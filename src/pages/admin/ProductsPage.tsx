import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/services/axios.config";
import type { Product } from "@/types/product.types";
import Modal from "@/components/common/Modal";

// ==========================================
// TYPES
// ==========================================
type ProductType = "PHYSICAL" | "DIGITAL" | "BOTH";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  original_price: string;
  product_type: ProductType;
  stock: string;
  download_url: string;
  download_expires_hours: string;
  is_active: boolean;
  sort_order: string;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  price: "",
  original_price: "",
  product_type: "PHYSICAL",
  stock: "",
  download_url: "",
  download_expires_hours: "24",
  is_active: true,
  sort_order: "0",
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

const TYPE_STYLE: Record<
  ProductType,
  { label: string; color: string; bg: string }
> = {
  PHYSICAL: { label: "📦 Fisik", color: "#1D4ED8", bg: "#DBEAFE" },
  DIGITAL: { label: "📥 Digital", color: "#7C3AED", bg: "#EDE9FE" },
  BOTH: { label: "📦+📥 Keduanya", color: "#B45309", bg: "#FEF3C7" },
};

// ==========================================
// API FUNCTIONS
// ==========================================
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

const LIMIT = 10;

const adminGetProducts = async (page = 1, limit = LIMIT) => {
  const res = await api.get<PaginatedResponse<Product>>(
    `/admin/products?page=${page}&limit=${limit}`,
  );
  return res.data;
};

