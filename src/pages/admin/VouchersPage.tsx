import { useState, useEffect, useCallback } from "react";
import api from "@/services/axios.config";
import Modal from "@/components/common/Modal";

// ==========================================
// TYPES — sesuai backend schema
// ==========================================
type VoucherType = "PERCENT" | "NOMINAL";

interface Voucher {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  minimum_order: number;
  max_uses: number;
  used_count: number;
  expired_at: string;
  is_active: boolean;
  created_at: string;
}

interface VoucherForm {
  code: string;
  type: VoucherType;
  value: string;
  minimum_order: string;
  max_uses: string;
  expired_at: string;
  is_active: boolean;
}

const EMPTY_FORM: VoucherForm = {
  code: "",
  type: "PERCENT",
  value: "",
  minimum_order: "",
  max_uses: "1",
  expired_at: "",
  is_active: true,
};

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
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const isExpired = (v: Voucher) => new Date(v.expired_at) < new Date();
const isQuotaFull = (v: Voucher) => v.used_count >= v.max_uses;

const generateCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 8 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length)),
  ).join("");
};

// Default expired_at: 30 hari dari sekarang, format datetime-local
const defaultExpiredAt = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  // Format: YYYY-MM-DDTHH:mm
  return d.toISOString().slice(0, 16);
};

// ==========================================
// SHARED STYLES
// ==========================================
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  background: "#fff",
  color: "#111827",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 5,
};

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      {children}
      {hint && (
        <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>{hint}</p>
      )}
    </div>
  );
}

