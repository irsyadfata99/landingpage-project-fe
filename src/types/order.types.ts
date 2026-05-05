// ==========================================
// ORDER TYPES
// ==========================================

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "DONE"
  | "EXPIRED"
  | "REFUNDED";

export type ProductType = "PHYSICAL" | "DIGITAL" | "BOTH";

export interface OrderItem {
  id: string;
  product_name: string;
  product_type: ProductType;
  quantity: number;
  price: number;
  subtotal: number;
  download_expires_at: string | null;
  signed_download_url: string | null;
}

export interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string | null;
  customer_city: string | null;
  customer_province: string | null;
  customer_postal_code: string | null;
  status: OrderStatus;
  total_amount: number;
  discount_amount: number;
  voucher_code: string | null;
  expedition_name: string | null;
  tracking_number: string | null;
  payment_method: "bank_transfer" | "qris" | null;
  payment_bank: string | null;
  payment_url: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  confirmed_at: string | null;
  created_at: string;
  items: OrderItem[];
}

// ---- Request Bodies ----

export interface CreateOrderItemBody {
  product_id: string;
  quantity: number;
}

export interface CreateOrderBody {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  customer_city?: string;
  customer_province?: string;
  customer_postal_code?: string;
  expedition_id?: string;
  payment_method: "bank_transfer" | "qris";
  bank?: "bca" | "bni" | "bri" | "mandiri";
  items: CreateOrderItemBody[];
  notes?: string;
  no_cancel_ack: true;
  voucher_code?: string;
}

// ---- Response Data ----

export interface CreateOrderResponse {
  order_id: string;
  order_code: string;
  total_amount: number;
  discount_amount: number;
  voucher_code: string | null;
}

export interface ChargePaymentResponse {
  order_code: string;
  payment_method: "bank_transfer" | "qris";
  bank?: string;
  channel_code?: string;
  va_number?: string | null;
  qr_url?: string | null;
  qr_string?: string | null;
  total_amount: number;
  tripay_reference: string;
  expired_time: number;
}

export interface ValidateVoucherResponse {
  id: string;
  code: string;
  type: "PERCENT" | "NOMINAL";
  value: number;
  discount_amount: number;
}
