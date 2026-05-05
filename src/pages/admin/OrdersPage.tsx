import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
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

interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: OrderStatus;
  total_amount: number;
  discount_amount: number;
  voucher_code: string | null;
  payment_method: string | null;
  payment_bank: string | null;
  expedition_name: string | null;
  tracking_number: string | null;
  created_at: string;
  paid_at: string | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ==========================================
// CONSTANTS
// ==========================================
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  PENDING: {
    label: "Pending",
    color: "#92400E",
    bg: "#FEF3C7",
    border: "#FCD34D",
  },
  PAID: {
    label: "Dibayar",
    color: "#1D4ED8",
    bg: "#DBEAFE",
    border: "#93C5FD",
  },
  PROCESSING: {
    label: "Diproses",
    color: "#5B21B6",
    bg: "#EDE9FE",
    border: "#C4B5FD",
  },
  SHIPPED: {
    label: "Dikirim",
    color: "#C2410C",
    bg: "#FEF3C7",
    border: "#FDE68A",
  },
  DELIVERED: {
    label: "Sampai",
    color: "#065F46",
    bg: "#D1FAE5",
    border: "#6EE7B7",
  },
  DONE: {
    label: "Selesai",
    color: "#065F46",
    bg: "#D1FAE5",
    border: "#6EE7B7",
  },
  EXPIRED: {
    label: "Kadaluarsa",
    color: "#6B7280",
    bg: "#F3F4F6",
    border: "#D1D5DB",
  },
  REFUNDED: {
    label: "Refund",
    color: "#991B1B",
    bg: "#FEE2E2",
    border: "#FCA5A5",
  },
};

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "DONE",
  "EXPIRED",
  "REFUNDED",
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

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatDateTime = (s: string) =>
  new Date(s).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ==========================================
