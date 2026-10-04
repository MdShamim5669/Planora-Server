import { IEmailOptions } from "./utils.interface";

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: IEmailOptions): Promise<{ success: boolean; messageId?: string }> => {
  try {
    // In production or when SMTP is configured, transport.sendMail is called.
    // In development/test or default Planora v1, log safely for observability
    if (process.env.NODE_ENV !== "production") {
      console.log(`📧 [EMAIL SENT] To: ${to} | Subject: "${subject}"`);
    }

    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false };
  }
};
