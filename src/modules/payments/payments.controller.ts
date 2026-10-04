import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import * as paymentsService from "./payments.service";
import { env } from "../../config/env";

export const initPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.initPayment(
    req.user!.id,
    req.body.eventId,
    req.body.invitationId
  );
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment session created",
    data: result,
  });
});

export const handleSuccessCallback = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentsService.processPaymentVerification(req.body);
  if (result.status === "SUCCESS") {
    return res.redirect(`${env.CLIENT_URL}/payment/success?tran_id=${result.tranId}`);
  }
  return res.redirect(`${env.CLIENT_URL}/payment/fail?tran_id=${result.tranId}`);
});

export const handleFailCallback = catchAsync(async (req: Request, res: Response) => {
  const tranId = await paymentsService.failPayment(req.body);
  return res.redirect(`${env.CLIENT_URL}/payment/fail?tran_id=${tranId || ""}`);
});

export const handleCancelCallback = catchAsync(async (req: Request, res: Response) => {
  const tranId = await paymentsService.cancelPayment(req.body);
  return res.redirect(`${env.CLIENT_URL}/payment/cancel?tran_id=${tranId || ""}`);
});

export const handleIpn = catchAsync(async (req: Request, res: Response) => {
  await paymentsService.processPaymentVerification(req.body);
  return res.status(200).send("IPN processed");
});

export const getMine = catchAsync(async (req: Request, res: Response) => {
  const payments = await paymentsService.getMyPayments(req.user!.id);
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User payments fetched",
    data: payments,
  });
});
