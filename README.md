# ChronoFlip

ChronoFlip is a single-container, zero-dependency ambient dashboard for tablets, TVs, laptops, and kiosk displays. It combines a configurable flip clock with weather, forecast, and an optional ICS agenda. Two switchable display styles are included: the spacious original Ambient layout and a compact retro Classic Weather layout.

## Quick start

1. Copy the example configuration:

   ```sh
   cp .env.example .env
   ```

2. Optionally edit `.env`. The included defaults use Timisoara, Romania and the Better F1 Calendar public feed.

3. Start the dashboard:

   ```sh
   docker compose up -d --build
   ```

4. On the tablet, open:

   ```text
   http://YOUR-COMPUTER-IP:8080
   ```

Tap the fullscreen icon in the upper-right corner to enter kiosk mode. For a permanent display, use a kiosk browser and enable “keep screen on.”

The upper-right controls provide light/dark mode, the full settings panel, and fullscreen kiosk mode. Settings are saved by the server and automatically synchronized to every connected tablet, TV, laptop, and iPad.

## One-command Docker run

```sh
docker build -t chronoflip .
docker run -d --name chronoflip --restart unless-stopped \
  -p 8080:8080 \
  -v chronoflip-settings:/data/settings \
  -e LOCATION_NAME="Timisoara, Romania" \
  -e LATITUDE="45.7489" \
  -e LONGITUDE="21.2087" \
  chronoflip
```

## Configuration

All settings are optional and configured with environment variables or `.env`:

| Variable | Default | Purpose |
| --- | --- | --- |
| `DASHBOARD_PORT` | `8080` | Host port used by Docker Compose |
| `SETTINGS_FILE` | `/data/settings/settings.json` | Persistent shared settings file |
| `LOCATION_NAME` | `Timisoara, Romania` | Initial weather city |
| `LATITUDE`, `LONGITUDE` | Timisoara coordinates | Initial weather coordinates |
| `TEMPERATURE_UNIT` | `celsius` | `celsius` or `fahrenheit` |
| `WIND_SPEED_UNIT` | `kmh` | `kmh`, `mph`, `ms`, or `kn` |
| `SHOW_SECONDS` | `false` | Show animated seconds when `true` |
| `BLINK_SEPARATOR` | `true` | Blink the hour/minute separator while seconds are hidden |
| `CLOCK_POSITION` | `center` | `center`, `top`, or full-width/full-height `fill` |
| `LOCALE` | `en-GB` | Initial shared interface language (`en-*` or `ro-*`) |
| `TIME_ZONE` | `Europe/Bucharest` | IANA timezone used before weather loads and for floating ICS times |
| `FORECAST_DAYS` | `5` | 3–7 days |
| `CALENDAR_ICS_FILE` | `/data/calendar/calendar.ics` | ICS file inside the container |
| `CALENDAR_ICS_URL` | Better F1 Calendar URL | Initial public ICS feed URL |
| `CALENDAR_DAYS` | `7` | Upcoming calendar window |
| `CALENDAR_MAX_EVENTS` | `4` | Events displayed, 1–8 |
| `DIM_START`, `DIM_END` | `22`, `7` | Automatic dimming hours |
| `DIM_LEVEL` | `0.72` | Night brightness, 0.25–1.0 |
| `SLEEP_ENABLED` | `false` | Initial clock-only sleep schedule state |
| `SLEEP_START`, `SLEEP_END` | `23:00`, `07:00` | Sleep interval in dashboard local time |
| `SLEEP_DAYS` | `0,1,2,3,4,5,6` | Active days, where 0 is Sunday and 6 is Saturday |
| `SLEEP_DIM_LEVEL` | `0.20` | Sleep-mode clock brightness, 0.05–1.0 |
| `SLEEP_SHOW_SECONDS` | `false` | Initial compact-seconds setting during sleep |
| `BURN_IN_SHIFT` | `true` | Periodic 2–3 px layout movement |

## On-screen settings

The settings panel includes the complete display set inspired by A Flip Clock:

- Ambient and Classic Weather display styles
- Five visibly different clock faces: Split Cards, Slate Cards, Ivory Panels, Mechanical, and Minimal
- Dark, Light, Midnight, and Sand themes
- Modern, Condensed, Roboto, and Monospace display fonts; the selected font also applies to the bold clock digits
- Fixed 24-hour time, optional compact corner seconds, and an optional blinking hour/minute separator
- Auto, horizontal, and vertical clock layouts
- Clock size and corner radius sliders
- Center, Top, or Fill Space clock position; Fill Space uses the full assigned width and height
- Shared sleep schedule with active days, clock-only display, brightness, and compact seconds controls
- Docker-default, city-name, or tablet-location weather
- Public iCal/ICS URL
- English and Romanian interface, weather, date, forecast, and calendar labels
- Reset and fullscreen kiosk controls

