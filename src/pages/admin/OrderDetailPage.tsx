import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  adminGetOrderById,
  adminUpdateOrderStatus,
  adminUpdateTracking,
  adminMarkAsDelivered,
} from "@/services/api";
import type { Order, OrderStatus } from "@/types/order.types";
import Modal from "@/components/common/Modal";

// ==========================================
// HELPERS
// ==========================================
const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ==========================================
// STATUS CONFIG
// ==========================================
const STATUS_STYLE: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: "Pending", color: "#92400E", bg: "#FEF3C7" },
  PAID: { label: "Dibayar", color: "#1D4ED8", bg: "#DBEAFE" },
  PROCESSING: { label: "Diproses", color: "#5B21B6", bg: "#EDE9FE" },
  SHIPPED: { label: "Dikirim", color: "#C2410C", bg: "#FEF3C7" },
  DELIVERED: { label: "Sampai", color: "#065F46", bg: "#D1FAE5" },
  DONE: { label: "Selesai", color: "#065F46", bg: "#D1FAE5" },
  EXPIRED: { label: "Kadaluarsa", color: "#6B7280", bg: "#F3F4F6" },
  REFUNDED: { label: "Refund", color: "#991B1B", bg: "#FEE2E2" },
};

const TIMELINE_STEPS: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "DONE",
];

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_STYLE[status] ?? {
    label: status,
    color: "#6B7280",
    bg: "#F3F4F6",
  };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: 99,
        fontSize: 13,
        fontWeight: 700,
        color: cfg.color,
        background: cfg.bg,
      }}
    >
      {cfg.label}
    </span>
  );
}

