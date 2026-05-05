import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/services/axios.config";

// ==========================================
// TYPES
// ==========================================
interface AnalyticsSummary {
  overview: {
    total_orders: number;
    total_revenue: number;
    revenue_this_month: number;
    orders_this_month: number;
  };
  orders_by_status: { status: string; count: number }[];
  top_products: {
    id: string;
    name: string;
    product_type: string;
    price: number;
    total_sold: number;
    total_revenue: number;
  }[];
  conversion: {
    paid_count: number;
    expired_count: number;
    conversion_rate: number;
  };
}

// ==========================================
// HELPERS
// ==========================================
const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const STATUS_LABEL: Record<
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

// ==========================================
// STAT CARD
// ==========================================
function StatCard({
  icon,
  label,
  value,
  sub,
  color = "#3B82F6",
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: "20px 24px",
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>
          {label}
        </p>
        <p
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#111827",
            lineHeight: 1,
          }}
        >
          {value}
        </p>
        {sub && (
          <p style={{ fontSize: 12, color: "#10B981", marginTop: 4 }}>{sub}</p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================
export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get<{
          success: boolean;
          data: AnalyticsSummary;
        }>("/admin/analytics/summary");
        setData(res.data.data);
      } catch {
        setError("Gagal memuat data analytics");
      } finally {
        setLoading(false);
      }
    };
    void fetch();
  }, []);

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
          <p style={{ color: "#6B7280", fontSize: 14 }}>Memuat dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        style={{
          background: "#FEF2F2",
          border: "1px solid #FCA5A5",
          borderRadius: 10,
          padding: "16px 20px",
          color: "#DC2626",
          fontSize: 14,
        }}
      >
        ❌ {error ?? "Data tidak tersedia"}
      </div>
    );
  }

  const { overview, orders_by_status, top_products, conversion } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* ---- Overview Cards ---- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <StatCard
          icon="💰"
          label="Total Pendapatan"
          value={formatRupiah(overview.total_revenue)}
          color="#10B981"
        />
        <StatCard
          icon="📅"
          label="Pendapatan Bulan Ini"
          value={formatRupiah(overview.revenue_this_month)}
          color="#3B82F6"
        />
        <StatCard
          icon="🛒"
          label="Total Pesanan"
          value={overview.total_orders.toLocaleString("id-ID")}
          color="#8B5CF6"
        />
        <StatCard
          icon="📈"
          label="Pesanan Bulan Ini"
          value={overview.orders_this_month.toLocaleString("id-ID")}
          color="#F59E0B"
        />
      </div>

      {/* ---- Row 2: Status + Conversion ---- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 20,
          alignItems: "start",
        }}
      >
        {/* Orders by status */}
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
              padding: "16px 20px",
              borderBottom: "1px solid #E5E7EB",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
              Pesanan per Status
            </h3>
            <Link
              to="/admin/orders"
              style={{ fontSize: 13, color: "#3B82F6", fontWeight: 600 }}
            >
              Lihat Semua →
            </Link>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {orders_by_status.map((s) => {
                const cfg = STATUS_LABEL[s.status] ?? {
                  label: s.status,
                  color: "#6B7280",
                  bg: "#F3F4F6",
                };
                return (
                  <div
                    key={s.status}
                    style={{
                      background: cfg.bg,
                      borderRadius: 8,
                      padding: "12px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: cfg.color,
                      }}
                    >
                      {cfg.label}
                    </span>
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: cfg.color,
                      }}
                    >
                      {s.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Conversion rate */}
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
              padding: "16px 20px",
              borderBottom: "1px solid #E5E7EB",
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
              Konversi Pembayaran
            </h3>
          </div>
          <div
            style={{
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Circle */}
            <div style={{ position: "relative", width: 100, height: 100 }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#F3F4F6"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="10"
                  strokeDasharray={`${(conversion.conversion_rate / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#111827",
                    lineHeight: 1,
                  }}
                >
                  {conversion.conversion_rate}%
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "#6B7280" }}>Berhasil bayar</span>
                <span style={{ fontWeight: 700, color: "#10B981" }}>
                  {conversion.paid_count}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "#6B7280" }}>Kadaluarsa</span>
                <span style={{ fontWeight: 700, color: "#EF4444" }}>
                  {conversion.expired_count}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Top Products ---- */}
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
            padding: "16px 20px",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
            Produk Terlaris
          </h3>
          <Link
            to="/admin/products"
            style={{ fontSize: 13, color: "#3B82F6", fontWeight: 600 }}
          >
            Kelola Produk →
          </Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["#", "Produk", "Tipe", "Terjual", "Pendapatan"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 20px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#6B7280",
                      textAlign:
                        h === "#" || h === "Terjual" || h === "Pendapatan"
                          ? "center"
                          : "left",
                      whiteSpace: "nowrap",
                      borderBottom: "1px solid #E5E7EB",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top_products.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td
                    style={{
                      padding: "12px 20px",
                      fontSize: 13,
                      color: "#9CA3AF",
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    {i + 1}
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {p.name}
                    </p>
                    <p style={{ fontSize: 12, color: "#9CA3AF" }}>
                      {formatRupiah(p.price)}
                    </p>
                  </td>
                  <td style={{ padding: "12px 20px" }}>
                    <span
                      style={{
                        fontSize: 11,
                        background:
                          p.product_type === "DIGITAL" ? "#EDE9FE" : "#DBEAFE",
                        color:
                          p.product_type === "DIGITAL" ? "#7C3AED" : "#1D4ED8",
                        padding: "2px 8px",
                        borderRadius: 99,
                        fontWeight: 600,
                      }}
                    >
                      {p.product_type}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 20px",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#111827",
                      textAlign: "center",
                    }}
                  >
                    {p.total_sold}
                  </td>
                  <td
                    style={{
                      padding: "12px 20px",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#10B981",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatRupiah(p.total_revenue)}
                  </td>
                </tr>
              ))}
              {top_products.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "32px",
                      textAlign: "center",
                      color: "#9CA3AF",
                      fontSize: 14,
                    }}
                  >
                    Belum ada data produk
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---- Quick Links ---- */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {[
          { to: "/admin/orders", icon: "🛒", label: "Kelola Pesanan" },
          { to: "/admin/products", icon: "📦", label: "Kelola Produk" },
          { to: "/admin/vouchers", icon: "🏷️", label: "Buat Voucher" },
          { to: "/admin/reviews", icon: "⭐", label: "Moderasi Review" },
          { to: "/admin/withdrawal", icon: "💰", label: "Penarikan Dana" },
          { to: "/admin/settings", icon: "⚙️", label: "Pengaturan" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              textDecoration: "none",
              transition: "box-shadow 0.15s, border-color 0.15s",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 4px 12px rgba(0,0,0,0.08)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "#3B82F6";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "#E5E7EB";
            }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 280px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
