# Local calendar

To display a local calendar, put a file named `calendar.ics` in this folder and restart the container:

```sh
docker compose restart dashboard
```

The folder is mounted read-only inside the container. A local `calendar.ics` file takes priority over `CALENDAR_ICS_URL`.

`formula1-2026.ics` is included as a ready-to-copy example based on Formula 1's published 2026 calendar announcement.