// ==========================================
// SECTION CARD
// ==========================================
function SectionCard({
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
          background: "#F9FAFB",
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
          {title}
        </h3>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
        paddingBottom: 10,
        borderBottom: "1px solid #F3F4F6",
      }}
    >
      <span
        style={{ fontSize: 13, color: "#6B7280", flexShrink: 0, minWidth: 120 }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#111827",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ==========================================
// ADMIN ORDER DETAIL PAGE
// ==========================================
export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update status modal
  const [statusModal, setStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // Tracking modal
  const [trackingModal, setTrackingModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingExpedition, setTrackingExpedition] = useState("");
  const [updatingTracking, setUpdatingTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Mark delivered modal
  const [deliveredModal, setDeliveredModal] = useState(false);
  const [updatingDelivered, setUpdatingDelivered] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await adminGetOrderById(id);
      setOrder(data);
    } catch {
      setError("Gagal memuat detail pesanan");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  // ---- Update Status ----
  const handleUpdateStatus = async () => {
    if (!order) return;
    const nextStatusMap: Record<string, string> = {
      PAID: "PROCESSING",
    };
    const next = nextStatusMap[order.status];
    if (!next) return;

    setUpdatingStatus(true);
    setStatusError(null);
    try {
      const updated = await adminUpdateOrderStatus(order.id, next);
      setOrder(updated);
      setStatusModal(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setStatusError(axiosErr.response?.data?.message ?? "Gagal update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ---- Update Tracking ----
  const handleUpdateTracking = async () => {
    if (!order || !trackingNumber.trim()) return;
    setUpdatingTracking(true);
    setTrackingError(null);
    try {
      const updated = await adminUpdateTracking(
        order.id,
        trackingNumber.trim(),
        trackingExpedition.trim() || undefined,
      );
      setOrder(updated);
      setTrackingModal(false);
      setTrackingNumber("");
      setTrackingExpedition("");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setTrackingError(
        axiosErr.response?.data?.message ?? "Gagal input nomor resi",
      );
    } finally {
      setUpdatingTracking(false);
    }
  };

  // ---- Mark as Delivered ----
  const handleMarkDelivered = async () => {
    if (!order) return;
    setUpdatingDelivered(true);
    try {
      const updated = await adminMarkAsDelivered(order.id);
      setOrder(updated);
      setDeliveredModal(false);
    } catch {
      alert("Gagal update status delivered");
    } finally {
      setUpdatingDelivered(false);
    }
  };

  // ==========================================
  // RENDER
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
              width: 32,
              height: 32,
              border: "3px solid #E5E7EB",
              borderTopColor: "#3B82F6",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ color: "#9CA3AF", fontSize: 14 }}>
            Memuat detail pesanan...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <p style={{ color: "#EF4444", fontSize: 15, marginBottom: 16 }}>
          ❌ {error ?? "Order tidak ditemukan"}
        </p>
        <button
          onClick={() => navigate("/admin/orders")}
          style={{
            padding: "9px 18px",
            background: "#3B82F6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ← Kembali ke Pesanan
        </button>
      </div>
    );
  }

  const isTerminal = ["DONE", "EXPIRED", "REFUNDED"].includes(order.status);
  const currentIdx = TIMELINE_STEPS.indexOf(order.status as OrderStatus);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ---- Back + Header ---- */}
      <div>
        <button
          onClick={() => navigate("/admin/orders")}
          style={{
            background: "none",
            border: "none",
            color: "#6B7280",
            fontSize: 14,
            cursor: "pointer",
            padding: 0,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#111827",
                  fontFamily: "monospace",
                }}
              >
                {order.order_code}
              </h2>
              <StatusBadge status={order.status} />
            </div>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>
              {formatDate(order.created_at)}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {order.status === "PAID" && (
              <button
                onClick={() => setStatusModal(true)}
                style={{
                  padding: "9px 18px",
                  background: "#8B5CF6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                📦 Proses Pesanan
              </button>
            )}
            {order.status === "PROCESSING" && (
              <button
                onClick={() => setTrackingModal(true)}
                style={{
                  padding: "9px 18px",
                  background: "#F59E0B",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                🚚 Input Nomor Resi
              </button>
            )}
            {order.status === "SHIPPED" && (
              <button
                onClick={() => setDeliveredModal(true)}
                style={{
                  padding: "9px 18px",
                  background: "#10B981",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                📬 Tandai Sudah Sampai
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---- Timeline ---- */}
      <SectionCard title="Status Pesanan">
        {["EXPIRED", "REFUNDED"].includes(order.status) ? (
          <div
            style={{
              background: STATUS_STYLE[order.status]?.bg,
              border: `1px solid`,
              borderColor: order.status === "EXPIRED" ? "#D1D5DB" : "#FCA5A5",
              borderRadius: 8,
              padding: "14px 16px",
              fontSize: 14,
              color: STATUS_STYLE[order.status]?.color,
              fontWeight: 600,
            }}
          >
            {order.status === "EXPIRED"
              ? "❌ Pesanan ini kadaluarsa karena tidak dibayar dalam 24 jam"
              : "↩️ Pesanan ini telah di-refund"}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: 0,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {TIMELINE_STEPS.map((step, idx) => {
              const cfg = STATUS_STYLE[step];
              const isDone = idx < currentIdx;
              const isCurrent = idx === currentIdx;
              const isPending = idx > currentIdx;
              const isLast = idx === TIMELINE_STEPS.length - 1;

              return (
                <div
                  key={step}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: 80,
                    position: "relative",
                  }}
                >
                  {/* Connector */}
                  {!isLast && (
                    <div
                      style={{
                        position: "absolute",
                        top: 16,
                        left: "50%",
                        right: "-50%",
                        height: 2,
                        background: isDone ? "#3B82F6" : "#E5E7EB",
                        zIndex: 0,
                      }}
                    />
                  )}

                  {/* Dot */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: isDone
                        ? "#3B82F6"
                        : isCurrent
                          ? cfg.bg
                          : "#F3F4F6",
                      border: isCurrent
                        ? `2px solid ${cfg.color}`
                        : isDone
                          ? "2px solid #3B82F6"
                          : "2px solid #E5E7EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      zIndex: 1,
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    {isDone ? (
                      <span
                        style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}
                      >
                        ✓
                      </span>
                    ) : (
                      <span
                        style={{ opacity: isPending ? 0.4 : 1, fontSize: 14 }}
                      >
                        {isCurrent ? "●" : "○"}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: isCurrent ? 700 : 500,
                      color: isPending
                        ? "#9CA3AF"
                        : isCurrent
                          ? cfg.color
                          : "#374151",
                      marginTop: 6,
                      textAlign: "center",
                      lineHeight: 1.3,
                    }}
                  >
                    {cfg.label}
                  </p>

                  {/* Timestamp */}
                  {isCurrent && (
                    <p
                      style={{
                        fontSize: 10,
                        color: "#9CA3AF",
                        textAlign: "center",
                        marginTop: 2,
                      }}
                    >
                      {order.status === "PAID" && order.paid_at
                        ? formatDate(order.paid_at)
                        : order.status === "SHIPPED" && order.shipped_at
                          ? formatDate(order.shipped_at)
                          : order.status === "DELIVERED" && order.delivered_at
                            ? formatDate(order.delivered_at)
                            : order.status === "DONE" && order.confirmed_at
                              ? formatDate(order.confirmed_at)
                              : "Sekarang"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ---- Main Grid ---- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Items */}
          <SectionCard
            title={`Detail Produk (${order.items?.length ?? 0} item)`}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                    paddingBottom: 14,
                    borderBottom: "1px solid #F3F4F6",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p
                      style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}
                    >
                      {item.product_name}
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                        {item.product_type}
                      </span>
                      <span style={{ fontSize: 13, color: "#6B7280" }}>
                        {formatRupiah(item.price)} × {item.quantity}
                      </span>
                    </div>
                    {item.signed_download_url && (
                      <a
                        href={item.signed_download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          marginTop: 6,
                          fontSize: 12,
                          color: "#059669",
                          fontWeight: 600,
                          textDecoration: "none",
                          background: "#D1FAE5",
                          padding: "3px 10px",
                          borderRadius: 6,
                        }}
                      >
                        📥 Download Link
                      </a>
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
            </div>
          </SectionCard>

          {/* Shipping info */}
          {(order.expedition_name || order.tracking_number) && (
            <SectionCard title="Info Pengiriman">
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {order.expedition_name && (
                  <InfoRow label="Ekspedisi" value={order.expedition_name} />
                )}
                {order.tracking_number && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                      paddingBottom: 10,
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    <span
                      style={{ fontSize: 13, color: "#6B7280", minWidth: 120 }}
                    >
                      No. Resi
                    </span>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#3B82F6",
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
                          background: "#EFF6FF",
                          color: "#3B82F6",
                          border: "1px solid #BFDBFE",
                          borderRadius: 6,
                          padding: "2px 8px",
                          cursor: "pointer",
                          fontWeight: 600,
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
                    value={formatDate(order.shipped_at)}
                  />
                )}
                {order.delivered_at && (
                  <InfoRow
                    label="Sampai"
                    value={formatDate(order.delivered_at)}
                  />
                )}
                {order.confirmed_at && (
                  <InfoRow
                    label="Dikonfirmasi"
                    value={formatDate(order.confirmed_at)}
                  />
                )}
              </div>
            </SectionCard>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Pembayaran */}
          <SectionCard title="Ringkasan Pembayaran">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <InfoRow
                label="Metode"
                value={
                  order.payment_method === "qris"
                    ? "QRIS"
                    : `VA ${order.payment_bank?.toUpperCase() ?? "-"}`
                }
              />
              {order.discount_amount > 0 && (
                <>
                  <InfoRow
                    label="Subtotal"
                    value={formatRupiah(
                      order.total_amount + order.discount_amount,
                    )}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      paddingBottom: 10,
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    <span
                      style={{ fontSize: 13, color: "#6B7280", minWidth: 120 }}
                    >
                      Diskon
                      {order.voucher_code && (
                        <span
                          style={{
                            marginLeft: 6,
                            background: "#ECFDF5",
                            color: "#065F46",
                            fontSize: 10,
                            padding: "1px 6px",
                            borderRadius: 99,
                            fontWeight: 700,
                          }}
                        >
                          {order.voucher_code}
                        </span>
                      )}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#10B981",
                      }}
                    >
                      -{formatRupiah(order.discount_amount)}
                    </span>
                  </div>
                </>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 4,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14 }}>Total</span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    color: "#3B82F6",
                  }}
                >
                  {formatRupiah(order.total_amount)}
                </span>
              </div>
              {order.paid_at && (
                <p style={{ fontSize: 12, color: "#9CA3AF", paddingTop: 4 }}>
                  Dibayar: {formatDate(order.paid_at)}
                </p>
              )}
            </div>
          </SectionCard>

          {/* Customer */}
          <SectionCard title="Info Customer">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <InfoRow label="Nama" value={order.customer_name} />
              <InfoRow label="Email" value={order.customer_email} />
              <InfoRow label="No. HP" value={order.customer_phone} />
              {order.customer_address && (
                <div
                  style={{
                    paddingBottom: 10,
                    borderBottom: "1px solid #F3F4F6",
                  }}
                >
                  <p
                    style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}
                  >
                    Alamat
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#111827",
                      lineHeight: 1.5,
                    }}
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
          </SectionCard>

          {/* Status hint jika terminal */}
          {isTerminal && (
            <div
              style={{
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                padding: "12px 14px",
                fontSize: 13,
                color: "#6B7280",
                textAlign: "center",
              }}
            >
              Pesanan ini sudah dalam status final dan tidak dapat diubah.
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          MODALS
      ========================================== */}

      {/* Update status → PROCESSING */}
      <Modal
        isOpen={statusModal}
        onClose={() => {
          if (!updatingStatus) {
            setStatusModal(false);
            setStatusError(null);
          }
        }}
        title="Proses Pesanan"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: "#EDE9FE",
              border: "1px solid #C4B5FD",
              borderRadius: 8,
              padding: "12px 14px",
              fontSize: 14,
              color: "#5B21B6",
            }}
          >
            Ubah status pesanan <strong>{order.order_code}</strong> dari{" "}
            <strong>Dibayar</strong> ke <strong>Diproses</strong>?
          </div>
          <p style={{ fontSize: 13, color: "#6B7280" }}>
            Pastikan Anda sudah siap mengemas produk sebelum mengubah status
            ini.
          </p>
          {statusError && (
            <p style={{ fontSize: 13, color: "#DC2626" }}>❌ {statusError}</p>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                setStatusModal(false);
                setStatusError(null);
              }}
              disabled={updatingStatus}
              style={{
                flex: 1,
                padding: "11px",
                background: "transparent",
                color: "#6B7280",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Batal
            </button>
            <button
              onClick={() => void handleUpdateStatus()}
              disabled={updatingStatus}
              style={{
                flex: 1,
                padding: "11px",
                background: "#8B5CF6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: updatingStatus ? "not-allowed" : "pointer",
                opacity: updatingStatus ? 0.7 : 1,
              }}
            >
              {updatingStatus ? "⏳ Memproses..." : "✅ Ya, Proses"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Input tracking */}
      <Modal
        isOpen={trackingModal}
        onClose={() => {
          if (!updatingTracking) {
            setTrackingModal(false);
            setTrackingError(null);
          }
        }}
        title="Input Nomor Resi"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                fontFamily: "monospace",
                letterSpacing: "0.03em",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
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
              Nama Ekspedisi (opsional)
            </label>
            <input
              type="text"
              value={trackingExpedition}
              onChange={(e) => setTrackingExpedition(e.target.value)}
              placeholder={order.expedition_name ?? "JNE, J&T, SiCepat, ..."}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </div>
          <div
            style={{
              background: "#FEF3C7",
              border: "1px solid #FCD34D",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 13,
              color: "#92400E",
            }}
          >
            ⚠️ Setelah input resi, status otomatis berubah ke{" "}
            <strong>Dikirim</strong> dan email notifikasi dikirim ke customer.
          </div>
          {trackingError && (
            <p style={{ fontSize: 13, color: "#DC2626" }}>❌ {trackingError}</p>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                setTrackingModal(false);
                setTrackingError(null);
              }}
              disabled={updatingTracking}
              style={{
                flex: 1,
                padding: "11px",
                background: "transparent",
                color: "#6B7280",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Batal
            </button>
            <button
              onClick={() => void handleUpdateTracking()}
              disabled={updatingTracking || !trackingNumber.trim()}
              style={{
                flex: 1,
                padding: "11px",
                background: "#F59E0B",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor:
                  updatingTracking || !trackingNumber.trim()
                    ? "not-allowed"
                    : "pointer",
                opacity: updatingTracking || !trackingNumber.trim() ? 0.7 : 1,
              }}
            >
              {updatingTracking ? "⏳ Menyimpan..." : "🚚 Simpan & Kirim Email"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Mark as delivered */}
      <Modal
        isOpen={deliveredModal}
        onClose={() => {
          if (!updatingDelivered) setDeliveredModal(false);
        }}
        title="Konfirmasi Sudah Sampai"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: "#D1FAE5",
              border: "1px solid #6EE7B7",
              borderRadius: 8,
              padding: "12px 14px",
              fontSize: 14,
              color: "#065F46",
            }}
          >
            Tandai pesanan <strong>{order.order_code}</strong> sebagai{" "}
            <strong>Telah Sampai</strong>?
          </div>
          <p style={{ fontSize: 13, color: "#6B7280" }}>
            Pastikan Anda sudah mendapat konfirmasi dari ekspedisi bahwa paket
            sudah diterima customer.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setDeliveredModal(false)}
              disabled={updatingDelivered}
              style={{
                flex: 1,
                padding: "11px",
                background: "transparent",
                color: "#6B7280",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Batal
            </button>
            <button
              onClick={() => void handleMarkDelivered()}
              disabled={updatingDelivered}
              style={{
                flex: 1,
                padding: "11px",
                background: "#10B981",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: updatingDelivered ? "not-allowed" : "pointer",
                opacity: updatingDelivered ? 0.7 : 1,
              }}
            >
              {updatingDelivered ? "⏳ Memproses..." : "📬 Ya, Sudah Sampai"}
            </button>
          </div>
        </div>
      </Modal>

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