// STATUS BADGE
// ==========================================
function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
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
        border: `1px solid ${cfg.border}`,
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
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  // Export
  const [exporting, setExporting] = useState(false);

  // ---- Fetch ----
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (startDate) params.set("start_date", startDate);
      if (endDate) params.set("end_date", endDate);
      params.set("page", String(page));
      params.set("limit", "20");

      const res = await api.get<{
        success: boolean;
        data: Order[];
        pagination: Pagination;
      }>(`/admin/orders?${params.toString()}`);

      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setError("Gagal memuat data pesanan");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, startDate, endDate, page]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  // ---- Search handler ----
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSearchInput("");
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasActiveFilter = search || statusFilter || startDate || endDate;

  // ---- Export ----
  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (startDate) params.set("start_date", startDate);
      if (endDate) params.set("end_date", endDate);

      const res = await api.get(`/admin/orders/export?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data as BlobPart]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengekspor data");
    } finally {
      setExporting(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
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
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>
            Manajemen Pesanan
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
            Total {pagination.total} pesanan
          </p>
        </div>
        <button
          onClick={() => void handleExport()}
          disabled={exporting}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 18px",
            background: exporting ? "#E5E7EB" : "#10B981",
            color: exporting ? "#9CA3AF" : "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            cursor: exporting ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {exporting ? "⏳ Mengekspor..." : "📥 Export Excel"}
        </button>
      </div>

      {/* ---- Filters ---- */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Search */}
        <form
          onSubmit={handleSearch}
          style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
        >
          <input
            type="text"
            placeholder="Cari kode order, nama, atau email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              flex: 1,
              minWidth: 200,
              padding: "9px 14px",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
          <button
            type="submit"
            style={{
              padding: "9px 20px",
              background: "#3B82F6",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            🔍 Cari
          </button>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleClearFilters}
              style={{
                padding: "9px 16px",
                background: "transparent",
                color: "#6B7280",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              ✕ Reset
            </button>
          )}
        </form>

        {/* Status + Date filters */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as OrderStatus | "");
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              fontSize: 13,
              outline: "none",
              background: "#fff",
              color: "#374151",
              cursor: "pointer",
            }}
          >
            <option value="">Semua Status</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>

          {/* Date range */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              fontSize: 13,
              outline: "none",
              color: "#374151",
            }}
          />
          <span
            style={{
              display: "flex",
              alignItems: "center",
              color: "#9CA3AF",
              fontSize: 13,
            }}
          >
            s/d
          </span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              fontSize: 13,
              outline: "none",
              color: "#374151",
            }}
          />
        </div>

        {/* Active filter chips */}
        {hasActiveFilter && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {search && (
              <FilterChip
                label={`Cari: "${search}"`}
                onRemove={() => {
                  setSearch("");
                  setSearchInput("");
                  setPage(1);
                }}
              />
            )}
            {statusFilter && (
              <FilterChip
                label={`Status: ${STATUS_CONFIG[statusFilter].label}`}
                onRemove={() => {
                  setStatusFilter("");
                  setPage(1);
                }}
              />
            )}
            {startDate && (
              <FilterChip
                label={`Dari: ${formatDate(startDate)}`}
                onRemove={() => {
                  setStartDate("");
                  setPage(1);
                }}
              />
            )}
            {endDate && (
              <FilterChip
                label={`Sampai: ${formatDate(endDate)}`}
                onRemove={() => {
                  setEndDate("");
                  setPage(1);
                }}
              />
            )}
          </div>
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
          <LoadingRows />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void fetchOrders()} />
        ) : orders.length === 0 ? (
          <EmptyState hasFilter={!!hasActiveFilter} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                    "Produk/Pembayaran",
                    "Total",
                    "Status",
                    "Tanggal",
                    "Aksi",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 16px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#6B7280",
                        textAlign: "left",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    style={{
                      borderBottom:
                        idx < orders.length - 1 ? "1px solid #F3F4F6" : "none",
                      transition: "background 0.1s",
                    }}
                    onMouseOver={(e) =>
                      ((
                        e.currentTarget as HTMLTableRowElement
                      ).style.background = "#FAFAFA")
                    }
                    onMouseOut={(e) =>
                      ((
                        e.currentTarget as HTMLTableRowElement
                      ).style.background = "transparent")
                    }
                  >
                    {/* No. Order */}
                    <td style={{ padding: "12px 16px" }}>
                      <p
                        style={{
                          fontFamily: "monospace",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#1D4ED8",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {order.order_code}
                      </p>
                    </td>

                    {/* Customer */}
                    <td style={{ padding: "12px 16px" }}>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#111827",
                          marginBottom: 2,
                        }}
                      >
                        {order.customer_name}
                      </p>
                      <p style={{ fontSize: 12, color: "#9CA3AF" }}>
                        {order.customer_email}
                      </p>
                    </td>

                    {/* Pembayaran */}
                    <td style={{ padding: "12px 16px" }}>
                      <p style={{ fontSize: 13, color: "#374151" }}>
                        {order.payment_method === "bank_transfer"
                          ? `🏦 ${order.payment_bank?.toUpperCase() ?? "Bank"}`
                          : "📱 QRIS"}
                      </p>
                      {order.expedition_name && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "#9CA3AF",
                            marginTop: 2,
                          }}
                        >
                          🚚 {order.expedition_name}
                        </p>
                      )}
                      {order.voucher_code && (
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: 4,
                            fontSize: 11,
                            background: "#ECFDF5",
                            color: "#065F46",
                            padding: "1px 6px",
                            borderRadius: 99,
                            fontWeight: 600,
                          }}
                        >
                          🏷️ {order.voucher_code}
                        </span>
                      )}
                    </td>

                    {/* Total */}
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        {formatRupiah(order.total_amount)}
                      </p>
                      {order.discount_amount > 0 && (
                        <p
                          style={{
                            fontSize: 11,
                            color: "#10B981",
                            marginTop: 1,
                          }}
                        >
                          Hemat {formatRupiah(order.discount_amount)}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: "12px 16px" }}>
                      <StatusBadge status={order.status} />
                    </td>

                    {/* Tanggal */}
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <p style={{ fontSize: 13, color: "#374151" }}>
                        {formatDateTime(order.created_at)}
                      </p>
                      {order.paid_at && (
                        <p
                          style={{
                            fontSize: 11,
                            color: "#10B981",
                            marginTop: 2,
                          }}
                        >
                          Bayar: {formatDate(order.paid_at)}
                        </p>
                      )}
                    </td>

                    {/* Aksi */}
                    <td style={{ padding: "12px 16px" }}>
                      <Link
                        to={`/admin/orders/${order.id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "6px 14px",
                          background: "#EFF6FF",
                          color: "#1D4ED8",
                          border: "1px solid #BFDBFE",
                          borderRadius: 7,
                          fontSize: 13,
                          fontWeight: 600,
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                          transition: "background 0.15s",
                        }}
                        onMouseOver={(e) =>
                          ((
                            e.currentTarget as HTMLAnchorElement
                          ).style.background = "#DBEAFE")
                        }
                        onMouseOut={(e) =>
                          ((
                            e.currentTarget as HTMLAnchorElement
                          ).style.background = "#EFF6FF")
                        }
                      >
                        Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---- Pagination ---- */}
      {!loading && !error && pagination.total_pages > 1 && (
        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      )}
    </div>
  );
}

