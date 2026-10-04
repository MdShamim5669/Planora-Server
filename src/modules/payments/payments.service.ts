import crypto from "crypto";
import { PaymentStatus, ParticipationStatus, InvitationStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { checkJoinEligibility } from "../participations/participations.service";
import { env } from "../../config/env";
import {
  initSslcommerzSession,
  validateSslcommerzPayment,
} from "../../lib/sslcommerz";

export const initPayment = async (
  userId: string,
  eventId: string,
  invitationId?: string
) => {
  // BL-01 Join eligibility
  const event = await checkJoinEligibility(eventId, userId);

  // If invitationId given, must belong to user, match event, and be PENDING
  if (invitationId) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });
    if (
      !invitation ||
      invitation.inviteeId !== userId ||
      invitation.eventId !== eventId ||
      invitation.status !== InvitationStatus.PENDING
    ) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid or expired invitation.");
    }
  }

  const feeNumber = Number(event.fee);
  if (feeNumber <= 0) {
    throw new ApiError(400, "BAD_REQUEST", "This event is free.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, phone: true },
  });

  const tranId = `PLN-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
  const totalAmountStr = feeNumber.toFixed(2);

  // Create PENDING Payment row
  const payment = await prisma.payment.create({
    data: {
      tranId,
      userId,
      eventId: event.id,
      eventTitle: event.title,
      amount: event.fee,
      currency: "BDT",
      status: PaymentStatus.PENDING,
      gateway: "SSLCOMMERZ",
      invitationId: invitationId || null,
    },
  });

  // Call SSLCommerz session API
  const gatewayUrl = await initSslcommerzSession({
    total_amount: totalAmountStr,
    currency: "BDT",
    tran_id: tranId,
    success_url: `${env.SERVER_URL}/api/v1/payments/success`,
    fail_url: `${env.SERVER_URL}/api/v1/payments/fail`,
    cancel_url: `${env.SERVER_URL}/api/v1/payments/cancel`,
    ipn_url: `${env.SERVER_URL}/api/v1/payments/ipn`,
    cus_name: user?.name || "Attendee",
    cus_email: user?.email || "attendee@example.com",
    cus_phone: user?.phone || "01700000000",
    product_name: event.title,
  });

  return { tranId, gatewayUrl };
};

// BL-04 Payment verification
export const processPaymentVerification = async (body: any) => {
  const { tran_id, val_id, status } = body;

  if (!tran_id) {
    return { status: "FAILED", tranId: "" };
  }

  const payment = await prisma.payment.findUnique({
    where: { tranId: tran_id },
  });

  if (!payment) {
    return { status: "FAILED", tranId: tran_id };
  }

  // Idempotency: if already processed, return stored status
  if (payment.status !== PaymentStatus.PENDING) {
    return { status: payment.status, tranId: tran_id };
  }

  // If callback indicates fail or cancel immediately
  if (status !== "VALID" && status !== "VALIDATED") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });
    return { status: "FAILED", tranId: tran_id };
  }

  // Call SSLCommerz validation API
  try {
    const valResult = await validateSslcommerzPayment(val_id);

    const isValidStatus = valResult.status === "VALID" || valResult.status === "VALIDATED";
    const isMatchingTran = valResult.tran_id === payment.tranId;
    const isMatchingCurrency = (valResult.currency || "BDT") === payment.currency;
    const isMatchingAmount =
      Math.abs(parseFloat(valResult.amount) - Number(payment.amount)) < 0.01;

    if (!isValidStatus || !isMatchingTran || !isMatchingCurrency || !isMatchingAmount) {
      console.error("[PAYMENT VALIDATION MISMATCH]", {
        valResult,
        paymentTranId: payment.tranId,
        paymentAmount: payment.amount.toString(),
      });
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      return { status: "FAILED", tranId: tran_id };
    }

    // Atomic transaction: mark Payment SUCCESS, create Participation PENDING
    await prisma.$transaction(async (tx) => {
      // Optimistic lock with updateMany
      const updateResult = await tx.payment.updateMany({
        where: { id: payment.id, status: PaymentStatus.PENDING },
        data: {
          status: PaymentStatus.SUCCESS,
          valId: val_id,
          bankTranId: valResult.bank_tran_id || null,
          paidAt: new Date(),
        },
      });

      if (updateResult.count === 0) {
        // Handled concurrently by IPN/callback
        return;
      }

      if (payment.eventId && payment.userId) {
        let participation = await tx.participation.findUnique({
          where: {
            eventId_userId: {
              eventId: payment.eventId,
              userId: payment.userId,
            },
          },
        });

        if (!participation) {
          participation = await tx.participation.create({
            data: {
              eventId: payment.eventId,
              userId: payment.userId,
              status: ParticipationStatus.PENDING,
            },
          });
        }

        // Link payment to participation
        await tx.payment.update({
          where: { id: payment.id },
          data: { participationId: participation.id },
        });

        // Mark invitation ACCEPTED if applicable
        if (payment.invitationId) {
          await tx.invitation.updateMany({
            where: {
              id: payment.invitationId,
              status: InvitationStatus.PENDING,
            },
            data: {
              status: InvitationStatus.ACCEPTED,
              respondedAt: new Date(),
            },
          });
        }
      }
    });

    return { status: "SUCCESS", tranId: tran_id };
  } catch (error) {
    console.error("[PAYMENT VALIDATION ERROR]", error);
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });
    return { status: "FAILED", tranId: tran_id };
  }
};

export const failPayment = async (body: any) => {
  const tranId = body.tran_id;
  if (tranId) {
    await prisma.payment.updateMany({
      where: { tranId, status: PaymentStatus.PENDING },
      data: { status: PaymentStatus.FAILED },
    });
  }
  return tranId;
};

export const cancelPayment = async (body: any) => {
  const tranId = body.tran_id;
  if (tranId) {
    await prisma.payment.updateMany({
      where: { tranId, status: PaymentStatus.PENDING },
      data: { status: PaymentStatus.CANCELLED },
    });
  }
  return tranId;
};

export const getMyPayments = async (userId: string) => {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          eventDate: true,
        },
      },
    },
  });
};
