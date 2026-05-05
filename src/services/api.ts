import api from "./axios.config";
import type { LandingPageData, Expedition } from "@/types/content.types";
import type { Product } from "@/types/product.types";
import type {
  Order,
  CreateOrderBody,
  CreateOrderResponse,
  ChargePaymentResponse,
  ValidateVoucherResponse,
} from "@/types/order.types";

// ==========================================
// GENERIC RESPONSE WRAPPER
// ==========================================
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// ==========================================
// CONTENT — Landing Page
// ==========================================
export const getLandingPage = async (): Promise<LandingPageData> => {
  const res = await api.get<ApiResponse<LandingPageData>>("/content");
  return res.data.data!;
};

// ==========================================
// PRODUCTS & EXPEDITIONS (public)
// ==========================================
export const getPublicProducts = async (): Promise<Product[]> => {
  const res = await api.get<ApiResponse<Product[]>>("/products");
  return res.data.data!;
};

export const getPublicExpeditions = async (): Promise<Expedition[]> => {
  const res = await api.get<ApiResponse<Expedition[]>>("/products/expeditions");
  return res.data.data!;
};

// ==========================================
// ORDERS (public)
// ==========================================
export const createOrder = async (
  body: CreateOrderBody,
): Promise<CreateOrderResponse> => {
  const res = await api.post<ApiResponse<CreateOrderResponse>>("/orders", body);
  return res.data.data!;
};

export const trackOrder = async (orderCode: string): Promise<Order> => {
  const res = await api.get<ApiResponse<Order>>(`/orders/track/${orderCode}`);
  return res.data.data!;
};

export const confirmDelivery = async (orderCode: string): Promise<void> => {
  await api.patch(`/orders/${orderCode}/confirm`);
};

export const validateVoucher = async (
  code: string,
  total_amount: number,
  customer_email: string,
): Promise<ValidateVoucherResponse> => {
  const res = await api.post<ApiResponse<ValidateVoucherResponse>>(
    "/orders/validate-voucher",
    { code, total_amount, customer_email },
  );
  return res.data.data!;
};

// ==========================================
// PAYMENT (public)
// ==========================================
export const chargePayment = async (
  order_id: string,
): Promise<ChargePaymentResponse> => {
  const res = await api.post<ApiResponse<ChargePaymentResponse>>(
    "/payment/charge",
    { order_id },
  );
  return res.data.data!;
};

export const checkPaymentStatus = async (orderId: string): Promise<Order> => {
  const res = await api.get<ApiResponse<Order>>(`/payment/status/${orderId}`);
  return res.data.data!;
};

// ==========================================
// ADMIN — Auth
// ==========================================
export const adminLogin = async (
  email: string,
  password: string,
): Promise<{
  token: string;
  admin: { id: string; email: string; username: string };
}> => {
  const res = await api.post<
    ApiResponse<{
      token: string;
      admin: { id: string; email: string; username: string };
    }>
  >("/admin/login", { email, password });
  return res.data.data!;
};

export const getAdminMe = async () => {
  const res =
    await api.get<ApiResponse<{ id: string; username: string; email: string }>>(
      "/admin/me",
    );
  return res.data.data!;
};
