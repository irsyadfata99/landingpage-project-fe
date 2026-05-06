import { useState, useEffect, useCallback } from "react";
import api from "@/services/axios.config";

// ==========================================
// TYPES
// ==========================================
interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  updated_at: string;
}

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

function Alert({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        background: type === "success" ? "#ECFDF5" : "#FEF2F2",
        border: `1px solid ${type === "success" ? "#6EE7B7" : "#FCA5A5"}`,
        borderRadius: 8,
        padding: "10px 14px",
        color: type === "success" ? "#065F46" : "#DC2626",
        fontSize: 13,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span>
        {type === "success" ? "✅" : "❌"} {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "inherit",
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
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
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
          {title}
        </h3>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

// ==========================================
// CHANGE PASSWORD FORM
// ==========================================
function ChangePasswordForm() {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPwd, setShowPwd] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    if (form.new_password.length < 8)
      return setAlert({
        type: "error",
        msg: "Password baru minimal 8 karakter",
      });
    if (form.new_password !== form.confirm_password)
      return setAlert({
        type: "error",
        msg: "Konfirmasi password tidak cocok",
      });
    setLoading(true);
    try {
      await api.patch("/admin/settings/password", {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setAlert({ type: "success", msg: "Password berhasil diubah" });
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setAlert({
        type: "error",
        msg: e.response?.data?.message ?? "Gagal mengubah password",
      });
    } finally {
      setLoading(false);
    }
  };

  const PwdInput = ({
    field,
    placeholder,
    showKey,
  }: {
    field: keyof typeof form;
    placeholder: string;
    showKey: keyof typeof showPwd;
  }) => (
    <div style={{ position: "relative" }}>
      <input
        type={showPwd[showKey] ? "text" : "password"}
        style={{ ...inputStyle, paddingRight: 44 }}
        value={form[field]}
        onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
        placeholder={placeholder}
        required
        onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
      />
      <button
        type="button"
        onClick={() => setShowPwd((p) => ({ ...p, [showKey]: !p[showKey] }))}
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 16,
          color: "#9CA3AF",
        }}
      >
        {showPwd[showKey] ? "🙈" : "👁️"}
      </button>
    </div>
  );

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
        <Alert
          type={alert.type}
          message={alert.msg}
          onClose={() => setAlert(null)}
        />
      )}

      <Field label="Password Saat Ini" required>
        <PwdInput
          field="current_password"
          placeholder="Password lama"
          showKey="current"
        />
      </Field>
      <Field label="Password Baru" required hint="Minimal 8 karakter">
        <PwdInput
          field="new_password"
          placeholder="Password baru"
          showKey="new"
        />
      </Field>
      <Field label="Konfirmasi Password Baru" required>
        <PwdInput
          field="confirm_password"
          placeholder="Ulangi password baru"
          showKey="confirm"
        />
      </Field>

      {/* Strength indicator */}
      {form.new_password && (
        <div>
          <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
            {[1, 2, 3, 4].map((i) => {
              const strength = Math.min(
                4,
                [
                  form.new_password.length >= 8,
                  /[A-Z]/.test(form.new_password),
                  /[0-9]/.test(form.new_password),
                  /[^A-Za-z0-9]/.test(form.new_password),
                ].filter(Boolean).length,
              );
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 99,
                    background:
                      i <= strength
                        ? strength <= 1
                          ? "#EF4444"
                          : strength <= 2
                            ? "#F59E0B"
                            : strength <= 3
                              ? "#3B82F6"
                              : "#10B981"
                        : "#F3F4F6",
                  }}
                />
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: "#9CA3AF" }}>
            Kekuatan password: gunakan huruf besar, angka, dan karakter khusus
          </p>
        </div>
      )}

      <div
        style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}
      >
        <button
          type="submit"
          disabled={
            loading ||
            !form.current_password ||
            !form.new_password ||
            !form.confirm_password
          }
          style={{
            padding: "10px 24px",
            background: "#3B82F6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
            opacity:
              loading ||
              !form.current_password ||
              !form.new_password ||
              !form.confirm_password
                ? 0.7
                : 1,
          }}
        >
          {loading ? "⏳ Menyimpan..." : "🔒 Ubah Password"}
        </button>
      </div>
    </form>
  );
}

