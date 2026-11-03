# Локальное демо для защиты (Mac)

Цель: показать преподу, что **база PostgreSQL подключена** и **основные функции (сделки) работают через API**.

## 1. Установите PostgreSQL (один раз)

```bash
brew install postgresql@16
brew services start postgresql@16
createuser -s postgres 2>/dev/null || true
createdb planer_demo
```

Если `createdb` ругается на пользователя — выполните:

```bash
psql postgres -c "CREATE USER postgres WITH SUPERUSER PASSWORD 'postgres';" 2>/dev/null || true
createdb -O postgres planer_demo 2>/dev/null || createdb planer_demo
```

## 2. Настройте проект

```bash
cd planer-saas-main
cp .env.example .env
npm install
npx prisma migrate dev --name demo
```

## 3. Запуск

```bash
npm run dev
```

Откройте в браузере: **http://localhost:3000**

Должна появиться зелёная полоска: «PostgreSQL · подключено».

## 4. Что показать преподу

1. Сайт на `localhost:3000` — создаёте сделку, меняете статус (Kanban).
2. В другом терминале:

```bash
npm run db:studio
```

Откроется Prisma Studio — таблица `tasks`, там те же сделки. Это и есть «данные в базе».

3. Проверка API:

```bash
curl -s http://localhost:3000/api/demo/status
```

## 5. Если ошибка подключения к БД

- PostgreSQL запущен? `brew services list`
- В `.env` правильный `DATABASE_URL`?
- База `planer_demo` создана? `psql -l | grep planer`

## Потом (сервер)

Тот же код переносится на VPS: меняете `DATABASE_URL` на серверный Postgres — логика та же.
