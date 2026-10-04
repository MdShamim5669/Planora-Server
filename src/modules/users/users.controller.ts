import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import * as usersService from "./users.service";

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await usersService.updateProfile(req.user!.id, req.body);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const updateNotifications = catchAsync(async (req: Request, res: Response) => {
  const result = await usersService.updateNotifications(
    req.user!.id,
    req.body.notificationsEnabled
  );
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification preference updated",
    data: result,
  });
});
