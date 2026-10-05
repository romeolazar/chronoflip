const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const dns = require('node:dns').promises;
const net = require('node:net');

const PORT = clampInt(process.env.PORT, 1, 65535, 8080);
const PUBLIC_DIR = path.join(__dirname, 'public');
const WEATHER_TTL_MS = 10 * 60 * 1000;
const CALENDAR_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 12_000;
const CALENDAR_ICS_FILE = process.env.CALENDAR_ICS_FILE || '/data/calendar/calendar.ics';
const hasCalendarFile = Boolean(CALENDAR_ICS_FILE && fs.existsSync(CALENDAR_ICS_FILE));

const config = Object.freeze({
  locationName: cleanText(process.env.LOCATION_NAME || 'Bucharest', 80),
  latitude: clampNumber(process.env.LATITUDE, -90, 90, 44.4268),
  longitude: clampNumber(process.env.LONGITUDE, -180, 180, 26.1025),
  temperatureUnit: process.env.TEMPERATURE_UNIT === 'fahrenheit' ? 'fahrenheit' : 'celsius',
  windSpeedUnit: ['kmh', 'mph', 'ms', 'kn'].includes(process.env.WIND_SPEED_UNIT)
    ? process.env.WIND_SPEED_UNIT
    : 'kmh',
  timeFormat: process.env.TIME_FORMAT === '12' ? '12' : '24',
  showSeconds: process.env.SHOW_SECONDS === 'true',
  clockPosition: ['center', 'top', 'fill'].includes(process.env.CLOCK_POSITION) ? process.env.CLOCK_POSITION : 'center',
  locale: cleanText(process.env.LOCALE || 'en-GB', 35),
  timeZone: normalizeTimeZone(process.env.TIME_ZONE),
  forecastDays: clampInt(process.env.FORECAST_DAYS, 3, 7, 5),
  calendarEnabled: hasCalendarFile || Boolean(process.env.CALENDAR_ICS_URL),
  calendarSource: hasCalendarFile ? 'file' : process.env.CALENDAR_ICS_URL ? 'url' : null,
  calendarDays: clampInt(process.env.CALENDAR_DAYS, 1, 31, 7),
  calendarMaxEvents: clampInt(process.env.CALENDAR_MAX_EVENTS, 1, 8, 4),
  dimStart: clampInt(process.env.DIM_START, 0, 23, 22),
  dimEnd: clampInt(process.env.DIM_END, 0, 23, 7),
  dimLevel: clampNumber(process.env.DIM_LEVEL, 0.25, 1, 0.72),
  burnInShift: process.env.BURN_IN_SHIFT !== 'false'
});

const weatherCache = new Map();
const calendarCache = new Map();

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
}

function clampInt(value, min, max, fallback) {
  return Math.round(clampNumber(value, min, max, fallback));
}

function cleanText(value, maxLength) {
  return String(value).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, maxLength);
}

function normalizeTimeZone(value) {
  const candidate = cleanText(value || 'Europe/Bucharest', 80);
  try {
    new Intl.DateTimeFormat('en', { timeZone: candidate }).format();
    return candidate;
  } catch {
    return 'UTC';
  }
}

function sendJson(res, status, body, cacheControl = 'no-store') {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': cacheControl,
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(payload);
}

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
  return response.json();
}

async function geocodeCity(city, language = config.locale.split('-')[0] || 'en') {
  const query = cleanText(city, 100).trim();
  if (query.length < 2) throw new Error('Enter a city name');
  const normalizedLanguage = ['en', 'ro'].includes(language) ? language : 'en';
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.search = new URLSearchParams({
    name: query,
    count: '1',
    language: normalizedLanguage,
    format: 'json'
  });
  const data = await fetchJson(url);
  const result = data.results?.[0];
  if (!result) throw new Error(`No weather location found for ${query}`);
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    name: [result.name, result.admin1, result.country].filter(Boolean).filter((value, index, all) => all.indexOf(value) === index).join(', ')
  };
}

async function getWeather(options = {}) {
  let location = {
    latitude: config.latitude,
    longitude: config.longitude,
    name: config.locationName
  };
  if (options.city) location = await geocodeCity(options.city, options.language);
  if (Number.isFinite(options.latitude) && Number.isFinite(options.longitude)) {
    location = {
      latitude: clampNumber(options.latitude, -90, 90, config.latitude),
      longitude: clampNumber(options.longitude, -180, 180, config.longitude),
      name: cleanText(options.name || 'Current location', 80)
    };
  }
  const cacheKey = `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}:${location.name}`;
  const cached = weatherCache.get(cacheKey);
  if (cached?.data && Date.now() < cached.expires) return cached.data;

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
    temperature_unit: config.temperatureUnit,
    wind_speed_unit: config.windSpeedUnit,
    timezone: 'auto',
    forecast_days: String(config.forecastDays)
  });

  const data = await fetchJson(url);
  const normalized = {
    locationName: location.name,
    timezone: data.timezone,
    timezoneAbbreviation: data.timezone_abbreviation,
    current: data.current,
    currentUnits: data.current_units,
    daily: data.daily,
    dailyUnits: data.daily_units,
    fetchedAt: new Date().toISOString()
  };
  weatherCache.set(cacheKey, { data: normalized, expires: Date.now() + WEATHER_TTL_MS });
  return normalized;
}