// ==========================================
// SUB COMPONENTS
// ==========================================

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        background: "#EFF6FF",
        color: "#1D4ED8",
        border: "1px solid #BFDBFE",
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#93C5FD",
          fontSize: 14,
          lineHeight: 1,
          padding: 0,
          display: "flex",
          alignItems: "center",
        }}
      >
        ×
      </button>
    </span>
  );
}

function LoadingRows() {
  return (
    <div style={{ padding: "40px 0" }}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 16,
            padding: "14px 20px",
            borderBottom: "1px solid #F3F4F6",
          }}
        >
          {[120, 160, 140, 100, 80, 100, 70].map((w, j) => (
            <div
              key={j}
              style={{
                height: 16,
                width: w,
                borderRadius: 6,
                background: "#F3F4F6",
                animation: "pulse 1.5s ease-in-out infinite",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      style={{
        padding: "48px 32px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 36 }}>❌</span>
      <p style={{ color: "#DC2626", fontSize: 15, fontWeight: 600 }}>
        {message}
      </p>
      <button
        onClick={onRetry}
        style={{
          padding: "8px 20px",
          background: "#3B82F6",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Coba Lagi
      </button>
    </div>
  );
}

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <div
      style={{
        padding: "64px 32px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 48 }}>🛒</span>
      <p style={{ fontSize: 16, fontWeight: 700, color: "#374151" }}>
        {hasFilter ? "Tidak ada pesanan yang cocok" : "Belum ada pesanan"}
      </p>
      <p style={{ fontSize: 14, color: "#9CA3AF" }}>
        {hasFilter
          ? "Coba ubah filter pencarian Anda"
          : "Pesanan akan muncul di sini setelah customer checkout"}
      </p>
    </div>
  );
}

function Pagination({
  pagination,
  onPageChange,
}: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}) {
  const { page, total_pages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Build page numbers to show
  const pages: (number | "...")[] = [];
  if (total_pages <= 7) {
    for (let i = 1; i <= total_pages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(total_pages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < total_pages - 2) pages.push("...");
    pages.push(total_pages);
  }

  return (
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
        Menampilkan {start}–{end} dari {total} pesanan
      </p>

      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <PageBtn
          label="←"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        />
        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              style={{ fontSize: 13, color: "#9CA3AF", padding: "0 4px" }}
            >
              ...
            </span>
          ) : (
            <PageBtn
              key={p}
              label={String(p)}
              active={p === page}
              onClick={() => onPageChange(p as number)}
            />
          ),
        )}
        <PageBtn
          label="→"
          disabled={page === total_pages}
          onClick={() => onPageChange(page + 1)}
        />
      </div>
    </div>
  );
}

function PageBtn({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 34,
        height: 34,
        padding: "0 8px",
        borderRadius: 8,
        border: active ? "none" : "1px solid #E5E7EB",
        background: active ? "#3B82F6" : disabled ? "#F9FAFB" : "#fff",
        color: active ? "#fff" : disabled ? "#D1D5DB" : "#374151",
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {label}
    </button>
  );
}
