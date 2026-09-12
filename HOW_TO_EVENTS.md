# Anleitung für das Erstellen und Bearbeiten von Events

## Wo werden Events gespeichert?
Die Events werden in einem Google Sheets verwaltet. Ein Google Script erstellt anschliessend daraus einen Link, der diese Daten in ein lesbares Dictionary-Format überträgt und an die Webseite weitergibt.

Für die Verwaltung der Events ist hauptsächlich der **Social Media Manager** und ferner auch das **Präsidium** verantwortlich. Solltest du eine dieser beiden Positionen haben oder sonst generell an den Events mitarbeiten wollen, lass dich von einem unserer Mitglieder per **gmail-Adresse** freischalten.
Bitte lies dir vorher den Rest dieses Dokuments durch.

## Wie ist die Tabelle aufgebaut?
Die Spalten stellen die jeweiligen "Parameter" der Events dar, die Zeilen dann die einzelnen Events. Wenn möglich, sollen diese immer chronologisch von oben nach unten eingetragen werden.

Bitte unter KEINEN UMSTÄNDEN die Spalten neu sortieren, neue Werte zu Drop-Downs hinzufügen oder neue Spalten erstelle!. Dies könnte dazu führe, dass die Events falsch oder sogar gar nicht auf der Webseite angezeigt werden! Bei Fehlern, Fragen und Anmerkungen zum Event-System bitte an den aktuellen **Social Media Manager** wenden.

## Zu den einzelnen Parametern

Parameter, die als Dropdown ausgewählt werden, werden hier mit ~ markiert.

### ID
Jedes Event hat eine eigene Identifikationsnummer. Diese besteht aus dem aktuellen Jahr, Bindestrich und dreistelliger Kennnummer, also zum Beispiel `2026-001`. Die Events werden, wenn möglich, immer chronologisch aufsteigend nummeriert. Begonnen wird ab `001`, zum Jahresanfang wird der "Counter" wieder auf `001` zurückgesetzt.

Die ID dient nur zu organisatorischen Zwecken und wird auf der Webseite nicht angezeigt.

### TITLE
Titel oder Name des Events, der auf der Webseite angezeigt wird. Er sollte nicht zu lang sein, z. B. `Lichtfang am Irchel` oder `Workshop Präparation`.

### DATE_START und DATE_END
Muss im Datumsformat `YYYY-MM-DD`, da die Tabelle diesen Wert als "Datum" erkennt. Bei den meisten Events (an einem Tag), ist **DATE_START** = **DATE_END**. Bei mehrtägigen Events (z. B. Ausflüge) entsprechend Start- und Enddatum eintragen.

### TIME
Zeit wird hier nur als Freitext eingetragen. Wenn möglich und sinnvoll, Start- und Endzeitpunkt eintragen (z. B. `09:00 - 16:00 Uhr`). Leerzeichen bei den Eingabe beachten. Bei Open-End- oder mehrtägigen Veranstaltungen Startzeit am Treffpunkt eintragen (`ab 09:00 Uhr`).

### TYPE ~
Kategorien, nach denen das Event gefiltert werden kann. Diese sind:

- `excursion`: Für Ausflüge aller Art und alles, was irgendwo draussen stattfindet
- `workshop`: Für alles, wo die Leute selbst etwas machen können, z. B. Präparations-Workshop, Bestimmungsabend etc.
- `talk`: Vorträge, also alles nicht-Interaktive, wo man drinnen ist
- `session`: Sitzungen, also jegliche offene und nicht-offene Vereinssitzungen
- `event`: Alles, was nicht in die obigen Kategorien passt (wird auf de Webseite unter "Sonstige" angezeigt)

Im Zweifel immer danach gehen, was der "Hauptpunkt" eines Events ist. Ein Ausflug ins Museum ist eine `excursion`, obwohl er drinnen stattfindet. Eine Sitzung ist eine `session`, obwohl man dabei auch was bestimmen kann. Eine Lichtfang mit anschliessender Bestimmung ist auch eine `excursion`, weil der Fokus hier auf dem "einzigartigeren" Event liegt. Im Notfall mit anderen Teammitgliedern absprechen.

