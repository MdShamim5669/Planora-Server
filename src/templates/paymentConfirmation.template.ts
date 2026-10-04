import { baseTemplate } from "./base.template";
import { IPaymentConfirmationPayload } from "./templates.interface";

export const paymentConfirmationTemplate = ({
  userName,
  eventName,
  tranId,
  amount,
  currency,
  paidAt,
}: IPaymentConfirmationPayload): string => {
  const content = `
    <h2 style="color: #10B981; margin-top: 0;">Payment Confirmed!</h2>
    <p style="color: #475569; font-size: 16px;">
      Hello <strong>${userName}</strong>, your payment for <strong>${eventName}</strong> has been successfully processed.
    </p>
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Transaction ID:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0F172A;">${tranId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Amount Paid:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #10B981;">${amount} ${currency}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Payment Date:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #0F172A;">${paidAt}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748B;">Status:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #10B981;">SUCCESS</td>
        </tr>
      </table>
    </div>
    <p style="color: #64748B; font-size: 14px;">
      Your registration request has been submitted to the event organizer for final approval. You can check your status anytime on your dashboard.
    </p>
  `;

  return baseTemplate({
    title: `Payment Receipt: ${eventName}`,
    previewText: `Payment confirmed for ${eventName}`,
    contentHtml: content,
  });
};
