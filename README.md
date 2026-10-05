# ChronoFlip

ChronoFlip is a single-container, zero-dependency ambient dashboard designed for a Samsung Galaxy Tab S6 in landscape mode. It combines a configurable flip clock with weather, forecast, and an optional ICS agenda. Two switchable display styles are included: the spacious original Ambient layout and a compact retro Classic Weather layout.

## Quick start

1. Copy the example configuration:

   ```sh
   cp .env.example .env
   ```

2. Edit `.env` with your location and coordinates. You can find coordinates by searching for your town on [Open-Meteo's geocoding page](https://open-meteo.com/en/docs/geocoding-api).

3. Start the dashboard:

   ```sh
   docker compose up -d --build
   ```

4. On the tablet, open:

   ```text
   http://YOUR-COMPUTER-IP:8080
   ```

Tap the fullscreen icon in the upper-right corner to enter kiosk mode. For a permanent display, use a kiosk browser and enable “keep screen on.”

The upper-right controls provide light/dark mode, the full settings panel, and fullscreen kiosk mode. Browser settings are saved locally on the tablet, so different displays can use different themes and locations against the same container.

## One-command Docker run

```sh
docker build -t chronoflip .
docker run -d --name chronoflip --restart unless-stopped \
  -p 8080:8080 \
  -e LOCATION_NAME="Bucharest" \
  -e LATITUDE="44.4268" \
  -e LONGITUDE="26.1025" \
  chronoflip
```

## Configuration

All settings are optional and configured with environment variables or `.env`:

| Variable | Default | Purpose |
| --- | --- | --- |
| `DASHBOARD_PORT` | `8080` | Host port used by Docker Compose |
| `LOCATION_NAME` | `Bucharest` | Label shown below the clock |
| `LATITUDE`, `LONGITUDE` | Bucharest coordinates | Weather location |
| `TEMPERATURE_UNIT` | `celsius` | `celsius` or `fahrenheit` |
| `WIND_SPEED_UNIT` | `kmh` | `kmh`, `mph`, `ms`, or `kn` |
| `TIME_FORMAT` | `24` | `24` or `12` |
| `SHOW_SECONDS` | `false` | Show animated seconds when `true` |
| `CLOCK_POSITION` | `center` | `center`, `top`, or full-width/full-height `fill` |
| `LOCALE` | `en-GB` | Initial interface language (`en-*` or `ro-*`); the tablet can override it |
| `TIME_ZONE` | `Europe/Bucharest` | IANA timezone used before weather loads and for floating ICS times |
| `FORECAST_DAYS` | `5` | 3–7 days |
| `CALENDAR_ICS_FILE` | `/data/calendar/calendar.ics` | ICS file inside the container |
| `CALENDAR_ICS_URL` | blank | Private or public ICS feed URL |
| `CALENDAR_DAYS` | `7` | Upcoming calendar window |
| `CALENDAR_MAX_EVENTS` | `4` | Events displayed, 1–8 |
| `DIM_START`, `DIM_END` | `22`, `7` | Automatic dimming hours |
| `DIM_LEVEL` | `0.72` | Night brightness, 0.25–1.0 |
| `BURN_IN_SHIFT` | `true` | Periodic 2–3 px layout movement |

## On-screen settings

The settings panel includes the complete display set inspired by A Flip Clock:

- Ambient and Classic Weather display styles
- Five visibly different clock faces: Split Cards, Slate Cards, Ivory Panels, Mechanical, and Minimal
- Dark, Light, Midnight, and Sand themes
- 12/24-hour time, compact animated corner seconds, and date/day toggles
- Auto, horizontal, and vertical clock layouts
- Clock size and corner radius sliders
- Center, Top, or Fill Space clock position; Fill Space uses the full assigned width and height
- Docker-default, city-name, or tablet-location weather
- Public iCal/ICS URL
- English and Romanian interface, weather, date, forecast, and calendar labels
- Reset and fullscreen kiosk controls

Classic Weather places the enlarged clock over a centered weather console, with a smaller forecast row below. Clock faces scale across the full assigned clock area; optional seconds remain compact in the lower-right corner. It is designed for across-the-room viewing at the Tab S6's 16:10 landscape resolution. The implementation uses this project's own HTML, CSS, flip animation, and inline SVG weather symbols; it does not bundle code or artwork from the visual reference projects.

Fill Space expands the hour and minute cards across all available room above the weather and calendar. When seconds are enabled, they remain animated in a small lower-right corner card instead of consuming a third full-size panel or covering the minute digit. While Fill Space is active, the Size control is held at 100%; its previous value is preserved and returns when Center or Top is selected.

The language selector is stored in the tablet browser. Choosing **Română** translates the controls, weather descriptions, dates, weekday names, forecast, calendar labels, and common status messages without restarting the container.

The city option is resolved by the container through Open-Meteo. Tablet location uses the browser Geolocation API; on a LAN address, browsers commonly require HTTPS before they expose precise location. City mode is the reliable HTTP fallback.

### Calendar from a local file

Copy or export your calendar as:

```text
calendar/calendar.ics
```

Then restart the dashboard:

```sh
docker compose restart dashboard
```

The `calendar/` directory is mounted read-only at `/data/calendar`. A local file takes priority over `CALENDAR_ICS_URL`. If neither a local file nor a URL is available when the container starts, the agenda row is hidden. An example file is included at `calendar/calendar.example.ics`.

You can also paste a public `https://` ICS URL directly into the on-screen settings. For safety, the container rejects calendar URLs that resolve to localhost or private network addresses.

### Formula 1 2026 example

The bundle includes the announced 24-round Formula 1 2026 calendar at:

```text
calendar/formula1-2026.ics
```

To use it as the mounted calendar:

```sh
cp calendar/formula1-2026.ics calendar/calendar.ics
docker compose restart dashboard
```

The example follows Formula 1's published 2026 calendar announcement. Race schedules can change, so replace it with an updated feed when exact live timings matter.

The lightweight ICS reader handles regular events plus common daily, weekly, monthly, and yearly recurrences. Advanced recurrence exclusions are intentionally outside its minimal scope.

## Tablet notes

- The dashboard is tuned for the Tab S6's 16:10 landscape screen.
- The background is true black (`#000`) and no remote fonts or images are loaded.
- Weather and remote calendar data are fetched and cached by the container, not by the tablet.
- Weather refreshes every 10 minutes; calendar data refreshes every 5 minutes on the server.
- The clock works if the internet drops. The last rendered forecast stays visible with an offline badge.
- The container has a health check at `/health`.
- Fullscreen mode hides the dashboard controls; double-tap the display or use the browser/system gesture to exit.

## Data source and privacy

Weather data comes from [Open-Meteo](https://open-meteo.com/). No API key is needed for normal non-commercial use. Your configured coordinates are sent to Open-Meteo by the container. An ICS URL is fetched only by the container and is never exposed to the browser configuration endpoint.

## Open source and design references

The dashboard is released under the [MIT License](LICENSE). Its clean-room clock and weather designs were informed by the general layout of [lovelace-htc-flipclock-weather](https://github.com/iamBiB/lovelace-htc-flipclock-weather), [plasma-flipclock](https://github.com/pruefsumme/plasma-flipclock), and [AlynxZhou/flipclock](https://github.com/AlynxZhou/flipclock). No source code, QML, fonts, branding, or image assets from those projects are distributed in this bundle. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for details.

## Stop or update

```sh
docker compose down
docker compose up -d --build
```