### LOCATION
Treffpunkt (**NICHT** Haupt-Veranstaltungsort). Fährt man z. B. zusammen ins Naturkundemuseum Karlsruhe, dann wird hier **NICHT** "Naturkundemuseum Karlsruhe", sondern "Zürich HB" eingetragen, da man (höchstwahrscheinlich) zusammen ab Zürich HB nach Karlsruhe fährt.

Als Treffpunkte geeignet sind z. B. Räume der UZH (z. B. `Y14-F-21`), Orte in Irchel/Zürich (z. B. `Naturhistorisches Museum`) oder Bahnhöfe und Haltestellen (z. B. `Bahnhof Stettbach`).

Bitte nicht zu lang wählen, da dies auf der Event-Ansicht angezeigt wird. Im Zweifel Treffpunkt/Anreise mit anderen Teammitgliedern absprechen und/oder in der Event-Beschreibung den Treffpunkt näher spezifizieren.

### SHORT
Kurzbeschreibung des Events in einem Satz. Bitte nicht zu lang wählen, da dies auf der Event-Ansicht angezeigt wird.

### DESCRIPTION
Längere Beschreibung des Events, die bei der auch auf wichtige Details eingegangen wird, zum Beispiel:

- Programm/Inhalte
- Was muss man mitbringen?
- Kosten (Studentenrabatt, Reisekosten etc.)
- ggf. Treffpunkt
- etc.

Datum, Uhrzeit und Treffpunkt werden hier in aller Regel **NICHT** nochmal wiederholt

Die Beschreibung verwendet **Markdown** (darin ist z. B. auch diese Seite geschrieben). Hier das wichtigste

