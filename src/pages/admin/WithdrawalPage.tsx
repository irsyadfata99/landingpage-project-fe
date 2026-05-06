import { useState, useEffect, useCallback } from "react";
import api from "@/services/axios.config";
import Modal from "@/components/common/Modal";

// ==========================================
// TYPES
// ==========================================
type WithdrawalStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_primary: boolean;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  bank_account_id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: WithdrawalStatus;
  notes: string | null;
  requested_at: string;
  processed_at: string | null;
}

interface WithdrawalSummary {
  total_revenue: number;
  total_withdrawn: number;
  pending_withdrawal: number;
  available_balance: number;
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

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_STYLE: Record<
  WithdrawalStatus,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: "Menunggu", color: "#92400E", bg: "#FEF3C7" },
  APPROVED: { label: "Disetujui", color: "#1D4ED8", bg: "#DBEAFE" },
  REJECTED: { label: "Ditolak", color: "#991B1B", bg: "#FEE2E2" },
  COMPLETED: { label: "Selesai", color: "#065F46", bg: "#D1FAE5" },
};

const BANKS = [
  "BCA",
  "BNI",
  "BRI",
  "Mandiri",
  "CIMB Niaga",
  "Danamon",
  "Permata",
  "BTN",
  "Muamalat",
  "BSI",
  "Jenius",
  "GoPay",
  "OVO",
  "DANA",
];

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
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ==========================================
// BANK ACCOUNT MODAL
// ==========================================
function BankAccountModal({
  isOpen,
  onClose,
  editAccount,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  editAccount: BankAccount | null;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
    is_primary: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editAccount) {
      setForm({
        bank_name: editAccount.bank_name,
        account_number: editAccount.account_number,
        account_name: editAccount.account_name,
        is_primary: editAccount.is_primary,
      });
    } else {
      setForm({
        bank_name: "",
        account_number: "",
        account_name: "",
        is_primary: false,
      });
    }
    setError(null);
  }, [editAccount, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.bank_name || !form.account_number || !form.account_name)
      return setError("Semua field wajib diisi");
    setSubmitting(true);
    try {
      if (editAccount) {
        await api.put(
          `/admin/withdrawal/bank-accounts/${editAccount.id}`,
          form,
        );
      } else {
        await api.post("/admin/withdrawal/bank-accounts", form);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Gagal menyimpan rekening");
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
      title={editAccount ? "Edit Rekening" : "Tambah Rekening"}
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <Field label="Bank" required>
          <select
            style={inputStyle}
            value={form.bank_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, bank_name: e.target.value }))
            }
            required
          >
            <option value="">-- Pilih Bank --</option>
            {BANKS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nomor Rekening" required>
          <input
            style={{
              ...inputStyle,
              fontFamily: "monospace",
              fontSize: 15,
              letterSpacing: "0.05em",
            }}
            type="text"
            value={form.account_number}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                account_number: e.target.value.replace(/\D/g, ""),
              }))
            }
            placeholder="1234567890"
            required
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <Field label="Nama Pemilik Rekening" required>
          <input
            style={inputStyle}
            type="text"
            value={form.account_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, account_name: e.target.value }))
            }
            placeholder="Nama sesuai buku tabungan"
            required
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={form.is_primary}
            onChange={(e) =>
              setForm((p) => ({ ...p, is_primary: e.target.checked }))
            }
            style={{ width: 16, height: 16 }}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
            Jadikan rekening utama
          </span>
        </label>
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
              : editAccount
                ? "💾 Simpan"
                : "➕ Tambah"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// REQUEST WITHDRAWAL MODAL
