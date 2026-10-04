import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import * as adminService from "./admin.service";
import * as eventsService from "../events/events.service";

export const getStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await adminService.getAdminStats();
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin stats fetched",
    data: stats,
  });
});

export const getEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllEvents(req.query as any);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin events fetched",
    data: result.events,
    meta: result.meta,
  });
});

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllUsers(req.query as any);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin users fetched",
    data: result.users,
    meta: result.meta,
  });
});

export const deleteEvent = catchAsync(async (req: Request, res: Response) => {
  const result = await eventsService.deleteEvent(req.params.id, req.user!);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.deleteUserAccount(req.params.id, req.user!.id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});

export const setFeature = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.setFeaturedEvent(
    req.params.id,
    req.body.isFeatured
  );
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});
