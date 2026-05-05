import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/services/axios.config";

// ==========================================
// TYPES
// ==========================================
type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "DONE"
  | "EXPIRED"
  | "REFUNDED";

interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  product_type: "PHYSICAL" | "DIGITAL" | "BOTH";
  quantity: number;
  price: number;
  subtotal: number;
  download_url: string | null;
  download_expires_at: string | null;
}

interface Order {
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
  expedition_id: string | null;
  expedition_name: string | null;
  tracking_number: string | null;
  payment_method: string | null;
  payment_bank: string | null;
  tripay_order_id: string | null;
  no_cancel_ack: boolean;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  confirmed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

// ==========================================
// CONSTANTS
// ==========================================
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  PENDING: {
    label: "Menunggu Pembayaran",
    color: "#92400E",
    bg: "#FEF3C7",
    border: "#FCD34D",
    icon: "⏳",
  },
  PAID: {
    label: "Pembayaran Diterima",
    color: "#1D4ED8",
    bg: "#DBEAFE",
    border: "#93C5FD",
    icon: "✅",
  },
  PROCESSING: {
    label: "Sedang Diproses",
    color: "#5B21B6",
    bg: "#EDE9FE",
    border: "#C4B5FD",
    icon: "📦",
  },
  SHIPPED: {
    label: "Dalam Pengiriman",
    color: "#C2410C",
    bg: "#FEF3C7",
    border: "#FDE68A",
    icon: "🚚",
  },
  DELIVERED: {
    label: "Telah Sampai",
    color: "#065F46",
    bg: "#D1FAE5",
    border: "#6EE7B7",
    icon: "📬",
  },
  DONE: {
    label: "Selesai",
    color: "#065F46",
    bg: "#D1FAE5",
    border: "#6EE7B7",
    icon: "🎉",
  },
  EXPIRED: {
    label: "Kadaluarsa",
    color: "#6B7280",
    bg: "#F3F4F6",
    border: "#D1D5DB",
    icon: "❌",
  },
  REFUNDED: {
    label: "Dikembalikan",
    color: "#991B1B",
    bg: "#FEE2E2",
    border: "#FCA5A5",
    icon: "↩️",
  },
};

// Valid next status per current (sesuai backend VALID_STATUS_TRANSITIONS)
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "PAID",
  PAID: "PROCESSING",
  PROCESSING: "SHIPPED", // via tracking endpoint
  SHIPPED: "DELIVERED",
  DELIVERED: "DONE",
};

const TIMELINE_STEPS: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "DONE",
];

// ==========================================
// HELPERS
// ==========================================
const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

