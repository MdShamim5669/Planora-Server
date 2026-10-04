import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ApiError } from "../utils/ApiError";

export const requireRole = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "UNAUTHORIZED", "Authentication required."));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, "FORBIDDEN", "You do not have permission to do this.")
      );
    }

    next();
  };
};
