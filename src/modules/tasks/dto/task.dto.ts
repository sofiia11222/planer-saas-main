import { z } from "zod";

/** Create */
export const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  projectId: z.string().cuid().optional().nullable(),
  assigneeId: z.string().cuid().optional().nullable(),
  client: z.string().max(300).optional().nullable(),
  inn: z.string().max(20).optional().nullable(),
  profit: z.number().optional().nullable(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

/** Update — все поля опциональны */
export const updateTaskSchema = createTaskSchema.partial();

/** Фильтры списка */
export const listTasksQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "dueDate", "title", "status", "priority", "profit"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  projectId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  search: z.string().max(200).optional(), // title, client, inn
  includeDeleted: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => v === "true"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
