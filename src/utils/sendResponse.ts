import { Response } from "express";
import { ResponsePayload, PaginationMeta } from "./utils.interface";

export { ResponsePayload, PaginationMeta };

export const sendResponse = <T>(res: Response, payload: ResponsePayload<T>) => {
  try {
    const { statusCode = 200, success, message, data, meta } = payload;
    return res.status(statusCode).json({
      success,
      message,
      ...(data !== undefined ? { data } : {}),
      ...(meta !== undefined ? { meta } : {}),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error while sending response",
    });
  }
};
