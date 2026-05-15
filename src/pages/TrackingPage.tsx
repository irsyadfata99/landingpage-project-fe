import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  trackOrder,
  confirmDelivery,
  checkPaymentStatus,
  getLandingPage,
} from "@/services/api";
import type { Order, OrderStatus } from "@/types/order.types";
import type { ContactPerson } from "@/types/content.types";
import Modal from "@/components/common/Modal";
import FloatingWhatsApp from "@/components/common/FloatingWhatsApp";

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
  if (!dateStr) return null;
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
interface StatusConfig {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

const STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  PENDING: {
    label: "Menunggu Pembayaran",
    icon: "⏳",
    color: "#92400E",
    bgColor: "#FEF3C7",
    borderColor: "#FCD34D",
    description: "Silakan selesaikan pembayaran sebelum batas waktu.",
  },
  PAID: {
    label: "Pembayaran Diterima",
    icon: "✅",
    color: "#1D4ED8",
    bgColor: "#DBEAFE",
    borderColor: "#93C5FD",
    description: "Pembayaran telah dikonfirmasi. Pesanan sedang dipersiapkan.",
  },
  PROCESSING: {
    label: "Sedang Diproses",
    icon: "📦",
    color: "#5B21B6",
    bgColor: "#EDE9FE",
    borderColor: "#C4B5FD",
    description: "Pesanan sedang dikemas oleh penjual.",
  },
  SHIPPED: {
    label: "Dalam Pengiriman",
    icon: "🚚",
    color: "#C2410C",
    bgColor: "#FEF3C7",
    borderColor: "#FCD34D",
    description: "Paket sedang dalam perjalanan menuju alamat Anda.",
  },
  DELIVERED: {
    label: "Telah Sampai",
    icon: "📬",
    color: "#065F46",
    bgColor: "#D1FAE5",
    borderColor: "#6EE7B7",
    description: "Paket telah sampai. Mohon konfirmasi jika sudah diterima.",
  },
  DONE: {
    label: "Selesai",
    icon: "🎉",
    color: "#065F46",
    bgColor: "#D1FAE5",
    borderColor: "#6EE7B7",
    description: "Pesanan telah selesai. Terima kasih sudah berbelanja!",
  },
  EXPIRED: {
    label: "Kadaluarsa",
    icon: "❌",
    color: "#6B7280",
    bgColor: "#F3F4F6",
    borderColor: "#D1D5DB",
    description: "Pesanan ini kadaluarsa karena tidak dibayar dalam 24 jam.",
  },
  REFUNDED: {
    label: "Dikembalikan",
    icon: "↩️",
    color: "#991B1B",
    bgColor: "#FEE2E2",
    borderColor: "#FCA5A5",
    description: "Dana pesanan ini telah dikembalikan.",
  },
};

const TIMELINE_STEPS: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "DONE",
];

const isTerminalError = (status: OrderStatus) =>
  status === "EXPIRED" || status === "REFUNDED";

const getStepIndex = (status: OrderStatus) => TIMELINE_STEPS.indexOf(status);

