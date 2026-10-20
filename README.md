# SaaS Backend — CRUD layer

**Стек:** Node.js + Express + TypeScript + PostgreSQL + Prisma + Zod + JWT

## Структура папок

```
saas-backend/
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
│   │   └── workspaces/    # проверка членства
│   └── server.ts
└── examples/http-examples.md
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
cd saas-backend
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
