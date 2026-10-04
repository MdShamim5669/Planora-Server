import { baseTemplate } from "./base.template";
import { IWelcomeEmailPayload } from "./templates.interface";

export const welcomeTemplate = ({ name, loginUrl }: IWelcomeEmailPayload): string => {
  const content = `
    <h2 style="color: #1E293B; margin-top: 0;">Welcome to Planora, ${name}!</h2>
    <p style="color: #475569; font-size: 16px;">
      We're excited to have you join our event management community. With Planora, you can discover amazing public events, host your own private gatherings, and manage your attendees effortlessly.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" class="btn">Explore Planora</a>
    </div>
    <p style="color: #64748B; font-size: 14px;">
      If you did not sign up for this account, you can safely ignore this email.
    </p>
  `;

  return baseTemplate({
    title: "Welcome to Planora",
    previewText: `Welcome to Planora, ${name}!`,
    contentHtml: content,
  });
};
