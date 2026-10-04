import { IBaseEmailPayload } from "./templates.interface";

export const baseTemplate = ({
  title,
  previewText = "Planora - Event Management Platform",
  contentHtml,
}: IBaseEmailPayload): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 0; line-height: 1.6; }
    .container { max-width: 600px; margin: 40px auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #4F46E5, #6366F1); padding: 32px 24px; text-align: center; }
    .header h1 { color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 32px 24px; }
    .footer { background-color: #F1F5F9; padding: 20px 24px; text-align: center; font-size: 13px; color: #64748B; border-top: 1px solid #E2E8F0; }
    .btn { display: inline-block; background-color: #4F46E5; color: #FFFFFF !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 20px; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>
  <div class="container">
    <div class="header">
      <h1>Planora</h1>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Planora. All rights reserved.</p>
      <p>Secure Event Management Platform</p>
    </div>
  </div>
</body>
</html>`;
};
