import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getPublicProducts,
  getPublicExpeditions,
  getLandingPage,
  createOrder,
  chargePayment,
  validateVoucher,
} from "@/services/api";
import type { Product } from "@/types/product.types";
import type { Expedition, ContactPerson } from "@/types/content.types";
import type {
  CreateOrderBody,
  CreateOrderResponse,
  ChargePaymentResponse,
  ValidateVoucherResponse,
} from "@/types/order.types";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import FloatingWhatsApp from "@/components/common/FloatingWhatsApp";

// ==========================================
// TYPES
// ==========================================
export interface CartItem {
  product: Product;
  quantity: number;
}

interface FormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_province: string;
  customer_postal_code: string;
  payment_method: "bank_transfer" | "qris";
  bank: "bca" | "bni" | "bri" | "mandiri" | "";
  expedition_id: string;
  notes: string;
  no_cancel_ack: boolean;
}

export type CheckoutStep = "form" | "payment" | "success";

// ==========================================
// CHECKOUT PAGE
// ==========================================
export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const preselectedProductId = searchParams.get("product_id");

  const [products, setProducts] = useState<Product[]>([]);
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [contact, setContact] = useState<ContactPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_address: "",
    customer_city: "",
    customer_province: "",
    customer_postal_code: "",
    payment_method: "bank_transfer",
    bank: "bca",
    expedition_id: "",
    notes: "",
    no_cancel_ack: false,
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [voucherCode, setVoucherCode] = useState("");
  const [voucher, setVoucher] = useState<ValidateVoucherResponse | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [step, setStep] = useState<CheckoutStep>("form");
  const [orderResult, setOrderResult] = useState<CreateOrderResponse | null>(
    null,
  );
  const [paymentResult, setPaymentResult] =
    useState<ChargePaymentResponse | null>(null);

  const hasPhysicalProduct = cartItems.some(
    (item) =>
      item.product.product_type === "PHYSICAL" ||
      item.product.product_type === "BOTH",
  );

  // ---- Fetch ----
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [prods, exps, landingData] = await Promise.all([
          getPublicProducts(),
          getPublicExpeditions(),
          getLandingPage(),
        ]);
        setProducts(prods);
        setExpeditions(exps);
        setContact(landingData.contact_person);

        // Simpan UTM dari URL ke sessionStorage
        const urlParams = new URLSearchParams(window.location.search);
        const utmFields = [
          "utm_source",
          "utm_medium",
          "utm_campaign",
          "referrer",
        ];
        utmFields.forEach((key) => {
          const val =
            key === "referrer"
              ? document.referrer || urlParams.get(key) || ""
              : urlParams.get(key) || "";
          if (val) sessionStorage.setItem(key, val);
        });

        if (preselectedProductId) {
          const found = prods.find((p) => p.id === preselectedProductId);
          if (found) setCartItems([{ product: found, quantity: 1 }]);
        } else if (prods.length > 0) {
          setCartItems([{ product: prods[0], quantity: 1 }]);
        }
      } catch {
        setDataError("Gagal memuat data produk. Silakan refresh halaman.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [preselectedProductId]);

  // ---- onChange ----
  const handleFormChange = useCallback(
    (field: keyof FormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (field === "customer_email") {
        setVoucher(null);
        setVoucherError(null);
      }
    },
    [],
  );

  // ---- onQuantityChange ----
  const handleQuantityChange = useCallback(
    (productId: string, qty: number) => {
      if (qty < 0) return;
      setCartItems((prev) => {
        if (qty === 0) return prev.filter((i) => i.product.id !== productId);
        const exists = prev.find((i) => i.product.id === productId);
        if (exists) {
          return prev.map((i) =>
            i.product.id === productId ? { ...i, quantity: qty } : i,
          );
        }
        const product = products.find((p) => p.id === productId);
        if (!product) return prev;
        return [...prev, { product, quantity: qty }];
      });
      setVoucher(null);
      setVoucherError(null);
    },
    [products],
  );

  // ---- Voucher ----
  const handleApplyVoucher = useCallback(async () => {
    if (!voucherCode.trim() || !formData.customer_email) return;
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    if (subtotal === 0) {
      setVoucherError("Tambahkan produk terlebih dahulu");
      return;
    }
    setVoucherLoading(true);
    setVoucherError(null);
    setVoucher(null);
    try {
      const result = await validateVoucher(
        voucherCode,
        subtotal,
        formData.customer_email,
      );
      setVoucher(result);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setVoucherError(
        axiosErr.response?.data?.message ??
          (err instanceof Error ? err.message : "Voucher tidak valid"),
      );
    } finally {
      setVoucherLoading(false);
    }
  }, [voucherCode, formData.customer_email, cartItems]);

  const handleRemoveVoucher = useCallback(() => {
    setVoucher(null);
    setVoucherCode("");
    setVoucherError(null);
  }, []);

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (cartItems.length === 0) {
      setSubmitError("Pilih minimal 1 produk");
      return;
    }
    if (hasPhysicalProduct && !formData.expedition_id) {
      setSubmitError("Pilih ekspedisi untuk produk fisik");
      return;
    }
    if (formData.payment_method === "bank_transfer" && !formData.bank) {
      setSubmitError("Pilih bank untuk transfer");
      return;
    }
    if (!formData.no_cancel_ack) {
      setSubmitError(
        "Anda harus menyetujui syarat pesanan tidak dapat dibatalkan",
      );
      return;
    }

    setSubmitting(true);
    try {
      const orderBody: CreateOrderBody = {
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim().toLowerCase(),
        customer_phone: formData.customer_phone.trim(),
        payment_method: formData.payment_method,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        no_cancel_ack: true,
        ...(hasPhysicalProduct && {
          customer_address: formData.customer_address.trim(),
          customer_city: formData.customer_city.trim(),
          customer_province: formData.customer_province.trim(),
          customer_postal_code:
            formData.customer_postal_code.trim() || undefined,
          expedition_id: formData.expedition_id,
        }),
        ...(formData.payment_method === "bank_transfer" && {
          bank: formData.bank as "bca" | "bni" | "bri" | "mandiri",
        }),
        ...(formData.notes.trim() && { notes: formData.notes.trim() }),
        ...(voucher && { voucher_code: voucher.code }),
        // UTM dari sessionStorage
        ...(sessionStorage.getItem("utm_source") && {
          utm_source: sessionStorage.getItem("utm_source")!,
        }),
        ...(sessionStorage.getItem("utm_medium") && {
          utm_medium: sessionStorage.getItem("utm_medium")!,
        }),
        ...(sessionStorage.getItem("utm_campaign") && {
          utm_campaign: sessionStorage.getItem("utm_campaign")!,
        }),
        ...(sessionStorage.getItem("referrer") && {
          referrer: sessionStorage.getItem("referrer")!,
        }),
      };

      const order = await createOrder(orderBody);
      setOrderResult(order);

      const payment = await chargePayment(order.order_id);
      setPaymentResult(payment);

      // Meta Pixel Purchase event
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Purchase", {
          value: order.total_amount,
          currency: "IDR",
          content_ids: cartItems.map((i) => i.product.id),
          content_type: "product",
        });
      }

      // GA4 purchase event
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "purchase", {
          transaction_id: order.order_code,
          value: order.total_amount,
          currency: "IDR",
          items: cartItems.map((item) => ({
            item_id: item.product.id,
            item_name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          })),
        });
      }

      // Bersihkan UTM dari sessionStorage setelah order sukses
      ["utm_source", "utm_medium", "utm_campaign", "referrer"].forEach((key) =>
        sessionStorage.removeItem(key),
      );

      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setSubmitError(
        axiosErr.response?.data?.message ??
          (err instanceof Error
            ? err.message
            : "Terjadi kesalahan. Coba lagi."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Nama produk di cart untuk pre-filled WA message
  const cartProductNames = cartItems.map((i) => i.product.name).join(", ");
  const waMessage = cartProductNames
    ? `Halo, saya ingin bertanya tentang pesanan saya untuk produk: ${cartProductNames}`
    : undefined;

  // ---- Loading / Error ----
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid var(--border)",
              borderTopColor: "var(--primary)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "var(--text-muted)" }}>
            Memuat halaman checkout...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (dataError) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <p style={{ color: "#EF4444", fontSize: 16 }}>{dataError}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius)",
            padding: "10px 24px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>
    );
  }

  if (step === "payment" && paymentResult && orderResult) {
    return (
      <>
        <PaymentView
          order={orderResult}
          payment={paymentResult}
          onDone={() => setStep("success")}
        />
        <FloatingWhatsApp contact={contact} customMessage={waMessage} />
      </>
    );
  }

  if (step === "success" && orderResult) {
    return (
      <>
        <SuccessView orderCode={orderResult.order_code} />
        <FloatingWhatsApp contact={contact} customMessage={waMessage} />
      </>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-gray)" }}>
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid var(--border)",
          padding: "16px 0",
        }}
      >
        <div className="container">
          <a
            href="/"
            style={{
              color: "var(--text-muted)",
              fontSize: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ← Kembali
          </a>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>
            Checkout
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: "32px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: 32,
            alignItems: "start",
          }}
        >
          <CheckoutForm
            formData={formData}
            cartItems={cartItems}
            products={products}
            expeditions={expeditions}
            hasPhysical={hasPhysicalProduct}
            loading={submitting}
            error={submitError}
            onChange={handleFormChange}
            onQuantityChange={handleQuantityChange}
            onSubmit={handleSubmit}
          />
          <OrderSummary
            cartItems={cartItems}
            voucher={voucher}
            voucherCode={voucherCode}
            voucherLoading={voucherLoading}
            voucherError={voucherError}
            customerEmail={formData.customer_email}
            onVoucherCodeChange={setVoucherCode}
            onApplyVoucher={() => void handleApplyVoucher()}
            onRemoveVoucher={handleRemoveVoucher}
          />
        </div>
      </div>

      <FloatingWhatsApp contact={contact} customMessage={waMessage} />

      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const formatCountdown = (expiredTime: number): string => {
  const diff = expiredTime * 1000 - Date.now();
  if (diff <= 0) return "Kadaluarsa";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

function PaymentView({
  order,
  payment,
  onDone,
}: {
  order: CreateOrderResponse;
  payment: ChargePaymentResponse;
  onDone: () => void;
}) {
  const [countdown, setCountdown] = useState(
    formatCountdown(payment.expired_time),
  );

  useEffect(() => {
    const timer = setInterval(
      () => setCountdown(formatCountdown(payment.expired_time)),
      1000,
    );
    return () => clearInterval(timer);
  }, [payment.expired_time]);

  const isQris = payment.payment_method === "qris";
  const isExpired = countdown === "Kadaluarsa";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-gray)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          padding: "40px",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#FEF3C7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            margin: "0 auto 20px",
          }}
        >
          💳
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
          Selesaikan Pembayaran
        </h2>
        <p
          style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}
        >
          Order: <strong>{order.order_code}</strong>
        </p>

        <div
          style={{
            background: isExpired ? "#FEE2E2" : "#FEF3C7",
            borderRadius: "var(--radius)",
            padding: "12px 20px",
            marginBottom: 24,
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: isExpired ? "#991B1B" : "#92400E",
              marginBottom: 4,
            }}
          >
            {isExpired ? "Pembayaran kadaluarsa" : "Batas waktu pembayaran"}
          </p>
          <p
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: isExpired ? "#EF4444" : "#D97706",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {countdown}
          </p>
        </div>

        <div
          style={{
            background: "var(--bg-gray)",
            borderRadius: "var(--radius)",
            padding: "16px",
            marginBottom: 24,
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 4,
            }}
          >
            Total yang harus dibayar
          </p>
          <p style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)" }}>
            {formatRupiah(order.total_amount)}
          </p>
          {order.discount_amount > 0 && (
            <p style={{ fontSize: 13, color: "#10B981", marginTop: 4 }}>
              Hemat {formatRupiah(order.discount_amount)}
            </p>
          )}
        </div>

        {isQris ? (
          <div style={{ marginBottom: 24 }}>
            {payment.qr_url && (
              <img
                src={payment.qr_url}
                alt="QR Code Pembayaran"
                style={{
                  width: 200,
                  height: 200,
                  margin: "0 auto 16px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                }}
              />
            )}
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Scan QR code menggunakan aplikasi mobile banking atau e-wallet
              Anda
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: 8,
              }}
            >
              Nomor Virtual Account{" "}
              <strong>{payment.bank?.toUpperCase()}</strong>
            </p>
            <div
              style={{
                background: "var(--bg-gray)",
                borderRadius: "var(--radius)",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                border: "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {payment.va_number ?? "-"}
              </span>
              <button
                onClick={() =>
                  void navigator.clipboard.writeText(payment.va_number ?? "")
                }
                style={{
                  background: "var(--primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Salin
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a
            href={`/track?code=${order.order_code}`}
            style={{
              display: "block",
              background: "var(--primary)",
              color: "#fff",
              borderRadius: "var(--radius)",
              padding: "13px",
              fontWeight: 700,
              fontSize: 15,
              textAlign: "center",
            }}
          >
            Cek Status Pesanan
          </a>
          <button
            onClick={onDone}
            style={{
              background: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "12px",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Sudah Bayar
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessView({ orderCode }: { orderCode: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-gray)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          padding: "48px 40px",
          maxWidth: 440,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#D1FAE5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            margin: "0 auto 24px",
          }}
        >
          ✓
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          Pesanan Dikonfirmasi!
        </h2>
        <p
          style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 8 }}
        >
          No. Order Anda:
        </p>
        <p
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "var(--primary)",
            marginBottom: 24,
            letterSpacing: "0.03em",
          }}
        >
          {orderCode}
        </p>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: 14,
            lineHeight: 1.7,
            marginBottom: 32,
          }}
        >
          Konfirmasi dan informasi pesanan akan dikirim ke email Anda. Simpan
          nomor order untuk melacak pesanan.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a
            href={`/track?code=${orderCode}`}
            style={{
              display: "block",
              background: "var(--primary)",
              color: "#fff",
              borderRadius: "var(--radius)",
              padding: "13px",
              fontWeight: 700,
              fontSize: 15,
              textAlign: "center",
            }}
          >
            Lacak Pesanan
          </a>
          <a
            href="/"
            style={{
              display: "block",
              background: "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "12px",
              fontWeight: 600,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}
