import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import * as participationsService from "./participations.service";

export const joinFree = catchAsync(async (req: Request, res: Response) => {
  const participation = await participationsService.joinFreeEvent(
    req.params.id,
    req.user!.id
  );
  return sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Participation created successfully",
    data: participation,
  });
});

export const listParticipants = catchAsync(async (req: Request, res: Response) => {
  const result = await participationsService.listEventParticipants(
    req.params.id,
    req.user!.id,
    req.query as any
  );
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Participants fetched",
    data: result.participants,
    meta: result.meta,
  });
});

export const approve = catchAsync(async (req: Request, res: Response) => {
  const result = await participationsService.moderateParticipant(
    req.params.id,
    req.user!.id,
    "approve"
  );
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Participant approved",
    data: result,
  });
});

export const reject = catchAsync(async (req: Request, res: Response) => {
  const result = await participationsService.moderateParticipant(
    req.params.id,
    req.user!.id,
    "reject"
  );
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Participant rejected",
    data: result,
  });
});

export const ban = catchAsync(async (req: Request, res: Response) => {
  const result = await participationsService.moderateParticipant(
    req.params.id,
    req.user!.id,
    "ban"
  );
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Participant banned",
    data: result,
  });
});

export const getMine = catchAsync(async (req: Request, res: Response) => {
  const participations = await participationsService.getMyParticipations(req.user!.id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User participations fetched",
    data: participations,
  });
});
