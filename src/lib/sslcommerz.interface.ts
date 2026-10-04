export interface SslcommerzInitPayload {
  total_amount: string;
  currency: string;
  tran_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;
  cus_name: string;
  cus_email: string;
  cus_phone: string;
  cus_add1?: string;
  cus_city?: string;
  cus_country?: string;
  product_name: string;
  product_category?: string;
  product_profile?: string;
  shipping_method?: string;
}

export interface SslcommerzInitResponse {
  status: string;
  failedreason?: string;
  sessionkey?: string;
  GatewayPageURL?: string;
}

export interface SslcommerzValidateResponse {
  status: string;
  tran_id: string;
  val_id: string;
  amount: string;
  currency: string;
  bank_tran_id?: string;
  card_type?: string;
}
