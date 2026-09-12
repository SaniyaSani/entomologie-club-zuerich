# Website des Studentischen Entomologie-Clubs Zürich

Die Website ist statisch und verwendet einen Google-Scripts Link, der sich auf ein Google Sheets bezieht.

## Inhalte bearbeiten

- Header und Footer auf allen Seiten: siehe `components`
- Vorstand und Ehrenmitglieder: `data/team.json` und `data/honorary.json`
- Event-Vorlage: siehe Dokumentation Events
- Gruppenbild: `assets/group.jpg`
- Mitglieder-Portraits: `assets/team`
- Dokumente: `documents/statuten.pdf` und `documents/ehrenkodex.pdf`

## Seiten

- `index.html` — Startseite
- `events.html` — kommende Events
- `ueber-uns.html` — Beschreibung, Dokumente, Vorstand und Ehrenmitglieder
- `archiv.html` — vergangene Events nach Semester
- `kontakt.html` — Kontakt, Spenden, Impressum und Datenschutz

## Personen bearbeiten

In `data` gibt es zwei Listen: `tem.json` und `honorary.json`. Bei Ehrenmitgliedern werden Rolle und Studiengang bewusst nicht angezeigt.

## Spenden ergänzen

Die Spenden-Sektion wird über `kontakt.html` gesteuert. IBAN, Kontoinhaber:in und optional ein QR-Bild erst nach Eröffnung des Vereinskontos und interner Prüfung eintragen.

