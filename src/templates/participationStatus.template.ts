import { baseTemplate } from "./base.template";
import { IParticipationStatusPayload } from "./templates.interface";

export const participationStatusTemplate = ({
  userName,
  eventName,
  status,
  eventDate,
  notes,
}: IParticipationStatusPayload): string => {
  const isApproved = status === "APPROVED";
  const titleColor = isApproved ? "#10B981" : "#EF4444";
  const statusTitle = isApproved ? "You're In! Registration Approved" : "Registration Status Update";

  const content = `
    <h2 style="color: ${titleColor}; margin-top: 0;">${statusTitle}</h2>
    <p style="color: #475569; font-size: 16px;">
      Hello <strong>${userName}</strong>,
    </p>
    <p style="color: #475569; font-size: 16px;">
      Your request to join <strong>${eventName}</strong> has been marked as <strong>${status}</strong> by the host.
    </p>
    ${
      eventDate
        ? `<p style="color: #334155; margin: 12px 0;"><strong>📅 Event Date:</strong> ${eventDate}</p>`
        : ""
    }
    ${
      notes
        ? `<div style="background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 12px; margin: 16px 0; color: #991B1B;">${notes}</div>`
        : ""
    }
    <p style="color: #64748B; font-size: 14px;">
      Visit your Planora dashboard to view all event details, venue access, and updates.
    </p>
  `;

  return baseTemplate({
    title: `Registration Status: ${eventName}`,
    previewText: `Registration ${status.toLowerCase()} for ${eventName}`,
    contentHtml: content,
  });
};
