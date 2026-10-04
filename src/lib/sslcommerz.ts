import axios from "axios";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

import {
  SslcommerzInitPayload,
  SslcommerzInitResponse,
  SslcommerzValidateResponse,
} from "./sslcommerz.interface";

export {
  SslcommerzInitPayload,
  SslcommerzInitResponse,
  SslcommerzValidateResponse,
};

export const getSslcommerzBaseUrl = () => {
  return env.SSLCZ_IS_LIVE
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";
};

export const initSslcommerzSession = async (
  payload: SslcommerzInitPayload
): Promise<string> => {
  const baseUrl = getSslcommerzBaseUrl();
  const initUrl = `${baseUrl}/gwprocess/v4/api.php`;

  const postData = new URLSearchParams({
    store_id: env.SSLCZ_STORE_ID,
    store_passwd: env.SSLCZ_STORE_PASSWORD,
    total_amount: payload.total_amount,
    currency: payload.currency || "BDT",
    tran_id: payload.tran_id,
    success_url: payload.success_url,
    fail_url: payload.fail_url,
    cancel_url: payload.cancel_url,
    ipn_url: payload.ipn_url,
    cus_name: payload.cus_name || "N/A",
    cus_email: payload.cus_email || "customer@example.com",
    cus_add1: payload.cus_add1 || "Dhaka",
    cus_city: payload.cus_city || "Dhaka",
    cus_country: payload.cus_country || "Bangladesh",
    cus_phone: payload.cus_phone || "01700000000",
    shipping_method: "NO",
    product_name: payload.product_name,
    product_category: "Event Registration",
    product_profile: "general",
  });

  try {
    const response = await axios.post<SslcommerzInitResponse>(initUrl, postData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (response.data?.status === "SUCCESS" && response.data.GatewayPageURL) {
      return response.data.GatewayPageURL;
    }

    throw new ApiError(
      502,
      "GATEWAY_ERROR",
      response.data?.failedreason || "Payment gateway did not create a session."
    );
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      502,
      "GATEWAY_ERROR",
      error.message || "Failed to contact payment gateway."
    );
  }
};

export const validateSslcommerzPayment = async (
  val_id: string
): Promise<SslcommerzValidateResponse> => {
  const baseUrl = getSslcommerzBaseUrl();
  const validateUrl = `${baseUrl}/validator/api/validationserverAPI.php`;

  try {
    const response = await axios.get<SslcommerzValidateResponse>(validateUrl, {
      params: {
        val_id,
        store_id: env.SSLCZ_STORE_ID,
        store_passwd: env.SSLCZ_STORE_PASSWORD,
        format: "json",
      },
    });

    return response.data;
  } catch (error: any) {
    throw new ApiError(
      502,
      "GATEWAY_ERROR",
      error.message || "Failed to validate payment with gateway."
    );
  }
};
