# Website-Prototyp: Studentischer Entomologie-Club Zürich

Die Website liest einen normalen ICS-Kalender. Dadurch kann der Kalender später aus Google Calendar, Outlook, Nextcloud oder einem anderen kompatiblen Dienst stammen.

## Lokal starten

```bash
python3 -m http.server 8080
```

Danach im Browser öffnen:

```text
http://localhost:8080
```

## Empfohlener Betrieb

1. Einen separaten Kalender für öffentliche Club-Events anlegen.
2. Den ICS-Link als GitHub Repository Secret `ICS_URL` speichern.
3. Den vorhandenen Workflow `.github/workflows/sync-calendar.yml` manuell starten.
4. Danach aktualisiert der Workflow `data/calendar.ics` automatisch.

## Event-Metadaten

Am Anfang der Kalenderbeschreibung können optionale Zeilen stehen:

```text
TYPE: excursion
STATUS: open
LANGUAGE: DE / EN
SHORT: Kurzer Text für die Event-Liste.
IMAGE: https://example.org/eventbild.jpg
REGISTRATION: https://example.org/anmeldung

Hier beginnt die ausführliche Eventbeschreibung.
```

## Banner-Video

Ersetze:

```text
assets/hero-loop.mp4
assets/hero-poster.jpg
```

Empfehlung: MP4/H.264, 1920×1080, 8–15 Sekunden, ohne Ton.
