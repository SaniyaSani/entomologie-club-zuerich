# Website des Studentischen Entomologie-Clubs Zürich

Die Website ist statisch und verwendet einen universellen ICS-Kalender als Event-CMS. Google Calendar, Outlook oder Nextcloud können als Quelle dienen; empfohlen ist derzeit Google Calendar.

## Inhalte bearbeiten

- allgemeine Einstellungen: `calendar-config.js`
- Vorstand: `data/team.json`
- Event-Vorlage: `EVENT_BESCHREIBUNG_VORLAGE.txt`
- Gruppenbild: `assets/hero-group.jpg`
- Dokumente: `documents/statuten.pdf` und `documents/ehrenkodex.pdf`

## Seiten

- `index.html` — Startseite
- `events.html` — kommende Events
- `ueber-uns.html` — Verein und Vorstand
- `archiv.html` — vergangene Events nach Semester
- `verein.html` — Dokumente, Kontakt, Impressum und Datenschutz

## Lokaler Start

```bash
python3 -m http.server 8080
```
