import { baseTemplate } from "./base.template";
import { IInvitationEmailPayload } from "./templates.interface";

export const invitationTemplate = ({
  inviterName,
  eventName,
  eventDate,
  eventLocation,
  inviteLink,
}: IInvitationEmailPayload): string => {
  const content = `
    <h2 style="color: #1E293B; margin-top: 0;">You're Invited!</h2>
    <p style="color: #475569; font-size: 16px;">
      <strong>${inviterName}</strong> has invited you to attend <strong>${eventName}</strong>.
    </p>
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 6px 0; color: #334155;"><strong>📅 Date & Time:</strong> ${eventDate}</p>
      <p style="margin: 6px 0; color: #334155;"><strong>📍 Location:</strong> ${eventLocation}</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteLink}" class="btn">View & Respond to Invitation</a>
    </div>
    <p style="color: #64748B; font-size: 14px;">
      Please respond before the event starts to secure your spot.
    </p>
  `;

  return baseTemplate({
    title: `You're invited to ${eventName}`,
    previewText: `${inviterName} invited you to ${eventName}`,
    contentHtml: content,
  });
};
