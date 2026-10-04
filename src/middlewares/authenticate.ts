import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { Role } from "@prisma/client";

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const extractBearerToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
};

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      throw new ApiError(401, "UNAUTHORIZED", "Authentication required.");
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, email: true, name: true },
    });

    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED", "Account no longer exists.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = extractBearerToken(req);
    if (token) {
      try {
        const payload = verifyToken(token);
        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
          select: { id: true, role: true, email: true, name: true },
        });
        if (user) {
          req.user = user;
        }
      } catch {
        // Token invalid/expired in optional mode: continue as unauthenticated guest
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
