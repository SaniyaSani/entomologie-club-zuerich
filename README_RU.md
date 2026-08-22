# Studentischer Entomologie-Club Zürich — версия по фидбеку Samuel

## Что изменено

- отдельные страницы: Startseite, Events, Über uns, Event-Archiv, Kontakt;
- на странице Events только будущие события, toggle прошлых удалён;
- прошедшие события автоматически появляются в архиве и группируются по FS/HS;
- Vorstand загружается из `data/team.json`;
- кнопка Mitglied werden сейчас скрыта через `showMembership: false`;
- hero по умолчанию использует изображение, но видео можно вернуть одной настройкой;
- слово `Studentischer` сохраняется в мобильной шапке;
- добавлены поля Anmeldung, Kosten, Zielgruppe, Bild, Kurzbeschreibung;
- все времена отображаются в `Europe/Zurich`, в том числе UTC-события Google Calendar.

## Быстрый запуск

```bash
python3 -m http.server 8080
```

Открыть `http://localhost:8080`.

## Подключение Google Calendar

1. Создайте отдельный календарь клуба.
2. В `Settings and sharing` включите публичный доступ с полными деталями событий.
3. В `Integrate calendar` скопируйте `Public address in iCal format`.
4. В GitHub: `Settings → Secrets and variables → Actions → ICS_URL`.
5. Вставьте новую ICS-ссылку.
6. Запустите `Actions → Kalender synchronisieren → Run workflow`.

Сайт читает `data/calendar.ics`; workflow автоматически заменяет этот файл содержимым Google Calendar.

## Как оформлять событие

Название, дата, время и location заполняются обычными полями Google Calendar. В description вставляется шаблон из `EVENT_BESCHREIBUNG_VORLAGE.txt`.

```text
TYPE: excursion
REGISTRATION_REQUIRED: yes
REGISTRATION_URL: https://forms.gle/...
COST: free
AUDIENCE: all
SHORT: Короткое описание.
IMAGE: https://публичная-ссылка-на-картинку.jpg
SEMESTER: HS 2026
LANGUAGE: DE / EN

Полное описание события.
```

`SEMESTER` необязателен: сайт определяет FS/HS автоматически.

## Как поменять групповое фото

Положите фотографию, например, в `assets/hero-group.jpg`, затем в `calendar-config.js`:

```js
hero: {
  mode: "image",
  imageUrl: "assets/hero-group.jpg",
  imagePosition: "center center"
}
```

Для видео:

```js
mode: "video"
```

и замените `assets/hero-loop.mp4` и `assets/hero-poster.jpg`.

## Как редактировать Vorstand и Ehrenmitglieder

Откройте `data/team.json`. Внутри есть два списка: `board` и `honoraryMembers`. Для каждого человека доступны:

- `firstName`
- `lastName`
- `pronouns` (необязательно)
- `role`
- `study`
- `favouriteInsect`
- `portrait`
- `contact` (необязательно)

Портреты удобно класть в `assets/team/`.

У Ehrenmitglieder поля `role` и `study` не показываются. Разделы Vorstand и Ehrenmitglieder можно сворачивать клавиатурой или нажатием — это сделано через нативный HTML `details`.

## Как добавить реквизиты для Spenden

В `calendar-config.js` заполните блок `donations`. Пока `iban` пустой, сайт показывает нейтральный текст о том, что банковские реквизиты появятся после открытия счёта и внутренней проверки. Поле `qrImageUrl` необязательно.

## Как вернуть Mitglied werden

В `calendar-config.js`:

```js
showMembership: true,
membershipUrl: "https://..."
```

## Что нужно заменить перед публикацией

- email и адрес;
- социальные ссылки;
- Google Calendar subscription link;
- портреты и данные Vorstand;
- групповое фото;
- официальные Statuten и Ehrenkodex (сейчас открываются страницы-заглушки);
- фамилии и, по желанию, pronouns членов Vorstand;
- IBAN и Kontoinhaber:in после открытия и проверки Vereinskontos;
- Impressum и Datenschutz после проверки официальных данных.