// ==========================================
// TIMELINE COMPONENT
// ==========================================
function StatusTimeline({ status }: { status: OrderStatus }) {
  if (isTerminalError(status)) {
    const cfg = STATUS_CONFIG[status];
    return (
      <div
        style={{
          background: cfg.bgColor,
          border: `1px solid ${cfg.borderColor}`,
          borderRadius: "var(--radius)",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 24 }}>{cfg.icon}</span>
        <div>
          <p style={{ fontWeight: 700, color: cfg.color, fontSize: 15 }}>
            {cfg.label}
          </p>
          <p style={{ fontSize: 13, color: cfg.color, opacity: 0.85 }}>
            {cfg.description}
          </p>
        </div>
      </div>
    );
  }

  const currentIdx = getStepIndex(status);

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          left: 19,
          top: 20,
          bottom: 20,
          width: 2,
          background: "var(--border)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 19,
          top: 20,
          width: 2,
          height: `${(currentIdx / (TIMELINE_STEPS.length - 1)) * 100}%`,
          background: "var(--primary)",
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
          const cfg = STATUS_CONFIG[step];
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                paddingBottom: idx < TIMELINE_STEPS.length - 1 ? 24 : 0,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isCurrent ? 18 : 14,
                  background: isDone
                    ? "var(--primary)"
                    : isCurrent
                      ? cfg.bgColor
                      : "var(--bg-gray)",
                  border: isCurrent
                    ? `2px solid ${cfg.borderColor}`
                    : isDone
                      ? "2px solid var(--primary)"
                      : "2px solid var(--border)",
                  transition: "all 0.3s",
                  boxShadow: isCurrent ? `0 0 0 4px ${cfg.bgColor}` : "none",
                }}
              >
                {isDone ? (
                  <span
                    style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}
                  >
                    ✓
                  </span>
                ) : (
                  <span style={{ opacity: isPending ? 0.4 : 1 }}>
                    {cfg.icon}
                  </span>
                )}
              </div>

              <div style={{ paddingTop: 8 }}>
                <p
                  style={{
                    fontWeight: isCurrent ? 700 : isDone ? 600 : 500,
                    fontSize: isCurrent ? 15 : 14,
                    color: isPending ? "var(--text-light)" : "var(--text)",
                    marginBottom: 2,
                  }}
                >
                  {cfg.label}
                </p>
                {isCurrent && (
                  <p style={{ fontSize: 13, color: cfg.color }}>
                    {cfg.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// TRACKING PAGE
// ==========================================
export default function TrackingPage() {
  const { orderCode: paramCode } = useParams<{ orderCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryCode = searchParams.get("code");
  const initialCode = paramCode ?? queryCode ?? "";

  const [inputCode, setInputCode] = useState(initialCode);
  const [searchCode, setSearchCode] = useState(initialCode);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contact, setContact] = useState<ContactPerson | null>(null);

  const [confirmModal, setConfirmModal] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch contact person sekali saat mount
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const data = await getLandingPage();
        setContact(data.contact_person);
      } catch {
        // silent fail — WA button tidak tampil jika gagal
      }
    };
    void fetchContact();
  }, []);

  const fetchOrder = useCallback(async (code: string, silent = false) => {
    if (!code.trim()) return;
    if (!silent) {
      setLoading(true);
      setError(null);
      setOrder(null);
    }
    try {
      const fetched = await trackOrder(code);
      setOrder(fetched);
    } catch {
      if (!silent)
        setError("Order tidak ditemukan. Periksa kembali kode pesanan Anda.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const checkAndRefresh = useCallback(
    async (code: string) => {
      try {
        const statusData = await checkPaymentStatus(code);
        if (statusData.status !== "PENDING") {
          await fetchOrder(code, true);
        }
      } catch {
        // silent
      }
    },
    [fetchOrder],
  );

  useEffect(() => {
    if (searchCode) void fetchOrder(searchCode);
  }, [searchCode, fetchOrder]);

  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    if (order?.status === "PENDING") {
      pollingRef.current = setInterval(() => {
        void checkAndRefresh(order.order_code);
      }, 30000);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [order?.status, order?.order_code, checkAndRefresh]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code) return;
    setSearchCode(code);
    navigate(`/track/${code}`, { replace: true });
  };

  const handleConfirm = async () => {
    if (!order) return;
    setConfirming(true);
    setConfirmError(null);
    try {
      await confirmDelivery(order.order_code);
      setConfirmModal(false);
      await fetchOrder(order.order_code);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setConfirmError(
        axiosErr.response?.data?.message ?? "Gagal mengkonfirmasi pesanan",
      );
    } finally {
      setConfirming(false);
    }
  };

  // Pre-filled WA message berdasarkan order yang sedang ditampilkan
  const waMessage = order
    ? `Halo, saya ingin bertanya mengenai pesanan saya dengan kode ${order.order_code}. Mohon bantuannya.`
    : undefined;

  const cfg = order ? STATUS_CONFIG[order.status] : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-gray)" }}>
      {/* ---- Header ---- */}
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
            Lacak Pesanan
          </h1>
        </div>
      </div>

      <div
        className="container"
        style={{ padding: "32px 24px", maxWidth: 800 }}
      >
        {/* ---- Search Form ---- */}
        <form onSubmit={handleSearch} style={{ marginBottom: 32 }}>
          <div
            style={{
              background: "#fff",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
            }}
          >
            <label
              style={{
                display: "block",
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 10,
                color: "var(--text)",
              }}
            >
              Kode Pesanan
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Contoh: ORD-20250101-XXXX"
                style={{
                  flex: 1,
                  padding: "11px 14px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "monospace",
                  letterSpacing: "0.05em",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--primary)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              />
              <button
                type="submit"
                disabled={loading || !inputCode.trim()}
                style={{
                  padding: "11px 24px",
                  background: "var(--primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius)",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor:
                    loading || !inputCode.trim() ? "not-allowed" : "pointer",
                  opacity: loading || !inputCode.trim() ? 0.6 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? "⏳ Mencari..." : "🔍 Lacak"}
              </button>
            </div>
            <p
              style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}
            >
              Kode pesanan dikirimkan ke email Anda setelah checkout berhasil.
            </p>
          </div>
        </form>

        {/* ---- Loading ---- */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
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
            <p style={{ color: "var(--text-muted)" }}>Mencari pesanan...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* ---- Error ---- */}
        {error && !loading && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              borderRadius: "var(--radius)",
              padding: "16px 20px",
              color: "#DC2626",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* ---- Order Result ---- */}
        {order && !loading && cfg && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Status Banner */}
            <div
              style={{
                background: cfg.bgColor,
                border: `1px solid ${cfg.borderColor}`,
                borderRadius: "var(--radius-lg)",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28 }}>{cfg.icon}</span>
                <div>
                  <p
                    style={{ fontSize: 13, color: cfg.color, marginBottom: 2 }}
                  >
                    Status Pesanan
                  </p>
                  <p
                    style={{ fontSize: 20, fontWeight: 800, color: cfg.color }}
                  >
                    {cfg.label}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 12, color: cfg.color, marginBottom: 2 }}>
                  No. Pesanan
                </p>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: cfg.color,
                    fontFamily: "monospace",
                    letterSpacing: "0.03em",
                  }}
                >
                  {order.order_code}
                </p>
              </div>
            </div>

            {/* Main Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 300px",
                gap: 20,
                alignItems: "start",
              }}
            >
              {/* Left: Timeline + Info */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {/* Timeline */}
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "24px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      marginBottom: 20,
                      paddingBottom: 12,
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    Status Pengiriman
                  </h3>
                  <StatusTimeline status={order.status} />
                </div>

                {/* Shipping Info */}
                {(order.expedition_name || order.tracking_number) && (
                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-lg)",
                      padding: "24px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        marginBottom: 16,
                        paddingBottom: 12,
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      Info Pengiriman
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {order.expedition_name && (
                        <InfoRow
                          label="Ekspedisi"
                          value={order.expedition_name}
                        />
                      )}
                      {order.tracking_number && (
                        <div>
                          <p
                            style={{
                              fontSize: 12,
                              color: "var(--text-muted)",
                              marginBottom: 4,
                            }}
                          >
                            No. Resi
                          </p>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: "monospace",
                                fontSize: 16,
                                fontWeight: 700,
                                letterSpacing: "0.05em",
                                color: "var(--primary)",
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
                                background: "var(--primary-light)",
                                color: "var(--primary)",
                                border: "1px solid var(--primary)",
                                borderRadius: "var(--radius-sm)",
                                padding: "4px 10px",
                                fontSize: 12,
                                fontWeight: 600,
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
                          label="Tanggal Kirim"
                          value={formatDate(order.shipped_at)!}
                        />
                      )}
                      {order.delivered_at && (
                        <InfoRow
                          label="Tanggal Sampai"
                          value={formatDate(order.delivered_at)!}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "24px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      marginBottom: 16,
                      paddingBottom: 12,
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    Detail Produk
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {(order.items ?? []).map((item) => (
                      <div key={item.id}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: 12,
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <p
                              style={{
                                fontWeight: 600,
                                fontSize: 14,
                                marginBottom: 2,
                              }}
                            >
                              {item.product_name}
                            </p>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
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
                                  borderRadius: "var(--radius-full)",
                                  fontWeight: 600,
                                }}
                              >
                                {item.product_type === "DIGITAL"
                                  ? "📥 Digital"
                                  : item.product_type === "BOTH"
                                    ? "📦+📥 Fisik & Digital"
                                    : "📦 Fisik"}
                              </span>
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "var(--text-muted)",
                                }}
                              >
                                x{item.quantity}
                              </span>
                            </div>
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

                        {item.signed_download_url && (
                          <a
                            href={item.signed_download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              marginTop: 8,
                              background: "#D1FAE5",
                              color: "#065F46",
                              border: "1px solid #6EE7B7",
                              borderRadius: "var(--radius-sm)",
                              padding: "6px 12px",
                              fontSize: 13,
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            📥 Download File
                            {item.download_expires_at && (
                              <span
                                style={{
                                  fontWeight: 400,
                                  fontSize: 11,
                                  opacity: 0.8,
                                }}
                              >
                                (s/d {formatDate(item.download_expires_at)})
                              </span>
                            )}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Order Info */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {/* Ringkasan Pembayaran */}
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "var(--bg-gray)",
                      padding: "14px 20px",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <h3 style={{ fontSize: 14, fontWeight: 700 }}>
                      Ringkasan Pembayaran
                    </h3>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <InfoRow
                        label="Metode"
                        value={
                          order.payment_method === "bank_transfer"
                            ? `Transfer Bank${order.payment_bank ? ` (${order.payment_bank.toUpperCase()})` : ""}`
                            : "QRIS"
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
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                color: "var(--text-muted)",
                              }}
                            >
                              Diskon
                              {order.voucher_code && (
                                <span
                                  style={{
                                    marginLeft: 6,
                                    background: "#ECFDF5",
                                    color: "#065F46",
                                    fontSize: 11,
                                    padding: "1px 6px",
                                    borderRadius: "var(--radius-full)",
                                    fontWeight: 600,
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
                                color: "#059669",
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
                          paddingTop: 10,
                          borderTop: "1px solid var(--border)",
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: 14 }}>
                          Total
                        </span>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 16,
                            color: "var(--primary)",
                          }}
                        >
                          {formatRupiah(order.total_amount)}
                        </span>
                      </div>
                      {order.paid_at && (
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          Dibayar: {formatDate(order.paid_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Penerima */}
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      background: "var(--bg-gray)",
                      padding: "14px 20px",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <h3 style={{ fontSize: 14, fontWeight: 700 }}>
                      Info Penerima
                    </h3>
                  </div>
                  <div
                    style={{
                      padding: "16px 20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <InfoRow label="Nama" value={order.customer_name} />
                    {order.customer_address && (
                      <div>
                        <p
                          style={{
                            fontSize: 12,
                            color: "var(--text-muted)",
                            marginBottom: 2,
                          }}
                        >
                          Alamat
                        </p>
                        <p
                          style={{
                            fontSize: 13,
                            color: "var(--text)",
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
                    <InfoRow
                      label="Tgl Order"
                      value={formatDate(order.created_at)!}
                    />
                  </div>
                </div>

                {/* CTA: Konfirmasi terima */}
                {order.status === "DELIVERED" && (
                  <button
                    onClick={() => setConfirmModal(true)}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "#10B981",
                      color: "#fff",
                      border: "none",
                      borderRadius: "var(--radius)",
                      fontWeight: 700,
                      fontSize: 15,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
                    }}
                  >
                    ✅ Konfirmasi Pesanan Diterima
                  </button>
                )}

                {/* CTA: Refresh status (PENDING) */}
                {order.status === "PENDING" && (
                  <div
                    style={{
                      background: "#FEF3C7",
                      border: "1px solid #FCD34D",
                      borderRadius: "var(--radius)",
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        color: "#92400E",
                        marginBottom: 10,
                        lineHeight: 1.5,
                      }}
                    >
                      ⚠️ Selesaikan pembayaran sebelum pesanan kadaluarsa.
                    </p>
                    <button
                      onClick={() => void fetchOrder(order.order_code)}
                      style={{
                        background: "#D97706",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        padding: "8px 16px",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      🔄 Refresh Status
                    </button>
                  </div>
                )}
              </div>
            </div>

            {order.status === "PENDING" && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-light)",
                  textAlign: "center",
                }}
              >
                🔄 Status diperbarui otomatis setiap 30 detik
              </p>
            )}
          </div>
        )}
      </div>

      {/* ---- Confirm Modal ---- */}
      <Modal
        isOpen={confirmModal}
        onClose={() => {
          if (!confirming) {
            setConfirmModal(false);
            setConfirmError(null);
          }
        }}
        title="Konfirmasi Pesanan Diterima"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              background: "#F0FDF4",
              border: "1px solid #86EFAC",
              borderRadius: "var(--radius)",
              padding: "14px 16px",
            }}
          >
            <p style={{ fontSize: 14, color: "#065F46", lineHeight: 1.6 }}>
              Dengan mengkonfirmasi, Anda menyatakan bahwa pesanan{" "}
              <strong>{order?.order_code}</strong> telah diterima dengan baik
              dan transaksi dinyatakan selesai.
            </p>
          </div>

          <div
            style={{
              background: "#FEF3C7",
              border: "1px solid #FCD34D",
              borderRadius: "var(--radius)",
              padding: "12px 14px",
            }}
          >
            <p style={{ fontSize: 13, color: "#92400E" }}>
              ⚠️ Tindakan ini tidak dapat dibatalkan. Pastikan Anda sudah
              menerima semua produk yang dipesan.
            </p>
          </div>

          {confirmError && (
            <p style={{ fontSize: 13, color: "#DC2626" }}>❌ {confirmError}</p>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => {
                setConfirmModal(false);
                setConfirmError(null);
              }}
              disabled={confirming}
              style={{
                flex: 1,
                padding: "12px",
                background: "transparent",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontWeight: 600,
                fontSize: 14,
                cursor: confirming ? "not-allowed" : "pointer",
              }}
            >
              Batal
            </button>
            <button
              onClick={() => void handleConfirm()}
              disabled={confirming}
              style={{
                flex: 1,
                padding: "12px",
                background: "#10B981",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius)",
                fontWeight: 700,
                fontSize: 14,
                cursor: confirming ? "not-allowed" : "pointer",
                opacity: confirming ? 0.7 : 1,
              }}
            >
              {confirming ? "⏳ Memproses..." : "✅ Ya, Sudah Diterima"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Floating WhatsApp */}
      <FloatingWhatsApp contact={contact} customMessage={waMessage} />

      <style>{`
        @media (max-width: 768px) {
          .container > div > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ==========================================
// HELPER COMPONENT
// ==========================================
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontSize: 13, color: "var(--text-muted)", flexShrink: 0 }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text)",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}