function unfoldIcs(text) {
  return text.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '').split('\n');
}

function decodeIcsText(value = '') {
  return value
    .replace(/\\n/gi, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

function zonedDate(parts, timeZone) {
  const desired = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]);
  let candidate = new Date(desired);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const formatted = Object.fromEntries(formatter.formatToParts(candidate).map((part) => [part.type, part.value]));
    const observed = Date.UTC(
      Number(formatted.year), Number(formatted.month) - 1, Number(formatted.day),
      Number(formatted.hour), Number(formatted.minute), Number(formatted.second)
    );
    candidate = new Date(candidate.getTime() + desired - observed);
  }
  return candidate;
}

function parseIcsDate(raw, parameters = '') {
  if (!raw) return null;
  const dateOnly = /VALUE=DATE/i.test(parameters) || /^\d{8}$/.test(raw);
  if (dateOnly) {
    const match = raw.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (!match) return null;
    return {
      date: zonedDate([Number(match[1]), Number(match[2]), Number(match[3]), 0, 0, 0], config.timeZone),
      allDay: true
    };
  }

  const match = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);
  if (!match) return null;
  const parts = match.slice(1, 7).map((part) => Number(part || 0));
  const timeZoneMatch = parameters.match(/(?:^|;)TZID=([^;:]+)/i);
  const timeZone = timeZoneMatch ? normalizeTimeZone(timeZoneMatch[1]) : config.timeZone;
  const date = match[7]
    ? new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4], parts[5]))
    : zonedDate(parts, timeZone);
  return { date, allDay: false };
}

function parseDuration(raw) {
  const match = String(raw || '').match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/i);
  if (!match) return 60 * 60 * 1000;
  return ((Number(match[1] || 0) * 24 + Number(match[2] || 0)) * 60 + Number(match[3] || 0)) * 60 * 1000;
}

function parseRRule(raw = '') {
  return Object.fromEntries(raw.split(';').map((part) => part.split('=', 2)).filter((pair) => pair.length === 2));
}

function addRecurrence(date, frequency, interval) {
  const next = new Date(date);
  if (frequency === 'DAILY') next.setDate(next.getDate() + interval);
  if (frequency === 'WEEKLY') next.setDate(next.getDate() + 7 * interval);
  if (frequency === 'MONTHLY') next.setMonth(next.getMonth() + interval);
  if (frequency === 'YEARLY') next.setFullYear(next.getFullYear() + interval);
  return next;
}

function expandEvent(event, windowStart, windowEnd) {
  const startData = parseIcsDate(event.DTSTART?.value, event.DTSTART?.params);
  if (!startData) return [];
  const endData = parseIcsDate(event.DTEND?.value, event.DTEND?.params);
  const duration = endData
    ? Math.max(0, endData.date - startData.date)
    : parseDuration(event.DURATION?.value || (startData.allDay ? 'P1D' : 'PT1H'));
  const base = {
    title: decodeIcsText(event.SUMMARY?.value || 'Untitled event'),
    location: decodeIcsText(event.LOCATION?.value || ''),
    allDay: startData.allDay
  };
  const rule = parseRRule(event.RRULE?.value);
  const frequency = rule.FREQ;
  const interval = Math.max(1, Number(rule.INTERVAL || 1));
  const count = Math.min(1000, Math.max(1, Number(rule.COUNT || 1000)));
  const until = rule.UNTIL ? parseIcsDate(rule.UNTIL)?.date : null;
  const occurrences = [];
  let occurrence = startData.date;

  for (let index = 0; index < count && occurrence <= windowEnd; index += 1) {
    const occurrenceEnd = new Date(occurrence.getTime() + duration);
    if (occurrenceEnd >= windowStart && occurrence <= windowEnd) {
      occurrences.push({ ...base, start: occurrence.toISOString(), end: occurrenceEnd.toISOString() });
    }
    if (!frequency || !['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(frequency)) break;
    occurrence = addRecurrence(occurrence, frequency, interval);
    if (until && occurrence > until) break;
  }
  return occurrences;
}

function parseCalendar(text) {
  const lines = unfoldIcs(text);
  const rawEvents = [];
  let event = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      event = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      if (event) rawEvents.push(event);
      event = null;
      continue;
    }
    if (!event) continue;
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const keyPart = line.slice(0, separator);
    const [key, ...params] = keyPart.split(';');
    if (['DTSTART', 'DTEND', 'DURATION', 'SUMMARY', 'LOCATION', 'RRULE'].includes(key)) {
      event[key] = { value: line.slice(separator + 1), params: params.join(';') };
    }
  }

  const now = new Date();
  const end = new Date(now.getTime() + config.calendarDays * 24 * 60 * 60 * 1000);
  return rawEvents
    .flatMap((item) => expandEvent(item, now, end))
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, config.calendarMaxEvents);
}

