import { IGenericErrorMessage } from "./errorHelpers.interface";

export class AppError extends Error {
  statusCode: number;
  errorCode: string;
  errors?: IGenericErrorMessage[];

  constructor(
    statusCode: number,
    arg2: string,
    arg3?: string,
    errors?: IGenericErrorMessage[]
  ) {
    let errorCode: string;
    let message: string;

    if (arg3 !== undefined) {
      if (/^[A-Z0-9_]+$/.test(arg2)) {
        errorCode = arg2;
        message = arg3;
      } else {
        message = arg2;
        errorCode = arg3;
      }
    } else {
      message = arg2;
      errorCode = "INTERNAL_ERROR";
    }

    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