- `**fett**` dieser Text ist **fett**
- `*kursiv*` dieser Text ist *kursiv*
- ``### Subheading` für Zwischenüberschriften (nur wenn notwendig)
- Absatz für Absätze
- `> Infobox` für die hellblauen Infoboxen. Diese können verwendet werden, um "good to know" Sachen mitzuteilen (sparsam verwenden)
- `[hier](https://www.uzh.ch/de.html)` erzeugt einen Link, wie [hier](https://www.uzh.ch/de.html)

Es empfiehlt sich, die Beschreibung vorher im Editor deiner Wahl (z. B. Word) zu schreiben und dann in das Tabellenfeld zu kopieren.

### IMAGE
Hier kommt die Bild-URL für die "normale" Event-Ansicht hin. Valide Werte sind Bild-URLs aus dem Internet oder Dateipfad zum Bild im GitHub-Ordner.

**Beispiele für valide Eingabewerte:**

- `https://www.nabu.de/imperia/md/nabu/images/arten/tiere/insekten/hautfluegler/bienen-hummeln/141201-nabu-honigbienen-auf-fenchel-helge-may.jpeg`
- `assets/events/beetle_terrarium.jpeg`

Bitte darauf achten, dass diese Bilder möglichst im Format 16:9 sind, halbwegs vernünftige Auflösung haben und in gängigen Bildformaten sind (`.png` `.jpg` `.jpeg` ... **KEIN** `.svg`). Event-Bilder immer in `assets/events/` hochladen.
Wird dieses Feld leergelassen, wird stattdessen `assets/events/fallback.png` verwendet.

### DIALOG_IMAGE
Hier kann ein Bild hinzugefügt werden, welches angezeigt wird, wenn man den Dialog anklickt. Für die generellen Regeln für Bilder, siehe oben.
Es gibt hier noch zwei spezielle Fälle bei den Eingabewerten:

**Beispiele für valide Eingabewerte:**

- `https://www.nabu.de/imperia/md/nabu/images/arten/tiere/insekten/hautfluegler/bienen-hummeln/141201-nabu-honigbienen-auf-fenchel-helge-may.jpeg`
- `assets/events/beetle_terrarium.jpeg`
- `duplicate` - das Bild aus `IMAGE` wird wiederverwendet.
- `empty` - es wird kein Bild angezeigt (gut geeignet für z. B. kleinere Events)

Wird dieses Feld leergelassen, wird stattdessen `assets/events/fallback.png` verwendet.

### REGISTARTION_REQUIRED ~
Ob eine Anmeldung **erforderlich** ist. Gut geeignet für Events mit begrenzter Teilnehmer-Anzahl, Gruppen-Tickets etc.

### REGISTRATION_URL
Wenn `REGISTRATION_REQUIRED` auf `yes` gesetzt ist, dann hier die URL zum Anmeldeformular einfügen. Hierfür eignet sich z. B. Google-Forms.

### REGISTARTION_OPEN ~
Ob eine Anmeldung **noch möglich** ist, z. B. bei Events mit begrenzter Teilnehmer-Anzahl, Anmelde-Deadline etc.

**Muss manuell im Sheets umgeschaltet werden!!!**

Bei begrenzter Teilnehmer Anzahl gilt i. d. R. "first come, first serve", es gibt keine "Vorteile" für Mitglieder. Bei Events `nur für Mitglieder` können sich nur Mitglieder anmelden, d. h. Anmeldungen von nicht-Mitgliedern werden nicht berücksichtigt. Im Zweifel mit anderen Teammitgliedern absprechen.

### AUDIENCE ~
`all` für alle, `members only` nur für Mitglieder. Vereinssitzungen sind zum Beispiel eine `members only` Veranstaltung (ausser offene Sitzungen natürlich).

### LANGUAGE
Hier die "Hauptsprache" der Veranstaltung eintragen, z. B. `DE` für Deutsch, `EN` für Englisch, etc. Bei mehreren Sprachen im Format `DE / EN` eintragen.

### COST
Die Kosten pro Person werden hier als Freitext eingetragen. Mögliche Eingabewerte:

- `kostenlos`
- `5 CHF`
- `5-10 CHF`
- bei nicht genau kalkulierbaren oder variablen Kosten - `variabel`

### SEMESTER ~
Das Semester, dem die Veranstaltung zugeordnet wird (wichtig für das **Event-Archiv**). Die offiziellen Semesterzeiten können [hier](https://www.students.uzh.ch/de/dates/dates.html) nachgelesen werden.

### PUBLISHED ~ (WICHTIG!!!)
Dies ist der "letzte Drehhebel", bevor die Veranstaltung veröffentlicht wird. Sobald dieser Wert auf `yes` gesetzt wird, wird das Event auf der Webseite veröffentlicht. Bitte vor dem Veröffentlichen noch einmal alle anderen Daten kontrollieren. Im Zweifel nochmal mit anderen Teammitgliedern absprechen.

## Was muss ich machen, wenn ein Event zu Ende ist?
Nach dem Ablaufen des Events wird dieses automatisch ins Event-Archiv einsortiert. Trotzdem empfiehlt sich, folgendes zu kontrollieren:

- Ist das Semester per Dropdown richtig ausgefüllt? (wichtig für die Einordnung ins Archiv)
- Sind alle anderen Parameter korrekt?
- Falls `REGISTARTION_OPEN` = `yes`: Manuell auf `no` umschalten.
- **NICHT** `PUBLISHED` auf `no` umstellen (Event ist sonst gar nicht sichtbar)

## Ich habe ein Event eingetragen. Wann ist es sichtbar?
Sobald `PUBLISHED` auf `yes` umgestellt wird, ist das Event beim nächsten Reload der Seite sichtbar. Manchmal dauert es ein wenig, bis die Events geladen werden (z. B. bei schlechter Verbindung). Sollten die Events nicht erscheinen, empfiehlt sich, die Seite neu zu laden.
