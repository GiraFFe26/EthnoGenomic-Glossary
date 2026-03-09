# EthnoGenomic Glossary

Двуязычный (RU/EN) словарь-навигатор терминов этногеномики. Каркас включает FastAPI + PostgreSQL с полнотекстовым поиском и фронтенд на React/Vite.

## Стек
- Backend: FastAPI (Python 3.12), SQLAlchemy, PostgreSQL FTS
- Frontend: React + Vite + TypeScript
- Кэш: Redis (подсказки частых запросов)
- Auth: JWT (FastAPI), роли admin/editor/viewer
- Контейнеры: Docker + Docker Compose

## Быстрый старт
```bash
docker compose up --build
```
- Frontend: http://localhost:3000  
- API: http://localhost:8000  
- pgAdmin: http://localhost:5050 (логин `admin@example.com`, пароль `admin`)
- Redis: localhost:6379 (используется для подсказок поиска)
- Auth: `admin@ethnoglossary.org` / `ChangeMe123!` (создаётся автоматически на старте) — смените через /auth/register под админом
  - В docker-сборке фронт стучится на `http://backend:8000` (см. VITE_API_BASE_URL в compose)

## Структура
```
app/                   # FastAPI
  api/                 # Роуты
  models/              # SQLAlchemy модели
  schemas/             # Pydantic схемы
  services/            # Бизнес-логика и поиск
  db/db.py             # Подключение к БД и сессия
frontend/              # React/Vite
  src/components       # UI-компоненты
  src/pages            # Страницы (SPA)
  src/services         # API-клиент
Dockerfile.backend
Dockerfile.frontend
docker-compose.yml
```

## API (шаблон)
- `GET /terms?query=` — поиск (fts + fallback)
- `GET /terms/{id}` — карточка термина
- `GET /terms/{id}/related` — связи
- `GET /alphabet/{letter}` — алфавитный указатель
- `POST /admin/term`, `POST /admin/relation` — задел под админку
- `GET /search?query=` — прямой FTS

## DDL и индексы
```sql
CREATE TABLE terms (
    id SERIAL PRIMARY KEY,
    term_ru TEXT,
    term_en TEXT,
    definition TEXT,
    context TEXT,
    abbreviation TEXT
);

CREATE TABLE relations (
    id SERIAL PRIMARY KEY,
    term_id INT REFERENCES terms(id) ON DELETE CASCADE,
    related_id INT REFERENCES terms(id) ON DELETE CASCADE,
    type VARCHAR(20)
);

-- Индексы
CREATE INDEX idx_terms_ru ON terms USING gin (to_tsvector('simple', term_ru));
CREATE INDEX idx_terms_en ON terms USING gin (to_tsvector('simple', term_en));
CREATE INDEX idx_terms_full ON terms USING gin (to_tsvector('simple', coalesce(term_ru,'') || ' ' || coalesce(term_en,'') || ' ' || coalesce(definition,'') || ' ' || coalesce(context,'')));
CREATE INDEX idx_relations_term ON relations(term_id);
CREATE INDEX idx_relations_related ON relations(related_id);
```

## Настройка окружения
- Переменные БД задаются через `POSTGRES_*` (см. `docker-compose.yml`).
- Фронтенд читает `VITE_API_BASE_URL` при сборке (в compose выставлено `http://backend:8000`).
- Начальные данные и индексы загружаются из `db/init.sql` (монтируется в postgres docker-entrypoint) и дополнительно на старте backend через `seed_initial_data` — теперь ~50 терминов для тестовой базы.
- Новые поля для английских описаний: `definition_en`, `context_en`. При обновлении с старой схемы пересоздайте volume БД: `docker compose down -v && docker compose up --build`.
- Swagger: http://localhost:8000/docs или openapi-файл `swagger/openapi.yaml`.

## Auth и роли
- Роли: admin (полный доступ), editor (CRUD терминов, импорт/шаблоны), viewer (чтение).
- Эндпоинты:
  - `POST /auth/login` (form-data username/password) — выдает JWT.
  - `POST /auth/register` — создать пользователя (только admin).
- Админ/редакторские действия: `/admin/*`, `/admin/templates/*`, `/admin/import/*`, `/admin/terms`, `/admin/term`, `/admin/relation` — требуют токена.
- По умолчанию создается admin `admin@ethnoglossary.org`/`ChangeMe123!` (меняйте сразу после запуска).

## Импорт/экспорт шаблонов
- Получить шаблоны: `GET /admin/templates/json`, `GET /admin/templates/xls`
- Импорт: `POST /admin/import/json` (UploadFile), `POST /admin/import/xls` (UploadFile, колонки: term_ru, term_en, definition, context, definition_en, context_en, abbreviation)

## Админ-панель (frontend)
- В навигации есть ссылка **Admin**. Введите email/пароль, далее доступны загрузка JSON/XLSX, скачивание шаблонов и просмотр терминов.

> Если ранее создавался volume `db_data`, пересоздайте его, чтобы применились данные из init.sql:  
> `docker compose down -v && docker compose up --build`
> Если volume менять нельзя, backend при старте сам добавит недостающие колонки (`definition_en`, `context_en`) через `ALTER TABLE`.

## Сервисы и сборка
- Backend (`Dockerfile.backend`): `python:3.12-slim`, FastAPI + Uvicorn.
- Frontend (`Dockerfile.frontend`): `node:20` сборка Vite, отдача через nginx.

## Разработка
- Локально: `cd frontend && npm install && npm run dev` (по умолчанию API `http://localhost:8000`).
- Backend локально: `uvicorn app.main:app --reload`.

Готово к дальнейшему расширению: добавляйте авторизацию, панели администрирования, миграции и улучшенный fuzzy-search.
