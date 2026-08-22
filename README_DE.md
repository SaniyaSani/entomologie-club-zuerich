# Website des Studentischen Entomologie-Clubs Zürich

Die Website ist statisch und verwendet einen universellen ICS-Kalender als Event-CMS. Google Calendar, Outlook oder Nextcloud können als Quelle dienen; empfohlen ist derzeit Google Calendar.

## Inhalte bearbeiten

- allgemeine Einstellungen: `calendar-config.js`
- Vorstand und Ehrenmitglieder: `data/team.json`
- Event-Vorlage: `EVENT_BESCHREIBUNG_VORLAGE.txt`
- Gruppenbild: `assets/hero-group.jpg`
- Dokumente: `documents/statuten.pdf` und `documents/ehrenkodex.pdf`

## Seiten

- `index.html` — Startseite
- `events.html` — kommende Events
- `ueber-uns.html` — Beschreibung, Dokumente, Vorstand und Ehrenmitglieder
- `archiv.html` — vergangene Events nach Semester
- `verein.html` — Kontakt, Spenden, Impressum und Datenschutz

## Personen bearbeiten

In `data/team.json` gibt es zwei Listen: `board` und `honoraryMembers`. Namen werden mit `firstName` und `lastName` gepflegt; `pronouns` ist optional. Bei Ehrenmitgliedern werden Rolle und Studiengang bewusst nicht angezeigt.

## Spenden ergänzen

Die Spenden-Sektion wird über `donations` in `calendar-config.js` gesteuert. IBAN, Kontoinhaber:in und optional ein QR-Bild erst nach Eröffnung des Vereinskontos und interner Prüfung eintragen. Ohne IBAN zeigt die Seite automatisch einen neutralen Hinweis statt erfundener Bankdaten.

## Lokaler Start

```bash
python3 -m http.server 8080
```
