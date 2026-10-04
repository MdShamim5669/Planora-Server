import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import * as invitationsService from "./invitations.service";

export const invite = catchAsync(async (req: Request, res: Response) => {
  const invitation = await invitationsService.inviteUser(
    req.params.id,
    req.user!.id,
    req.body.email
  );
  return sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Invitation sent successfully",
    data: invitation,
  });
});

export const getEventInvitations = catchAsync(async (req: Request, res: Response) => {
  const invitations = await invitationsService.getEventInvitations(
    req.params.id,
    req.user!.id
  );
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Event invitations fetched",
    data: invitations,
  });
});

export const getMine = catchAsync(async (req: Request, res: Response) => {
  const invitations = await invitationsService.getMyInvitations(req.user!.id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User invitations fetched",
    data: invitations,
  });
});

export const accept = catchAsync(async (req: Request, res: Response) => {
  const result = await invitationsService.acceptInvitation(
    req.params.id,
    req.user!.id
  );
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Invitation accepted",
    data: result,
  });
});

export const decline = catchAsync(async (req: Request, res: Response) => {
  const result = await invitationsService.declineInvitation(
    req.params.id,
    req.user!.id
  );
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Invitation declined",
    data: result,
  });
});
