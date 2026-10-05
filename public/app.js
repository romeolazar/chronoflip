const STORAGE_KEY = 'oledAmbientDashboard.settings.v2';

const state = {
  config: null,
  settings: null,
  defaults: null,
  weather: null,
  calendar: null,
  previousTime: '',
  lastClockMinute: -1,
  lastClockSecond: -1,
  lastDateKey: ''
};

const elements = {
  dashboard: document.querySelector('#dashboard'),
  digits: [...document.querySelectorAll('.flip-digit')],
  secondsGroup: document.querySelector('#seconds-group'),
  meridiem: document.querySelector('#meridiem'),
  dateLine: document.querySelector('#date-line'),
  location: document.querySelector('#location-label'),
  currentIcon: document.querySelector('#current-icon'),
  temperature: document.querySelector('#temperature'),
  temperatureRange: document.querySelector('#temperature-range'),
  condition: document.querySelector('#condition'),
  feels: document.querySelector('#feels'),
  forecast: document.querySelector('#forecast'),
  agendaRegion: document.querySelector('#agenda-region'),
  agenda: document.querySelector('#agenda'),
  offline: document.querySelector('#offline-badge'),
  fullscreen: document.querySelector('#fullscreen-button'),
  themeToggle: document.querySelector('#theme-toggle'),
  settingsButton: document.querySelector('#settings-button'),
  settingsPanel: document.querySelector('#settings-panel'),
  settingsBackdrop: document.querySelector('#settings-backdrop'),
  settingsClose: document.querySelector('#settings-close'),
  settingsStatus: document.querySelector('#settings-status'),
  setting24Hour: document.querySelector('#setting-24-hour'),
  settingSeconds: document.querySelector('#setting-seconds'),
  settingDate: document.querySelector('#setting-date'),
  clockSize: document.querySelector('#setting-clock-size'),
  clockSizeOutput: document.querySelector('#clock-size-output'),
  cornerRadius: document.querySelector('#setting-corner-radius'),
  cornerRadiusOutput: document.querySelector('#corner-radius-output'),
  weatherMode: document.querySelector('#weather-mode'),
  weatherCity: document.querySelector('#weather-city'),
  calendarUrl: document.querySelector('#calendar-url'),
  saveSettings: document.querySelector('#save-settings'),
  resetSettings: document.querySelector('#reset-settings'),
  kioskButton: document.querySelector('#kiosk-button')
};

