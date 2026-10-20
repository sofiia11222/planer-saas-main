import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ForbiddenError, AppError } from "../utils/errors.js";

export type AuthUser = {
  userId: string;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      workspaceId?: string;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/** Bearer JWT → req.user */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AppError(401, "Missing or invalid Authorization header", "UNAUTHORIZED");
    }
    const token = header.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (e) {
    if (e instanceof AppError) return next(e);
    next(new AppError(401, "Invalid or expired token", "UNAUTHORIZED"));
  }
}

/**
 * workspaceId берём из заголовка X-Workspace-Id или query.
 * Проверку членства делает service/repository.
 */
export function requireWorkspace(req: Request, _res: Response, next: NextFunction) {
  const ws =
    (req.headers["x-workspace-id"] as string) ||
    (req.query.workspaceId as string) ||
    (req.body?.workspaceId as string);
  if (!ws) {
    return next(new ForbiddenError("X-Workspace-Id header is required"));
  }
  req.workspaceId = ws;
  next();
}
