import { Router } from "express";
import { requireAuth, requireWorkspace } from "../../../middleware/auth.js";
import {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
} from "../dto/task.dto.js";
import { taskService } from "../service/task.service.js";
import { z } from "zod";

/**
 * REST endpoints для Tasks.
 * Все запросы: Authorization: Bearer <jwt>
 *              X-Workspace-Id: <workspace cuid>
 */
export const taskRouter = Router();

taskRouter.use(requireAuth, requireWorkspace);

/** POST /api/tasks — Create */
taskRouter.post("/", async (req, res, next) => {
  try {
    const body = createTaskSchema.parse(req.body);
    const task = await taskService.create(
      req.workspaceId!,
      req.user!.userId,
      body
    );
    res.status(201).json(task);
  } catch (e) {
    next(e);
  }
});

/** GET /api/tasks — Read list (filter + sort + pagination) */
taskRouter.get("/", async (req, res, next) => {
  try {
    const query = listTasksQuerySchema.parse(req.query);
    const result = await taskService.list(
      req.workspaceId!,
      req.user!.userId,
      query
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
});

/** GET /api/tasks/:id — Read one */
taskRouter.get("/:id", async (req, res, next) => {
  try {
    const task = await taskService.getById(
      req.workspaceId!,
      req.user!.userId,
      req.params.id
    );
    res.json(task);
  } catch (e) {
    next(e);
  }
});

/** PATCH /api/tasks/:id — Update */
taskRouter.patch("/:id", async (req, res, next) => {
  try {
    const body = updateTaskSchema.parse(req.body);
    const task = await taskService.update(
      req.workspaceId!,
      req.user!.userId,
      req.params.id,
      body
    );
    res.json(task);
  } catch (e) {
    next(e);
  }
});

/** DELETE /api/tasks/:id — Soft delete */
taskRouter.delete("/:id", async (req, res, next) => {
  try {
    const result = await taskService.remove(
      req.workspaceId!,
      req.user!.userId,
      req.params.id
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
});

/** POST /api/tasks/:id/restore — восстановить soft-deleted */
taskRouter.post("/:id/restore", async (req, res, next) => {
  try {
    const task = await taskService.restore(
      req.workspaceId!,
      req.user!.userId,
      req.params.id
    );
    res.json(task);
  } catch (e) {
    next(e);
  }
});

/** POST /api/tasks/bulk/status — транзакция, смена статуса пачкой */
taskRouter.post("/bulk/status", async (req, res, next) => {
  try {
    const body = z
      .object({
        ids: z.array(z.string().cuid()).min(1).max(100),
        status: z.enum(["todo", "in_progress", "done", "cancelled"]),
      })
      .parse(req.body);
    const result = await taskService.bulkStatus(
      req.workspaceId!,
      req.user!.userId,
      body.ids,
      body.status
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
});