const messages = {
  en: {
    pageTitle: 'ChronoFlip', appName: 'CHRONOFLIP', settings: 'Settings', displayStyle: 'Display style',
    ambient: 'Ambient', classicWeather: 'Classic weather', classicHelp: 'Classic weather is an original open-source interpretation of the retro two-panel clock layout.',
    language: 'Language', theme: 'Theme', dark: 'Dark', light: 'Light', midnight: 'Midnight', sand: 'Sand',
    clockFace: 'Clock face', splitCards: 'Split cards', twinDark: 'Slate cards', twinLight: 'Ivory panels', mechanical: 'Mechanical', minimal: 'Minimal',
    clockFaceHelp: 'Each face changes the cards, divider, shadows, and number treatment.',
    hourFormat: '24-hour format', hourFormatHelp: 'Use 13:45 instead of 1:45 PM', showSeconds: 'Show seconds', showSecondsHelp: 'Show animated seconds in the clock corner',
    showDate: 'Show date & day', showDateHelp: 'Display the date under the clock', clockLayout: 'Clock layout', layout: 'Layout', auto: 'Auto', horizontal: 'Horizontal', vertical: 'Vertical',
    position: 'Position', center: 'Center', top: 'Top', fill: 'Fill space', fillHelp: 'Expand the clock to use all available width and height above the weather.', size: 'Size', cornerRadius: 'Corner radius', weatherLocation: 'Weather location', locationSource: 'Location source',
    dockerDefaults: 'Docker defaults', cityName: 'City name', tabletLocation: "This tablet's location", city: 'City', cityPlaceholder: 'e.g. Bucharest, Romania',
    locationHelp: 'Device location needs browser location permission and usually HTTPS on a LAN.', calendar: 'Calendar', publicCalendarUrl: 'Public iCal / ICS URL',
    calendarHelp: 'Leave blank to use the Docker-mounted calendar file or configured URL.', reset: 'Reset', enterKiosk: 'Enter kiosk', apply: 'Apply', upNext: 'UP NEXT',
    timeAndDate: 'Time and date', currentWeather: 'Current weather', fiveDayForecast: 'Five day forecast', upcomingEvents: 'Upcoming calendar events', displayControls: 'Display controls',
    switchTheme: 'Switch light or dark mode', lightDarkMode: 'Light / dark mode', openSettings: 'Open settings', closeSettings: 'Close settings', enterFullscreen: 'Enter fullscreen',
    fullscreenKiosk: 'Fullscreen / kiosk mode', dashboardSettings: 'Dashboard settings', offline: 'OFFLINE · SHOWING LAST UPDATE', loadingWeather: 'Loading weather', updating: 'Updating…',
    currentConditions: 'Current conditions', feels: 'Feels', humidity: 'Humidity', wind: 'Wind', high: 'High', low: 'Low', today: 'Today', tomorrow: 'Tomorrow', allDay: 'All day',
    nextSevenDays: 'Next 7 days', nothingScheduled: 'Nothing scheduled', currentLocation: 'Current location', settingsSaved: 'Settings saved.', loadingSettings: 'Loading your settings…',
    defaultsRestored: 'Defaults restored.', requestingLocation: 'Requesting tablet location…', calendarUrlError: 'Calendar URL must begin with https:// or http://', cityRequired: 'Enter a city name for weather.',
    fullscreenUnavailable: 'Fullscreen is not supported by this browser. Use its kiosk/fullscreen option instead.', locationUnavailable: 'This browser does not provide device location',
    locationDenied: 'Location permission was unavailable. Use a city name or HTTPS.',
    weatherClear: 'Clear', weatherMostlyClear: 'Mostly clear', weatherPartlyCloudy: 'Partly cloudy', weatherOvercast: 'Overcast', weatherFoggy: 'Foggy', weatherIcyFog: 'Icy fog',
    weatherLightDrizzle: 'Light drizzle', weatherDrizzle: 'Drizzle', weatherHeavyDrizzle: 'Heavy drizzle', weatherFreezingDrizzle: 'Freezing drizzle', weatherLightRain: 'Light rain',
    weatherRain: 'Rain', weatherHeavyRain: 'Heavy rain', weatherFreezingRain: 'Freezing rain', weatherLightSnow: 'Light snow', weatherSnow: 'Snow', weatherHeavySnow: 'Heavy snow',
    weatherSnowGrains: 'Snow grains', weatherShowers: 'Rain showers', weatherHeavyShowers: 'Heavy showers', weatherSnowShowers: 'Snow showers', weatherHeavySnowShowers: 'Heavy snow showers',
    weatherThunderstorm: 'Thunderstorm', weatherThunderHail: 'Thunder & hail'
  },
  ro: {
    pageTitle: 'ChronoFlip', appName: 'CHRONOFLIP', settings: 'Setări', displayStyle: 'Stil de afișare',
    ambient: 'Ambiental', classicWeather: 'Vreme clasică', classicHelp: 'Vreme clasică este o interpretare originală open-source a aspectului retro cu două panouri.',
    language: 'Limbă', theme: 'Temă', dark: 'Întunecat', light: 'Luminos', midnight: 'Noapte', sand: 'Nisip',
    clockFace: 'Aspectul ceasului', splitCards: 'Cartele separate', twinDark: 'Panouri grafit', twinLight: 'Panouri fildeș', mechanical: 'Mecanic', minimal: 'Minimal',
    clockFaceHelp: 'Fiecare aspect schimbă panourile, separatorul, umbrele și stilul cifrelor.',
    hourFormat: 'Format de 24 de ore', hourFormatHelp: 'Folosește 13:45 în loc de 1:45 PM', showSeconds: 'Afișează secundele', showSecondsHelp: 'Afișează secundele animate în colțul ceasului',
    showDate: 'Afișează data și ziua', showDateHelp: 'Arată data sub ceas', clockLayout: 'Aranjarea ceasului', layout: 'Aranjare', auto: 'Automat', horizontal: 'Orizontal', vertical: 'Vertical',
    position: 'Poziție', center: 'Centru', top: 'Sus', fill: 'Umple spațiul', fillHelp: 'Extinde ceasul pe toată lățimea și înălțimea disponibilă deasupra zonei meteo.', size: 'Mărime', cornerRadius: 'Rotunjire colțuri', weatherLocation: 'Locația meteo', locationSource: 'Sursa locației',
    dockerDefaults: 'Setările Docker', cityName: 'Numele orașului', tabletLocation: 'Locația acestei tablete', city: 'Oraș', cityPlaceholder: 'ex. București, România',
    locationHelp: 'Locația dispozitivului necesită permisiunea browserului și, de obicei, HTTPS în rețeaua locală.', calendar: 'Calendar', publicCalendarUrl: 'Adresă publică iCal / ICS',
    calendarHelp: 'Lasă necompletat pentru fișierul calendar montat în Docker sau adresa configurată.', reset: 'Resetează', enterKiosk: 'Mod chioșc', apply: 'Aplică', upNext: 'URMEAZĂ',
    timeAndDate: 'Ora și data', currentWeather: 'Vremea actuală', fiveDayForecast: 'Prognoza pe cinci zile', upcomingEvents: 'Evenimente viitoare', displayControls: 'Comenzi afișaj',
    switchTheme: 'Comută modul luminos sau întunecat', lightDarkMode: 'Mod luminos / întunecat', openSettings: 'Deschide setările', closeSettings: 'Închide setările', enterFullscreen: 'Intră în ecran complet',
    fullscreenKiosk: 'Ecran complet / mod chioșc', dashboardSettings: 'Setările tabloului', offline: 'OFFLINE · SE AFIȘEAZĂ ULTIMA ACTUALIZARE', loadingWeather: 'Se încarcă vremea', updating: 'Se actualizează…',
    currentConditions: 'Condiții actuale', feels: 'Resimțită', humidity: 'Umiditate', wind: 'Vânt', high: 'Max', low: 'Min', today: 'Astăzi', tomorrow: 'Mâine', allDay: 'Toată ziua',
    nextSevenDays: 'Următoarele 7 zile', nothingScheduled: 'Nimic programat', currentLocation: 'Locația curentă', settingsSaved: 'Setările au fost salvate.', loadingSettings: 'Se încarcă setările…',
    defaultsRestored: 'Setările implicite au fost restaurate.', requestingLocation: 'Se solicită locația tabletei…', calendarUrlError: 'Adresa calendarului trebuie să înceapă cu https:// sau http://', cityRequired: 'Introdu un oraș pentru vreme.',
    fullscreenUnavailable: 'Ecranul complet nu este acceptat de acest browser. Folosește opțiunea de ecran complet sau chioșc a browserului.', locationUnavailable: 'Acest browser nu oferă locația dispozitivului',
    locationDenied: 'Permisiunea pentru locație nu este disponibilă. Folosește un oraș sau HTTPS.',
    weatherClear: 'Senin', weatherMostlyClear: 'Mai mult senin', weatherPartlyCloudy: 'Parțial noros', weatherOvercast: 'Acoperit', weatherFoggy: 'Ceață', weatherIcyFog: 'Ceață înghețată',
    weatherLightDrizzle: 'Burniță ușoară', weatherDrizzle: 'Burniță', weatherHeavyDrizzle: 'Burniță puternică', weatherFreezingDrizzle: 'Burniță înghețată', weatherLightRain: 'Ploaie ușoară',
    weatherRain: 'Ploaie', weatherHeavyRain: 'Ploaie puternică', weatherFreezingRain: 'Ploaie înghețată', weatherLightSnow: 'Ninsoare ușoară', weatherSnow: 'Ninsoare', weatherHeavySnow: 'Ninsoare puternică',
    weatherSnowGrains: 'Grăunțe de zăpadă', weatherShowers: 'Averse de ploaie', weatherHeavyShowers: 'Averse puternice', weatherSnowShowers: 'Averse de zăpadă', weatherHeavySnowShowers: 'Averse puternice de zăpadă',
    weatherThunderstorm: 'Furtună', weatherThunderHail: 'Furtună cu grindină'
  }
};

