import { Router } from "express";
import { ensureDemoData } from "../../seed-demo.js";
import { signToken } from "../../middleware/auth.js";

export const demoRouter = Router();

demoRouter.post("/session", async (_req, res, next) => {
  try {
    const { user, workspace } = await ensureDemoData();
    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      token,
      workspaceId: workspace.id,
      user: { id: user.id, email: user.email, name: user.name },
      workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug },
      message: "Демо-сессия. Данные в PostgreSQL.",
    });
  } catch (e) {
    next(e);
  }
});

demoRouter.get("/status", async (_req, res, next) => {
  try {
    const { user, workspace } = await ensureDemoData();
    res.json({
      ok: true,
      mode: "local-demo",
      database: "postgresql",
      user: user.email,
      workspace: workspace.slug,
    });
  } catch (e) {
    next(e);
  }
});
