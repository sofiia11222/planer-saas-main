import bcrypt from "bcryptjs";
import { prisma } from "./config/db.js";
import { logger } from "./utils/logger.js";

export async function ensureDemoData() {
  const email = "demo@planer.local";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: "Демо",
        passwordHash: await bcrypt.hash("demo1234", 8),
      },
    });
    logger.info("demo.user_created", { userId: user.id });
  }

  let workspace = await prisma.workspace.findFirst({
    where: { slug: "demo", deletedAt: null },
  });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: "Демо-пространство",
        slug: "demo",
        members: {
          create: { userId: user.id, role: "owner" },
        },
      },
    });
    logger.info("demo.workspace_created", { workspaceId: workspace.id });
  } else {
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId: workspace.id, userId: user.id },
    });
    if (!member) {
      await prisma.workspaceMember.create({
        data: { workspaceId: workspace.id, userId: user.id, role: "owner" },
      });
    }
  }

  return { user, workspace };
}
