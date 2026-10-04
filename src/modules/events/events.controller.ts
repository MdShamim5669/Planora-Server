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

import { uploadToCloudinary } from "../../lib/cloudinary";

export const uploadBannerImage = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "No image file provided for banner upload",
      data: null,
    });
  }

  // Upload directly to Cloudinary folder 'planora/events'
  const result = await uploadToCloudinary(
    req.file.buffer,
    "planora/events",
    req.file.originalname
  );

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Banner uploaded to Cloudinary successfully",
    data: {
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    },
  });
});

export const getGatheringPlans = catchAsync(async (_req: Request, res: Response) => {
  const plans = await eventsService.getGatheringPlans();
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Gathering plans fetched successfully",
    data: plans,
  });
});

export const create = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body };

  // Resolve gatheringType if provided
  if (payload.gatheringType) {
    switch (payload.gatheringType) {
      case "PUBLIC_FREE":
        payload.visibility = "PUBLIC";
        payload.fee = 0;
        break;
      case "PUBLIC_PAID":
        payload.visibility = "PUBLIC";
        payload.fee = Number(payload.fee) > 0 ? Number(payload.fee) : 1500;
        break;
      case "PRIVATE_FREE":
        payload.visibility = "PRIVATE";
        payload.fee = 0;
        break;
      case "PRIVATE_PAID":
        payload.visibility = "PRIVATE";
        payload.fee = Number(payload.fee) > 0 ? Number(payload.fee) : 3500;
        break;
    }
  }

  // If a file was uploaded in multipart/form-data, upload to Cloudinary
  if (req.file) {
    const result = await uploadToCloudinary(
      req.file.buffer,
      "planora/events",
      req.file.originalname
    );
    payload.imageUrl = result.secure_url;
    payload.bannerImage = result.secure_url;
  } else if (payload.bannerImage && !payload.imageUrl) {
    payload.imageUrl = payload.bannerImage;
  } else if (payload.imageUrl && !payload.bannerImage) {
    payload.bannerImage = payload.imageUrl;
  }

  const event = await eventsService.createEvent(req.user!.id, payload);
  return sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Event created successfully",
    data: event,
  });
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body };

  if (req.file) {
    const result = await uploadToCloudinary(
      req.file.buffer,
      "planora/events",
      req.file.originalname
    );
    payload.imageUrl = result.secure_url;
    payload.bannerImage = result.secure_url;
  } else if (payload.bannerImage && !payload.imageUrl) {
    payload.imageUrl = payload.bannerImage;
  } else if (payload.imageUrl && !payload.bannerImage) {
    payload.bannerImage = payload.imageUrl;
  }

  const event = await eventsService.updateEvent(req.params.id, req.user!.id, payload);
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
