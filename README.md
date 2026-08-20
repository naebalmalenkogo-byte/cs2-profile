# CS2 PROFILE

Визуальный профиль CS2: рейтинги (CyberShore, Premier, Faceit), статистика киллов/хедшотов, графики, матчи, достижения.

## Запуск локально

```
node server.js
```

Открой http://localhost:3000

## Хостинг на GitHub Pages

1. Создай токен GitHub: https://github.com/settings/tokens → Generate new token → галка `repo`.
2. Запусти загрузку (создаст репозиторий, загрузит файлы, включит Pages):

```
powershell -ExecutionPolicy Bypass -File github-upload.ps1 -Token "ТВОЙ_ТОКЕН"
```

3. Через 1–2 минуты сайт будет доступен по ссылке вида `https://ТВОЙ_ЛОГИН.github.io/cs2-profile/`

## База данных

- `data/stats.json` — вся статистика профиля (обновляй этот файл).
- `.github/workflows/daily-stats.yml` — GitHub Actions: каждый день в 3:00 автоматически делает снимок статистики и коммитит в репозиторий (полная история в `history`).
- Приложение само определяет репозиторий по адресу страницы и берёт свежую базу с GitHub.

## Защита

- Отключены: ПКМ, выделение, перетаскивание, Ctrl+C/X/S/P/U, F12, DevTools.
- Капча на форме подключения.
- Водяной знак с ником профиля.
- `robots.txt` запрещает индексацию поисковиками.