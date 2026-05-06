import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  adminGetOrders,
  adminExportOrders,
  type AdminOrderFilter,
} from "@/services/api";
import type { Order, OrderStatus } from "@/types/order.types";

// ==========================================
// HELPERS
// ==========================================
const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ==========================================
// STATUS CONFIG
// ==========================================
const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua Status" },
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Dibayar" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "SHIPPED", label: "Dikirim" },
  { value: "DELIVERED", label: "Sampai" },
  { value: "DONE", label: "Selesai" },
  { value: "EXPIRED", label: "Kadaluarsa" },
  { value: "REFUNDED", label: "Refund" },
];

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
        padding: "3px 10px",
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 700,
        color: cfg.color,
        background: cfg.bg,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}

// ==========================================
// ADMIN ORDERS PAGE
// ==========================================
const LIMIT = 20;

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter dari URL
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") ?? "",
  );
  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: LIMIT,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // ---- Fetch ----
  const fetchOrders = useCallback(async (filter: AdminOrderFilter) => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminGetOrders({ ...filter, limit: LIMIT });
      setOrders(result.data);
      setPagination(result.pagination);
    } catch {
      setError("Gagal memuat data pesanan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const filter: AdminOrderFilter = { page, limit: LIMIT };
    if (status) filter.status = status;
    if (search) filter.search = search;

    // Sync ke URL
    const params: Record<string, string> = { page: String(page) };
    if (status) params.status = status;
    if (search) params.search = search;
    setSearchParams(params, { replace: true });

    void fetchOrders(filter);
  }, [status, search, page, fetchOrders, setSearchParams]);

  // ---- Search submit ----
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  // ---- Export ----
  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await adminExportOrders({
        status: status || undefined,
        search: search || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal export data");
    } finally {
      setExporting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: "9px 12px",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    background: "#fff",
    color: "#111827",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ---- Header ---- */}
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
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>
            Pesanan
          </h2>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>
            {pagination.total} total pesanan
          </p>
        </div>
        <button
          onClick={() => void handleExport()}
          disabled={exporting}
          style={{
            padding: "9px 18px",
            background: "#10B981",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: exporting ? "not-allowed" : "pointer",
            opacity: exporting ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {exporting ? "⏳ Mengexport..." : "📥 Export Excel"}
        </button>
      </div>

      {/* ---- Filter Bar ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: "16px 20px",
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        {/* Search */}
        <form
          onSubmit={handleSearch}
          style={{ display: "flex", gap: 8, flex: 1, minWidth: 220 }}
        >
          <input
            type="text"
            placeholder="Cari order code, nama, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
          <button
            type="submit"
            style={{
              padding: "9px 16px",
              background: "#3B82F6",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            🔍 Cari
          </button>
        </form>

        {/* Status filter */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          style={{ ...inputStyle, minWidth: 160 }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Reset */}
        {(status || search) && (
          <button
            onClick={() => {
              setStatus("");
              setSearch("");
              setSearchInput("");
              setPage(1);
            }}
            style={{
              padding: "9px 14px",
              background: "transparent",
              color: "#6B7280",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            ✕ Reset
          </button>
        )}
      </div>

      {/* ---- Table ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
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
            <p style={{ color: "#9CA3AF", fontSize: 14 }}>Memuat pesanan...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : error ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <p style={{ color: "#EF4444", fontSize: 14 }}>❌ {error}</p>
            <button
              onClick={() => void fetchOrders({ page, status, search })}
              style={{
                marginTop: 12,
                padding: "8px 16px",
                background: "#3B82F6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Coba Lagi
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              padding: "60px",
              textAlign: "center",
              color: "#9CA3AF",
              fontSize: 14,
            }}
          >
            <p style={{ fontSize: 36, marginBottom: 12 }}>📭</p>
            <p>Tidak ada pesanan ditemukan</p>
            {(status || search) && (
              <p style={{ marginTop: 4, fontSize: 13 }}>
                Coba ubah filter pencarian
              </p>
            )}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#F9FAFB",
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  {[
                    "No. Order",
                    "Customer",
                    "Produk",
                    "Total",
                    "Pembayaran",
                    "Status",
                    "Tanggal",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6B7280",
                        textAlign: "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    style={{
                      borderBottom: "1px solid #F3F4F6",
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                    onMouseOver={(e) =>
                      ((
                        e.currentTarget as HTMLTableRowElement
                      ).style.background = "#F9FAFB")
                    }
                    onMouseOut={(e) =>
                      ((
                        e.currentTarget as HTMLTableRowElement
                      ).style.background = "transparent")
                    }
                  >
                    {/* Order code */}
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#3B82F6",
                        }}
                      >
                        {order.order_code}
                      </span>
                    </td>

                    {/* Customer */}
                    <td style={{ padding: "13px 16px" }}>
                      <p
                        style={{
                          fontWeight: 600,
                          color: "#111827",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {order.customer_name}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#9CA3AF",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {order.customer_email}
                      </p>
                    </td>

                    {/* Produk */}
                    <td style={{ padding: "13px 16px" }}>
                      <p style={{ fontSize: 13, color: "#6B7280" }}>
                        {order.items?.length ?? 0} item
                      </p>
                    </td>

                    {/* Total */}
                    <td
                      style={{
                        padding: "13px 16px",
                        fontWeight: 700,
                        color: "#111827",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatRupiah(order.total_amount)}
                      {order.discount_amount > 0 && (
                        <p
                          style={{
                            fontSize: 11,
                            color: "#10B981",
                            fontWeight: 500,
                          }}
                        >
                          Hemat {formatRupiah(order.discount_amount)}
                        </p>
                      )}
                    </td>

                    {/* Pembayaran */}
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 13,
                        color: "#6B7280",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.payment_method === "qris"
                        ? "QRIS"
                        : `VA ${order.payment_bank?.toUpperCase() ?? "-"}`}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "13px 16px" }}>
                      <StatusBadge status={order.status} />
                    </td>

                    {/* Tanggal */}
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 12,
                        color: "#9CA3AF",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(order.created_at)}
                    </td>

                    {/* Action */}
                    <td style={{ padding: "13px 16px" }}>
                      <span
                        style={{
                          fontSize: 13,
                          color: "#3B82F6",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Detail →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---- Pagination ---- */}
      {pagination.total_pages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ fontSize: 13, color: "#6B7280" }}>
            Menampilkan {Math.min((page - 1) * LIMIT + 1, pagination.total)}–
            {Math.min(page * LIMIT, pagination.total)} dari {pagination.total}{" "}
            pesanan
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: "7px 14px",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                background: "#fff",
                fontSize: 13,
                cursor: page === 1 ? "not-allowed" : "pointer",
                opacity: page === 1 ? 0.5 : 1,
                fontWeight: 500,
              }}
            >
              ← Prev
            </button>

            {/* Page numbers */}
            {Array.from(
              { length: Math.min(5, pagination.total_pages) },
              (_, i) => {
                let p: number;
                if (pagination.total_pages <= 5) {
                  p = i + 1;
                } else if (page <= 3) {
                  p = i + 1;
                } else if (page >= pagination.total_pages - 2) {
                  p = pagination.total_pages - 4 + i;
                } else {
                  p = page - 2 + i;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: "7px 12px",
                      border: `1px solid ${p === page ? "#3B82F6" : "#E5E7EB"}`,
                      borderRadius: 8,
                      background: p === page ? "#3B82F6" : "#fff",
                      color: p === page ? "#fff" : "#374151",
                      fontSize: 13,
                      cursor: "pointer",
                      fontWeight: p === page ? 700 : 500,
                      minWidth: 36,
                    }}
                  >
                    {p}
                  </button>
                );
              },
            )}

            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.total_pages, p + 1))
              }
              disabled={page === pagination.total_pages}
              style={{
                padding: "7px 14px",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                background: "#fff",
                fontSize: 13,
                cursor:
                  page === pagination.total_pages ? "not-allowed" : "pointer",
                opacity: page === pagination.total_pages ? 0.5 : 1,
                fontWeight: 500,
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
