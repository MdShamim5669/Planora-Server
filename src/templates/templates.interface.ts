export interface IBaseEmailPayload {
  title: string;
  previewText?: string;
  contentHtml: string;
}

export interface IWelcomeEmailPayload {
  name: string;
  loginUrl: string;
}

export interface IInvitationEmailPayload {
  inviterName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  inviteLink: string;
}

export interface IPaymentConfirmationPayload {
  userName: string;
  eventName: string;
  tranId: string;
  amount: string;
  currency: string;
  paidAt: string;
}

export interface IParticipationStatusPayload {
  userName: string;
  eventName: string;
  status: "APPROVED" | "REJECTED" | "BANNED";
  eventDate?: string;
  notes?: string;
}
