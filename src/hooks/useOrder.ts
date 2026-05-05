import { useState } from "react";
import { createOrder, chargePayment, validateVoucher } from "@/services/api";
import type {
  CreateOrderBody,
  CreateOrderResponse,
  ChargePaymentResponse,
  ValidateVoucherResponse,
} from "@/types/order.types";

// ==========================================
// useOrder — handle full checkout flow
// ==========================================
export const useOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitOrder = async (
    body: CreateOrderBody,
  ): Promise<CreateOrderResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await createOrder(body);
      return result;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal membuat order";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const submitCharge = async (
    orderId: string,
  ): Promise<ChargePaymentResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await chargePayment(orderId);
      return result;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal membuat pembayaran";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, setError, submitOrder, submitCharge };
};

// ==========================================
// useVoucher — handle voucher validation
// ==========================================
export const useVoucher = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voucher, setVoucher] = useState<ValidateVoucherResponse | null>(null);

  const validate = async (
    code: string,
    totalAmount: number,
    customerEmail: string,
  ): Promise<boolean> => {
    if (!customerEmail) {
      setError("Isi email terlebih dahulu sebelum menggunakan voucher");
      return false;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await validateVoucher(code, totalAmount, customerEmail);
      setVoucher(result);
      return true;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Voucher tidak valid";
      setError(msg);
      setVoucher(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setVoucher(null);
    setError(null);
  };

  return { loading, error, voucher, validate, reset };
};
