import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/services/axios.config";

// ==========================================
// TYPES
// ==========================================
interface SiteConfig {
  id: string;
  brand_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  font_url: string;
  meta_title: string;
  meta_description: string;
  og_image_url: string | null;
  meta_pixel_id: string | null; // NEW
  ga4_measurement_id: string | null; // NEW
}

interface HeroSection {
  id: string;
  headline: string;
  subheadline: string | null;
  cta_text: string;
  image_url: string | null;
  bg_color: string | null;
  is_active: boolean;
  secondary_cta_text: string | null;
  secondary_cta_target: string | null;
}

interface PromoSection {
  id: string;
  badge_text: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

interface PricingItem {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  features: string[];
  is_popular: boolean;
  cta_text: string;
  is_active: boolean;
  sort_order: number;
}

interface Testimonial {
  id: string;
  customer_name: string;
  customer_photo_url: string | null;
  content: string;
  rating: number;
  testimonial_date: string | null;
  is_active: boolean;
  sort_order: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
}

interface ContactPerson {
  id: string;
  name: string;
  whatsapp_number: string | null;
  email: string | null;
  photo_url: string | null;
  cta_text: string;
  instagram_url: string | null;
  tiktok_url: string | null;
  is_active: boolean;
}

interface PainPoint {
  id: string;
  headline: string;
  items: string[];
  is_active: boolean;
  sort_order: number;
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
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
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

function SaveBtn({
  loading,
  label = "Simpan",
}: {
  loading: boolean;
  label?: string;
}) {
  return (
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
      {loading ? "⏳ Menyimpan..." : `💾 ${label}`}
    </button>
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
// IMAGE UPLOADER
// ==========================================
function ImageUploader({
  currentUrl,
  onFileChange,
  label = "Gambar",
}: {
  currentUrl: string | null | undefined;
  onFileChange: (file: File | null) => void;
  label?: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentUrl ?? null);
  }, [currentUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileChange(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div
        onClick={() => ref.current?.click()}
        style={{
          border: "2px dashed #E5E7EB",
          borderRadius: 10,
          padding: 16,
          textAlign: "center",
          cursor: "pointer",
          background: "#F9FAFB",
          transition: "border-color 0.15s",
        }}
        onMouseOver={(e) =>
          ((e.currentTarget as HTMLDivElement).style.borderColor = "#3B82F6")
        }
        onMouseOut={(e) =>
          ((e.currentTarget as HTMLDivElement).style.borderColor = "#E5E7EB")
        }
      >
        {preview ? (
          <div>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxHeight: 100,
                maxWidth: "100%",
                borderRadius: 8,
                objectFit: "cover",
                margin: "0 auto",
              }}
            />
            <p style={{ fontSize: 12, color: "#6B7280", marginTop: 8 }}>
              Klik untuk ganti
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 24, marginBottom: 6 }}>🖼️</p>
            <p style={{ fontSize: 13, color: "#6B7280" }}>Upload gambar</p>
            <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
              JPEG, PNG, WebP — maks. 5MB
            </p>
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

// ==========================================
// SITE CONFIG FORM
// ==========================================
function SiteConfigForm({ data }: { data: SiteConfig | null }) {
  const [form, setForm] = useState({
    brand_name: data?.brand_name ?? "",
    primary_color: data?.primary_color ?? "#3B82F6",
    secondary_color: data?.secondary_color ?? "#10B981",
    font_family: data?.font_family ?? "Inter",
    font_url: data?.font_url ?? "",
    meta_title: data?.meta_title ?? "",
    meta_description: data?.meta_description ?? "",
    meta_pixel_id: data?.meta_pixel_id ?? "", // NEW
    ga4_measurement_id: data?.ga4_measurement_id ?? "", // NEW
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [ogFile, setOgFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    if (data) {
      setForm({
        brand_name: data.brand_name,
        primary_color: data.primary_color,
        secondary_color: data.secondary_color,
        font_family: data.font_family,
        font_url: data.font_url,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        meta_pixel_id: data.meta_pixel_id ?? "", // NEW
        ga4_measurement_id: data.ga4_measurement_id ?? "", // NEW
      });
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logoFile) fd.append("logo", logoFile);
      if (faviconFile) fd.append("favicon", faviconFile);
      if (ogFile) fd.append("og_image", ogFile);
      await api.put("/admin/content/site-config", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAlert({ type: "success", msg: "Site config berhasil disimpan!" });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setAlert({
        type: "error",
        msg: e.response?.data?.message ?? "Gagal menyimpan",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      {alert && (
        <Alert
          type={alert.type}
          message={alert.msg}
          onClose={() => setAlert(null)}
        />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Nama Toko" required>
          <input
            style={inputStyle}
            value={form.brand_name}
            onChange={(e) =>
              setForm((p) => ({ ...p, brand_name: e.target.value }))
            }
            required
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <Field label="Meta Title">
          <input
            style={inputStyle}
            value={form.meta_title}
            onChange={(e) =>
              setForm((p) => ({ ...p, meta_title: e.target.value }))
            }
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <Field label="Warna Utama">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="color"
              value={form.primary_color}
              onChange={(e) =>
                setForm((p) => ({ ...p, primary_color: e.target.value }))
              }
              style={{
                width: 40,
                height: 36,
                border: "none",
                cursor: "pointer",
                borderRadius: 6,
              }}
            />
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={form.primary_color}
              onChange={(e) =>
                setForm((p) => ({ ...p, primary_color: e.target.value }))
              }
              placeholder="#3B82F6"
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </div>
        </Field>
        <Field label="Warna Sekunder">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="color"
              value={form.secondary_color}
              onChange={(e) =>
                setForm((p) => ({ ...p, secondary_color: e.target.value }))
              }
              style={{
                width: 40,
                height: 36,
                border: "none",
                cursor: "pointer",
                borderRadius: 6,
              }}
            />
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={form.secondary_color}
              onChange={(e) =>
                setForm((p) => ({ ...p, secondary_color: e.target.value }))
              }
              placeholder="#10B981"
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </div>
        </Field>
        <Field label="Font Family" hint="Nama font Google Fonts, misal: Inter">
          <input
            style={inputStyle}
            value={form.font_family}
            onChange={(e) =>
              setForm((p) => ({ ...p, font_family: e.target.value }))
            }
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <Field label="Font URL" hint="URL embed Google Fonts">
          <input
            style={inputStyle}
            value={form.font_url}
            onChange={(e) =>
              setForm((p) => ({ ...p, font_url: e.target.value }))
            }
            placeholder="https://fonts.googleapis.com/..."
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Meta Description">
            <textarea
              style={{ ...inputStyle, minHeight: 64, resize: "vertical" }}
              value={form.meta_description}
              onChange={(e) =>
                setForm((p) => ({ ...p, meta_description: e.target.value }))
              }
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
        </div>
      </div>

      {/* ==========================================
          NEW: Tracking / Analytics
          ========================================== */}
      <div
        style={{
          border: "1px solid #E5E7EB",
          borderRadius: 10,
          padding: "16px",
          background: "#F9FAFB",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <p
          style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: 0 }}
        >
          📊 Tracking & Analytics
        </p>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <Field
            label="Meta Pixel ID"
            hint="Dari Facebook Business Manager. Contoh: 1234567890123456"
          >
            <input
              style={inputStyle}
              value={form.meta_pixel_id}
              onChange={(e) =>
                setForm((p) => ({ ...p, meta_pixel_id: e.target.value }))
              }
              placeholder="1234567890123456"
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
          <Field
            label="GA4 Measurement ID"
            hint="Dari Google Analytics 4. Contoh: G-XXXXXXXXXX"
          >
            <input
              style={inputStyle}
              value={form.ga4_measurement_id}
              onChange={(e) =>
                setForm((p) => ({ ...p, ga4_measurement_id: e.target.value }))
              }
              placeholder="G-XXXXXXXXXX"
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
        </div>
        {(form.meta_pixel_id || form.ga4_measurement_id) && (
          <div
            style={{
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              color: "#1D4ED8",
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {form.meta_pixel_id && (
              <span>
                ✅ Meta Pixel: <strong>{form.meta_pixel_id}</strong>
              </span>
            )}
            {form.ga4_measurement_id && (
              <span>
                ✅ GA4: <strong>{form.ga4_measurement_id}</strong>
              </span>
            )}
          </div>
        )}
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}
      >
        <ImageUploader
          label="Logo"
          currentUrl={data?.logo_url}
          onFileChange={setLogoFile}
        />
        <ImageUploader
          label="Favicon"
          currentUrl={data?.favicon_url}
          onFileChange={setFaviconFile}
        />
        <ImageUploader
          label="OG Image"
          currentUrl={data?.og_image_url}
          onFileChange={setOgFile}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn loading={loading} />
      </div>
    </form>
  );
}

// ==========================================
// HERO FORM
// ==========================================
function HeroForm({ data }: { data: HeroSection | null }) {
  const [form, setForm] = useState({
    headline: data?.headline ?? "",
    subheadline: data?.subheadline ?? "",
    cta_text: data?.cta_text ?? "",
    bg_color: data?.bg_color ?? "#FFFFFF",
    is_active: data?.is_active ?? true,
    secondary_cta_text: data?.secondary_cta_text ?? "",
    secondary_cta_target: data?.secondary_cta_target ?? "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    if (data)
      setForm({
        headline: data.headline,
        subheadline: data.subheadline ?? "",
        cta_text: data.cta_text,
        bg_color: data.bg_color ?? "#FFFFFF",
        is_active: data.is_active,
        secondary_cta_text: data.secondary_cta_text ?? "",
        secondary_cta_target: data.secondary_cta_target ?? "",
      });
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const fd = new FormData();
      fd.append("headline", form.headline);
      fd.append("subheadline", form.subheadline);
      fd.append("cta_text", form.cta_text);
      fd.append("bg_color", form.bg_color);
      fd.append("is_active", String(form.is_active));
      fd.append("secondary_cta_text", form.secondary_cta_text);
      fd.append("secondary_cta_target", form.secondary_cta_target);
      if (imageFile) fd.append("image", imageFile);
      await api.put("/admin/content/hero", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAlert({ type: "success", msg: "Hero section berhasil disimpan!" });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setAlert({
        type: "error",
        msg: e.response?.data?.message ?? "Gagal menyimpan",
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
      <Field label="Headline" required>
        <input
          style={inputStyle}
          value={form.headline}
          onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))}
          required
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
        />
      </Field>
      <Field label="Subheadline">
        <textarea
          style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
          value={form.subheadline}
          onChange={(e) =>
            setForm((p) => ({ ...p, subheadline: e.target.value }))
          }
          onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
        />
      </Field>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}
      >
        <Field label="Teks CTA Utama">
          <input
            style={inputStyle}
            value={form.cta_text}
            onChange={(e) =>
              setForm((p) => ({ ...p, cta_text: e.target.value }))
            }
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <Field label="Warna Background">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="color"
              value={form.bg_color}
              onChange={(e) =>
                setForm((p) => ({ ...p, bg_color: e.target.value }))
              }
              style={{
                width: 40,
                height: 36,
                border: "none",
                cursor: "pointer",
                borderRadius: 6,
              }}
            />
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={form.bg_color}
              onChange={(e) =>
                setForm((p) => ({ ...p, bg_color: e.target.value }))
              }
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </div>
        </Field>
        <Field label="Status">
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
            style={{
              width: "100%",
              padding: "9px 12px",
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
      </div>

      <div
        style={{
          border: "1px solid #E5E7EB",
          borderRadius: 10,
          padding: "16px",
          background: "#F9FAFB",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <p
          style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: 0 }}
        >
          🔘 CTA Sekunder (opsional)
        </p>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Field
            label="Teks CTA Sekunder"
            hint="Kosongkan jika tidak ingin menampilkan tombol sekunder"
          >
            <input
              style={inputStyle}
              value={form.secondary_cta_text}
              onChange={(e) =>
                setForm((p) => ({ ...p, secondary_cta_text: e.target.value }))
              }
              placeholder="Lihat Produk"
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
          <Field
            label="Target / Anchor"
            hint="Contoh: #pricing, #produk, /track, atau URL eksternal"
          >
            <input
              style={inputStyle}
              value={form.secondary_cta_target}
              onChange={(e) =>
                setForm((p) => ({ ...p, secondary_cta_target: e.target.value }))
              }
              placeholder="#pricing"
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
        </div>
        {form.secondary_cta_text && (
          <div
            style={{
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 12,
              color: "#1D4ED8",
            }}
          >
            Preview: tombol &quot;<strong>{form.secondary_cta_text}</strong>
            &quot;
            {form.secondary_cta_target
              ? ` → mengarah ke "${form.secondary_cta_target}"`
              : " (target belum diisi)"}
          </div>
        )}
      </div>

      <ImageUploader
        label="Gambar Hero (opsional)"
        currentUrl={data?.image_url}
        onFileChange={setImageFile}
      />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn loading={loading} />
      </div>
    </form>
  );
}

// ==========================================
// PROMO FORM
// ==========================================
function PromoForm({ data }: { data: PromoSection | null }) {
  const [form, setForm] = useState({
    badge_text: data?.badge_text ?? "",
    title: data?.title ?? "",
    description: data?.description ?? "",
    start_date: data?.start_date?.slice(0, 16) ?? "",
    end_date: data?.end_date?.slice(0, 16) ?? "",
    is_active: data?.is_active ?? false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    if (data)
      setForm({
        badge_text: data.badge_text ?? "",
        title: data.title,
        description: data.description ?? "",
        start_date: data.start_date?.slice(0, 16) ?? "",
        end_date: data.end_date?.slice(0, 16) ?? "",
        is_active: data.is_active,
      });
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const fd = new FormData();
      fd.append("badge_text", form.badge_text);
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("is_active", String(form.is_active));
      if (form.start_date)
        fd.append("start_date", new Date(form.start_date).toISOString());
      if (form.end_date)
        fd.append("end_date", new Date(form.end_date).toISOString());
      if (imageFile) fd.append("image", imageFile);
      await api.put("/admin/content/promo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAlert({ type: "success", msg: "Promo section berhasil disimpan!" });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setAlert({
        type: "error",
        msg: e.response?.data?.message ?? "Gagal menyimpan",
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Badge Text">
          <input
            style={inputStyle}
            value={form.badge_text}
            onChange={(e) =>
              setForm((p) => ({ ...p, badge_text: e.target.value }))
            }
            placeholder="Promo Terbatas"
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <Field label="Judul Promo" required>
          <input
            style={inputStyle}
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <Field label="Mulai">
          <input
            type="datetime-local"
            style={inputStyle}
            value={form.start_date}
            onChange={(e) =>
              setForm((p) => ({ ...p, start_date: e.target.value }))
            }
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <Field label="Berakhir">
          <input
            type="datetime-local"
            style={inputStyle}
            value={form.end_date}
            onChange={(e) =>
              setForm((p) => ({ ...p, end_date: e.target.value }))
            }
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <div style={{ gridColumn: "1 / -1" }}>
          <Field label="Deskripsi">
            <textarea
              style={{ ...inputStyle, minHeight: 64, resize: "vertical" }}
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <ImageUploader
            label="Gambar Promo"
            currentUrl={data?.image_url}
            onFileChange={setImageFile}
          />
        </div>
        <div style={{ paddingTop: 24 }}>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
            style={{
              padding: "9px 16px",
              border: `2px solid ${form.is_active ? "#10B981" : "#E5E7EB"}`,
              borderRadius: 8,
              background: form.is_active ? "#ECFDF5" : "#F9FAFB",
              color: form.is_active ? "#065F46" : "#6B7280",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {form.is_active ? "✅ Aktif" : "⏸️ Nonaktif"}
          </button>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn loading={loading} />
      </div>
    </form>
  );
}

// ==========================================
// PRICING MANAGER
// ==========================================
function PricingManager() {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get<{ data: PricingItem[] }>(
        "/admin/content/pricing",
      );
      setItems(res.data.data);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pricing ini?")) return;
    try {
      await api.delete(`/admin/content/pricing/${id}`);
      setAlert({ type: "success", msg: "Pricing dihapus" });
      void fetch();
    } catch {
      setAlert({ type: "error", msg: "Gagal menghapus" });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.msg}
          onClose={() => setAlert(null)}
        />
      )}
      {loading ? (
        <p style={{ color: "#9CA3AF", fontSize: 14 }}>Memuat...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item) => (
            <div key={item.id}>
              {editingId === item.id ? (
                <PricingForm
                  data={item}
                  onSuccess={() => {
                    setEditingId(null);
                    setAlert({ type: "success", msg: "Pricing diperbarui" });
                    void fetch();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  style={{
                    background: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: 10,
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      <p style={{ fontWeight: 700, fontSize: 14 }}>
                        {item.name}
                      </p>
                      {item.is_popular && (
                        <span
                          style={{
                            fontSize: 11,
                            background: "#DBEAFE",
                            color: "#1D4ED8",
                            padding: "1px 8px",
                            borderRadius: 99,
                            fontWeight: 700,
                          }}
                        >
                          Popular
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 11,
                          background: item.is_active ? "#D1FAE5" : "#F3F4F6",
                          color: item.is_active ? "#065F46" : "#6B7280",
                          padding: "1px 8px",
                          borderRadius: 99,
                          fontWeight: 700,
                        }}
                      >
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>
                      Rp {item.price.toLocaleString("id-ID")} ·{" "}
                      {item.features.length} fitur · sort: {item.sort_order}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => setEditingId(item.id)}
                      style={{
                        padding: "5px 12px",
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
                      onClick={() => void handleDelete(item.id)}
                      style={{
                        padding: "5px 12px",
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
              )}
            </div>
          ))}
          {showAdd ? (
            <PricingForm
              data={null}
              onSuccess={() => {
                setShowAdd(false);
                setAlert({ type: "success", msg: "Pricing ditambahkan" });
                void fetch();
              }}
              onCancel={() => setShowAdd(false)}
            />
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              style={{
                padding: "10px",
                border: "2px dashed #E5E7EB",
                borderRadius: 10,
                background: "transparent",
                color: "#6B7280",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ➕ Tambah Paket Pricing
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PricingForm({
  data,
  onSuccess,
  onCancel,
}: {
  data: PricingItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: data?.name ?? "",
    price: data ? String(data.price) : "",
    original_price: data?.original_price ? String(data.original_price) : "",
    features: data?.features.join("\n") ?? "",
    is_popular: data?.is_popular ?? false,
    cta_text: data?.cta_text ?? "Pilih Paket",
    is_active: data?.is_active ?? true,
    sort_order: data ? String(data.sort_order) : "0",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = {
        name: form.name,
        price: Number(form.price),
        original_price: form.original_price
          ? Number(form.original_price)
          : undefined,
        features: form.features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        is_popular: form.is_popular,
        cta_text: form.cta_text,
        is_active: form.is_active,
        sort_order: Number(form.sort_order),
      };
      if (data) {
        await api.put(`/admin/content/pricing/${data.id}`, body);
      } else {
        await api.post("/admin/content/pricing", body);
      }
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#EFF6FF",
        border: "1px solid #BFDBFE",
        borderRadius: 10,
        padding: 16,
      }}
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <Field label="Nama Paket" required>
            <input
              style={inputStyle}
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
          <Field label="Teks CTA">
            <input
              style={inputStyle}
              value={form.cta_text}
              onChange={(e) =>
                setForm((p) => ({ ...p, cta_text: e.target.value }))
              }
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
          <Field label="Harga" required>
            <input
              type="number"
              min={0}
              style={inputStyle}
              value={form.price}
              onChange={(e) =>
                setForm((p) => ({ ...p, price: e.target.value }))
              }
              required
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
          <Field label="Harga Coret">
            <input
              type="number"
              min={0}
              style={inputStyle}
              value={form.original_price}
              onChange={(e) =>
                setForm((p) => ({ ...p, original_price: e.target.value }))
              }
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
          <Field label="Sort Order">
            <input
              type="number"
              min={0}
              style={inputStyle}
              value={form.sort_order}
              onChange={(e) =>
                setForm((p) => ({ ...p, sort_order: e.target.value }))
              }
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
          <Field label="Opsi">
            <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, is_popular: !p.is_popular }))
                }
                style={{
                  padding: "6px 12px",
                  border: `2px solid ${form.is_popular ? "#3B82F6" : "#E5E7EB"}`,
                  borderRadius: 8,
                  background: form.is_popular ? "#DBEAFE" : "#fff",
                  color: form.is_popular ? "#1D4ED8" : "#6B7280",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ⭐ Popular
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, is_active: !p.is_active }))
                }
                style={{
                  padding: "6px 12px",
                  border: `2px solid ${form.is_active ? "#10B981" : "#E5E7EB"}`,
                  borderRadius: 8,
                  background: form.is_active ? "#ECFDF5" : "#fff",
                  color: form.is_active ? "#065F46" : "#6B7280",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ✅ Aktif
              </button>
            </div>
          </Field>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Fitur (satu per baris)" required>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                value={form.features}
                onChange={(e) =>
                  setForm((p) => ({ ...p, features: e.target.value }))
                }
                placeholder={"Fitur A\nFitur B\nFitur C"}
                required
                onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
              />
            </Field>
          </div>
        </div>
        {error && <p style={{ fontSize: 13, color: "#DC2626" }}>❌ {error}</p>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#6B7280",
              cursor: "pointer",
            }}
          >
            Batal
          </button>
          <SaveBtn loading={loading} label={data ? "Simpan" : "Tambah"} />
        </div>
      </form>
    </div>
  );
}

// ==========================================
// TESTIMONIAL MANAGER
// ==========================================
function TestimonialManager() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get<{ data: Testimonial[] }>(
        "/admin/content/testimonials",
      );
      setItems(res.data.data);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus testimoni ini?")) return;
    try {
      await api.delete(`/admin/content/testimonials/${id}`);
      setAlert({ type: "success", msg: "Testimoni dihapus" });
      void fetch();
    } catch {
      setAlert({ type: "error", msg: "Gagal menghapus" });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.msg}
          onClose={() => setAlert(null)}
        />
      )}
      {loading ? (
        <p style={{ color: "#9CA3AF", fontSize: 14 }}>Memuat...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item) => (
            <div key={item.id}>
              {editingId === item.id ? (
                <TestimonialForm
                  data={item}
                  onSuccess={() => {
                    setEditingId(null);
                    setAlert({ type: "success", msg: "Testimoni diperbarui" });
                    void fetch();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  style={{
                    background: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: 10,
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    {item.customer_photo_url && (
                      <img
                        src={item.customer_photo_url}
                        alt={item.customer_name}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>
                        {item.customer_name}{" "}
                        <span style={{ color: "#F59E0B" }}>
                          {"★".repeat(item.rating)}
                        </span>
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#6B7280",
                          marginTop: 1,
                          maxWidth: 300,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.content}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => setEditingId(item.id)}
                      style={{
                        padding: "5px 12px",
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
                      onClick={() => void handleDelete(item.id)}
                      style={{
                        padding: "5px 12px",
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
              )}
            </div>
          ))}
          {showAdd ? (
            <TestimonialForm
              data={null}
              onSuccess={() => {
                setShowAdd(false);
                setAlert({ type: "success", msg: "Testimoni ditambahkan" });
                void fetch();
              }}
              onCancel={() => setShowAdd(false)}
            />
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              style={{
                padding: "10px",
                border: "2px dashed #E5E7EB",
                borderRadius: 10,
                background: "transparent",
                color: "#6B7280",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ➕ Tambah Testimoni
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function TestimonialForm({
  data,
  onSuccess,
  onCancel,
}: {
  data: Testimonial | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    customer_name: data?.customer_name ?? "",
    content: data?.content ?? "",
    rating: data?.rating ?? 5,
    testimonial_date: data?.testimonial_date?.slice(0, 10) ?? "",
    is_active: data?.is_active ?? true,
    sort_order: data ? String(data.sort_order) : "0",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("customer_name", form.customer_name);
      fd.append("content", form.content);
      fd.append("rating", String(form.rating));
      fd.append("is_active", String(form.is_active));
      fd.append("sort_order", form.sort_order);
      if (form.testimonial_date)
        fd.append("testimonial_date", form.testimonial_date);
      if (photoFile) fd.append("image", photoFile);
      if (data) {
        await api.put(`/admin/content/testimonials/${data.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/admin/content/testimonials", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#F0FDF4",
        border: "1px solid #6EE7B7",
        borderRadius: 10,
        padding: 16,
      }}
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <Field label="Nama Customer" required>
            <input
              style={inputStyle}
              value={form.customer_name}
              onChange={(e) =>
                setForm((p) => ({ ...p, customer_name: e.target.value }))
              }
              required
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
          <Field label="Rating">
            <select
              style={inputStyle}
              value={form.rating}
              onChange={(e) =>
                setForm((p) => ({ ...p, rating: Number(e.target.value) }))
              }
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} ★
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tanggal">
            <input
              type="date"
              style={inputStyle}
              value={form.testimonial_date}
              onChange={(e) =>
                setForm((p) => ({ ...p, testimonial_date: e.target.value }))
              }
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
          <Field label="Sort Order">
            <input
              type="number"
              min={0}
              style={inputStyle}
              value={form.sort_order}
              onChange={(e) =>
                setForm((p) => ({ ...p, sort_order: e.target.value }))
              }
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
          <div style={{ gridColumn: "1 / -1" }}>
            <Field label="Konten" required>
              <textarea
                style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
                value={form.content}
                onChange={(e) =>
                  setForm((p) => ({ ...p, content: e.target.value }))
                }
                required
                onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
              />
            </Field>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <ImageUploader
              label="Foto Customer"
              currentUrl={data?.customer_photo_url}
              onFileChange={setPhotoFile}
            />
          </div>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
            style={{
              padding: "9px 14px",
              border: `2px solid ${form.is_active ? "#10B981" : "#E5E7EB"}`,
              borderRadius: 8,
              background: form.is_active ? "#ECFDF5" : "#F9FAFB",
              color: form.is_active ? "#065F46" : "#6B7280",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {form.is_active ? "✅ Aktif" : "⏸️ Nonaktif"}
          </button>
        </div>
        {error && <p style={{ fontSize: 13, color: "#DC2626" }}>❌ {error}</p>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#6B7280",
              cursor: "pointer",
            }}
          >
            Batal
          </button>
          <SaveBtn loading={loading} label={data ? "Simpan" : "Tambah"} />
        </div>
      </form>
    </div>
  );
}

// ==========================================
// FAQ MANAGER
// ==========================================
function FAQManager() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get<{ data: FAQ[] }>("/admin/content/faqs");
      setItems(res.data.data);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus FAQ ini?")) return;
    try {
      await api.delete(`/admin/content/faqs/${id}`);
      setAlert({ type: "success", msg: "FAQ dihapus" });
      void fetch();
    } catch {
      setAlert({ type: "error", msg: "Gagal menghapus" });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.msg}
          onClose={() => setAlert(null)}
        />
      )}
      {loading ? (
        <p style={{ color: "#9CA3AF", fontSize: 14 }}>Memuat...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item) => (
            <div key={item.id}>
              {editingId === item.id ? (
                <FAQForm
                  data={item}
                  onSuccess={() => {
                    setEditingId(null);
                    setAlert({ type: "success", msg: "FAQ diperbarui" });
                    void fetch();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  style={{
                    background: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: 10,
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>
                      {item.question}
                    </p>
                    <p style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                      {item.answer.slice(0, 80)}
                      {item.answer.length > 80 ? "..." : ""}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => setEditingId(item.id)}
                      style={{
                        padding: "5px 12px",
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
                      onClick={() => void handleDelete(item.id)}
                      style={{
                        padding: "5px 12px",
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
              )}
            </div>
          ))}
          {showAdd ? (
            <FAQForm
              data={null}
              onSuccess={() => {
                setShowAdd(false);
                setAlert({ type: "success", msg: "FAQ ditambahkan" });
                void fetch();
              }}
              onCancel={() => setShowAdd(false)}
            />
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              style={{
                padding: "10px",
                border: "2px dashed #E5E7EB",
                borderRadius: 10,
                background: "transparent",
                color: "#6B7280",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ➕ Tambah FAQ
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FAQForm({
  data,
  onSuccess,
  onCancel,
}: {
  data: FAQ | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    question: data?.question ?? "",
    answer: data?.answer ?? "",
    is_active: data?.is_active ?? true,
    sort_order: data ? String(data.sort_order) : "0",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = {
        question: form.question,
        answer: form.answer,
        is_active: form.is_active,
        sort_order: Number(form.sort_order),
      };
      if (data) {
        await api.put(`/admin/content/faqs/${data.id}`, body);
      } else {
        await api.post("/admin/content/faqs", body);
      }
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#FFFBEB",
        border: "1px solid #FCD34D",
        borderRadius: 10,
        padding: 16,
      }}
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <Field label="Pertanyaan" required>
          <input
            style={inputStyle}
            value={form.question}
            onChange={(e) =>
              setForm((p) => ({ ...p, question: e.target.value }))
            }
            required
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <Field label="Jawaban" required>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
            value={form.answer}
            onChange={(e) => setForm((p) => ({ ...p, answer: e.target.value }))}
            required
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <div style={{ display: "flex", gap: 10 }}>
          <Field label="Sort Order">
            <input
              type="number"
              min={0}
              style={{ ...inputStyle, width: 100 }}
              value={form.sort_order}
              onChange={(e) =>
                setForm((p) => ({ ...p, sort_order: e.target.value }))
              }
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
          <div style={{ paddingTop: 24 }}>
            <button
              type="button"
              onClick={() =>
                setForm((p) => ({ ...p, is_active: !p.is_active }))
              }
              style={{
                padding: "8px 14px",
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
          </div>
        </div>
        {error && <p style={{ fontSize: 13, color: "#DC2626" }}>❌ {error}</p>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#6B7280",
              cursor: "pointer",
            }}
          >
            Batal
          </button>
          <SaveBtn loading={loading} label={data ? "Simpan" : "Tambah"} />
        </div>
      </form>
    </div>
  );
}

function PainPointManager() {
  const [items, setItems] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get<{ data: PainPoint[] }>("/admin/pain-points");
      setItems(res.data.data);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pain point ini?")) return;
    try {
      await api.delete(`/admin/pain-points/${id}`);
      setAlert({ type: "success", msg: "Pain point dihapus" });
      void fetch();
    } catch {
      setAlert({ type: "error", msg: "Gagal menghapus" });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.msg}
          onClose={() => setAlert(null)}
        />
      )}

      <div
        style={{
          background: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 13,
          color: "#1D4ED8",
        }}
      >
        💡 Tampilkan 2 pain point untuk layout dua kolom (Masalah vs Solusi).
        Item pertama = masalah (merah), item kedua = solusi (hijau).
      </div>

      {loading ? (
        <p style={{ color: "#9CA3AF", fontSize: 14 }}>Memuat...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item) => (
            <div key={item.id}>
              {editingId === item.id ? (
                <PainPointForm
                  data={item}
                  onSuccess={() => {
                    setEditingId(null);
                    setAlert({ type: "success", msg: "Pain point diperbarui" });
                    void fetch();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  style={{
                    background: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: 10,
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 4,
                      }}
                    >
                      <p style={{ fontWeight: 700, fontSize: 14 }}>
                        {item.headline}
                      </p>
                      <span
                        style={{
                          fontSize: 11,
                          background: item.is_active ? "#D1FAE5" : "#F3F4F6",
                          color: item.is_active ? "#065F46" : "#6B7280",
                          padding: "1px 8px",
                          borderRadius: 99,
                          fontWeight: 700,
                        }}
                      >
                        {item.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "#6B7280" }}>
                      {item.items.length} item · sort: {item.sort_order}
                    </p>
                    <ul
                      style={{
                        marginTop: 6,
                        paddingLeft: 0,
                        listStyle: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      {item.items.slice(0, 2).map((text, i) => (
                        <li
                          key={i}
                          style={{
                            fontSize: 12,
                            color: "#9CA3AF",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 380,
                          }}
                        >
                          • {text}
                        </li>
                      ))}
                      {item.items.length > 2 && (
                        <li style={{ fontSize: 12, color: "#9CA3AF" }}>
                          +{item.items.length - 2} lainnya...
                        </li>
                      )}
                    </ul>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => setEditingId(item.id)}
                      style={{
                        padding: "5px 12px",
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
                      onClick={() => void handleDelete(item.id)}
                      style={{
                        padding: "5px 12px",
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
              )}
            </div>
          ))}

          {showAdd ? (
            <PainPointForm
              data={null}
              onSuccess={() => {
                setShowAdd(false);
                setAlert({ type: "success", msg: "Pain point ditambahkan" });
                void fetch();
              }}
              onCancel={() => setShowAdd(false)}
            />
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              style={{
                padding: "10px",
                border: "2px dashed #E5E7EB",
                borderRadius: 10,
                background: "transparent",
                color: "#6B7280",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ➕ Tambah Pain Point
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PainPointForm({
  data,
  onSuccess,
  onCancel,
}: {
  data: PainPoint | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    headline: data?.headline ?? "",
    items: data?.items.join("\n") ?? "",
    is_active: data?.is_active ?? true,
    sort_order: data ? String(data.sort_order) : "0",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = {
        headline: form.headline,
        items: form.items
          .split("\n")
          .map((i) => i.trim())
          .filter(Boolean),
        is_active: form.is_active,
        sort_order: Number(form.sort_order),
      };

      if (body.items.length === 0) {
        setError("Minimal 1 item wajib diisi");
        setLoading(false);
        return;
      }

      if (data) {
        await api.put(`/admin/pain-points/${data.id}`, body);
      } else {
        await api.post("/admin/pain-points", body);
      }
      onSuccess();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#F0F9FF",
        border: "1px solid #BAE6FD",
        borderRadius: 10,
        padding: 16,
      }}
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <Field label="Headline" required>
            <input
              style={inputStyle}
              value={form.headline}
              onChange={(e) =>
                setForm((p) => ({ ...p, headline: e.target.value }))
              }
              placeholder="Masalah yang Sering Dihadapi"
              required
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
          <Field label="Sort Order">
            <input
              type="number"
              min={0}
              style={inputStyle}
              value={form.sort_order}
              onChange={(e) =>
                setForm((p) => ({ ...p, sort_order: e.target.value }))
              }
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
        </div>

        <Field
          label="Items (satu per baris)"
          required
          hint="Pisahkan setiap item dengan Enter"
        >
          <textarea
            style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
            value={form.items}
            onChange={(e) => setForm((p) => ({ ...p, items: e.target.value }))}
            placeholder={
              "Bingung mencari produk yang tepat?\nKhawatir kualitas tidak sesuai?"
            }
            required
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
            style={{
              padding: "6px 14px",
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
        </div>

        {error && <p style={{ fontSize: 13, color: "#DC2626" }}>❌ {error}</p>}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#6B7280",
              cursor: "pointer",
            }}
          >
            Batal
          </button>
          <SaveBtn loading={loading} label={data ? "Simpan" : "Tambah"} />
        </div>
      </form>
    </div>
  );
}

// ==========================================
// CONTACT PERSON FORM
// ==========================================
function ContactPersonForm({ data }: { data: ContactPerson | null }) {
  const [form, setForm] = useState({
    name: data?.name ?? "",
    whatsapp_number: data?.whatsapp_number ?? "",
    email: data?.email ?? "",
    cta_text: data?.cta_text ?? "Chat Sekarang",
    instagram_url: data?.instagram_url ?? "",
    tiktok_url: data?.tiktok_url ?? "",
    is_active: data?.is_active ?? true,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    if (data)
      setForm({
        name: data.name,
        whatsapp_number: data.whatsapp_number ?? "",
        email: data.email ?? "",
        cta_text: data.cta_text,
        instagram_url: data.instagram_url ?? "",
        tiktok_url: data.tiktok_url ?? "",
        is_active: data.is_active,
      });
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (photoFile) fd.append("image", photoFile);
      await api.put("/admin/content/contact", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAlert({ type: "success", msg: "Contact person berhasil disimpan!" });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setAlert({
        type: "error",
        msg: e.response?.data?.message ?? "Gagal menyimpan",
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Nama" required>
          <input
            style={inputStyle}
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <Field label="Nomor WhatsApp" hint="Format: 6281234567890">
          <input
            style={inputStyle}
            value={form.whatsapp_number}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                whatsapp_number: e.target.value.replace(/\D/g, ""),
              }))
            }
            placeholder="6281234567890"
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            style={inputStyle}
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <Field label="Teks CTA">
          <input
            style={inputStyle}
            value={form.cta_text}
            onChange={(e) =>
              setForm((p) => ({ ...p, cta_text: e.target.value }))
            }
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <Field label="URL Instagram">
          <input
            type="url"
            style={inputStyle}
            value={form.instagram_url}
            onChange={(e) =>
              setForm((p) => ({ ...p, instagram_url: e.target.value }))
            }
            placeholder="https://instagram.com/..."
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
        <Field label="URL TikTok">
          <input
            type="url"
            style={inputStyle}
            value={form.tiktok_url}
            onChange={(e) =>
              setForm((p) => ({ ...p, tiktok_url: e.target.value }))
            }
            placeholder="https://tiktok.com/..."
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <ImageUploader
            label="Foto"
            currentUrl={data?.photo_url}
            onFileChange={setPhotoFile}
          />
        </div>
        <button
          type="button"
          onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
          style={{
            padding: "9px 16px",
            border: `2px solid ${form.is_active ? "#10B981" : "#E5E7EB"}`,
            borderRadius: 8,
            background: form.is_active ? "#ECFDF5" : "#F9FAFB",
            color: form.is_active ? "#065F46" : "#6B7280",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {form.is_active ? "✅ Aktif" : "⏸️ Nonaktif"}
        </button>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <SaveBtn loading={loading} />
      </div>
    </form>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
interface ContentData {
  site_config: SiteConfig | null;
  hero: HeroSection | null;
  promo: PromoSection | null;
  contact_person: ContactPerson | null;
}

type TabKey =
  | "site"
  | "hero"
  | "promo"
  | "pricing"
  | "testimonials"
  | "faq"
  | "pain_points"
  | "contact";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "site", label: "Site Config", icon: "⚙️" },
  { key: "hero", label: "Hero", icon: "🏠" },
  { key: "promo", label: "Promo", icon: "🎁" },
  { key: "pricing", label: "Pricing", icon: "💰" },
  { key: "testimonials", label: "Testimoni", icon: "⭐" },
  { key: "faq", label: "FAQ", icon: "❓" },
  { key: "pain_points", label: "Pain Points", icon: "💡" },
  { key: "contact", label: "Kontak", icon: "📞" },
];

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("site");
  const [data, setData] = useState<ContentData>({
    site_config: null,
    hero: null,
    promo: null,
    contact_person: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get<{ data: ContentData }>("/admin/content");
        setData(res.data.data);
      } catch {
        /* noop */
      } finally {
        setLoading(false);
      }
    };
    void fetch();
  }, []);

  const SECTION_TITLES: Record<TabKey, { title: string; icon: string }> = {
    site: { title: "Site Configuration", icon: "⚙️" },
    hero: { title: "Hero Section", icon: "🏠" },
    promo: { title: "Promo Banner", icon: "🎁" },
    pricing: { title: "Pricing Packages", icon: "💰" },
    testimonials: { title: "Testimonials", icon: "⭐" },
    faq: { title: "FAQ", icon: "❓" },
    pain_points: { title: "Pain Points & Solusi", icon: "💡" },
    contact: { title: "Contact Person", icon: "📞" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>
          Landing Page Editor
        </h2>
        <p style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>
          Kelola konten halaman utama toko Anda
        </p>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: "4px",
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "8px 14px",
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
              transition: "all 0.15s",
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
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
            <p style={{ color: "#6B7280", fontSize: 14 }}>Memuat konten...</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : (
        <SectionCard
          title={SECTION_TITLES[activeTab].title}
          icon={SECTION_TITLES[activeTab].icon}
        >
          {activeTab === "site" && <SiteConfigForm data={data.site_config} />}
          {activeTab === "hero" && <HeroForm data={data.hero} />}
          {activeTab === "promo" && <PromoForm data={data.promo} />}
          {activeTab === "pricing" && <PricingManager />}
          {activeTab === "testimonials" && <TestimonialManager />}
          {activeTab === "faq" && <FAQManager />}
          {activeTab === "pain_points" && <PainPointManager />}
          {activeTab === "contact" && (
            <ContactPersonForm data={data.contact_person} />
          )}
        </SectionCard>
      )}
    </div>
  );
}