const weatherLabelKeys = {
  0: 'weatherClear', 1: 'weatherMostlyClear', 2: 'weatherPartlyCloudy', 3: 'weatherOvercast',
  45: 'weatherFoggy', 48: 'weatherIcyFog', 51: 'weatherLightDrizzle', 53: 'weatherDrizzle',
  55: 'weatherHeavyDrizzle', 56: 'weatherFreezingDrizzle', 57: 'weatherFreezingDrizzle',
  61: 'weatherLightRain', 63: 'weatherRain', 65: 'weatherHeavyRain', 66: 'weatherFreezingRain',
  67: 'weatherFreezingRain', 71: 'weatherLightSnow', 73: 'weatherSnow', 75: 'weatherHeavySnow',
  77: 'weatherSnowGrains', 80: 'weatherShowers', 81: 'weatherShowers',
  82: 'weatherHeavyShowers', 85: 'weatherSnowShowers', 86: 'weatherHeavySnowShowers',
  95: 'weatherThunderstorm', 96: 'weatherThunderHail', 99: 'weatherThunderHail'
};

function t(key) {
  const language = state.settings?.language || state.defaults?.language || 'en';
  return messages[language]?.[key] || messages.en[key] || key;
}

function currentLocale() {
  return state.settings?.language === 'ro' ? 'ro-RO' : 'en-GB';
}