// ==========================================
function RequestWithdrawalModal({
  isOpen,
  onClose,
  accounts,
  availableBalance,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  availableBalance: number;
  onSuccess: () => void;
}) {
  const primaryAccount = accounts.find((a) => a.is_primary);
  const [form, setForm] = useState({
    amount: "",
    bank_account_id: primaryAccount?.id ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const primary = accounts.find((a) => a.is_primary);
    setForm({
      amount: "",
      bank_account_id: primary?.id ?? accounts[0]?.id ?? "",
    });
    setError(null);
  }, [accounts, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return setError("Masukkan jumlah yang valid");
    if (amount > availableBalance)
      return setError("Jumlah melebihi saldo tersedia");
    if (!form.bank_account_id) return setError("Pilih rekening tujuan");
    setSubmitting(true);
    try {
      await api.post("/admin/withdrawal/request", {
        amount,
        bank_account_id: form.bank_account_id,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Gagal membuat request penarikan");
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
      title="Request Penarikan Dana"
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <div
          style={{
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: 8,
            padding: "14px 16px",
          }}
        >
          <p style={{ fontSize: 13, color: "#1D4ED8", marginBottom: 4 }}>
            Saldo Tersedia
          </p>
          <p style={{ fontSize: 24, fontWeight: 800, color: "#1D4ED8" }}>
            {formatRupiah(availableBalance)}
          </p>
        </div>

        <Field label="Jumlah Penarikan (Rp)" required>
          <input
            style={{ ...inputStyle, fontFamily: "monospace", fontSize: 15 }}
            type="number"
            min={1}
            max={availableBalance}
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            placeholder="500000"
            required
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    amount: String(Math.floor((availableBalance * pct) / 100)),
                  }))
                }
                style={{
                  padding: "4px 10px",
                  background: "#F3F4F6",
                  border: "1px solid #E5E7EB",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                }}
              >
                {pct}%
              </button>
            ))}
          </div>
        </Field>

        <Field label="Rekening Tujuan" required>
          {accounts.length === 0 ? (
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
              ⚠️ Belum ada rekening terdaftar. Tambah rekening terlebih dahulu.
            </div>
          ) : (
            <select
              style={inputStyle}
              value={form.bank_account_id}
              onChange={(e) =>
                setForm((p) => ({ ...p, bank_account_id: e.target.value }))
              }
              required
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.bank_name} — {a.account_number} ({a.account_name})
                  {a.is_primary ? " ★" : ""}
                </option>
              ))}
            </select>
          )}
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
            disabled={submitting || accounts.length === 0}
            style={{
              flex: 2,
              padding: "11px",
              background: "#10B981",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor:
                submitting || accounts.length === 0 ? "not-allowed" : "pointer",
              opacity: submitting || accounts.length === 0 ? 0.7 : 1,
            }}
          >
            {submitting ? "⏳ Memproses..." : "💸 Request Penarikan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
type TabKey = "overview" | "history" | "accounts";

export default function AdminWithdrawalPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [summary, setSummary] = useState<WithdrawalSummary | null>(null);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [bankModal, setBankModal] = useState(false);
  const [editAccount, setEditAccount] = useState<BankAccount | null>(null);
  const [withdrawModal, setWithdrawModal] = useState(false);

  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, historyRes, accountsRes] = await Promise.all([
        api.get<{ data: WithdrawalSummary }>("/admin/withdrawal/summary"),
        api.get<{ data: WithdrawalRequest[] }>("/admin/withdrawal/history"),
        api.get<{ data: BankAccount[] }>("/admin/withdrawal/bank-accounts"),
      ]);
      setSummary(summaryRes.data.data);
      setHistory(historyRes.data.data);
      setAccounts(accountsRes.data.data);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Hapus rekening ini?")) return;
    try {
      await api.delete(`/admin/withdrawal/bank-accounts/${id}`);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      showToast("Rekening dihapus");
    } catch {
      showToast("Gagal menghapus rekening", "error");
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await api.patch(`/admin/withdrawal/bank-accounts/${id}/primary`);
      setAccounts((prev) =>
        prev.map((a) => ({ ...a, is_primary: a.id === id })),
      );
      showToast("Rekening utama diperbarui");
    } catch {
      showToast("Gagal mengubah rekening utama", "error");
    }
  };

  const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "history", label: "Riwayat Penarikan", icon: "📋" },
    { key: "accounts", label: "Rekening Bank", icon: "🏦" },
  ];

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
            Penarikan Dana
          </h2>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>
            Kelola saldo dan request penarikan dana
          </p>
        </div>
        <button
          onClick={() => setWithdrawModal(true)}
          style={{
            padding: "9px 18px",
            background: "#10B981",
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
          💸 Request Penarikan
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: "4px",
          display: "flex",
          gap: 4,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: activeTab === tab.key ? "#3B82F6" : "transparent",
              color: activeTab === tab.key ? "#fff" : "#6B7280",
              fontSize: 13,
              fontWeight: activeTab === tab.key ? 700 : 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "40vh",
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
            <p style={{ color: "#9CA3AF", fontSize: 14 }}>Memuat data...</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : (
        <>
          {/* ---- OVERVIEW ---- */}
          {activeTab === "overview" && summary && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: 16,
                }}
              >
                {[
                  {
                    label: "Total Pendapatan",
                    value: formatRupiah(summary.total_revenue),
                    color: "#10B981",
                    icon: "💰",
                  },
                  {
                    label: "Total Ditarik",
                    value: formatRupiah(summary.total_withdrawn),
                    color: "#6B7280",
                    icon: "📤",
                  },
                  {
                    label: "Dalam Proses",
                    value: formatRupiah(summary.pending_withdrawal),
                    color: "#F59E0B",
                    icon: "⏳",
                  },
                  {
                    label: "Saldo Tersedia",
                    value: formatRupiah(summary.available_balance),
                    color: "#3B82F6",
                    icon: "✅",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: 12,
                      padding: "20px 24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{stat.icon}</span>
                      <p style={{ fontSize: 13, color: "#6B7280" }}>
                        {stat.label}
                      </p>
                    </div>
                    <p
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: stat.color,
                      }}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {summary.available_balance > 0 && (
                <div
                  style={{
                    background: "#F0FDF4",
                    border: "1px solid #86EFAC",
                    borderRadius: 12,
                    padding: "20px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#065F46",
                      }}
                    >
                      Saldo siap ditarik
                    </p>
                    <p style={{ fontSize: 14, color: "#059669" }}>
                      {formatRupiah(summary.available_balance)} tersedia untuk
                      penarikan
                    </p>
                  </div>
                  <button
                    onClick={() => setWithdrawModal(true)}
                    style={{
                      padding: "10px 20px",
                      background: "#10B981",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    💸 Tarik Sekarang
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ---- HISTORY ---- */}
          {activeTab === "history" && (
            <div
              style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {history.length === 0 ? (
                <div
                  style={{
                    padding: "60px",
                    textAlign: "center",
                    color: "#9CA3AF",
                  }}
                >
                  <p style={{ fontSize: 36, marginBottom: 12 }}>📋</p>
                  <p style={{ fontSize: 14 }}>Belum ada riwayat penarikan</p>
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
                          "Tanggal",
                          "Jumlah",
                          "Rekening Tujuan",
                          "Status",
                          "Diproses",
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
                      {history.map((item) => {
                        const cfg = STATUS_STYLE[item.status];
                        return (
                          <tr
                            key={item.id}
                            style={{ borderBottom: "1px solid #F3F4F6" }}
                          >
                            <td
                              style={{
                                padding: "13px 16px",
                                fontSize: 13,
                                color: "#6B7280",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatDate(item.requested_at)}
                            </td>
                            <td
                              style={{
                                padding: "13px 16px",
                                fontWeight: 700,
                                color: "#111827",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatRupiah(item.amount)}
                            </td>
                            <td style={{ padding: "13px 16px" }}>
                              <p style={{ fontWeight: 600, fontSize: 13 }}>
                                {item.bank_name}
                              </p>
                              <p
                                style={{
                                  fontSize: 12,
                                  color: "#6B7280",
                                  fontFamily: "monospace",
                                }}
                              >
                                {item.account_number} · {item.account_name}
                              </p>
                            </td>
                            <td style={{ padding: "13px 16px" }}>
                              <span
                                style={{
                                  padding: "3px 10px",
                                  borderRadius: 99,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: cfg.color,
                                  background: cfg.bg,
                                }}
                              >
                                {cfg.label}
                              </span>
                              {item.notes && (
                                <p
                                  style={{
                                    fontSize: 12,
                                    color: "#6B7280",
                                    marginTop: 4,
                                  }}
                                >
                                  {item.notes}
                                </p>
                              )}
                            </td>
                            <td
                              style={{
                                padding: "13px 16px",
                                fontSize: 13,
                                color: "#6B7280",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatDate(item.processed_at)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ---- ACCOUNTS ---- */}
          {activeTab === "accounts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {accounts.map((account) => (
                <div
                  key={account.id}
                  style={{
                    background: "#fff",
                    border: `1px solid ${account.is_primary ? "#3B82F6" : "#E5E7EB"}`,
                    borderRadius: 12,
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 14 }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: account.is_primary ? "#EFF6FF" : "#F3F4F6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                      }}
                    >
                      🏦
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: 15,
                            color: "#111827",
                          }}
                        >
                          {account.bank_name}
                        </p>
                        {account.is_primary && (
                          <span
                            style={{
                              fontSize: 11,
                              background: "#DBEAFE",
                              color: "#1D4ED8",
                              padding: "2px 8px",
                              borderRadius: 99,
                              fontWeight: 700,
                            }}
                          >
                            ★ Utama
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#6B7280",
                          fontFamily: "monospace",
                        }}
                      >
                        {account.account_number}
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#374151",
                          fontWeight: 500,
                        }}
                      >
                        {account.account_name}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    {!account.is_primary && (
                      <button
                        onClick={() => void handleSetPrimary(account.id)}
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
                        ★ Utamakan
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditAccount(account);
                        setBankModal(true);
                      }}
                      style={{
                        padding: "6px 12px",
                        background: "#F9FAFB",
                        color: "#374151",
                        border: "1px solid #E5E7EB",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => void handleDeleteAccount(account.id)}
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
                </div>
              ))}

              <button
                onClick={() => {
                  setEditAccount(null);
                  setBankModal(true);
                }}
                style={{
                  padding: "14px",
                  border: "2px dashed #E5E7EB",
                  borderRadius: 12,
                  background: "transparent",
                  color: "#6B7280",
                  fontSize: 14,
                  cursor: "pointer",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                ➕ Tambah Rekening Bank
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <BankAccountModal
        isOpen={bankModal}
        onClose={() => setBankModal(false)}
        editAccount={editAccount}
        onSuccess={() => {
          void fetchAll();
          showToast("Rekening berhasil disimpan");
        }}
      />
      <RequestWithdrawalModal
        isOpen={withdrawModal}
        onClose={() => setWithdrawModal(false)}
        accounts={accounts}
        availableBalance={summary?.available_balance ?? 0}
        onSuccess={() => {
          void fetchAll();
          showToast("Request penarikan berhasil dibuat");
        }}
      />
    </div>
  );
}
