# Как обновить существующий GitHub-репозиторий

Этот проект уже настроен так, чтобы использовать существующий GitHub Secret `ICS_URL` и workflow синхронизации календаря.

## Рекомендуемый способ: GitHub Desktop

1. Установите и откройте GitHub Desktop.
2. Выберите `File → Clone repository`.
3. Найдите репозиторий `SaniyaSani/entomologie-club-zuerich` и клонируйте его.
4. Откройте локальную папку репозитория через `Repository → Show in Finder`.
5. Скопируйте содержимое папки из ZIP обновления в папку репозитория с заменой файлов.
6. В GitHub Desktop в поле Summary напишите, например:

   `Website nach Samuel-Feedback aktualisiert`

7. Нажмите `Commit to main`, затем `Push origin`.
8. В GitHub откройте `Actions → Kalender synchronisieren → Run workflow`.
9. После зелёной галочки дождитесь `pages build and deployment` и обновите сайт через `Cmd + Shift + R`.

## Важно

ZIP `UPDATE` специально не содержит `data/calendar.ics`, поэтому уже загруженный Google Calendar не заменяется демонстрационными событиями.

## Что заполнить после обновления

- `calendar-config.js`: email, адрес, социальные ссылки и ссылка подписки на Google Calendar;
- `data/team.json`: данные Vorstand;
- `assets/hero-group-placeholder.svg`: заменить на групповое фото и прописать его в Config;
- `statuten.html` / `ehrenkodex.html`: позже заменить ссылками на официальные PDF.
