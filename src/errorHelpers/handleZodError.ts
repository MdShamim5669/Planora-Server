import { ZodError } from "zod";
import { IGenericErrorMessage, IGenericErrorResponse } from "./errorHelpers.interface";

export const handleZodError = (err: ZodError): IGenericErrorResponse => {
  const errors: IGenericErrorMessage[] = err.issues.map((issue) => {
    return {
      field: issue.path.join(".") || "unknown",
      message: issue.message,
    };
  });

  return {
    statusCode: 400,
    errorCode: "VALIDATION_ERROR",
    message: "Validation failed",
    errors,
  };
};