Classic Weather places the enlarged clock over a centered weather console, with a smaller forecast row below. Clock faces scale across the full assigned clock area; optional seconds remain compact in the lower-right corner. The implementation uses this project's own HTML, CSS, flip animation, and inline SVG weather symbols; it does not bundle code or artwork from the visual reference projects.

Fill Space expands the hour and minute cards across all available room above the weather and calendar. When seconds are enabled, they remain animated in a small lower-right corner card instead of consuming a third full-size panel or covering the minute digit. While Fill Space is active, the Size control is held at 100%; its previous value is preserved and returns when Center or Top is selected.

Choosing **Română** translates the controls, weather descriptions, dates, weekday names, forecast, calendar labels, and common status messages on every connected display without restarting the container.

The city option is resolved by the container through Open-Meteo. Tablet location uses the browser Geolocation API; on a LAN address, browsers commonly require HTTPS before they expose precise location. City mode is the reliable HTTP fallback.

### Sleep schedule

Sleep mode follows the dashboard timezone and supports overnight intervals plus individual active days. During the interval, weather, forecast, date, calendar, and status controls are hidden so only the dimmed clock remains. It preserves the selected Dark, Light, Midnight, or Sand theme while reducing overall brightness. Tap the sleeping clock once to restore full brightness and controls for 15 seconds.

Sleep start and end values use explicit `HH:MM` text fields, so they stay in 24-hour format even on devices whose regional settings normally render native time inputs with AM/PM.

### Shared client-server settings

The container is the single source of truth for display, language, theme, font, clock, sleep, weather, and calendar settings. Pressing **Apply** on any client writes the complete configuration to `/data/settings/settings.json`; all other open clients retrieve the new revision within five seconds. The Docker volume `chronoflip-settings` preserves it through image updates and container restarts. Legacy browser-local settings are removed when version 2.6 first loads.

Environment variables define the initial values and the values restored by **Reset**. Once the shared settings file exists, normal changes should be made from any one ChronoFlip settings panel instead of repeated on every display.

### Adaptive displays

The layout scales from compact laptop windows through landscape tablets to large TV viewports. It uses the available width, height, and aspect ratio rather than a device-specific pixel resolution. Auto layout changes direction in portrait view, compact landscape screens reduce vertical spacing, and large displays receive larger clock cards while preserving room for weather and calendar rows.

### Calendar from a local file

Copy or export your calendar as:

```text
calendar/calendar.ics
```

Then restart the dashboard:

```sh
docker compose restart dashboard
```

The `calendar/` directory is mounted read-only at `/data/calendar`. A URL entered in the shared on-screen settings takes priority; otherwise a mounted local file takes priority over `CALENDAR_ICS_URL`. An example file is included at `calendar/calendar.example.ics`.

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

## Display notes

- The dashboard adapts to tablet, laptop, TV, portrait, landscape, windowed, and fullscreen viewports.
- The Dark theme background is true black (`#000`). Roboto is bundled and self-hosted; the other font choices use device system fonts, so no runtime font download is required.
- Weather and remote calendar data are fetched and cached by the container, not by the tablet.
- Weather refreshes every 10 minutes; calendar data refreshes every 5 minutes on the server.
- The clock works if the internet drops. The last rendered forecast stays visible with an offline badge.
- The container has a health check at `/health`.
- Fullscreen mode hides the dashboard controls; double-tap the display or use the browser/system gesture to exit.

## Data source and privacy

Weather data comes from [Open-Meteo](https://open-meteo.com/). No API key is needed for normal non-commercial use. Your configured city or coordinates are sent to Open-Meteo by the container. Public ICS feeds are also fetched by the container; their URL is part of the shared client configuration so every display can show and edit the same value.

## Open source and design references

The dashboard is released under the [MIT License](LICENSE). Its clean-room clock and weather designs were informed by the general layout of [lovelace-htc-flipclock-weather](https://github.com/iamBiB/lovelace-htc-flipclock-weather), [plasma-flipclock](https://github.com/pruefsumme/plasma-flipclock), and [AlynxZhou/flipclock](https://github.com/AlynxZhou/flipclock). No source code, QML, fonts, branding, or image assets from those projects are distributed in this bundle. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for details.

## Stop or update

```sh
docker compose down
docker compose up -d --build
```
