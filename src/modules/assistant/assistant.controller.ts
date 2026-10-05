import { Request, Response } from "express";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { sendResponse } from "../../utils/sendResponse";
import { askAssistant } from "./assistant.service";

export const ask = async (req: Request, res: Response) => {
  if (!env.ASSISTANT_ENABLED) {
    throw new ApiError(
      404,
      "NOT_FOUND",
      "Planora AI Assistant is currently disabled."
    );
  }

  const { question, history } = req.body;
  const result = await askAssistant({
    question,
    history,
    viewer: req.user,
  });

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Answer generated",
    data: result,
  });
};
