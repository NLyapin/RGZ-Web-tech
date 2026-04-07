# RGZ Web Tech — Video Hosting

РГЗ по теме:  
**«Создание тестовой видеоплатформы с использованием технологий Python для бэкенда, React JS для фронтенда и Figma для дизайна»**.

## Что реализовано

- Регистрация пользователя и вход по JWT.
- Импорт видеофайлов.
- Каталог видео с карточками.
- Просмотр видео и стриминг через endpoint с поддержкой `Range`.
- Редактирование и удаление видео.
- UI: бургер-меню, профиль, базовые анимации.
- Запуск в Docker (`backend` + `frontend`).

## Технологии

- Backend: `Django 4.2`, `Django REST Framework`, `SimpleJWT`
- Frontend: `React (CRA)`
- База данных: `SQLite` (по умолчанию в текущем docker-compose)
- Контейнеризация: `Docker`, `docker compose`

## Структура репозитория

- `backend/` — Django project (`settings.py`, `urls.py`)
- `videos/` — основное DRF-приложение (модели, сериализаторы, viewset, auth endpoints)
- `frontend/` — React-приложение
- `docs/` — документация API
- `docker-compose.yml` — запуск приложения в контейнерах

## Быстрый старт (рекомендуется)

Требования:
- Docker Desktop
- Docker Compose v2

Запуск:

```bash
docker compose up -d --build
```

Проверка:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/`

Остановка:

```bash
docker compose down
```

## Локальный запуск без Docker

### Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
USE_SQLITE=1 python manage.py migrate
USE_SQLITE=1 python manage.py runserver 0.0.0.0:8000
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Переменные окружения Backend

Поддерживаются в `backend/settings.py`:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG` (`1`/`0`)
- `DJANGO_ALLOWED_HOSTS` (через запятую)
- `CORS_ALLOWED_ORIGINS` (через запятую)
- `USE_SQLITE` (`1` включает SQLite)

Если `USE_SQLITE=0`, backend ожидает:
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_HOST`
- `POSTGRES_PORT`

## Документация API

Подробно: [docs/api.md](docs/api.md)

## Типовой сценарий проверки

1. Зарегистрировать пользователя.
2. Получить JWT (`access`, `refresh`).
3. Выполнить импорт видео через `POST /api/videos/`.
4. Проверить каталог через `GET /api/videos/`.
5. Открыть видео и проверить стрим через `GET /api/videos/{id}/stream/`.