function translateDocument() {
  document.documentElement.lang = state.settings?.language || 'en';
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => { element.setAttribute('aria-label', t(element.dataset.i18nAria)); });
  document.querySelectorAll('[data-i18n-title]').forEach((element) => { element.title = t(element.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => { element.placeholder = t(element.dataset.i18nPlaceholder); });
  if (!state.weather) {
    elements.location.textContent = t('loadingWeather');
    elements.condition.textContent = t('updating');
  }
}

function localizeApiError(message) {
  const value = String(message || '');
  if (state.settings?.language !== 'ro') return value;
  if (value === 'Enter a city name') return 'Introdu un nume de oraș.';
  if (value.startsWith('No weather location found for ')) return `Nu s-a găsit nicio locație meteo pentru ${value.slice(30)}.`;
  if (value === 'Calendar is too large') return 'Calendarul este prea mare.';
  if (value === 'Calendar could not be loaded') return 'Calendarul nu a putut fi încărcat.';
  if (value === 'Data is temporarily unavailable') return 'Datele sunt temporar indisponibile.';
  return value
    .replace(/^Upstream returned (\d+)$/, 'Serviciul extern a răspuns cu starea $1')
    .replace(/^Calendar returned (\d+)$/, 'Calendarul a răspuns cu starea $1');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}

function weatherIcon(code, isDay = true) {
  const stroke = 'stroke-width="2.1"';
  if (code === 0) {
    return `<svg viewBox="0 0 64 64" role="img"><circle class="sun" cx="32" cy="32" r="11"/><g class="stroke sun-rays" ${stroke}><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13.5 13.5l5.7 5.7M44.8 44.8l5.7 5.7M50.5 13.5l-5.7 5.7M19.2 44.8l-5.7 5.7"/></g></svg>`;
  }
  if (code <= 3) {
    const celestial = isDay
      ? '<circle class="sun" cx="23" cy="23" r="10"/>'
      : '<path fill="#d8d8d5" d="M31 9a15 15 0 1 0 15 20A13 13 0 0 1 31 9Z"/>';
    return `<svg viewBox="0 0 64 64" role="img">${celestial}<path class="cloud" d="M18 48h31a10 10 0 0 0 1-20 16 16 0 0 0-30-2 11 11 0 0 0-2 22Z"/></svg>`;
  }
  if (code === 45 || code === 48) {
    return `<svg viewBox="0 0 64 64" role="img"><g class="stroke" ${stroke}><path d="M13 23h38M9 32h39M16 41h39"/></g></svg>`;
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return `<svg viewBox="0 0 64 64" role="img"><path class="cloud" d="M13 38h38a10 10 0 0 0-1-20 16 16 0 0 0-30 1 10 10 0 0 0-7 19Z"/><g class="stroke" stroke="#75a9c8" ${stroke}><path d="M20 46l-3 7M33 46l-3 7M46 46l-3 7"/></g></svg>`;
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return `<svg viewBox="0 0 64 64" role="img"><path class="cloud" d="M13 35h38a10 10 0 0 0-1-20 16 16 0 0 0-30 1 10 10 0 0 0-7 19Z"/><g fill="#d8d8d5"><circle cx="19" cy="47" r="2"/><circle cx="32" cy="51" r="2"/><circle cx="45" cy="47" r="2"/></g></svg>`;
  }
  if (code >= 95) {
    return `<svg viewBox="0 0 64 64" role="img"><path class="cloud" d="M13 35h38a10 10 0 0 0-1-20 16 16 0 0 0-30 1 10 10 0 0 0-7 19Z"/><path fill="#e2b65c" d="M32 39h9l-8 9h6L26 61l4-10h-6Z"/></svg>`;
  }
  return weatherIcon(2, isDay);
}

function buildDefaults(config) {
  return {
    displayStyle: 'ambient',
    language: String(config.locale || '').toLowerCase().startsWith('ro') ? 'ro' : 'en',
    theme: 'dark',
    flipStyle: 'standard',
    clockStyleVersion: 2,
    timeFormat: config.timeFormat || '24',
    showSeconds: Boolean(config.showSeconds),
    showDate: true,
    layout: 'auto',
    clockPosition: config.clockPosition || 'center',
    clockSize: 100,
    cornerRadius: 18,
    weatherMode: 'server',
    weatherCity: '',
    deviceLocation: null,
    calendarUrl: ''
  };
}

function normalizeSettings(raw, defaults) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const settings = { ...defaults, ...source };
  settings.displayStyle = ['ambient', 'classic-weather'].includes(settings.displayStyle) ? settings.displayStyle : defaults.displayStyle;
  settings.language = ['en', 'ro'].includes(settings.language) ? settings.language : defaults.language;
  settings.theme = ['dark', 'light', 'midnight', 'sand'].includes(settings.theme) ? settings.theme : defaults.theme;
  settings.flipStyle = ['simple', 'standard', 'professional', 'paired-dark', 'paired-light'].includes(settings.flipStyle) ? settings.flipStyle : defaults.flipStyle;
  if (!source.clockStyleVersion && settings.displayStyle === 'classic-weather' && settings.flipStyle === 'standard') settings.flipStyle = 'paired-light';
  settings.clockStyleVersion = 2;
  settings.timeFormat = settings.timeFormat === '12' ? '12' : '24';
  settings.layout = ['auto', 'horizontal', 'vertical'].includes(settings.layout) ? settings.layout : 'auto';
  settings.clockPosition = ['center', 'top', 'fill'].includes(settings.clockPosition) ? settings.clockPosition : 'center';
  settings.clockSize = Math.min(100, Math.max(70, Number(settings.clockSize) || 100));
  settings.cornerRadius = Math.min(36, Math.max(0, Number(settings.cornerRadius) || 0));
  settings.weatherMode = ['server', 'city', 'device'].includes(settings.weatherMode) ? settings.weatherMode : 'server';
  settings.weatherCity = String(settings.weatherCity || '').slice(0, 100);
  settings.calendarUrl = String(settings.calendarUrl || '').slice(0, 2000);
  settings.showSeconds = Boolean(settings.showSeconds);
  settings.showDate = settings.showDate !== false;
  if (!settings.deviceLocation || !Number.isFinite(settings.deviceLocation.latitude) || !Number.isFinite(settings.deviceLocation.longitude)) {
    settings.deviceLocation = null;
  }
  return settings;
}