// ==========================================
// EMAIL TEMPLATE EDITOR
// ==========================================
function EmailTemplateEditor({
  template,
  onSuccess,
}: {
  template: EmailTemplate;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    subject: template.subject,
    body: template.body,
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const insertVariable = (variable: string) => {
    setForm((p) => ({ ...p, body: p.body + `{{${variable}}}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setLoading(true);
    try {
      await api.put(`/admin/settings/email-templates/${template.id}`, form);
      setAlert({ type: "success", msg: "Template berhasil disimpan!" });
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setAlert({
        type: "error",
        msg: e.response?.data?.message ?? "Gagal menyimpan template",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      {alert && (
        <Alert
          type={alert.type}
          message={alert.msg}
          onClose={() => setAlert(null)}
        />
      )}

      <Field label="Subject Email" required>
        <input
          style={inputStyle}
          value={form.subject}
          onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
          required
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
        />
      </Field>

      {/* Variables */}
      {template.variables.length > 0 && (
        <div>
          <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
            Variabel tersedia (klik untuk insert):
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {template.variables.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => insertVariable(v)}
                style={{
                  padding: "4px 10px",
                  background: "#EFF6FF",
                  color: "#1D4ED8",
                  border: "1px solid #BFDBFE",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "monospace",
                }}
              >
                {`{{${v}}}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toggle preview */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <label style={{ ...labelStyle, marginBottom: 0 }}>
          Isi Email (HTML diizinkan)
        </label>
        <button
          type="button"
          onClick={() => setPreviewMode((p) => !p)}
          style={{
            padding: "4px 12px",
            background: previewMode ? "#3B82F6" : "#F3F4F6",
            color: previewMode ? "#fff" : "#374151",
            border: "1px solid #E5E7EB",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {previewMode ? "✏️ Edit" : "👁️ Preview"}
        </button>
      </div>

      {previewMode ? (
        <div
          style={{
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            padding: 16,
            minHeight: 200,
            background: "#fff",
            fontSize: 14,
            lineHeight: 1.7,
          }}
          dangerouslySetInnerHTML={{ __html: form.body }}
        />
      ) : (
        <textarea
          style={{
            ...inputStyle,
            minHeight: 220,
            resize: "vertical",
            fontFamily: "monospace",
            fontSize: 13,
          }}
          value={form.body}
          onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
          required
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
        />
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "9px 20px",
            background: "#3B82F6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "⏳ Menyimpan..." : "💾 Simpan Template"}
        </button>
      </div>
    </form>
  );
}

// ==========================================
// EMAIL TEMPLATES SECTION
// ==========================================
function EmailTemplatesSection() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: EmailTemplate[] }>(
        "/admin/settings/email-templates",
      );
      setTemplates(res.data.data);
      if (res.data.data.length > 0 && !activeTemplate) {
        setActiveTemplate(res.data.data[0].id);
      }
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, [activeTemplate]);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div
          style={{
            width: 28,
            height: 28,
            border: "3px solid #E5E7EB",
            borderTopColor: "#3B82F6",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px",
          }}
        />
        <p style={{ color: "#9CA3AF", fontSize: 14 }}>Memuat template...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>
        <p style={{ fontSize: 36, marginBottom: 12 }}>📧</p>
        <p style={{ fontSize: 14 }}>
          Belum ada template email terdaftar di server
        </p>
      </div>
    );
  }

  const current = templates.find((t) => t.id === activeTemplate);

  return (
    <div style={{ display: "flex", gap: 20 }}>
      {/* Template list */}
      <div style={{ width: 220, flexShrink: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTemplate(t.id)}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "none",
                textAlign: "left",
                background: activeTemplate === t.id ? "#EFF6FF" : "transparent",
                color: activeTemplate === t.id ? "#1D4ED8" : "#374151",
                fontSize: 13,
                fontWeight: activeTemplate === t.id ? 700 : 500,
                cursor: "pointer",
              }}
            >
              📧 {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1 }}>
        {current ? (
          <EmailTemplateEditor
            key={current.id}
            template={current}
            onSuccess={() => void fetchTemplates()}
          />
        ) : (
          <p
            style={{
              color: "#9CA3AF",
              fontSize: 14,
              textAlign: "center",
              paddingTop: 40,
            }}
          >
            Pilih template di sebelah kiri
          </p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
type TabKey = "password" | "email";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "password", label: "Ganti Password", icon: "🔒" },
  { key: "email", label: "Template Email", icon: "📧" },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("password");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>
          Pengaturan
        </h2>
        <p style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>
          Konfigurasi akun dan template komunikasi
        </p>
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

      {/* Content */}
      {activeTab === "password" && (
        <SectionCard title="Ganti Password Admin" icon="🔒">
          <ChangePasswordForm />
        </SectionCard>
      )}

      {activeTab === "email" && (
        <SectionCard title="Template Email" icon="📧">
          <p
            style={{
              fontSize: 13,
              color: "#6B7280",
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            Kelola template email yang dikirim ke customer. Gunakan variabel
            yang tersedia untuk personalisasi pesan.
          </p>
          <EmailTemplatesSection />
        </SectionCard>
      )}
    </div>
  );
}