function isPrivateAddress(address) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  if (net.isIPv6(address)) {
    const normalized = address.toLowerCase();
    return normalized === '::1' || normalized === '::' || normalized.startsWith('fc') ||
      normalized.startsWith('fd') || normalized.startsWith('fe8') || normalized.startsWith('fe9') ||
      normalized.startsWith('fea') || normalized.startsWith('feb') || normalized.startsWith('::ffff:127.') ||
      normalized.startsWith('::ffff:10.') || normalized.startsWith('::ffff:192.168.');
  }
  return true;
}

async function validatePublicCalendarUrl(rawUrl) {
  if (!rawUrl || rawUrl.length > 2000) throw new Error('Calendar URL is missing or too long');
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('Calendar URL is invalid');
  }
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Calendar URL must use HTTP or HTTPS');
  if (url.username || url.password) throw new Error('Calendar URL cannot contain credentials');
  if (url.port && !['80', '443'].includes(url.port)) throw new Error('Calendar URL uses an unsupported port');
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  if (hostname === 'localhost' || hostname.endsWith('.local')) throw new Error('Calendar URL must be public');

  const addresses = net.isIP(hostname)
    ? [{ address: hostname }]
    : await dns.lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error('Calendar URL must resolve to a public address');
  }
  return url;
}

async function fetchPublicCalendar(rawUrl) {
  let url = await validatePublicCalendarUrl(rawUrl);
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      redirect: 'manual',
      headers: { 'User-Agent': 'OLED-Ambient-Dashboard/2.0' }
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location || redirects === 3) throw new Error('Calendar redirected too many times');
      url = await validatePublicCalendarUrl(new URL(location, url).href);
      continue;
    }
    if (!response.ok) throw new Error(`Calendar returned ${response.status}`);
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > 5_000_000) throw new Error('Calendar is too large');
    const text = await response.text();
    if (text.length > 5_000_000) throw new Error('Calendar is too large');
    return text;
  }
  throw new Error('Calendar could not be loaded');
}

async function getCalendar(publicUrl = '') {
  const overrideUrl = cleanText(publicUrl, 2000).trim();
  if (!overrideUrl && !config.calendarEnabled) return { enabled: false, events: [] };

  const source = overrideUrl ? 'public-url' : hasCalendarFile ? 'file' : 'url';
  const cacheKey = source === 'file' ? `file:${CALENDAR_ICS_FILE}` : `url:${overrideUrl || process.env.CALENDAR_ICS_URL}`;
  const cached = calendarCache.get(cacheKey);
  if (cached?.data && Date.now() < cached.expires) return cached.data;

  let text;
  if (overrideUrl) {
    text = await fetchPublicCalendar(overrideUrl);
  } else if (hasCalendarFile) {
    const stats = await fs.promises.stat(CALENDAR_ICS_FILE);
    if (stats.size > 5_000_000) throw new Error('Calendar is too large');
    text = await fs.promises.readFile(CALENDAR_ICS_FILE, 'utf8');
  } else {
    text = await fetchPublicCalendar(process.env.CALENDAR_ICS_URL);
  }
  const data = {
    enabled: true,
    source,
    events: parseCalendar(text),
    fetchedAt: new Date().toISOString()
  };
  calendarCache.set(cacheKey, { data, expires: Date.now() + CALENDAR_TTL_MS });
  return data;
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function serveStatic(req, res, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(PUBLIC_DIR, `.${requested}`);
  if (!filePath.startsWith(`${PUBLIC_DIR}${path.sep}`)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': requested === '/index.html' ? 'no-cache' : 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'"
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }

  try {
    if (url.pathname === '/health') return sendJson(res, 200, { ok: true });
    if (url.pathname === '/api/config') return sendJson(res, 200, config, 'public, max-age=300');
    if (url.pathname === '/api/weather') {
      const city = url.searchParams.get('city') || '';
      const latitude = url.searchParams.has('latitude') ? Number(url.searchParams.get('latitude')) : NaN;
      const longitude = url.searchParams.has('longitude') ? Number(url.searchParams.get('longitude')) : NaN;
      const name = url.searchParams.get('name') || '';
      const language = cleanText(url.searchParams.get('language') || '', 5).toLowerCase();
      return sendJson(res, 200, await getWeather({ city, latitude, longitude, name, language }), 'public, max-age=300');
    }
    if (url.pathname === '/api/calendar') {
      return sendJson(res, 200, await getCalendar(url.searchParams.get('url') || ''), 'public, max-age=180');
    }
    return serveStatic(req, res, decodeURIComponent(url.pathname));
  } catch (error) {
    console.error(`${new Date().toISOString()} ${url.pathname}: ${error.message}`);
    return sendJson(res, 502, { error: cleanText(error.message || 'Data is temporarily unavailable', 180) });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`OLED dashboard listening on port ${PORT}`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
