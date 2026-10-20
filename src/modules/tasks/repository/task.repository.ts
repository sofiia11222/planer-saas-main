import type { Prisma, Task } from "@prisma/client";
import { prisma } from "../../../config/db.js";
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from "../dto/task.dto.js";
import { parsePagination, toPaginated, type PaginatedResult } from "../../../utils/pagination.js";

/**
 * Repository / DAO — только доступ к БД.
 * Все запросы через Prisma (параметризованные, без SQL-инъекций).
 * Soft delete: deletedAt IS NULL.
 */
export class TaskRepository {
  /** CREATE */
  async create(
    workspaceId: string,
    data: CreateTaskInput,
    creatorId?: string
  ): Promise<Task> {
    return prisma.task.create({
      data: {
        workspaceId,
        title: data.title,
        description: data.description ?? null,
        status: data.status ?? "todo",
        priority: data.priority ?? "medium",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        projectId: data.projectId ?? null,
        assigneeId: data.assigneeId ?? null,
        creatorId: creatorId ?? null,
        client: data.client ?? null,
        inn: data.inn ?? null,
        profit: data.profit ?? null,
        tags: data.tags ?? [],
      },
    });
  }

  /** READ one (с проверкой workspace + soft delete) */
  async findById(
    workspaceId: string,
    id: string,
    opts?: { includeDeleted?: boolean }
  ): Promise<Task | null> {
    return prisma.task.findFirst({
      where: {
        id,
        workspaceId,
        ...(opts?.includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  /**
   * READ list — фильтры, поиск, сортировка, пагинация.
   * WHERE строится объектом Prisma (не конкатенация строк SQL).
   */
  async findMany(
    workspaceId: string,
    query: ListTasksQuery
  ): Promise<PaginatedResult<Task>> {
    const { page, limit, skip, sortBy, sortOrder } = parsePagination(query);

    const where: Prisma.TaskWhereInput = {
      workspaceId,
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" } },
              { client: { contains: query.search, mode: "insensitive" } },
              { inn: { contains: query.search, mode: "insensitive" } },
              { description: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const orderField = sortBy || "createdAt";
    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      [orderField]: sortOrder,
    };

    // Транзакция не обязательна, но count+find параллельно — быстрее
    const [total, items] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return toPaginated(items, total, page, limit);
  }

  /** UPDATE */
  async update(
    workspaceId: string,
    id: string,
    data: UpdateTaskInput
  ): Promise<Task | null> {
    // Обновляем только если запись жива и в этом workspace
    const existing = await this.findById(workspaceId, id);
    if (!existing) return null;

    return prisma.task.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.dueDate !== undefined
          ? { dueDate: data.dueDate ? new Date(data.dueDate) : null }
          : {}),
        ...(data.projectId !== undefined ? { projectId: data.projectId } : {}),
        ...(data.assigneeId !== undefined ? { assigneeId: data.assigneeId } : {}),
        ...(data.client !== undefined ? { client: data.client } : {}),
        ...(data.inn !== undefined ? { inn: data.inn } : {}),
        ...(data.profit !== undefined ? { profit: data.profit } : {}),
        ...(data.tags !== undefined ? { tags: data.tags } : {}),
        // updatedAt выставит Prisma @updatedAt
      },
    });
  }

  /**
   * DELETE — soft delete (deletedAt = now).
   * Hard delete только через отдельный admin-метод при необходимости.
   */
  async softDelete(workspaceId: string, id: string): Promise<Task | null> {
    const existing = await this.findById(workspaceId, id);
    if (!existing) return null;

    return prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /** Восстановление после soft delete */
  async restore(workspaceId: string, id: string): Promise<Task | null> {
    const existing = await this.findById(workspaceId, id, { includeDeleted: true });
    if (!existing || !existing.deletedAt) return null;

    return prisma.task.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  /**
   * Пример операции с транзакцией:
   * массовое перемещение задач в другой статус.
   */
  async bulkUpdateStatus(
    workspaceId: string,
    ids: string[],
    status: string
  ): Promise<number> {
    return prisma.$transaction(async (tx) => {
      const result = await tx.task.updateMany({
        where: {
          workspaceId,
          id: { in: ids },
          deletedAt: null,
        },
        data: { status },
      });
      return result.count;
    });
  }
}

export const taskRepository = new TaskRepository();
