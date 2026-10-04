import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import * as eventsService from "./events.service";

export const listEvents = catchAsync(async (req: Request, res: Response) => {
  const result = await eventsService.listEvents(req.query as any);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Events fetched",
    data: result.events,
    meta: result.meta,
  });
});

export const getFeatured = catchAsync(async (_req: Request, res: Response) => {
  const event = await eventsService.getFeaturedEvent();
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Featured event fetched",
    data: event,
  });
});

export const getUpcoming = catchAsync(async (_req: Request, res: Response) => {
  const events = await eventsService.getUpcomingEvents();
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Upcoming events fetched",
    data: events,
  });
});

export const getMine = catchAsync(async (req: Request, res: Response) => {
  const events = await eventsService.getMyEvents(req.user!.id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User events fetched",
    data: events,
  });
});

export const getById = catchAsync(async (req: Request, res: Response) => {
  const event = await eventsService.getEventById(req.params.id, req.user?.id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event fetched",
    data: event,
  });
});

export const create = catchAsync(async (req: Request, res: Response) => {
  const event = await eventsService.createEvent(req.user!.id, req.body);
  return sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Event created successfully",
    data: event,
  });
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const event = await eventsService.updateEvent(req.params.id, req.user!.id, req.body);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event updated successfully",
    data: event,
  });
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await eventsService.deleteEvent(req.params.id, req.user!);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});
