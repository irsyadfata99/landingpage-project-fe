import { useState, useEffect, useCallback } from "react";
import api from "@/services/axios.config";
import Modal from "@/components/common/Modal";

// ==========================================
// TYPES
// ==========================================
type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

interface Review {
  id: string;
  order_id: string;
  order_code: string;
  customer_name: string;
  customer_email: string;
  product_name: string;
  rating: number;
  content: string;
  status: ReviewStatus;
  created_at: string;
}

// ==========================================
// HELPERS
// ==========================================
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const StarRating = ({ rating }: { rating: number }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        style={{ color: i <= rating ? "#F59E0B" : "#E5E7EB", fontSize: 14 }}
      >
        ★
      </span>
    ))}
  </div>
);

const STATUS_STYLE: Record<
  ReviewStatus,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: "Menunggu", color: "#92400E", bg: "#FEF3C7" },
  APPROVED: { label: "Disetujui", color: "#065F46", bg: "#D1FAE5" },
  REJECTED: { label: "Ditolak", color: "#991B1B", bg: "#FEE2E2" },
};

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "PENDING", label: "Menunggu" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
];

// ==========================================
// REVIEW DETAIL MODAL
// ==========================================
function ReviewDetailModal({
  isOpen,
  onClose,
  review,
  onApprove,
  onReject,
  processing,
}: {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  processing: string | null;
}) {
  if (!review) return null;
  const cfg = STATUS_STYLE[review.status];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Review">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Customer info */}
        <div
          style={{
            background: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                {review.customer_name}
              </p>
              <p style={{ fontSize: 12, color: "#6B7280" }}>
                {review.customer_email}
              </p>
              <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                Order:{" "}
                <span style={{ fontFamily: "monospace", color: "#3B82F6" }}>
                  {review.order_code}
                </span>
              </p>
            </div>
            <span
              style={{
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
          </div>
        </div>

        {/* Produk + Rating */}
        <div>
          <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>
            Produk
          </p>
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
            {review.product_name}
          </p>
          <StarRating rating={review.rating} />
        </div>

        {/* Konten review */}
        <div
          style={{
            background: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            padding: "14px 16px",
          }}
        >
          <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 6 }}>
            Isi Review
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#111827" }}>
            {review.content}
          </p>
        </div>

        <p style={{ fontSize: 12, color: "#9CA3AF" }}>
          Dikirim: {formatDate(review.created_at)}
        </p>

        {/* Actions */}
        {review.status === "PENDING" && (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => void onReject(review.id)}
              disabled={processing === review.id}
              style={{
                flex: 1,
                padding: "11px",
                background: "#FEF2F2",
                color: "#DC2626",
                border: "1px solid #FCA5A5",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: processing === review.id ? "not-allowed" : "pointer",
                opacity: processing === review.id ? 0.7 : 1,
              }}
            >
              ❌ Tolak
            </button>
            <button
              onClick={() => void onApprove(review.id)}
              disabled={processing === review.id}
              style={{
                flex: 1,
                padding: "11px",
                background: "#10B981",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14,
                cursor: processing === review.id ? "not-allowed" : "pointer",
                opacity: processing === review.id ? 0.7 : 1,
              }}
            >
              {processing === review.id ? "⏳ Memproses..." : "✅ Setujui"}
            </button>
          </div>
        )}
        {review.status === "APPROVED" && (
          <button
            onClick={() => void onReject(review.id)}
            disabled={processing === review.id}
            style={{
              width: "100%",
              padding: "11px",
              background: "#FEF2F2",
              color: "#DC2626",
              border: "1px solid #FCA5A5",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: processing === review.id ? "not-allowed" : "pointer",
              opacity: processing === review.id ? 0.7 : 1,
            }}
          >
            {processing === review.id
              ? "⏳ Memproses..."
              : "❌ Tolak Review Ini"}
          </button>
        )}
        {review.status === "REJECTED" && (
          <button
            onClick={() => void onApprove(review.id)}
            disabled={processing === review.id}
            style={{
              width: "100%",
              padding: "11px",
              background: "#10B981",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: processing === review.id ? "not-allowed" : "pointer",
              opacity: processing === review.id ? 0.7 : 1,
            }}
          >
            {processing === review.id
              ? "⏳ Memproses..."
              : "✅ Setujui Review Ini"}
          </button>
        )}
      </div>
    </Modal>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [detailModal, setDetailModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filterStatus ? `?status=${filterStatus}` : "";
      const res = await api.get<{ data: Review[] }>(`/admin/reviews${params}`);
      setReviews(res.data.data);
    } catch {
      setError("Gagal memuat data review");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      await api.patch(`/admin/reviews/${id}/approve`);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r)),
      );
      if (selectedReview?.id === id) {
        setSelectedReview((prev) =>
          prev ? { ...prev, status: "APPROVED" } : null,
        );
      }
      showToast("Review disetujui");
    } catch {
      showToast("Gagal menyetujui review", "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    try {
      await api.patch(`/admin/reviews/${id}/reject`);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r)),
      );
      if (selectedReview?.id === id) {
        setSelectedReview((prev) =>
          prev ? { ...prev, status: "REJECTED" } : null,
        );
      }
      showToast("Review ditolak");
    } catch {
      showToast("Gagal menolak review", "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus review ini secara permanen?")) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showToast("Review dihapus");
    } catch {
      showToast("Gagal menghapus review", "error");
    }
  };

  const pendingCount = reviews.filter((r) => r.status === "PENDING").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            background: toast.type === "success" ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${toast.type === "success" ? "#6EE7B7" : "#FCA5A5"}`,
            borderRadius: 10,
            padding: "12px 20px",
            color: toast.type === "success" ? "#065F46" : "#DC2626",
            fontSize: 14,
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* Header */}
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
            Moderasi Review
          </h2>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>
            {reviews.length} total review
            {pendingCount > 0 && (
              <span
                style={{
                  marginLeft: 8,
                  background: "#FEF3C7",
                  color: "#92400E",
                  fontSize: 12,
                  padding: "2px 8px",
                  borderRadius: 99,
                  fontWeight: 700,
                }}
              >
                {pendingCount} menunggu
              </span>
            )}
          </p>
        </div>

        {/* Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "9px 12px",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
            background: "#fff",
            color: "#111827",
            cursor: "pointer",
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
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
            <p style={{ color: "#9CA3AF", fontSize: 14 }}>Memuat review...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : error ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <p style={{ color: "#EF4444", fontSize: 14 }}>❌ {error}</p>
            <button
              onClick={() => void fetchReviews()}
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
        ) : reviews.length === 0 ? (
          <div
            style={{ padding: "60px", textAlign: "center", color: "#9CA3AF" }}
          >
            <p style={{ fontSize: 36, marginBottom: 12 }}>⭐</p>
            <p style={{ fontSize: 14 }}>
              {filterStatus
                ? "Tidak ada review dengan status ini"
                : "Belum ada review masuk"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {reviews.map((review) => {
              const cfg = STATUS_STYLE[review.status];
              return (
                <div
                  key={review.id}
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #F3F4F6",
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Left: info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                        marginBottom: 6,
                      }}
                    >
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#111827",
                        }}
                      >
                        {review.customer_name}
                      </p>
                      <StarRating rating={review.rating} />
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 99,
                          fontSize: 11,
                          fontWeight: 700,
                          color: cfg.color,
                          background: cfg.bg,
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        marginBottom: 4,
                      }}
                    >
                      Produk:{" "}
                      <strong style={{ color: "#374151" }}>
                        {review.product_name}
                      </strong>
                      {" · "}
                      <span
                        style={{
                          fontFamily: "monospace",
                          color: "#3B82F6",
                          fontSize: 12,
                        }}
                      >
                        {review.order_code}
                      </span>
                    </p>

                    <p
                      style={{
                        fontSize: 14,
                        color: "#374151",
                        lineHeight: 1.6,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {review.content}
                    </p>

                    <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 6 }}>
                      {formatDate(review.created_at)}
                    </p>
                  </div>

                  {/* Right: actions */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      flexShrink: 0,
                    }}
                  >
                    <button
                      onClick={() => {
                        setSelectedReview(review);
                        setDetailModal(true);
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#EFF6FF",
                        color: "#3B82F6",
                        border: "1px solid #BFDBFE",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      👁️ Detail
                    </button>
                    {review.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => void handleApprove(review.id)}
                          disabled={processing === review.id}
                          style={{
                            padding: "6px 12px",
                            background: "#D1FAE5",
                            color: "#065F46",
                            border: "1px solid #6EE7B7",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor:
                              processing === review.id
                                ? "not-allowed"
                                : "pointer",
                            opacity: processing === review.id ? 0.6 : 1,
                          }}
                        >
                          ✅ Setujui
                        </button>
                        <button
                          onClick={() => void handleReject(review.id)}
                          disabled={processing === review.id}
                          style={{
                            padding: "6px 12px",
                            background: "#FEF2F2",
                            color: "#DC2626",
                            border: "1px solid #FCA5A5",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor:
                              processing === review.id
                                ? "not-allowed"
                                : "pointer",
                            opacity: processing === review.id ? 0.6 : 1,
                          }}
                        >
                          ❌ Tolak
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => void handleDelete(review.id)}
                      style={{
                        padding: "6px 12px",
                        background: "transparent",
                        color: "#9CA3AF",
                        border: "1px solid #E5E7EB",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <ReviewDetailModal
        isOpen={detailModal}
        onClose={() => {
          setDetailModal(false);
          setSelectedReview(null);
        }}
        review={selectedReview}
        onApprove={handleApprove}
        onReject={handleReject}
        processing={processing}
      />
    </div>
  );
}