const formatDateTime = (s: string | null) => {
  if (!s) return null;
  return new Date(s).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ==========================================
// MAIN PAGE
// ==========================================
export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Tracking input modal
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingExpedition, setTrackingExpedition] = useState("");

  // ---- Fetch ----
  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: Order }>(
        `/admin/orders/${id}`,
      );
      setOrder(res.data.data);
    } catch {
      setError("Gagal memuat detail pesanan");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  // ---- Auto-clear feedback ----
  useEffect(() => {
    if (actionSuccess) {
      const t = setTimeout(() => setActionSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [actionSuccess]);

  // ---- Update status ----
  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await api.patch(`/admin/orders/${order.id}/status`, {
        status: newStatus,
      });
      setActionSuccess(
        `Status berhasil diubah ke ${STATUS_CONFIG[newStatus].label}`,
      );
      await fetchOrder();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal mengubah status";
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // ---- Input resi ----
  const handleSubmitTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !trackingNumber.trim()) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await api.patch(`/admin/orders/${order.id}/tracking`, {
        tracking_number: trackingNumber.trim(),
        ...(trackingExpedition.trim() && {
          expedition_name: trackingExpedition.trim(),
        }),
      });
      setActionSuccess("Nomor resi berhasil diinput, status diubah ke SHIPPED");
      setShowTrackingModal(false);
      setTrackingNumber("");
      setTrackingExpedition("");
      await fetchOrder();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal input nomor resi";
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // ---- Mark delivered ----
  const handleMarkDelivered = async () => {
    if (!order) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await api.patch(`/admin/orders/${order.id}/delivered`);
      setActionSuccess("Status diubah ke DELIVERED");
      await fetchOrder();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal mengubah status";
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid #E5E7EB",
              borderTopColor: "#3B82F6",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ color: "#6B7280", fontSize: 14 }}>
            Memuat detail pesanan...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p style={{ color: "#DC2626", fontSize: 15, marginBottom: 16 }}>
          ❌ {error ?? "Pesanan tidak ditemukan"}
        </p>
        <button
          onClick={() => navigate("/admin/orders")}
          style={{
            padding: "9px 20px",
            background: "#3B82F6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ← Kembali ke Pesanan
        </button>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status];
  const nextStatus = NEXT_STATUS[order.status];
  const isFinal = ["DONE", "EXPIRED", "REFUNDED"].includes(order.status);
  const currentStepIdx = TIMELINE_STEPS.indexOf(order.status);
  const isTerminal = order.status === "EXPIRED" || order.status === "REFUNDED";

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ---- Breadcrumb + Header ---- */}
      <div>
        <button
          onClick={() => navigate("/admin/orders")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "#6B7280",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            marginBottom: 12,
          }}
        >
          ← Kembali ke Pesanan
        </button>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#111827",
                fontFamily: "monospace",
                letterSpacing: "0.03em",
              }}
            >
              {order.order_code}
            </h1>
            <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
              Dibuat: {formatDateTime(order.created_at)}
            </p>
          </div>
          {/* Status badge besar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              borderRadius: 10,
              padding: "10px 18px",
            }}
          >
            <span style={{ fontSize: 20 }}>{cfg.icon}</span>
            <div>
              <p style={{ fontSize: 11, color: cfg.color, fontWeight: 600 }}>
                STATUS
              </p>
              <p style={{ fontSize: 15, color: cfg.color, fontWeight: 800 }}>
                {cfg.label}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Feedback ---- */}
      {actionSuccess && (
        <div
          style={{
            background: "#ECFDF5",
            border: "1px solid #6EE7B7",
            borderRadius: 8,
            padding: "12px 16px",
            color: "#065F46",
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          ✅ {actionSuccess}
        </div>
      )}
      {actionError && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: 8,
            padding: "12px 16px",
            color: "#DC2626",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span>❌ {actionError}</span>
          <button
            onClick={() => setActionError(null)}
            style={{
              background: "none",
              border: "none",
              color: "#FCA5A5",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ---- Main Grid ---- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* ===== LEFT COLUMN ===== */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* ---- Timeline ---- */}
          <Card title="Progres Pesanan">
            {isTerminal ? (
              <div
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderRadius: 8,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 24 }}>{cfg.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, color: cfg.color }}>
                    {cfg.label}
                  </p>
                  <p style={{ fontSize: 13, color: cfg.color, opacity: 0.8 }}>
                    {order.status === "EXPIRED"
                      ? "Pesanan tidak dibayar dalam 24 jam"
                      : "Dana telah dikembalikan via Tripay"}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ position: "relative", paddingLeft: 8 }}>
                {/* Connector line */}
                <div
                  style={{
                    position: "absolute",
                    left: 27,
                    top: 20,
                    bottom: 20,
                    width: 2,
                    background: "#E5E7EB",
                    zIndex: 0,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 27,
                    top: 20,
                    width: 2,
                    height: `${(Math.max(0, currentStepIdx) / (TIMELINE_STEPS.length - 1)) * 100}%`,
                    background: "#3B82F6",
                    zIndex: 1,
                    transition: "height 0.5s ease",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {TIMELINE_STEPS.map((step, idx) => {
                    const scfg = STATUS_CONFIG[step];
                    const isDone = idx < currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const isPending = idx > currentStepIdx;

                    // Timestamp per step
                    const timestamps: Partial<
                      Record<OrderStatus, string | null>
                    > = {
                      PAID: order.paid_at,
                      SHIPPED: order.shipped_at,
                      DELIVERED: order.delivered_at,
                      DONE: order.confirmed_at,
                    };
                    const ts = timestamps[step];

                    return (
                      <div
                        key={step}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 16,
                          paddingBottom:
                            idx < TIMELINE_STEPS.length - 1 ? 20 : 0,
                        }}
                      >
                        {/* Dot */}
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: isCurrent ? 16 : 13,
                            background: isDone
                              ? "#3B82F6"
                              : isCurrent
                                ? scfg.bg
                                : "#F9FAFB",
                            border: isCurrent
                              ? `2px solid ${scfg.border}`
                              : isDone
                                ? "2px solid #3B82F6"
                                : "2px solid #E5E7EB",
                            boxShadow: isCurrent
                              ? `0 0 0 4px ${scfg.bg}`
                              : "none",
                            transition: "all 0.3s",
                          }}
                        >
                          {isDone ? (
                            <span
                              style={{
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: 13,
                              }}
                            >
                              ✓
                            </span>
                          ) : (
                            <span style={{ opacity: isPending ? 0.35 : 1 }}>
                              {scfg.icon}
                            </span>
                          )}
                        </div>

                        {/* Label */}
                        <div style={{ paddingTop: 8 }}>
                          <p
                            style={{
                              fontWeight: isCurrent ? 700 : isDone ? 600 : 500,
                              fontSize: isCurrent ? 14 : 13,
                              color: isPending ? "#D1D5DB" : "#111827",
                            }}
                          >
                            {scfg.label}
                          </p>
                          {ts && (
                            <p
                              style={{
                                fontSize: 12,
                                color: "#10B981",
                                marginTop: 1,
                              }}
                            >
                              {formatDateTime(ts)}
                            </p>
                          )}
                          {step === "SHIPPED" && order.tracking_number && (
                            <p
                              style={{
                                fontSize: 12,
                                color: "#6B7280",
                                marginTop: 1,
                              }}
                            >
                              Resi: <strong>{order.tracking_number}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          {/* ---- Action Panel ---- */}
          {!isFinal && (
            <Card title="Aksi Admin">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {/* PENDING → PAID manual */}
                {order.status === "PENDING" && nextStatus && (
                  <ActionButton
                    label={`✅ Tandai Sudah Dibayar (${STATUS_CONFIG[nextStatus].label})`}
                    color="#1D4ED8"
                    bg="#DBEAFE"
                    border="#93C5FD"
                    loading={actionLoading}
                    onClick={() => void handleUpdateStatus(nextStatus)}
                    warning="Gunakan ini hanya jika pembayaran sudah dikonfirmasi manual."
                  />
                )}

                {/* PAID → PROCESSING */}
                {order.status === "PAID" && nextStatus && (
                  <ActionButton
                    label="📦 Mulai Proses Pesanan"
                    color="#5B21B6"
                    bg="#EDE9FE"
                    border="#C4B5FD"
                    loading={actionLoading}
                    onClick={() => void handleUpdateStatus(nextStatus)}
                  />
                )}

                {/* PROCESSING → SHIPPED via tracking */}
                {order.status === "PROCESSING" && (
                  <ActionButton
                    label="🚚 Input Nomor Resi & Kirim"
                    color="#C2410C"
                    bg="#FEF3C7"
                    border="#FDE68A"
                    loading={actionLoading}
                    onClick={() => setShowTrackingModal(true)}
                  />
                )}

                {/* SHIPPED → DELIVERED */}
                {order.status === "SHIPPED" && (
                  <ActionButton
                    label="📬 Konfirmasi Sudah Sampai (DELIVERED)"
                    color="#065F46"
                    bg="#D1FAE5"
                    border="#6EE7B7"
                    loading={actionLoading}
                    onClick={() => void handleMarkDelivered()}
                    warning="Konfirmasi bahwa barang sudah sampai ke customer."
                  />
                )}

                {/* DELIVERED — menunggu konfirmasi customer */}
                {order.status === "DELIVERED" && (
                  <div
                    style={{
                      background: "#F0FDF4",
                      border: "1px solid #86EFAC",
                      borderRadius: 8,
                      padding: "14px 16px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: "#065F46",
                        fontWeight: 600,
                      }}
                    >
                      📬 Menunggu konfirmasi customer
                    </p>
                    <p style={{ fontSize: 12, color: "#059669", marginTop: 4 }}>
                      Pesanan akan otomatis DONE setelah customer konfirmasi
                      terima.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* ---- Items ---- */}
          <Card title="Detail Produk">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {order.items.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                    paddingBottom: idx < order.items.length - 1 ? 12 : 0,
                    borderBottom:
                      idx < order.items.length - 1
                        ? "1px solid #F3F4F6"
                        : "none",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#111827",
                      }}
                    >
                      {item.product_name}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          background:
                            item.product_type === "DIGITAL"
                              ? "#EDE9FE"
                              : "#DBEAFE",
                          color:
                            item.product_type === "DIGITAL"
                              ? "#7C3AED"
                              : "#1D4ED8",
                          padding: "2px 8px",
                          borderRadius: 99,
                          fontWeight: 600,
                        }}
                      >
                        {item.product_type === "DIGITAL"
                          ? "📥 Digital"
                          : item.product_type === "BOTH"
                            ? "📦+📥 Fisik & Digital"
                            : "📦 Fisik"}
                      </span>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>
                        {formatRupiah(item.price)} × {item.quantity}
                      </span>
                    </div>
                    {item.download_expires_at && (
                      <p
                        style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}
                      >
                        Link expire: {formatDateTime(item.download_expires_at)}
                      </p>
                    )}
                  </div>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatRupiah(item.subtotal)}
                  </p>
                </div>
              ))}

              {/* Summary */}
              <div
                style={{
                  borderTop: "1px solid #E5E7EB",
                  paddingTop: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <SummaryRow
                  label="Subtotal"
                  value={formatRupiah(
                    order.total_amount + order.discount_amount,
                  )}
                />
                {order.discount_amount > 0 && (
                  <SummaryRow
                    label={`Diskon${order.voucher_code ? ` (${order.voucher_code})` : ""}`}
                    value={`-${formatRupiah(order.discount_amount)}`}
                    valueColor="#059669"
                  />
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 8,
                    borderTop: "1px solid #E5E7EB",
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: 17,
                      color: "#1D4ED8",
                    }}
                  >
                    {formatRupiah(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* ---- Notes ---- */}
          {order.notes && (
            <Card title="Catatan dari Customer">
              <p
                style={{
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: 1.7,
                  background: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                💬 {order.notes}
              </p>
            </Card>
          )}
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* ---- Info Customer ---- */}
          <Card title="Informasi Customer">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <InfoRow label="Nama" value={order.customer_name} />
              <InfoRow label="Email" value={order.customer_email} mono />
              <InfoRow label="No. HP" value={order.customer_phone} />
              {order.customer_address && (
                <div>
                  <p
                    style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 3 }}
                  >
                    Alamat
                  </p>
                  <p
                    style={{ fontSize: 13, color: "#111827", lineHeight: 1.6 }}
                  >
                    {[
                      order.customer_address,
                      order.customer_city,
                      order.customer_province,
                      order.customer_postal_code,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* ---- Info Pembayaran ---- */}
          <Card title="Informasi Pembayaran">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <InfoRow
                label="Metode"
                value={
                  order.payment_method === "bank_transfer"
                    ? `Transfer Bank${order.payment_bank ? ` (${order.payment_bank.toUpperCase()})` : ""}`
                    : "QRIS"
                }
              />
              {order.tripay_order_id && (
                <InfoRow
                  label="Ref. Tripay"
                  value={order.tripay_order_id}
                  mono
                />
              )}
              {order.paid_at && (
                <InfoRow
                  label="Waktu Bayar"
                  value={formatDateTime(order.paid_at)!}
                />
              )}
              <InfoRow
                label="No Cancel Ack"
                value={order.no_cancel_ack ? "✅ Ya" : "❌ Tidak"}
              />
            </div>
          </Card>

          {/* ---- Info Pengiriman ---- */}
          {(order.expedition_name || order.tracking_number) && (
            <Card title="Informasi Pengiriman">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {order.expedition_name && (
                  <InfoRow label="Ekspedisi" value={order.expedition_name} />
                )}
                {order.tracking_number && (
                  <div>
                    <p
                      style={{
                        fontSize: 12,
                        color: "#9CA3AF",
                        marginBottom: 3,
                      }}
                    >
                      No. Resi
                    </p>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#1D4ED8",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {order.tracking_number}
                      </span>
                      <button
                        onClick={() =>
                          void navigator.clipboard.writeText(
                            order.tracking_number!,
                          )
                        }
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          background: "#EFF6FF",
                          color: "#1D4ED8",
                          border: "1px solid #BFDBFE",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        Salin
                      </button>
                    </div>
                  </div>
                )}
                {order.shipped_at && (
                  <InfoRow
                    label="Dikirim"
                    value={formatDateTime(order.shipped_at)!}
                  />
                )}
                {order.delivered_at && (
                  <InfoRow
                    label="Sampai"
                    value={formatDateTime(order.delivered_at)!}
                  />
                )}
                {order.confirmed_at && (
                  <InfoRow
                    label="Dikonfirmasi"
                    value={formatDateTime(order.confirmed_at)!}
                  />
                )}
              </div>
            </Card>
          )}

          {/* ---- Meta ---- */}
          <Card title="Informasi Sistem">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <InfoRow label="Order ID" value={order.id} mono small />
              <InfoRow
                label="Dibuat"
                value={formatDateTime(order.created_at)!}
              />
              <InfoRow
                label="Diupdate"
                value={formatDateTime(order.updated_at)!}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* ==========================================
          TRACKING MODAL
      ========================================== */}
      {showTrackingModal && (
        <div
          onClick={() => {
            if (!actionLoading) setShowTrackingModal(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 440,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 24px",
                borderBottom: "1px solid #E5E7EB",
                background: "#FFFBEB",
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
                  🚚 Input Nomor Resi
                </h3>
                <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                  Pesanan akan otomatis berubah ke SHIPPED
                </p>
              </div>
              <button
                onClick={() => setShowTrackingModal(false)}
                disabled={actionLoading}
                style={{
                  background: "#F3F4F6",
                  border: "none",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  fontSize: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <form
              onSubmit={(e) => void handleSubmitTracking(e)}
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Nomor Resi <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Contoh: JNE123456789"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    fontSize: 14,
                    outline: "none",
                    fontFamily: "monospace",
                    letterSpacing: "0.05em",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#3B82F6")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#E5E7EB")
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}
                >
                  Ekspedisi{" "}
                  <span style={{ color: "#9CA3AF", fontWeight: 400 }}>
                    (opsional, jika ingin override)
                  </span>
                </label>
                <input
                  type="text"
                  value={trackingExpedition}
                  onChange={(e) => setTrackingExpedition(e.target.value)}
                  placeholder={order.expedition_name ?? "Nama ekspedisi..."}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    fontSize: 14,
                    outline: "none",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#3B82F6")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#E5E7EB")
                  }
                />
              </div>

              {actionError && (
                <p style={{ fontSize: 13, color: "#DC2626" }}>
                  ❌ {actionError}
                </p>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowTrackingModal(false)}
                  disabled={actionLoading}
                  style={{
                    flex: 1,
                    padding: "11px",
                    background: "transparent",
                    color: "#6B7280",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: actionLoading ? "not-allowed" : "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !trackingNumber.trim()}
                  style={{
                    flex: 1,
                    padding: "11px",
                    background:
                      actionLoading || !trackingNumber.trim()
                        ? "#E5E7EB"
                        : "#C2410C",
                    color:
                      actionLoading || !trackingNumber.trim()
                        ? "#9CA3AF"
                        : "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor:
                      actionLoading || !trackingNumber.trim()
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {actionLoading ? "⏳ Menyimpan..." : "🚚 Simpan & Kirim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 320px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ==========================================
// HELPER COMPONENTS
// ==========================================

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid #E5E7EB",
          background: "#FAFAFA",
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>
          {title}
        </h3>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  small,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          fontSize: small ? 11 : 12,
          color: "#9CA3AF",
          flexShrink: 0,
          paddingTop: 1,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: small ? 11 : 13,
          fontWeight: 600,
          color: "#111827",
          textAlign: "right",
          fontFamily: mono ? "monospace" : "inherit",
          wordBreak: "break-all",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontSize: 13, color: "#6B7280" }}>{label}</span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: valueColor ?? "#111827",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ActionButton({
  label,
  color,
  bg,
  border,
  loading,
  onClick,
  warning,
}: {
  label: string;
  color: string;
  bg: string;
  border: string;
  loading: boolean;
  onClick: () => void;
  warning?: string;
}) {
  return (
    <div>
      <button
        onClick={onClick}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px 16px",
          background: loading ? "#F3F4F6" : bg,
          color: loading ? "#9CA3AF" : color,
          border: `1px solid ${loading ? "#E5E7EB" : border}`,
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          textAlign: "left",
          transition: "all 0.15s",
        }}
        onMouseOver={(e) => {
          if (!loading)
            (e.currentTarget as HTMLButtonElement).style.filter =
              "brightness(0.95)";
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLButtonElement).style.filter = "none";
        }}
      >
        {loading ? "⏳ Memproses..." : label}
      </button>
      {warning && (
        <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 6 }}>
          ⚠️ {warning}
        </p>
      )}
    </div>
  );
}
