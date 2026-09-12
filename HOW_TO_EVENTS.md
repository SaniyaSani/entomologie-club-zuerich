# Anleitung für das Erstellen und Bearbeiten von Events

## Wo werden Events gespeichert?
Die Events werden in einem Google Sheets verwaltet. Ein Google Script erstellt anschliessend daraus einen Link, der diese Daten in ein lesbares Dictionary-Format überträgt und an die Webseite weitergibt.

Für die Verwaltung der Events ist hauptsächlich der **Social Media Manager** und ferner auch das **Präsidium** verantwortlich. Solltest du eine dieser beiden Positionen haben oder sonst generell an den Events mitarbeiten wollen, lass dich von einem unserer Mitglieder per **gmail-Adresse** freischalten.
Bitte lies dir vorher den Rest dieses Dokuments durch.

## Wie ist die Tabelle aufgebaut?
Die Spalten stellen die jeweiligen "Parameter" der Events dar, die Zeilen dann die einzelnen Events. Wenn möglich, sollen diese immer chronologisch von oben nach unten eingetragen werden.

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
