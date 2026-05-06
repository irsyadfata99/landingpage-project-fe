import { useState, useEffect, useCallback } from "react";
import api from "@/services/axios.config";
import Modal from "@/components/common/Modal";

// ==========================================
// TYPES (sesuai backend aktual)
// ==========================================
interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WithdrawalHistory {
  id: string;
  bank_account_id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  tripay_ref: string | null;
  notes: string | null;
  requested_at: string;
  processed_at: string | null;
}

interface WithdrawalSettings {
  id: string;
  withdrawal_date: number;
  minimum_amount: number;
  is_auto: boolean;
  notification_email: string | null;
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
  "PENDING" | "SUCCESS" | "FAILED",
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: "Menunggu", color: "#92400E", bg: "#FEF3C7" },
  SUCCESS: { label: "Berhasil", color: "#065F46", bg: "#D1FAE5" },
  FAILED: { label: "Gagal", color: "#991B1B", bg: "#FEE2E2" },
};

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
    is_active: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editAccount) {
      setForm({
        bank_name: editAccount.bank_name,
        account_number: editAccount.account_number,
        account_name: editAccount.account_name,
        is_active: editAccount.is_active,
      });
    } else {
      setForm({
        bank_name: "",
        account_number: "",
        account_name: "",
        is_active: false,
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
        await api.put(`/admin/bank-accounts/${editAccount.id}`, form);
      } else {
        await api.post("/admin/bank-accounts", form);
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
        <Field label="Nama Bank" required>
          <input
            style={inputStyle}
            value={form.bank_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, bank_name: e.target.value }))
            }
            placeholder="BCA, BNI, BRI, Mandiri..."
            required
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <Field label="Nomor Rekening" required>
          <input
            style={{ ...inputStyle, fontFamily: "monospace", fontSize: 15 }}
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
            checked={form.is_active}
            onChange={(e) =>
              setForm((p) => ({ ...p, is_active: e.target.checked }))
            }
            style={{ width: 16, height: 16 }}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
            Jadikan rekening aktif (hanya satu yang bisa aktif)
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
        <div style={{ display: "flex", gap: 10 }}>
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
  activeAccount,
  settings,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeAccount: BankAccount | null;
  settings: WithdrawalSettings | null;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAmount("");
    setNotes("");
    setError(null);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) return setError("Masukkan jumlah yang valid");
    if (!activeAccount) return setError("Tidak ada rekening aktif");
    setSubmitting(true);
    try {
      await api.post("/admin/withdrawal/request", {
        amount: amt,
        bank_account_id: activeAccount.id,
        notes: notes.trim() || undefined,
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
        {!activeAccount ? (
          <div
            style={{
              background: "#FEF3C7",
              border: "1px solid #FCD34D",
              borderRadius: 8,
              padding: "14px 16px",
              fontSize: 14,
              color: "#92400E",
            }}
          >
            ⚠️ Belum ada rekening aktif. Tambah dan aktifkan rekening terlebih
            dahulu.
          </div>
        ) : (
          <div
            style={{
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              padding: "14px 16px",
            }}
          >
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 4 }}>
              Rekening Tujuan
            </p>
            <p style={{ fontWeight: 700, fontSize: 14 }}>
              {activeAccount.bank_name}
            </p>
            <p
              style={{
                fontSize: 13,
                color: "#6B7280",
                fontFamily: "monospace",
              }}
            >
              {activeAccount.account_number} · {activeAccount.account_name}
            </p>
          </div>
        )}

        {settings && (
          <div
            style={{
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: 8,
              padding: "12px 14px",
              fontSize: 13,
              color: "#1D4ED8",
            }}
          >
            ℹ️ Penarikan hanya bisa dilakukan pada tanggal{" "}
            <strong>{settings.withdrawal_date}</strong> setiap bulan.
            {settings.minimum_amount > 0 &&
              ` Minimum: ${formatRupiah(settings.minimum_amount)}.`}
          </div>
        )}

        <Field label="Jumlah Penarikan (Rp)" required>
          <input
            style={{ ...inputStyle, fontFamily: "monospace", fontSize: 15 }}
            type="number"
            min={settings?.minimum_amount ?? 1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="500000"
            required
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>

        <Field label="Catatan (opsional)">
          <textarea
            style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Keterangan tambahan..."
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
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

        <div style={{ display: "flex", gap: 10 }}>
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
            disabled={submitting || !activeAccount}
            style={{
              flex: 2,
              padding: "11px",
              background: "#10B981",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 14,
              cursor: submitting || !activeAccount ? "not-allowed" : "pointer",
              opacity: submitting || !activeAccount ? 0.7 : 1,
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
// WITHDRAWAL SETTINGS FORM
// ==========================================
function WithdrawalSettingsForm({
  settings,
  onSuccess,
}: {
  settings: WithdrawalSettings | null;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    withdrawal_date: settings?.withdrawal_date ?? 1,
    minimum_amount: settings?.minimum_amount ?? 0,
    is_auto: settings?.is_auto ?? false,
    notification_email: settings?.notification_email ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    if (settings) {
      setForm({
        withdrawal_date: settings.withdrawal_date,
        minimum_amount: settings.minimum_amount,
        is_auto: settings.is_auto,
        notification_email: settings.notification_email ?? "",
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    try {
      await api.put("/admin/withdrawal/settings", {
        withdrawal_date: form.withdrawal_date,
        minimum_amount: form.minimum_amount,
        is_auto: form.is_auto,
        notification_email: form.notification_email || undefined,
      });
      setAlert({ type: "success", msg: "Pengaturan berhasil disimpan" });
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setAlert({
        type: "error",
        msg: e.response?.data?.message ?? "Gagal menyimpan",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        maxWidth: 480,
      }}
    >
      {alert && (
        <div
          style={{
            background: alert.type === "success" ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${alert.type === "success" ? "#6EE7B7" : "#FCA5A5"}`,
            borderRadius: 8,
            padding: "10px 14px",
            color: alert.type === "success" ? "#065F46" : "#DC2626",
            fontSize: 13,
          }}
        >
          {alert.type === "success" ? "✅" : "❌"} {alert.msg}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Tanggal Penarikan" hint="Tanggal 1-28 setiap bulan">
          <input
            type="number"
            min={1}
            max={28}
            style={inputStyle}
            value={form.withdrawal_date}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                withdrawal_date: Number(e.target.value),
              }))
            }
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <Field label="Minimum Penarikan (Rp)">
          <input
            type="number"
            min={0}
            style={inputStyle}
            value={form.minimum_amount}
            onChange={(e) =>
              setForm((p) => ({ ...p, minimum_amount: Number(e.target.value) }))
            }
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
      </div>
      <Field label="Email Notifikasi">
        <input
          type="email"
          style={inputStyle}
          value={form.notification_email}
          onChange={(e) =>
            setForm((p) => ({ ...p, notification_email: e.target.value }))
          }
          placeholder="admin@example.com"
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
        />
      </Field>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "9px 20px",
            background: "#3B82F6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "⏳ Menyimpan..." : "💾 Simpan Pengaturan"}
        </button>
      </div>
    </form>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
type TabKey = "history" | "accounts" | "settings";

export default function AdminWithdrawalPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("history");
  const [history, setHistory] = useState<WithdrawalHistory[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [settings, setSettings] = useState<WithdrawalSettings | null>(null);
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
      const [historyRes, accountsRes, settingsRes] = await Promise.all([
        api.get<{ data: WithdrawalHistory[] }>("/admin/withdrawal/history"),
        api.get<{ data: BankAccount[] }>("/admin/bank-accounts"),
        api.get<{ data: WithdrawalSettings }>("/admin/withdrawal/settings"),
      ]);
      setHistory(historyRes.data.data);
      setAccounts(accountsRes.data.data);
      setSettings(settingsRes.data.data);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const handleActivateAccount = async (id: string) => {
    try {
      await api.patch(`/admin/bank-accounts/${id}/activate`);
      setAccounts((prev) =>
        prev.map((a) => ({ ...a, is_active: a.id === id })),
      );
      showToast("Rekening diaktifkan");
    } catch {
      showToast("Gagal mengaktifkan rekening", "error");
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("Hapus rekening ini?")) return;
    try {
      await api.delete(`/admin/bank-accounts/${id}`);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      showToast("Rekening dihapus");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      showToast(
        e.response?.data?.message ?? "Gagal menghapus rekening",
        "error",
      );
    }
  };

  const activeAccount = accounts.find((a) => a.is_active) ?? null;

  const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "history", label: "Riwayat Penarikan", icon: "📋" },
    { key: "accounts", label: "Rekening Bank", icon: "🏦" },
    { key: "settings", label: "Pengaturan", icon: "⚙️" },
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
            Rekening aktif:{" "}
            {activeAccount ? (
              <strong style={{ color: "#111827" }}>
                {activeAccount.bank_name} · {activeAccount.account_number}
              </strong>
            ) : (
              <span style={{ color: "#EF4444" }}>Belum ada</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setWithdrawModal(true)}
          disabled={!activeAccount}
          style={{
            padding: "9px 18px",
            background: activeAccount ? "#10B981" : "#E5E7EB",
            color: activeAccount ? "#fff" : "#9CA3AF",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            cursor: activeAccount ? "pointer" : "not-allowed",
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
                          "Ref",
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
                            <td
                              style={{
                                padding: "13px 16px",
                                fontSize: 12,
                                color: "#6B7280",
                                fontFamily: "monospace",
                              }}
                            >
                              {item.tripay_ref ?? "-"}
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
              {accounts.length === 0 ? (
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: 12,
                    padding: "40px",
                    textAlign: "center",
                    color: "#9CA3AF",
                  }}
                >
                  <p style={{ fontSize: 36, marginBottom: 12 }}>🏦</p>
                  <p style={{ fontSize: 14 }}>Belum ada rekening terdaftar</p>
                </div>
              ) : (
                accounts.map((account) => (
                  <div
                    key={account.id}
                    style={{
                      background: "#fff",
                      border: `1px solid ${account.is_active ? "#3B82F6" : "#E5E7EB"}`,
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
                          background: account.is_active ? "#EFF6FF" : "#F3F4F6",
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
                          {account.is_active && (
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
                              ★ Aktif
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
                      {!account.is_active && (
                        <button
                          onClick={() => void handleActivateAccount(account.id)}
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
                          ★ Aktifkan
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
                ))
              )}
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

          {/* ---- SETTINGS ---- */}
          {activeTab === "settings" && (
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
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
                  ⚙️ Pengaturan Penarikan
                </h3>
              </div>
              <div style={{ padding: "20px" }}>
                <WithdrawalSettingsForm
                  settings={settings}
                  onSuccess={() => void fetchAll()}
                />
              </div>
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
        activeAccount={activeAccount}
        settings={settings}
        onSuccess={() => {
          void fetchAll();
          showToast("Request penarikan berhasil dibuat");
        }}
      />
    </div>
  );
}
