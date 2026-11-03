# Примеры HTTP-запросов (Tasks CRUD)

Все запросы (кроме health) требуют:

```
Authorization: Bearer <JWT>
X-Workspace-Id: <workspace_cuid>
Content-Type: application/json
```

## Create

```http
POST /api/tasks
{
  "title": "Позвонить клиенту",
  "status": "todo",
  "priority": "high",
  "client": "ООО Ромашка",
  "inn": "7701234567",
  "profit": 150000,
  "tags": ["важно", "b2b"],
  "dueDate": "2026-10-25T17:00:00.000Z"
}
```

## Read list (фильтр + пагинация + сортировка + поиск)

```http
GET /api/tasks?page=1&limit=20&status=todo&sortBy=dueDate&sortOrder=asc&search=Ромашка
```

Ответ:

```json
{
  "items": [ /* Task[] */ ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

## Read one

```http
GET /api/tasks/clxxxxxxxx
```

## Update

```http
PATCH /api/tasks/clxxxxxxxx
{
  "status": "in_progress",
  "assigneeId": "cl_user_id"
}
```

## Soft delete

```http
DELETE /api/tasks/clxxxxxxxx
```

```json
{ "success": true, "id": "clxxxxxxxx" }
```

## Restore

```http
POST /api/tasks/clxxxxxxxx/restore
```

## Bulk status (транзакция)

```http
POST /api/tasks/bulk/status
{
  "ids": ["id1", "id2", "id3"],
  "status": "done"
}
```

## SQL-эквиваленты (как делает Prisma под капотом)

**INSERT (параметры $1, $2…):**
```sql
INSERT INTO tasks (id, workspace_id, title, status, created_at, updated_at)
VALUES ($1, $2, $3, $4, NOW(), NOW());
```

**SELECT с soft delete + filter:**
```sql
SELECT * FROM tasks
WHERE workspace_id = $1
  AND deleted_at IS NULL
  AND status = $2
  AND (title ILIKE $3 OR client ILIKE $3)
ORDER BY due_date ASC
LIMIT $4 OFFSET $5;
```

**UPDATE (soft delete):**
```sql
UPDATE tasks SET deleted_at = NOW(), updated_at = NOW()
WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL;
```
