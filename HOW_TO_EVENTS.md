# Anleitung für das Erstellen und Bearbeiten von Events

## Wo werden Events gespeichert?
Die Events werden in einem Google Sheets verwaltet. Ein Google Script erstellt anschliessend daraus einen Link, der diese Daten in ein lesbares Dictionary-Format überträgt und an die Webseite weitergibt.

Für die Verwaltung der Events ist hauptsächlich der **Social Media Manager** und ferner auch das **Präsidium** verantwortlich. Solltest du eine dieser beiden Positionen haben oder sonst generell an den Events mitarbeiten wollen, lass dich von einem unserer Mitglieder per **gmail-Adresse** freischalten.
Bitte lies dir vorher den Rest dieses Dokuments durch.

## Wie ist die Tabelle aufgebaut?
Die Spalten stellen die jeweiligen "Parameter" der Events dar, die Zeilen dann die einzelnen Events. Wenn möglich, sollen diese immer chronologisch von oben nach unten eingetragen werden.

## Zu den einzelnen Parametern
### ID
Jedes Event hat eine eigene Identifikationsnummer. Diese besteht aus dem aktuellen Jahr, Bindestrich und dreistelliger Kennnummer, also zum Beispiel `2026-001`. Die Events werden, wenn möglich, immer chronologisch aufsteigend nummeriert. Begonnen wird ab `001`, zum Jahresanfang wird der "Counter" wieder auf `001` zurückgesetzt.

Die ID dient nur zu organisatorischen Zwecken und wird auf der Webseite nicht angezeigt.

### TITLE
Titel oder Name des Events, der auf der Webseite angezeigt wird. Er sollte nicht zu lang sein, z. B. `Lichtfang am Irchel` oder `Workshop Präparation`.

### DATE_START und DATE_END
Muss im Datumsformat `YYYY-MM-DD`, da die Tabelle diesen Wert als "Datum" erkennt. Bei den meisten Events (an einem Tag), ist **DATE_START** = **DATE_END**. Bei mehrtägigen Events (z. B. Ausflüge) entsprechend Start- und Enddatum eintragen.

### TIME
Zeit wird hier nur als Freitext eingetragen. Wenn möglich und sinnvoll, Start- und Endzeitpunkt eintragen (z. B. `09:00 - 16:00 Uhr`). Leerzeichen bei den Eingabe beachten. Bei Open-End- oder mehrtägigen Veranstaltungen Startzeit am Treffpunkt eintragen (`ab 09:00 Uhr`).

### TYPE
Kategorien, nach denen das Event gefiltert werden kann.
