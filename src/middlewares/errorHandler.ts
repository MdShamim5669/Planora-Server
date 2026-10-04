import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { AppError, handleZodError } from "../errorHelpers";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let statusCode = 500;
  let errorCode = "INTERNAL_ERROR";
  let message = "An unexpected server error occurred";
  let errors: Array<{ field: string; message: string }> | undefined;

  // 1. Custom AppError / ApiError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    errors = err.errors;
  }
  // 2. Zod Validation Error (PRD 13.12, 14.5)
  else if (err instanceof ZodError) {
    const simplified = handleZodError(err);
    statusCode = simplified.statusCode;
    errorCode = simplified.errorCode;
    message = simplified.message;
    errors = simplified.errors;
  }
  // 3. JWT Signature / Malformed Error
  else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    errorCode = "UNAUTHORIZED";
    message = "Invalid token.";
  }
  // 4. JWT Token Expired Error
  else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    errorCode = "TOKEN_EXPIRED";
    message = "Session expired. Please log in again.";
  }
  // 5. Prisma Errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      errorCode = "CONFLICT";
      const target = Array.isArray(err.meta?.target)
        ? err.meta?.target.join(", ")
        : "resource";
      message = `A conflict occurred with an existing ${target}.`;
    } else if (err.code === "P2025") {
      statusCode = 404;
      errorCode = "NOT_FOUND";
      message = "Requested record was not found.";
    }
  }

  // Log in development
  if (process.env.NODE_ENV !== "production") {
    console.error("[ERROR]", {
      path: req.originalUrl,
      method: req.method,
      statusCode,
      errorCode,
      message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    ...(errors && errors.length > 0 ? { errors } : {}),
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
};