// ==========================================
// VOUCHER FORM MODAL
// ==========================================
function VoucherFormModal({
  isOpen,
  onClose,
  editVoucher,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  editVoucher: Voucher | null;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<VoucherForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editVoucher) {
      setForm({
        code: editVoucher.code,
        type: editVoucher.type,
        value: String(editVoucher.value),
        minimum_order: editVoucher.minimum_order
          ? String(editVoucher.minimum_order)
          : "",
        max_uses: String(editVoucher.max_uses),
        expired_at: editVoucher.expired_at
          ? editVoucher.expired_at.slice(0, 16)
          : defaultExpiredAt(),
        is_active: editVoucher.is_active,
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        code: generateCode(),
        expired_at: defaultExpiredAt(),
      });
    }
    setError(null);
  }, [editVoucher, isOpen]);

  const handleChange = (field: keyof VoucherForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.code.trim()) return setError("Kode voucher wajib diisi");
    if (!form.value || Number(form.value) <= 0)
      return setError("Nilai tidak valid");
    if (form.type === "PERCENT" && Number(form.value) > 100)
      return setError("Persentase maksimal 100%");
    if (!form.expired_at) return setError("Tanggal expired wajib diisi");
    if (!form.max_uses || Number(form.max_uses) < 1)
      return setError("Kuota minimal 1");

    setSubmitting(true);
    try {
      // Body sesuai backend: code, type, value, minimum_order, max_uses, expired_at, is_active
      const body: Record<string, unknown> = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value),
        minimum_order: form.minimum_order ? Number(form.minimum_order) : 0,
        max_uses: Number(form.max_uses),
        expired_at: new Date(form.expired_at).toISOString(),
        is_active: form.is_active,
      };

      if (editVoucher) {
        await api.put(`/admin/vouchers/${editVoucher.id}`, body);
      } else {
        await api.post("/admin/vouchers", body);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Gagal menyimpan voucher");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!submitting) onClose();
      }}
      title={editVoucher ? "Edit Voucher" : "Buat Voucher"}
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        {/* Kode */}
        <Field label="Kode Voucher" required>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{
                ...inputStyle,
                flex: 1,
                textTransform: "uppercase",
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
              value={form.code}
              onChange={(e) =>
                handleChange("code", e.target.value.toUpperCase())
              }
              placeholder="DISKON20"
              required
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
            {!editVoucher && (
              <button
                type="button"
                onClick={() => handleChange("code", generateCode())}
                style={{
                  padding: "9px 14px",
                  background: "#F3F4F6",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                🎲 Generate
              </button>
            )}
          </div>
        </Field>

        {/* Tipe + Nilai */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Field label="Tipe Diskon" required>
            <div style={{ display: "flex", gap: 8 }}>
              {(["PERCENT", "NOMINAL"] as VoucherType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleChange("type", t)}
                  style={{
                    flex: 1,
                    padding: "9px 8px",
                    border: `2px solid ${form.type === t ? "#3B82F6" : "#E5E7EB"}`,
                    borderRadius: 8,
                    background: form.type === t ? "#EFF6FF" : "#fff",
                    color: form.type === t ? "#1D4ED8" : "#6B7280",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {t === "PERCENT" ? "% Persen" : "Rp Nominal"}
                </button>
              ))}
            </div>
          </Field>

          <Field
            label={form.type === "PERCENT" ? "Persentase (%)" : "Nilai (Rp)"}
            required
          >
            <input
              style={inputStyle}
              type="number"
              min={1}
              max={form.type === "PERCENT" ? 100 : undefined}
              value={form.value}
              onChange={(e) => handleChange("value", e.target.value)}
              placeholder={form.type === "PERCENT" ? "20" : "50000"}
              required
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
        </div>

        {/* Minimum Order + Kuota */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Field label="Min. Pembelian (Rp)" hint="Kosongkan = tanpa minimum">
            <input
              style={inputStyle}
              type="number"
              min={0}
              value={form.minimum_order}
              onChange={(e) => handleChange("minimum_order", e.target.value)}
              placeholder="100000"
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>

          <Field
            label="Maks. Pemakaian (Kuota)"
            required
            hint="Total berapa kali voucher bisa dipakai"
          >
            <input
              style={inputStyle}
              type="number"
              min={1}
              value={form.max_uses}
              onChange={(e) => handleChange("max_uses", e.target.value)}
              placeholder="100"
              required
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
        </div>

        {/* Expired At */}
        <Field label="Berlaku Sampai" required>
          <input
            style={inputStyle}
            type="datetime-local"
            value={form.expired_at}
            onChange={(e) => handleChange("expired_at", e.target.value)}
            required
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>

        {/* Status */}
        <Field label="Status">
          <button
            type="button"
            onClick={() => handleChange("is_active", !form.is_active)}
            style={{
              padding: "9px 16px",
              border: `2px solid ${form.is_active ? "#10B981" : "#E5E7EB"}`,
              borderRadius: 8,
              background: form.is_active ? "#ECFDF5" : "#F9FAFB",
              color: form.is_active ? "#065F46" : "#6B7280",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {form.is_active ? "✅ Aktif" : "⏸️ Nonaktif"}
          </button>
        </Field>

        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              borderRadius: 8,
              padding: "10px 12px",
              color: "#DC2626",
              fontSize: 13,
            }}
          >
            ❌ {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
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
            type="submit"
            disabled={submitting}
            style={{
              flex: 2,
              padding: "11px",
              background: "#3B82F6",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting
              ? "⏳ Menyimpan..."
              : editVoucher
                ? "💾 Simpan Perubahan"
                : "➕ Buat Voucher"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// DELETE MODAL
// ==========================================
function DeleteModal({
  isOpen,
  onClose,
  voucher,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  voucher: Voucher | null;
  onSuccess: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!voucher) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/vouchers/${voucher.id}`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Gagal menghapus voucher");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!deleting) {
          onClose();
          setError(null);
        }
      }}
      title="Hapus Voucher"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: 8,
            padding: "14px 16px",
            fontSize: 14,
            color: "#991B1B",
            lineHeight: 1.6,
          }}
        >
          Hapus voucher <strong>"{voucher?.code}"</strong>? Tindakan ini tidak
          dapat dibatalkan.
        </div>
        {error && <p style={{ fontSize: 13, color: "#DC2626" }}>❌ {error}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => {
              onClose();
              setError(null);
            }}
            disabled={deleting}
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
            onClick={() => void handleDelete()}
            disabled={deleting}
            style={{
              flex: 1,
              padding: "11px",
              background: "#EF4444",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: deleting ? "not-allowed" : "pointer",
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? "⏳ Menghapus..." : "🗑️ Ya, Hapus"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formModal, setFormModal] = useState(false);
  const [editVoucher, setEditVoucher] = useState<Voucher | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{
        data: Voucher[];
        pagination: { total: number };
      }>("/admin/vouchers?limit=100");
      setVouchers(res.data.data);
    } catch {
      setError("Gagal memuat data voucher");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchVouchers();
  }, [fetchVouchers]);

  const handleToggle = async (v: Voucher) => {
    setTogglingId(v.id);
    try {
      await api.patch(`/admin/vouchers/${v.id}/toggle`);
      setVouchers((prev) =>
        prev.map((item) =>
          item.id === v.id ? { ...item, is_active: !item.is_active } : item,
        ),
      );
    } catch {
      alert("Gagal mengubah status voucher");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
            Voucher
          </h2>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>
            {vouchers.length} total voucher
          </p>
        </div>
        <button
          onClick={() => {
            setEditVoucher(null);
            setFormModal(true);
          }}
          style={{
            padding: "9px 18px",
            background: "#3B82F6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ➕ Buat Voucher
        </button>
      </div>

      {/* Table */}
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
            <p style={{ color: "#9CA3AF", fontSize: 14 }}>Memuat voucher...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : error ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <p style={{ color: "#EF4444", fontSize: 14 }}>❌ {error}</p>
            <button
              onClick={() => void fetchVouchers()}
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
        ) : vouchers.length === 0 ? (
          <div
            style={{ padding: "60px", textAlign: "center", color: "#9CA3AF" }}
          >
            <p style={{ fontSize: 36, marginBottom: 12 }}>🏷️</p>
            <p style={{ fontSize: 14 }}>
              Belum ada voucher. Buat voucher pertama Anda!
            </p>
            <button
              onClick={() => {
                setEditVoucher(null);
                setFormModal(true);
              }}
              style={{
                marginTop: 16,
                padding: "9px 20px",
                background: "#3B82F6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              ➕ Buat Voucher
            </button>
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
                    "Kode",
                    "Tipe & Nilai",
                    "Min. Beli",
                    "Kuota Terpakai",
                    "Berlaku Sampai",
                    "Status",
                    "Aksi",
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
                {vouchers.map((v) => {
                  const expired = isExpired(v);
                  const full = isQuotaFull(v);
                  return (
                    <tr
                      key={v.id}
                      style={{ borderBottom: "1px solid #F3F4F6" }}
                    >
                      {/* Kode */}
                      <td style={{ padding: "13px 16px" }}>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 800,
                            fontSize: 14,
                            color: "#3B82F6",
                            background: "#EFF6FF",
                            padding: "3px 10px",
                            borderRadius: 6,
                            letterSpacing: "0.05em",
                          }}
                        >
                          {v.code}
                        </span>
                        {expired && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 11,
                              background: "#FEE2E2",
                              color: "#991B1B",
                              padding: "1px 6px",
                              borderRadius: 99,
                              fontWeight: 700,
                            }}
                          >
                            Expired
                          </span>
                        )}
                        {full && !expired && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 11,
                              background: "#FEF3C7",
                              color: "#92400E",
                              padding: "1px 6px",
                              borderRadius: 99,
                              fontWeight: 700,
                            }}
                          >
                            Kuota Habis
                          </span>
                        )}
                      </td>

                      {/* Tipe & Nilai */}
                      <td
                        style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                      >
                        <p style={{ fontWeight: 700, color: "#111827" }}>
                          {v.type === "PERCENT"
                            ? `${v.value}%`
                            : formatRupiah(v.value)}
                        </p>
                        <p style={{ fontSize: 12, color: "#9CA3AF" }}>
                          {v.type === "PERCENT" ? "Persentase" : "Nominal"}
                        </p>
                      </td>

                      {/* Min. beli */}
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: 13,
                          color: "#6B7280",
                        }}
                      >
                        {v.minimum_order > 0
                          ? formatRupiah(v.minimum_order)
                          : "-"}
                      </td>

                      {/* Kuota */}
                      <td style={{ padding: "13px 16px" }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#111827",
                          }}
                        >
                          {v.used_count} / {v.max_uses}
                        </p>
                        <div
                          style={{
                            height: 4,
                            background: "#F3F4F6",
                            borderRadius: 99,
                            marginTop: 4,
                            width: 64,
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${Math.min(100, (v.used_count / v.max_uses) * 100)}%`,
                              background: full ? "#EF4444" : "#3B82F6",
                              borderRadius: 99,
                            }}
                          />
                        </div>
                      </td>

                      {/* Expired at */}
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: 13,
                          color: expired ? "#EF4444" : "#6B7280",
                          whiteSpace: "nowrap",
                          fontWeight: expired ? 600 : 400,
                        }}
                      >
                        {formatDate(v.expired_at)}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "13px 16px" }}>
                        <button
                          onClick={() => void handleToggle(v)}
                          disabled={togglingId === v.id}
                          style={{
                            padding: "4px 12px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 700,
                            border: "none",
                            cursor:
                              togglingId === v.id ? "not-allowed" : "pointer",
                            opacity: togglingId === v.id ? 0.6 : 1,
                            background: v.is_active ? "#D1FAE5" : "#F3F4F6",
                            color: v.is_active ? "#065F46" : "#6B7280",
                          }}
                        >
                          {togglingId === v.id
                            ? "..."
                            : v.is_active
                              ? "✅ Aktif"
                              : "⏸️ Nonaktif"}
                        </button>
                      </td>

                      {/* Aksi */}
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => {
                              setEditVoucher(v);
                              setFormModal(true);
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
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTarget(v);
                              setDeleteModal(true);
                            }}
                            style={{
                              padding: "6px 12px",
                              background: "#FEF2F2",
                              color: "#EF4444",
                              border: "1px solid #FCA5A5",
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <VoucherFormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        editVoucher={editVoucher}
        onSuccess={() => void fetchVouchers()}
      />
      <DeleteModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        voucher={deleteTarget}
        onSuccess={() => void fetchVouchers()}
      />
    </div>
  );
}