const adminCreateProduct = async (formData: FormData) => {
  const res = await api.post<ApiResponse<Product>>(
    "/admin/products",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return res.data.data;
};

const adminUpdateProduct = async (id: string, formData: FormData) => {
  const res = await api.put<ApiResponse<Product>>(
    `/admin/products/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data.data;
};

const adminDeleteProduct = async (id: string) => {
  await api.delete(`/admin/products/${id}`);
};

const adminToggleProduct = async (id: string) => {
  const res = await api.patch<ApiResponse<Product>>(
    `/admin/products/${id}/toggle`,
  );
  return res.data.data;
};

// ==========================================
// FORM FIELD COMPONENTS
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
// PRODUCT FORM MODAL
// ==========================================
function ProductFormModal({
  isOpen,
  onClose,
  editProduct,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  editProduct: Product | null;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form saat edit
  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name,
        description: editProduct.description ?? "",
        price: String(editProduct.price),
        original_price: editProduct.original_price
          ? String(editProduct.original_price)
          : "",
        product_type: editProduct.product_type as ProductType,
        stock: editProduct.stock !== null ? String(editProduct.stock) : "",
        download_url: "",
        download_expires_hours: "24",
        is_active: editProduct.is_active,
        sort_order: String(editProduct.sort_order),
      });
      setImagePreview(editProduct.image_url);
    } else {
      setForm(EMPTY_FORM);
      setImagePreview(null);
    }
    setImageFile(null);
    setError(null);
  }, [editProduct, isOpen]);

  const handleChange = (field: keyof ProductForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Nama produk wajib diisi");
      return;
    }
    if (!form.price || Number(form.price) < 0) {
      setError("Harga tidak valid");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("price", form.price);
      fd.append("product_type", form.product_type);
      fd.append("is_active", String(form.is_active));
      fd.append("sort_order", form.sort_order || "0");

      if (form.original_price) fd.append("original_price", form.original_price);

      // Stok hanya untuk PHYSICAL / BOTH
      if (
        (form.product_type === "PHYSICAL" || form.product_type === "BOTH") &&
        form.stock !== ""
      ) {
        fd.append("stock", form.stock);
      }

      // Download fields untuk DIGITAL / BOTH
      if (form.product_type === "DIGITAL" || form.product_type === "BOTH") {
        if (form.download_url.trim())
          fd.append("download_url", form.download_url.trim());
        fd.append(
          "download_expires_hours",
          form.download_expires_hours || "24",
        );
      }

      if (imageFile) fd.append("image", imageFile);

      if (editProduct) {
        await adminUpdateProduct(editProduct.id, fd);
      } else {
        await adminCreateProduct(fd);
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message ?? "Gagal menyimpan produk");
    } finally {
      setSubmitting(false);
    }
  };

  const isDigital =
    form.product_type === "DIGITAL" || form.product_type === "BOTH";
  const isPhysical =
    form.product_type === "PHYSICAL" || form.product_type === "BOTH";

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!submitting) onClose();
      }}
      title={editProduct ? "Edit Produk" : "Tambah Produk"}
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* Nama */}
        <Field label="Nama Produk" required>
          <input
            style={inputStyle}
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Nama produk"
            required
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>

        {/* Deskripsi */}
        <Field label="Deskripsi">
          <textarea
            style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Deskripsi produk (opsional)"
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
          />
        </Field>

        {/* Harga */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Field label="Harga" required>
            <input
              style={inputStyle}
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              placeholder="150000"
              required
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
          <Field label="Harga Coret (opsional)">
            <input
              style={inputStyle}
              type="number"
              min={0}
              value={form.original_price}
              onChange={(e) => handleChange("original_price", e.target.value)}
              placeholder="200000"
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
        </div>

        {/* Tipe Produk */}
        <Field label="Tipe Produk" required>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["PHYSICAL", "DIGITAL", "BOTH"] as ProductType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleChange("product_type", t)}
                style={{
                  padding: "8px 14px",
                  border: `2px solid ${form.product_type === t ? TYPE_STYLE[t].color : "#E5E7EB"}`,
                  borderRadius: 8,
                  background:
                    form.product_type === t ? TYPE_STYLE[t].bg : "#fff",
                  color:
                    form.product_type === t ? TYPE_STYLE[t].color : "#6B7280",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {TYPE_STYLE[t].label}
              </button>
            ))}
          </div>
        </Field>

        {/* Stok — hanya untuk PHYSICAL/BOTH */}
        {isPhysical && (
          <Field label="Stok (kosongkan = unlimited)">
            <input
              style={inputStyle}
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => handleChange("stock", e.target.value)}
              placeholder="Contoh: 50"
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
        )}

        {/* Download — hanya untuk DIGITAL/BOTH */}
        {isDigital && (
          <>
            <Field label="URL Download">
              <input
                style={inputStyle}
                type="url"
                value={form.download_url}
                onChange={(e) => handleChange("download_url", e.target.value)}
                placeholder="https://drive.google.com/..."
                onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
              />
              {editProduct?.product_type !== "PHYSICAL" && (
                <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                  Kosongkan jika tidak ingin mengubah URL download
                </p>
              )}
            </Field>
            <Field label="Link Aktif (jam)">
              <input
                style={inputStyle}
                type="number"
                min={1}
                max={8760}
                value={form.download_expires_hours}
                onChange={(e) =>
                  handleChange("download_expires_hours", e.target.value)
                }
                placeholder="24"
                onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
              />
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                Berapa jam link download aktif setelah pembayaran (default: 24
                jam)
              </p>
            </Field>
          </>
        )}

        {/* Gambar */}
        <Field label="Gambar Produk">
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: "2px dashed #E5E7EB",
              borderRadius: 10,
              padding: 16,
              textAlign: "center",
              cursor: "pointer",
              transition: "border-color 0.15s",
              background: "#F9FAFB",
            }}
            onMouseOver={(e) =>
              ((e.currentTarget as HTMLDivElement).style.borderColor =
                "#3B82F6")
            }
            onMouseOut={(e) =>
              ((e.currentTarget as HTMLDivElement).style.borderColor =
                "#E5E7EB")
            }
          >
            {imagePreview ? (
              <div>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxHeight: 120,
                    maxWidth: "100%",
                    borderRadius: 8,
                    objectFit: "cover",
                    margin: "0 auto",
                  }}
                />
                <p
                  style={{
                    fontSize: 12,
                    color: "#6B7280",
                    marginTop: 8,
                  }}
                >
                  Klik untuk ganti gambar
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 24, marginBottom: 8 }}>🖼️</p>
                <p style={{ fontSize: 14, color: "#6B7280" }}>
                  Klik untuk upload gambar
                </p>
                <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
                  JPEG, PNG, WebP — maks. 5MB
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
        </Field>

        {/* Sort order + Status */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <Field label="Urutan Tampil">
            <input
              style={inputStyle}
              type="number"
              min={0}
              value={form.sort_order}
              onChange={(e) => handleChange("sort_order", e.target.value)}
              placeholder="0"
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3B82F6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E7EB")}
            />
          </Field>
          <Field label="Status">
            <button
              type="button"
              onClick={() => handleChange("is_active", !form.is_active)}
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
                textAlign: "center",
              }}
            >
              {form.is_active ? "✅ Aktif" : "⏸️ Nonaktif"}
            </button>
          </Field>
        </div>

        {/* Error */}
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

        {/* Actions */}
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
              : editProduct
                ? "💾 Simpan Perubahan"
                : "➕ Tambah Produk"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ==========================================
// DELETE CONFIRM MODAL
// ==========================================
function DeleteModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!product) return;
    setDeleting(true);
    setError(null);
    try {
      await adminDeleteProduct(product.id);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message ?? "Gagal menghapus produk");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!deleting) onClose();
      }}
      title="Hapus Produk"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: 8,
            padding: "14px 16px",
          }}
        >
          <p style={{ fontSize: 14, color: "#991B1B", lineHeight: 1.6 }}>
            Hapus produk <strong>"{product?.name}"</strong>? Tindakan ini tidak
            dapat dibatalkan. Gambar produk juga akan dihapus dari storage.
          </p>
        </div>
        {error && <p style={{ fontSize: 13, color: "#DC2626" }}>❌ {error}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
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
// ADMIN PRODUCTS PAGE
// ==========================================
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: LIMIT,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Modals
  const [formModal, setFormModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Toggle loading per-product
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminGetProducts(p, LIMIT);
      setProducts(result.data);
      setPagination(result.pagination);
    } catch {
      setError("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts(page);
  }, [page, fetchProducts]);

  const handleToggle = async (product: Product) => {
    setTogglingId(product.id);
    try {
      const updated = await adminToggleProduct(product.id);
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
    } catch {
      alert("Gagal mengubah status produk");
    } finally {
      setTogglingId(null);
    }
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setFormModal(true);
  };

  const openDelete = (product: Product) => {
    setDeleteTarget(product);
    setDeleteModal(true);
  };

  const openAdd = () => {
    setEditProduct(null);
    setFormModal(true);
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
            Produk
          </h2>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 2 }}>
            {pagination.total} total produk
          </p>
        </div>
        <button
          onClick={openAdd}
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
          ➕ Tambah Produk
        </button>
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
            <p style={{ color: "#9CA3AF", fontSize: 14 }}>Memuat produk...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : error ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <p style={{ color: "#EF4444", fontSize: 14 }}>❌ {error}</p>
            <button
              onClick={() => void fetchProducts(page)}
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
        ) : products.length === 0 ? (
          <div
            style={{
              padding: "60px",
              textAlign: "center",
              color: "#9CA3AF",
              fontSize: 14,
            }}
          >
            <p style={{ fontSize: 36, marginBottom: 12 }}>📦</p>
            <p>Belum ada produk. Tambah produk pertama Anda!</p>
            <button
              onClick={openAdd}
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
              ➕ Tambah Produk
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
                    "Produk",
                    "Tipe",
                    "Harga",
                    "Stok",
                    "Urutan",
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
                {products.map((product) => {
                  const typeCfg =
                    TYPE_STYLE[product.product_type as ProductType];
                  return (
                    <tr
                      key={product.id}
                      style={{ borderBottom: "1px solid #F3F4F6" }}
                    >
                      {/* Produk */}
                      <td style={{ padding: "13px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 8,
                                objectFit: "cover",
                                flexShrink: 0,
                                border: "1px solid #E5E7EB",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 8,
                                background: "#F3F4F6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                                flexShrink: 0,
                              }}
                            >
                              📦
                            </div>
                          )}
                          <div>
                            <p
                              style={{
                                fontWeight: 600,
                                color: "#111827",
                                fontSize: 14,
                                marginBottom: 2,
                              }}
                            >
                              {product.name}
                            </p>
                            {product.description && (
                              <p
                                style={{
                                  fontSize: 12,
                                  color: "#9CA3AF",
                                  maxWidth: 200,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Tipe */}
                      <td style={{ padding: "13px 16px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 700,
                            color: typeCfg.color,
                            background: typeCfg.bg,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {typeCfg.label}
                        </span>
                      </td>

                      {/* Harga */}
                      <td
                        style={{ padding: "13px 16px", whiteSpace: "nowrap" }}
                      >
                        <p style={{ fontWeight: 700, color: "#111827" }}>
                          {formatRupiah(product.price)}
                        </p>
                        {product.original_price && (
                          <p
                            style={{
                              fontSize: 12,
                              color: "#9CA3AF",
                              textDecoration: "line-through",
                            }}
                          >
                            {formatRupiah(product.original_price)}
                          </p>
                        )}
                      </td>

                      {/* Stok */}
                      <td style={{ padding: "13px 16px" }}>
                        {product.stock === null ? (
                          <span style={{ fontSize: 13, color: "#9CA3AF" }}>
                            ∞ Unlimited
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: product.stock < 5 ? "#EF4444" : "#111827",
                            }}
                          >
                            {product.stock}
                          </span>
                        )}
                      </td>

                      {/* Sort order */}
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: 13,
                          color: "#6B7280",
                          textAlign: "center",
                        }}
                      >
                        {product.sort_order}
                      </td>

                      {/* Status toggle */}
                      <td style={{ padding: "13px 16px" }}>
                        <button
                          onClick={() => void handleToggle(product)}
                          disabled={togglingId === product.id}
                          style={{
                            padding: "4px 12px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 700,
                            border: "none",
                            cursor:
                              togglingId === product.id
                                ? "not-allowed"
                                : "pointer",
                            opacity: togglingId === product.id ? 0.6 : 1,
                            background: product.is_active
                              ? "#D1FAE5"
                              : "#F3F4F6",
                            color: product.is_active ? "#065F46" : "#6B7280",
                            transition: "all 0.15s",
                          }}
                        >
                          {togglingId === product.id
                            ? "..."
                            : product.is_active
                              ? "✅ Aktif"
                              : "⏸️ Nonaktif"}
                        </button>
                      </td>

                      {/* Aksi */}
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => openEdit(product)}
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
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => openDelete(product)}
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
            produk
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
            {Array.from(
              { length: Math.min(5, pagination.total_pages) },
              (_, i) => {
                let p: number;
                if (pagination.total_pages <= 5) p = i + 1;
                else if (page <= 3) p = i + 1;
                else if (page >= pagination.total_pages - 2)
                  p = pagination.total_pages - 4 + i;
                else p = page - 2 + i;
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

      {/* ---- Modals ---- */}
      <ProductFormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        editProduct={editProduct}
        onSuccess={() => void fetchProducts(page)}
      />
      <DeleteModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        product={deleteTarget}
        onSuccess={() => void fetchProducts(page)}
      />
    </div>
  );
}