function readStoredSettings(defaults) {
  try {
    return normalizeSettings(JSON.parse(localStorage.getItem(STORAGE_KEY)), defaults);
  } catch {
    return { ...defaults };
  }
}

function persistSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
}

function markActive(selector, attribute, value) {
  document.querySelectorAll(selector).forEach((button) => {
    button.classList.toggle('active', button.dataset[attribute] === value);
  });
}

function syncSettingsPanel() {
  const settings = state.settings;
  markActive('[data-display-style]', 'displayStyle', settings.displayStyle);
  markActive('[data-language]', 'language', settings.language);
  markActive('[data-theme-option]', 'themeOption', settings.theme);
  markActive('[data-flip-style]', 'flipStyle', settings.flipStyle);
  markActive('[data-layout]', 'layout', settings.layout);
  markActive('[data-position]', 'position', settings.clockPosition);
  elements.setting24Hour.checked = settings.timeFormat === '24';
  elements.settingSeconds.checked = settings.showSeconds;
  elements.settingDate.checked = settings.showDate;
  elements.clockSize.value = settings.clockSize;
  elements.clockSize.disabled = settings.clockPosition === 'fill';
  elements.clockSizeOutput.textContent = settings.clockPosition === 'fill' ? '100%' : `${settings.clockSize}%`;
  elements.cornerRadius.value = settings.cornerRadius;
  elements.cornerRadiusOutput.textContent = `${settings.cornerRadius}px`;
  elements.weatherMode.value = settings.weatherMode;
  elements.weatherCity.value = settings.weatherCity;
  elements.calendarUrl.value = settings.calendarUrl;
  document.querySelectorAll('.city-field').forEach((field) => { field.hidden = settings.weatherMode !== 'city'; });
}

function applySettings() {
  const settings = state.settings;
  document.documentElement.dataset.theme = settings.theme;
  translateDocument();
  elements.dashboard.dataset.displayStyle = settings.displayStyle;
  elements.dashboard.dataset.flipStyle = settings.flipStyle;
  elements.dashboard.dataset.layout = settings.layout;
  elements.dashboard.dataset.clockPosition = settings.clockPosition;
  elements.dashboard.classList.toggle('show-seconds', settings.showSeconds);
  elements.dashboard.style.setProperty('--clock-scale', settings.clockPosition === 'fill' ? 1 : settings.clockSize / 100);
  elements.dashboard.style.setProperty('--clock-radius', `${settings.cornerRadius}px`);
  elements.secondsGroup.hidden = !settings.showSeconds;
  elements.dateLine.hidden = !settings.showDate;
  state.previousTime = '';
  state.lastDateKey = '';
  if (state.weather) renderWeather(state.weather);
  if (state.calendar) renderCalendar(state.calendar);
  syncSettingsPanel();
  updateClock();
}

