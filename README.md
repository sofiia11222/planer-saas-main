# SaaS Backend — CRUD layer

**Стек:** Node.js + Express + TypeScript + PostgreSQL + Prisma + Zod + JWT

## Структура папок

```
planer-saas-main/
├── public/                # фронтенд (статика; Express отдаёт её как есть)
│   ├── index.html         # редирект на saas-planer.html
│   ├── landing.html       # лендинг
│   └── saas-planer.html   # сам планер (Kanban, сделки, ЧКД)
├── prisma/
│   ├── schema.prisma      # модели + soft delete + индексы
│   └── schema.sql         # тот же смысл на чистом SQL
├── src/
│   ├── config/db.ts
│   ├── middleware/        # auth, errorHandler
│   ├── utils/             # errors, logger, pagination
│   ├── modules/
│   │   ├── tasks/
│   │   │   ├── dto/       # Zod-валидация
│   │   │   ├── repository/# доступ к БД (CRUD)
│   │   │   ├── service/   # бизнес-логика + ACL
│   │   │   └── routes/    # REST API
│   │   ├── workspaces/    # проверка членства
│   │   └── demo/          # демо-сессия: routes + seed (demo.seed.ts)
│   └── server.ts
├── docs/
│   ├── LOCAL_DEMO.md      # локальное демо (Mac + PostgreSQL)
│   └── http-examples.md   # примеры HTTP-запросов
└── .github/workflows/pages.yml   # публикация public/ на GitHub Pages
```

## Принципы

| Слой | Ответственность |
|------|-----------------|
| **DTO (Zod)** | Валидация входа |
| **Repository** | Только SQL/Prisma, soft delete, пагинация |
| **Service** | Права (workspace member), логирование |
| **Routes** | HTTP → DTO → Service → JSON |

- Параметризованные запросы → через Prisma (нет SQL-инъекций)
- Soft delete → `deletedAt`
- Timestamps → `createdAt` / `updatedAt`
- Изоляция SaaS → `workspaceId` + проверка `WorkspaceMember`
- Транзакции → `bulkUpdateStatus`

## Запуск

```bash
cd planer-saas-main
cp .env.example .env   # пропишите DATABASE_URL и JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run dev
```

## Расширение на Projects / Users

Скопируйте модуль `tasks` → `projects` / `users`:
1. DTO (Zod)
2. Repository (create / findById / findMany / update / softDelete)
3. Service (`assertAccess` + вызовы repo)
4. Routes + подключение в `server.ts`

Полный эталон CRUD — модуль **Tasks**.

## Документация

- [Локальное демо для защиты](docs/LOCAL_DEMO.md)
- [Примеры HTTP-запросов](docs/http-examples.md)
