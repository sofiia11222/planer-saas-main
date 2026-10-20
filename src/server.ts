import express from "express";
import cors from "cors";
import { taskRouter } from "./modules/tasks/routes/task.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";
import { disconnectDb } from "./config/db.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/api/tasks", taskRouter);

// Сюда же: /api/projects, /api/users, /api/workspaces — по тому же шаблону

app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`API listening on :${PORT}`);
});

async function shutdown() {
  server.close();
  await disconnectDb();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
