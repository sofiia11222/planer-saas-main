import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { taskRouter } from "./modules/tasks/routes/task.routes.js";
import { demoRouter } from "./modules/demo/demo.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";
import { disconnectDb } from "./config/db.js";
import { ensureDemoData } from "./seed-demo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString(), mode: "local" });
});

app.use("/api/demo", demoRouter);
app.use("/api/tasks", taskRouter);

app.use(express.static(publicDir));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(publicDir, "index.html"), (err) => {
    if (err) next(err);
  });
});

app.use(errorHandler);

async function main() {
  try {
    await ensureDemoData();
  } catch (e) {
    logger.error("demo.seed_failed", {
      message: e instanceof Error ? e.message : String(e),
    });
    logger.error(
      "Проверьте DATABASE_URL и что PostgreSQL запущен (см. LOCAL_DEMO.md)"
    );
  }

  const server = app.listen(PORT, () => {
    logger.info(`Планер: http://localhost:${PORT}`);
    logger.info(`API:    http://localhost:${PORT}/api/tasks`);
    logger.info(`Studio: npm run db:studio`);
  });

  async function shutdown() {
    server.close();
    await disconnectDb();
    process.exit(0);
  }
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();
