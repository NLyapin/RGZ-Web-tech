# API Documentation

Базовый URL:

```text
http://localhost:8000/api
```

Формат:
- Request/response: `application/json` (кроме upload)
- Авторизация: `Authorization: Bearer <access_token>`

## 1. Auth

### 1.1 Регистрация

`POST /auth/register/`

Request:

```json
{
  "username": "demo",
  "email": "demo@example.com",
  "password": "demo1234"
}
```

Response `201`:

```json
{
  "id": 1,
  "username": "demo",
  "email": "demo@example.com"
}
```

Пример:

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@example.com","password":"demo1234"}'
```

### 1.2 Получение JWT

`POST /auth/token/`

Request:

```json
{
  "username": "demo",
  "password": "demo1234"
}
```

Response `200`:

```json
{
  "refresh": "eyJhbGciOi...",
  "access": "eyJhbGciOi..."
}
```

Пример:

```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo1234"}'
```

### 1.3 Обновление access token

`POST /auth/token/refresh/`

Request:

```json
{
  "refresh": "eyJhbGciOi..."
}
```

Response `200`:

```json
{
  "access": "eyJhbGciOi..."
}
```

## 2. Videos

### 2.1 Получить список видео

`GET /videos/` (публичный)

Response `200`:

```json
[
  {
    "id": 2,
    "title": "My video",
    "description": "Description",
    "file_url": "http://localhost:8000/media/videos/example.mp4",
    "thumbnail_url": "",
    "uploaded_by": "demo",
    "created_at": "2026-04-08T01:20:43.243985+07:00",
    "updated_at": "2026-04-08T01:20:43.244039+07:00",
    "views": 0
  }
]
```

Пример:

```bash
curl http://localhost:8000/api/videos/
```

### 2.2 Создать видео (upload)

`POST /videos/` (требует JWT)

Form-data поля:
- `title` — string
- `description` — string (опционально)
- `file` — video file
- `thumbnail` — image file (опционально)

Пример:

```bash
ACCESS_TOKEN="<your_access_token>"

curl -X POST http://localhost:8000/api/videos/ \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -F "title=Test video" \
  -F "description=Uploaded from curl" \
  -F "file=@/absolute/path/video.mp4"
```

Response `201`:

```json
{
  "id": 3,
  "title": "Test video",
  "description": "Uploaded from curl",
  "file": "http://localhost:8000/media/videos/video.mp4",
  "thumbnail": null
}
```

### 2.3 Получить видео по id

`GET /videos/{id}/` (публичный)

Пример:

```bash
curl http://localhost:8000/api/videos/3/
```

### 2.4 Частично обновить видео

`PATCH /videos/{id}/` (требует JWT)

Request:

```json
{
  "title": "New title",
  "description": "New description"
}
```

Пример:

```bash
ACCESS_TOKEN="<your_access_token>"

curl -X PATCH http://localhost:8000/api/videos/3/ \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title":"New title","description":"New description"}'
```

### 2.5 Удалить видео

`DELETE /videos/{id}/` (требует JWT)

Пример:

```bash
ACCESS_TOKEN="<your_access_token>"

curl -X DELETE http://localhost:8000/api/videos/3/ \
  -H "Authorization: Bearer ${ACCESS_TOKEN}"
```

Response `204`: пустое тело.

### 2.6 Стриминг видео (Range)

`GET /videos/{id}/stream/` (публичный)

Поддерживается заголовок `Range`, ответ `206 Partial Content`.

Пример:

```bash
curl -H "Range: bytes=0-1048575" \
  -o part.mp4 \
  http://localhost:8000/api/videos/2/stream/
```

## 3. Коды ответов

- `200` — успешный запрос
- `201` — ресурс создан
- `204` — ресурс удален
- `400` — ошибка валидации
- `401` — отсутствует/некорректный токен
- `404` — ресурс не найден
- `416` — некорректный `Range`

## 4. Быстрый e2e сценарий

1. `POST /auth/register/` — создать пользователя  
2. `POST /auth/token/` — получить `access`  
3. `POST /videos/` — загрузить видео  
4. `GET /videos/` — увидеть запись в каталоге  
5. `PATCH /videos/{id}/` — отредактировать название/описание  
6. `GET /videos/{id}/stream/` — проверить потоковое воспроизведение  
7. `DELETE /videos/{id}/` — удалить видео  
