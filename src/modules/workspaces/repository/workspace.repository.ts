import { prisma } from "../../../config/db.js";

/**
 * Проверка, что user состоит в workspace (изоляция данных SaaS).
 */
export class WorkspaceRepository {
  async isMember(workspaceId: string, userId: string): Promise<boolean> {
    const row = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
        workspace: { deletedAt: null },
      },
      select: { id: true },
    });
    return Boolean(row);
  }

  async getMemberRole(
    workspaceId: string,
    userId: string
  ): Promise<string | null> {
    const row = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, workspace: { deletedAt: null } },
      select: { role: true },
    });
    return row?.role ?? null;
  }
}

export const workspaceRepository = new WorkspaceRepository();
