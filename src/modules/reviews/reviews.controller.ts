import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import * as reviewsService from "./reviews.service";

export const getEventReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewsService.getEventReviews(req.params.id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews fetched",
    data: result,
  });
});

export const create = catchAsync(async (req: Request, res: Response) => {
  const review = await reviewsService.createReview(
    req.params.id,
    req.user!.id,
    req.body
  );
  return sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review created successfully",
    data: review,
  });
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const review = await reviewsService.updateReview(
    req.params.id,
    req.user!.id,
    req.body
  );
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review updated successfully",
    data: review,
  });
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewsService.deleteReview(req.params.id, req.user!.id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});

export const getMine = catchAsync(async (req: Request, res: Response) => {
  const reviews = await reviewsService.getMyReviews(req.user!.id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User reviews fetched",
    data: reviews,
  });
});