function flipDigit(element, nextValue, animate) {
  const base = element.querySelector(':scope > span');
  const oldValue = base.textContent;
  if (oldValue === nextValue) return;
  element.querySelectorAll('.flap').forEach((flap) => flap.remove());
  if (!animate) {
    base.textContent = nextValue;
    return;
  }
  const oldTop = document.createElement('div');
  oldTop.className = 'flap old-top';
  oldTop.innerHTML = `<span>${escapeHtml(oldValue)}</span>`;
  const newBottom = document.createElement('div');
  newBottom.className = 'flap new-bottom';
  newBottom.innerHTML = `<span>${escapeHtml(nextValue)}</span>`;
  element.append(oldTop, newBottom);
  setTimeout(() => { base.textContent = nextValue; }, 315);
  setTimeout(() => {
    base.textContent = nextValue;
    oldTop.remove();
    newBottom.remove();
  }, 760);
}

function localNow() {
  const timeZone = state.weather?.timezone || state.config?.timeZone;
  if (!timeZone) return new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date());
  const get = (type) => Number(parts.find((part) => part.type === type)?.value || 0);
  return new Date(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
}

function updateClock() {
  if (!state.settings) return;
  const now = localNow();
  const is12Hour = state.settings.timeFormat === '12';
  const showSeconds = state.settings.showSeconds;
  let hour = now.getHours();
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  if (is12Hour) hour = hour % 12 || 12;
  const time = `${String(hour).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${showSeconds ? String(now.getSeconds()).padStart(2, '0') : ''}`;
  const shouldAnimate = Boolean(state.previousTime) && (showSeconds
    ? now.getSeconds() !== state.lastClockSecond
    : now.getMinutes() !== state.lastClockMinute);
  [...time].forEach((digit, index) => flipDigit(elements.digits[index], digit, shouldAnimate));
  state.previousTime = time;
  state.lastClockMinute = now.getMinutes();
  state.lastClockSecond = now.getSeconds();
  elements.meridiem.hidden = !is12Hour;
  elements.meridiem.textContent = meridiem;

  const dateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  if (dateKey !== state.lastDateKey) {
    elements.dateLine.textContent = new Intl.DateTimeFormat(currentLocale(), {
      weekday: 'long', day: 'numeric', month: 'long',
      timeZone: state.weather?.timezone || state.config?.timeZone
    }).format(new Date());
    state.lastDateKey = dateKey;
  }
  updateDimming(now.getHours());
}

function updateDimming(hour) {
  if (!state.config) return;
  const { dimStart, dimEnd, dimLevel } = state.config;
  const isDimTime = dimStart === dimEnd ? false
    : dimStart > dimEnd ? hour >= dimStart || hour < dimEnd
      : hour >= dimStart && hour < dimEnd;
  elements.dashboard.style.setProperty('--dim-level', dimLevel);
  elements.dashboard.classList.toggle('dimmed', isDimTime && dimLevel < 1);
}

function renderWeather(data) {
  const current = data.current;
  const temperatureUnit = data.currentUnits?.temperature_2m || '°';
  const degree = temperatureUnit.includes('°') ? temperatureUnit : `°${temperatureUnit}`;
  elements.location.textContent = data.locationName;
  elements.currentIcon.innerHTML = weatherIcon(current.weather_code, Boolean(current.is_day));
  elements.temperature.textContent = `${Math.round(current.temperature_2m)}°`;
  elements.condition.textContent = t(weatherLabelKeys[current.weather_code] || 'currentConditions');
  elements.feels.textContent = `${t('feels')} ${Math.round(current.apparent_temperature)}${degree} · ${t('humidity')} ${current.relative_humidity_2m}% · ${t('wind')} ${Math.round(current.wind_speed_10m)} ${data.currentUnits?.wind_speed_10m || ''}`;

  const todayHigh = data.daily?.temperature_2m_max?.[0];
  const todayLow = data.daily?.temperature_2m_min?.[0];
  elements.temperatureRange.textContent = Number.isFinite(todayHigh) && Number.isFinite(todayLow)
    ? `${t('high')} ${Math.round(todayHigh)}° · ${t('low')} ${Math.round(todayLow)}°`
    : '';

  const days = data.daily?.time || [];
  elements.forecast.innerHTML = days.map((date, index) => {
    const parsedDate = new Date(`${date}T12:00:00`);
    const dayName = index === 0 ? t('today') : new Intl.DateTimeFormat(currentLocale(), { weekday: 'short' }).format(parsedDate);
    const high = Math.round(data.daily.temperature_2m_max[index]);
    const low = Math.round(data.daily.temperature_2m_min[index]);
    const rain = data.daily.precipitation_probability_max[index];
    return `<div class="forecast-day">
      <div class="forecast-name">${escapeHtml(dayName)}</div>
      <div class="forecast-icon">${weatherIcon(data.daily.weather_code[index], true)}</div>
      <div class="forecast-temp">${high}° <span class="forecast-low">${low}°</span></div>
      <div class="rain-chance">${rain >= 15 ? `${Math.round(rain)}%` : '&nbsp;'}</div>
    </div>`;
  }).join('');
}

