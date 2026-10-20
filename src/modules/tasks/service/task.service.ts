import { taskRepository } from "../repository/task.repository.js";
import { workspaceRepository } from "../../workspaces/repository/workspace.repository.js";
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from "../dto/task.dto.js";
import { ForbiddenError, NotFoundError } from "../../../utils/errors.js";
import { logger } from "../../../utils/logger.js";

/**
 * Service — бизнес-логика + проверка прав.
 * Не знает про Express; только userId / workspaceId / DTO.
 */
export class TaskService {
  /** Пользователь должен быть участником workspace */
  private async assertAccess(workspaceId: string, userId: string) {
    const ok = await workspaceRepository.isMember(workspaceId, userId);
    if (!ok) {
      throw new ForbiddenError("You are not a member of this workspace");
    }
  }

  async create(workspaceId: string, userId: string, input: CreateTaskInput) {
    await this.assertAccess(workspaceId, userId);
    const task = await taskRepository.create(workspaceId, input, userId);
    logger.info("task.created", { taskId: task.id, workspaceId, userId });
    return task;
  }

  async getById(workspaceId: string, userId: string, id: string) {
    await this.assertAccess(workspaceId, userId);
    const task = await taskRepository.findById(workspaceId, id);
    if (!task) throw new NotFoundError("Task");
    return task;
  }

  async list(workspaceId: string, userId: string, query: ListTasksQuery) {
    await this.assertAccess(workspaceId, userId);
    return taskRepository.findMany(workspaceId, query);
  }

  async update(
    workspaceId: string,
    userId: string,
    id: string,
    input: UpdateTaskInput
  ) {
    await this.assertAccess(workspaceId, userId);
    const task = await taskRepository.update(workspaceId, id, input);
    if (!task) throw new NotFoundError("Task");
    logger.info("task.updated", { taskId: id, workspaceId, userId });
    return task;
  }

  async remove(workspaceId: string, userId: string, id: string) {
    await this.assertAccess(workspaceId, userId);
    const task = await taskRepository.softDelete(workspaceId, id);
    if (!task) throw new NotFoundError("Task");
    logger.info("task.soft_deleted", { taskId: id, workspaceId, userId });
    return { success: true, id };
  }

  async restore(workspaceId: string, userId: string, id: string) {
    await this.assertAccess(workspaceId, userId);
    const task = await taskRepository.restore(workspaceId, id);
    if (!task) throw new NotFoundError("Task");
    logger.info("task.restored", { taskId: id, workspaceId, userId });
    return task;
  }

  async bulkStatus(
    workspaceId: string,
    userId: string,
    ids: string[],
    status: string
  ) {
    await this.assertAccess(workspaceId, userId);
    const count = await taskRepository.bulkUpdateStatus(workspaceId, ids, status);
    logger.info("task.bulk_status", { workspaceId, userId, count, status });
    return { updated: count };
  }
}

export const taskService = new TaskService();
