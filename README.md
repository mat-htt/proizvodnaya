# MathBase

Интерактивный курс по производной: лекции с формулами, тесты с мгновенной проверкой,
итоговое тестирование (4 варианта), кабинет учителя со статистикой и режим «Эфир»
с QR-кодом и живым рейтингом для выступлений.

| Часть | Папка | Технологии | Адрес |
|---|---|---|---|
| Бэкенд (API) | `back-end/` | Django, Django REST Framework, JWT, PostgreSQL | http://localhost:8000 |
| Фронтенд (сайт) | `frontend-math/frontend-math/` | React, React Router, KaTeX | http://localhost:3000 |

Сайт (React) берёт все данные у бэкенда по адресу `http://<тот же хост>:8000/api/`.
Вход выдаёт JWT-токен, он хранится в браузере и прикладывается к запросам.

## Первый запуск

Нужны Python 3.12+, Node.js 18+ и PostgreSQL с базой `math_db`.

### Бэкенд

```bash
cd back-end
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

В `back-end/core/settings.py` в блоке `DATABASES` укажите пароль к своему PostgreSQL, затем:

```bash
python manage.py migrate
python manage.py seed_control_tests   # итоговое тестирование: 4 варианта по 10 задач
python manage.py seed_demo_data       # демо-учителя, ученики и их попытки
python manage.py createsuperuser      # свой аккаунт для админки (по желанию)
```

### Фронтенд

```bash
cd frontend-math/frontend-math
npm install
```

## Ежедневный запуск

Два окна терминала — сервера работают одновременно.

**Окно 1 — бэкенд:**

```bash
cd back-end
venv\Scripts\activate
python manage.py runserver 0.0.0.0:8000
```

**Окно 2 — фронтенд:**

```bash
cd frontend-math/frontend-math
npm start
```

Сайт откроется на http://localhost:3000. Остановить сервер — `Ctrl + C`.

`0.0.0.0` нужен, чтобы сайт открывался с телефонов в той же Wi-Fi сети (режим «Эфир»).
Если Windows спросит про брандмауэр для Python — разрешите доступ.

## Полезное

| Что | Команда / адрес |
|---|---|
| Админка Django | http://localhost:8000/admin |
| Обновить базу после `git pull` | `python manage.py migrate` |
| Тесты бэкенда | `python manage.py test education.tests` |
| Тесты фронтенда | `npm test` |
| Сборка фронтенда для хостинга | `npm run build` |

Демо-логины и пароли — в [DEMO_ACCOUNTS.md](DEMO_ACCOUNTS.md).

> `seed_control_tests` пересоздаёт вопросы итогового тестирования. После того как ученики
> его прошли, команду лучше не запускать: разбор ответов по прошлым попыткам пропадёт.

## Структура

```
back-end/
  core/                     настройки Django и корневые URL
  education/
    models.py               лекции, тесты, вопросы, попытки, группы
    views.py, urls.py       API: /api/lectures, /api/tests, /api/submit-test, /api/leaderboard ...
    answers.py              проверка ответов (дроби и десятичные сравниваются по значению)
    management/commands/    seed_control_tests, seed_demo_data
frontend-math/frontend-math/
  public/images/covers/     обложки лекций
  src/pages/                страницы сайта
  src/components/           шапка, подвал, карточки, редактор тестов
  src/css/, src/index.css   стили (цвета и размеры — в начале index.css)
```