function relativeDay(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const difference = Math.round((eventDay - today) / 86400000);
  if (difference === 0) return t('today');
  if (difference === 1) return t('tomorrow');
  return new Intl.DateTimeFormat(currentLocale(), { weekday: 'short', day: 'numeric' }).format(date);
}

function renderCalendar(data) {
  if (!data.enabled) {
    elements.agendaRegion.hidden = true;
    elements.dashboard.classList.remove('has-agenda');
    return;
  }
  elements.agendaRegion.hidden = false;
  elements.dashboard.classList.add('has-agenda');
  if (!data.events.length) {
    elements.agenda.innerHTML = `<div class="event"><div class="event-time">${escapeHtml(t('nextSevenDays'))}</div><div class="event-title">${escapeHtml(t('nothingScheduled'))}</div></div>`;
    return;
  }
  elements.agenda.innerHTML = data.events.map((event) => {
    const start = new Date(event.start);
    const time = event.allDay ? t('allDay') : new Intl.DateTimeFormat(currentLocale(), { hour: '2-digit', minute: '2-digit' }).format(start);
    return `<div class="event"><div class="event-time">${escapeHtml(relativeDay(start))} · ${escapeHtml(time)}</div><div class="event-title">${escapeHtml(event.title)}</div></div>`;
  }).join('');
}

async function getJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `${url} returned ${response.status}`);
  return body;
}

function weatherApiUrl() {
  if (state.settings.weatherMode === 'city' && state.settings.weatherCity.trim()) {
    return `/api/weather?city=${encodeURIComponent(state.settings.weatherCity.trim())}&language=${encodeURIComponent(state.settings.language)}`;
  }
  if (state.settings.weatherMode === 'device' && state.settings.deviceLocation) {
    const { latitude, longitude } = state.settings.deviceLocation;
    return `/api/weather?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&name=${encodeURIComponent(t('currentLocation'))}`;
  }
  return '/api/weather';
}

function calendarApiUrl() {
  return state.settings.calendarUrl.trim()
    ? `/api/calendar?url=${encodeURIComponent(state.settings.calendarUrl.trim())}`
    : '/api/calendar';
}

function setStatus(message, isError = false) {
  elements.settingsStatus.textContent = message;
  elements.settingsStatus.style.color = isError ? '#d88970' : 'var(--accent)';
}

async function refreshData() {
  const [weatherResult, calendarResult] = await Promise.allSettled([
    getJson(weatherApiUrl()),
    getJson(calendarApiUrl())
  ]);
  if (weatherResult.status === 'fulfilled') {
    state.weather = weatherResult.value;
    renderWeather(weatherResult.value);
    elements.offline.hidden = true;
  } else {
    elements.offline.hidden = false;
    setStatus(localizeApiError(weatherResult.reason.message), true);
  }
  if (calendarResult.status === 'fulfilled') {
    state.calendar = calendarResult.value;
    renderCalendar(calendarResult.value);
  } else {
    setStatus(localizeApiError(calendarResult.reason.message), true);
  }
  return {
    weatherOk: weatherResult.status === 'fulfilled',
    calendarOk: calendarResult.status === 'fulfilled'
  };
}

function applyBurnInShift() {
  if (!state.config?.burnInShift) return;
  const sequence = [[0, 0], [2, -2], [-2, 2], [3, 2], [-3, -2], [0, 3]];
  const index = Math.floor(Date.now() / (10 * 60 * 1000)) % sequence.length;
  const [x, y] = sequence[index];
  elements.dashboard.style.setProperty('--shift-x', `${x}px`);
  elements.dashboard.style.setProperty('--shift-y', `${y}px`);
}

function openSettings() {
  syncSettingsPanel();
  setStatus('');
  elements.settingsPanel.hidden = false;
  elements.settingsBackdrop.hidden = false;
}

function closeSettings() {
  elements.settingsPanel.hidden = true;
  elements.settingsBackdrop.hidden = true;
}

async function enterKiosk() {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    elements.dashboard.classList.add('kiosk');
    closeSettings();
  } catch {
    setStatus(t('fullscreenUnavailable'), true);
  }
}

async function toggleFullscreen() {
  if (document.fullscreenElement) await document.exitFullscreen();
  else await enterKiosk();
}

function requestDeviceLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error(t('locationUnavailable')));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => reject(new Error(t('locationDenied'))),
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 30 * 60 * 1000 }
    );
  });
}

