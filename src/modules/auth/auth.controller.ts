import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import * as authService from "./auth.service";

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  return sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Registration successful",
    data: result,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Login successful",
    data: result,
  });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User fetched successfully",
    data: user,
  });
});
