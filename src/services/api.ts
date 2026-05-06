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

interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
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

// ==========================================
// ADMIN — Orders
// ==========================================
export interface AdminOrderFilter {
  status?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface AdminOrdersResult {
  data: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export const adminGetOrders = async (
  filter: AdminOrderFilter = {},
): Promise<AdminOrdersResult> => {
  const params = new URLSearchParams();
  if (filter.status) params.set("status", filter.status);
  if (filter.search) params.set("search", filter.search);
  if (filter.start_date) params.set("start_date", filter.start_date);
  if (filter.end_date) params.set("end_date", filter.end_date);
  if (filter.page) params.set("page", String(filter.page));
  if (filter.limit) params.set("limit", String(filter.limit));

  const res = await api.get<PaginatedResponse<Order>>(
    `/admin/orders?${params.toString()}`,
  );
  return { data: res.data.data, pagination: res.data.pagination };
};

export const adminGetOrderById = async (id: string): Promise<Order> => {
  const res = await api.get<ApiResponse<Order>>(`/admin/orders/${id}`);
  return res.data.data!;
};

export const adminUpdateOrderStatus = async (
  id: string,
  status: string,
): Promise<Order> => {
  const res = await api.patch<ApiResponse<Order>>(
    `/admin/orders/${id}/status`,
    { status },
  );
  return res.data.data!;
};

export const adminUpdateTracking = async (
  id: string,
  tracking_number: string,
  expedition_name?: string,
): Promise<Order> => {
  const res = await api.patch<ApiResponse<Order>>(
    `/admin/orders/${id}/tracking`,
    { tracking_number, expedition_name },
  );
  return res.data.data!;
};

export const adminMarkAsDelivered = async (id: string): Promise<Order> => {
  const res = await api.patch<ApiResponse<Order>>(
    `/admin/orders/${id}/delivered`,
  );
  return res.data.data!;
};

export const adminExportOrders = async (
  filter: AdminOrderFilter = {},
): Promise<Blob> => {
  const params = new URLSearchParams();
  if (filter.status) params.set("status", filter.status);
  if (filter.search) params.set("search", filter.search);
  if (filter.start_date) params.set("start_date", filter.start_date);
  if (filter.end_date) params.set("end_date", filter.end_date);

  const res = await api.get(`/admin/orders/export?${params.toString()}`, {
    responseType: "blob",
  });
  return res.data as Blob;
};