async function saveSettings() {
  state.settings.weatherCity = elements.weatherCity.value.trim();
  state.settings.calendarUrl = elements.calendarUrl.value.trim();
  if (state.settings.calendarUrl && !/^https?:\/\//i.test(state.settings.calendarUrl)) {
    setStatus(t('calendarUrlError'), true);
    return;
  }
  if (state.settings.weatherMode === 'city' && state.settings.weatherCity.length < 2) {
    setStatus(t('cityRequired'), true);
    return;
  }
  if (state.settings.weatherMode === 'device') {
    setStatus(t('requestingLocation'));
    try {
      state.settings.deviceLocation = await requestDeviceLocation();
    } catch (error) {
      setStatus(error.message, true);
      return;
    }
  }
  persistSettings();
  applySettings();
  setStatus(t('loadingSettings'));
  const result = await refreshData();
  if (result.weatherOk && result.calendarOk) {
    setStatus(t('settingsSaved'));
    setTimeout(closeSettings, 450);
  }
}

function wireChoiceButtons() {
  document.querySelectorAll('[data-display-style]').forEach((button) => button.addEventListener('click', () => {
    state.settings.displayStyle = button.dataset.displayStyle;
    applySettings();
  }));
  document.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => {
    state.settings.language = button.dataset.language;
    applySettings();
  }));
  document.querySelectorAll('[data-theme-option]').forEach((button) => button.addEventListener('click', () => {
    state.settings.theme = button.dataset.themeOption;
    applySettings();
  }));
  document.querySelectorAll('[data-flip-style]').forEach((button) => button.addEventListener('click', () => {
    state.settings.flipStyle = button.dataset.flipStyle;
    applySettings();
  }));
  document.querySelectorAll('[data-layout]').forEach((button) => button.addEventListener('click', () => {
    state.settings.layout = button.dataset.layout;
    applySettings();
  }));
  document.querySelectorAll('[data-position]').forEach((button) => button.addEventListener('click', () => {
    state.settings.clockPosition = button.dataset.position;
    applySettings();
  }));
}

function wireControls() {
  wireChoiceButtons();
  elements.setting24Hour.addEventListener('change', () => { state.settings.timeFormat = elements.setting24Hour.checked ? '24' : '12'; applySettings(); });
  elements.settingSeconds.addEventListener('change', () => { state.settings.showSeconds = elements.settingSeconds.checked; applySettings(); });
  elements.settingDate.addEventListener('change', () => { state.settings.showDate = elements.settingDate.checked; applySettings(); });
  elements.clockSize.addEventListener('input', () => { state.settings.clockSize = Number(elements.clockSize.value); applySettings(); });
  elements.cornerRadius.addEventListener('input', () => { state.settings.cornerRadius = Number(elements.cornerRadius.value); applySettings(); });
  elements.weatherMode.addEventListener('change', () => { state.settings.weatherMode = elements.weatherMode.value; syncSettingsPanel(); });
  elements.themeToggle.addEventListener('click', () => {
    state.settings.theme = ['light', 'sand'].includes(state.settings.theme) ? 'dark' : 'light';
    persistSettings();
    applySettings();
  });
  elements.settingsButton.addEventListener('click', openSettings);
  elements.settingsClose.addEventListener('click', closeSettings);
  elements.settingsBackdrop.addEventListener('click', closeSettings);
  elements.saveSettings.addEventListener('click', saveSettings);
  elements.resetSettings.addEventListener('click', () => {
    state.settings = { ...state.defaults };
    localStorage.removeItem(STORAGE_KEY);
    applySettings();
    setStatus(t('defaultsRestored'));
    refreshData();
  });
  elements.kioskButton.addEventListener('click', enterKiosk);
  elements.fullscreen.addEventListener('click', toggleFullscreen);
  elements.dashboard.addEventListener('dblclick', () => {
    if (document.fullscreenElement) document.exitFullscreen();
  });
  document.addEventListener('fullscreenchange', () => {
    elements.dashboard.classList.toggle('kiosk', Boolean(document.fullscreenElement));
  });
}

async function init() {
  try {
    state.config = await getJson('/api/config');
  } catch {
    state.config = { locale: 'en-GB', timeFormat: '24', showSeconds: false, clockPosition: 'center', timeZone: 'UTC', dimStart: 22, dimEnd: 7, dimLevel: .72 };
  }
  state.defaults = buildDefaults(state.config);
  state.settings = readStoredSettings(state.defaults);
  wireControls();
  applySettings();
  applyBurnInShift();
  await refreshData();
  updateClock();
  setInterval(updateClock, 250);
  setInterval(applyBurnInShift, 60_000);
  setInterval(refreshData, 10 * 60 * 1000);
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && state.settings) {
    updateClock();
    refreshData();
  }
});
window.addEventListener('online', refreshData);

init();
