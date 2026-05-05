import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/services/axios.config";

// ==========================================
// TYPES
// ==========================================
type ProductType = "PHYSICAL" | "DIGITAL" | "BOTH";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  product_type: ProductType;
  stock: number | null;
  image_url: string | null;
  download_url: string | null;
  download_expires_hours: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

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

interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ==========================================
// CONSTANTS
// ==========================================
const PRODUCT_TYPE_CONFIG: Record<
  ProductType,
  { label: string; icon: string; color: string; bg: string }
> = {
  PHYSICAL: { label: "Fisik", icon: "📦", color: "#1D4ED8", bg: "#DBEAFE" },
  DIGITAL: { label: "Digital", icon: "📥", color: "#7C3AED", bg: "#EDE9FE" },
  BOTH: {
    label: "Fisik & Digital",
    icon: "📦",
    color: "#C2410C",
    bg: "#FEF3C7",
  },
};

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
const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

// ==========================================
// MAIN PAGE
// ==========================================
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  // ---- Toast auto-dismiss ----
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ---- Fetch ----
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{
        success: boolean;
        data: Product[];
        pagination: Pagination;
      }>(`/admin/products?page=${page}&limit=10`);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setError("Gagal memuat data produk");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  // ---- Open modal ----
  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      original_price: product.original_price
        ? String(product.original_price)
        : "",
      product_type: product.product_type,
      stock: product.stock !== null ? String(product.stock) : "",
      download_url: product.download_url ?? "",
      download_expires_hours: String(product.download_expires_hours),
      is_active: product.is_active,
      sort_order: String(product.sort_order),
    });
    setImageFile(null);
    setImagePreview(product.image_url);
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditProduct(null);
    setImageFile(null);
    setImagePreview(null);
    setFormError(null);
  };

  // ---- Image change ----
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ---- Form change ----
  const handleFormChange = (
    field: keyof ProductForm,
    value: string | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError("Nama produk wajib diisi");
      return;
    }
    if (!form.price || isNaN(Number(form.price))) {
      setFormError("Harga tidak valid");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("price", form.price);
      if (form.original_price)
        formData.append("original_price", form.original_price);
      formData.append("product_type", form.product_type);
      if (form.stock !== "") formData.append("stock", form.stock);
      if (form.download_url)
        formData.append("download_url", form.download_url.trim());
      formData.append(
        "download_expires_hours",
        form.download_expires_hours || "24",
      );
      formData.append("is_active", String(form.is_active));
      formData.append("sort_order", form.sort_order || "0");
      if (imageFile) formData.append("image", imageFile);

      if (editProduct) {
        await api.put(`/admin/products/${editProduct.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setToast({ msg: "Produk berhasil diupdate", type: "success" });
      } else {
        await api.post("/admin/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setToast({ msg: "Produk berhasil ditambahkan", type: "success" });
      }

      closeModal();
      await fetchProducts();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Gagal menyimpan produk";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ---- Toggle ----
  const handleToggle = async (product: Product) => {
    try {
      await api.patch(`/admin/products/${product.id}/toggle`);
      setToast({
        msg: `Produk "${product.name}" ${product.is_active ? "dinonaktifkan" : "diaktifkan"}`,
        type: "success",
      });
      await fetchProducts();
    } catch {
      setToast({ msg: "Gagal mengubah status produk", type: "error" });
    }
  };

  // ---- Delete ----
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/products/${deleteId}`);
      setToast({ msg: "Produk berhasil dihapus", type: "success" });
      setDeleteId(null);
      await fetchProducts();
    } catch {
      setToast({ msg: "Gagal menghapus produk", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const isDigitalOrBoth =
    form.product_type === "DIGITAL" || form.product_type === "BOTH";
  const isPhysicalOrBoth =
    form.product_type === "PHYSICAL" || form.product_type === "BOTH";

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ---- Toast ---- */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: 10,
            background: toast.type === "success" ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${toast.type === "success" ? "#6EE7B7" : "#FCA5A5"}`,
            color: toast.type === "success" ? "#065F46" : "#DC2626",
            fontSize: 14,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            maxWidth: 360,
            animation: "slideIn 0.2s ease",
          }}
        >
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
        </div>
      )}

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
            Manajemen Produk
          </h1>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>
            Total {pagination.total} produk
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            background: "#1D4ED8",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          + Tambah Produk
        </button>
      </div>

      {/* ---- Product Grid ---- */}
      {loading ? (
        <ProductSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void fetchProducts()} />
      ) : products.length === 0 ? (
        <EmptyState onAdd={openCreate} />
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {products.map((product) => {
              const typeCfg = PRODUCT_TYPE_CONFIG[product.product_type];
              return (
                <div
                  key={product.id}
                  style={{
                    background: "#fff",
                    border: `1px solid ${product.is_active ? "#E5E7EB" : "#F3F4F6"}`,
                    borderRadius: 12,
                    overflow: "hidden",
                    opacity: product.is_active ? 1 : 0.65,
                    transition: "box-shadow 0.15s",
                  }}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.08)")
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.boxShadow =
                      "none")
                  }
                >
                  {/* Image */}
                  <div
                    style={{
                      height: 160,
                      background: "#F9FAFB",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 40,
                          color: "#D1D5DB",
                        }}
                      >
                        {typeCfg.icon}
                      </div>
                    )}
                    {/* Type badge */}
                    <span
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        fontSize: 11,
                        fontWeight: 700,
                        color: typeCfg.color,
                        background: typeCfg.bg,
                        padding: "3px 8px",
                        borderRadius: 99,
                      }}
                    >
                      {typeCfg.icon} {typeCfg.label}
                    </span>
                    {/* Active badge */}
                    {!product.is_active && (
                      <span
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#6B7280",
                          background: "#F3F4F6",
                          border: "1px solid #D1D5DB",
                          padding: "3px 8px",
                          borderRadius: 99,
                        }}
                      >
                        Nonaktif
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: "16px" }}>
                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#111827",
                        marginBottom: 4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {product.name}
                    </h3>
                    {product.description && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "#9CA3AF",
                          marginBottom: 10,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {product.description}
                      </p>
                    )}

                    {/* Price */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 17,
                          fontWeight: 800,
                          color: "#1D4ED8",
                        }}
                      >
                        {formatRupiah(product.price)}
                      </span>
                      {product.original_price && (
                        <span
                          style={{
                            fontSize: 12,
                            color: "#9CA3AF",
                            textDecoration: "line-through",
                          }}
                        >
                          {formatRupiah(product.original_price)}
                        </span>
                      )}
                    </div>

                    {/* Stock */}
                    <p
                      style={{
                        fontSize: 12,
                        color: "#6B7280",
                        marginBottom: 14,
                      }}
                    >
                      {product.stock === null
                        ? "📦 Stok: Unlimited"
                        : product.stock === 0
                          ? "❌ Stok habis"
                          : `📦 Stok: ${product.stock}`}
                    </p>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => openEdit(product)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          background: "#EFF6FF",
                          color: "#1D4ED8",
                          border: "1px solid #BFDBFE",
                          borderRadius: 7,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => void handleToggle(product)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          background: product.is_active ? "#F3F4F6" : "#ECFDF5",
                          color: product.is_active ? "#6B7280" : "#065F46",
                          border: `1px solid ${product.is_active ? "#E5E7EB" : "#6EE7B7"}`,
                          borderRadius: 7,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {product.is_active ? "⏸ Nonaktif" : "▶ Aktifkan"}
                      </button>
                      <button
                        onClick={() => setDeleteId(product.id)}
                        style={{
                          padding: "8px 12px",
                          background: "#FEF2F2",
                          color: "#DC2626",
                          border: "1px solid #FCA5A5",
                          borderRadius: 7,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <PageBtn
                label="←"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              />
              {Array.from(
                { length: pagination.total_pages },
                (_, i) => i + 1,
              ).map((p) => (
                <PageBtn
                  key={p}
                  label={String(p)}
                  active={p === page}
                  onClick={() => setPage(p)}
                />
              ))}
              <PageBtn
                label="→"
                disabled={page === pagination.total_pages}
                onClick={() => setPage((p) => p + 1)}
              />
            </div>
          )}
        </>
      )}

      {/* ==========================================
          PRODUCT FORM MODAL
      ========================================== */}
      {modalOpen && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "24px 16px",
            overflowY: "auto",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 560,
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
              marginBottom: 24,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 24px",
                borderBottom: "1px solid #E5E7EB",
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 1,
                borderRadius: "16px 16px 0 0",
              }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 700 }}>
                {editProduct ? "Edit Produk" : "Tambah Produk Baru"}
              </h3>
              <button
                onClick={closeModal}
                disabled={saving}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  background: "#F9FAFB",
                  fontSize: 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => void handleSubmit(e)}
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              {/* Image upload */}
              <div>
                <label style={labelStyle}>Gambar Produk</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed #D1D5DB",
                    borderRadius: 10,
                    height: imagePreview ? "auto" : 120,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: imagePreview ? "flex-start" : "center",
                    gap: 8,
                    cursor: "pointer",
                    background: "#F9FAFB",
                    overflow: "hidden",
                    transition: "border-color 0.15s",
                  }}
                  onMouseOver={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.borderColor =
                      "#3B82F6")
                  }
                  onMouseOut={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.borderColor =
                      "#D1D5DB")
                  }
                >
                  {imagePreview ? (
                    <div style={{ position: "relative", width: "100%" }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: 180,
                          objectFit: "cover",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0,0,0,0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "opacity 0.15s",
                        }}
                        onMouseOver={(e) =>
                          ((e.currentTarget as HTMLDivElement).style.opacity =
                            "1")
                        }
                        onMouseOut={(e) =>
                          ((e.currentTarget as HTMLDivElement).style.opacity =
                            "0")
                        }
                      >
                        <p
                          style={{
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          🖼️ Ganti Gambar
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: 28 }}>🖼️</span>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#6B7280",
                          textAlign: "center",
                        }}
                      >
                        Klik untuk upload gambar
                      </p>
                      <p style={{ fontSize: 11, color: "#9CA3AF" }}>
                        JPEG, PNG, WebP — maks 5MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>

              {/* Nama */}
              <Field label="Nama Produk" required>
                <input
                  style={inputStyle}
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="Nama produk"
                  required
                />
              </Field>

              {/* Deskripsi */}
              <Field label="Deskripsi">
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                  value={form.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  placeholder="Deskripsi singkat produk..."
                />
              </Field>

              {/* Tipe produk */}
              <Field label="Tipe Produk" required>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["PHYSICAL", "DIGITAL", "BOTH"] as ProductType[]).map(
                    (type) => {
                      const cfg = PRODUCT_TYPE_CONFIG[type];
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleFormChange("product_type", type)}
                          style={{
                            flex: 1,
                            padding: "9px 8px",
                            border: `2px solid ${form.product_type === type ? cfg.color : "#E5E7EB"}`,
                            borderRadius: 8,
                            background:
                              form.product_type === type ? cfg.bg : "#fff",
                            color:
                              form.product_type === type
                                ? cfg.color
                                : "#6B7280",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            textAlign: "center",
                          }}
                        >
                          {cfg.icon} {cfg.label}
                        </button>
                      );
                    },
                  )}
                </div>
              </Field>

              {/* Harga */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="Harga Jual" required>
                  <div style={{ position: "relative" }}>
                    <span style={prefixStyle}>Rp</span>
                    <input
                      style={{ ...inputStyle, paddingLeft: 36 }}
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={(e) =>
                        handleFormChange("price", e.target.value)
                      }
                      placeholder="0"
                      required
                    />
                  </div>
                </Field>
                <Field label="Harga Coret">
                  <div style={{ position: "relative" }}>
                    <span style={prefixStyle}>Rp</span>
                    <input
                      style={{ ...inputStyle, paddingLeft: 36 }}
                      type="number"
                      min="0"
                      value={form.original_price}
                      onChange={(e) =>
                        handleFormChange("original_price", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                </Field>
              </div>

              {/* Stok — hanya untuk PHYSICAL / BOTH */}
              {isPhysicalOrBoth && (
                <Field label="Stok" required={false}>
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => handleFormChange("stock", e.target.value)}
                    placeholder="Kosongkan jika unlimited"
                  />
                </Field>
              )}

              {/* Download — hanya untuk DIGITAL / BOTH */}
              {isDigitalOrBoth && (
                <>
                  <Field
                    label="URL Download"
                    required={form.product_type === "DIGITAL"}
                  >
                    <input
                      style={inputStyle}
                      type="url"
                      value={form.download_url}
                      onChange={(e) =>
                        handleFormChange("download_url", e.target.value)
                      }
                      placeholder="https://..."
                    />
                  </Field>
                  <Field label="Link Aktif (jam)">
                    <input
                      style={inputStyle}
                      type="number"
                      min="1"
                      max="8760"
                      value={form.download_expires_hours}
                      onChange={(e) =>
                        handleFormChange(
                          "download_expires_hours",
                          e.target.value,
                        )
                      }
                      placeholder="24"
                    />
                  </Field>
                </>
              )}

              {/* Sort order + Aktif */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <Field label="Urutan Tampil">
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    value={form.sort_order}
                    onChange={(e) =>
                      handleFormChange("sort_order", e.target.value)
                    }
                    placeholder="0"
                  />
                </Field>
                <Field label="Status">
                  <button
                    type="button"
                    onClick={() =>
                      handleFormChange("is_active", !form.is_active)
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: `1px solid ${form.is_active ? "#6EE7B7" : "#E5E7EB"}`,
                      borderRadius: 8,
                      background: form.is_active ? "#ECFDF5" : "#F9FAFB",
                      color: form.is_active ? "#065F46" : "#6B7280",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {form.is_active ? "✅ Aktif" : "⏸ Nonaktif"}
                  </button>
                </Field>
              </div>

              {formError && (
                <div
                  style={{
                    background: "#FEF2F2",
                    border: "1px solid #FCA5A5",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#DC2626",
                    fontSize: 13,
                  }}
                >
                  ❌ {formError}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "11px",
                    background: "transparent",
                    color: "#6B7280",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 2,
                    padding: "11px",
                    background: saving ? "#E5E7EB" : "#1D4ED8",
                    color: saving ? "#9CA3AF" : "#fff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving
                    ? "⏳ Menyimpan..."
                    : editProduct
                      ? "💾 Simpan Perubahan"
                      : "➕ Tambah Produk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          DELETE CONFIRM MODAL
      ========================================== */}
      {deleteId && (
        <div
          onClick={() => {
            if (!deleting) setDeleteId(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 380,
              padding: "28px 24px",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                margin: "0 auto 16px",
              }}
            >
              🗑️
            </div>
            <h3
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#111827",
                marginBottom: 8,
              }}
            >
              Hapus Produk?
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "#6B7280",
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              Produk yang dihapus tidak bisa dikembalikan. Data order yang sudah
              ada tidak terpengaruh.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: "transparent",
                  color: "#6B7280",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: deleting ? "not-allowed" : "pointer",
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
                  background: deleting ? "#E5E7EB" : "#DC2626",
                  color: deleting ? "#9CA3AF" : "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: deleting ? "not-allowed" : "pointer",
                }}
              >
                {deleting ? "⏳ Menghapus..." : "🗑️ Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 1; }
      `}</style>
    </div>
  );
}

// ==========================================
// STYLE CONSTANTS
// ==========================================
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  background: "#fff",
  color: "#111827",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};

const prefixStyle: React.CSSProperties = {
  position: "absolute",
  left: 12,
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: 13,
  color: "#6B7280",
  fontWeight: 600,
  pointerEvents: "none",
};

// ==========================================
// SUB COMPONENTS
// ==========================================
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

function ProductSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 16,
      }}
    >
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: 160,
              background: "#F3F4F6",
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
          <div
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {[100, 160, 80].map((w, j) => (
              <div
                key={j}
                style={{
                  height: 14,
                  width: w,
                  borderRadius: 6,
                  background: "#F3F4F6",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            ))}
          </div>
        </div>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
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
        background: "#FEF2F2",
        border: "1px solid #FCA5A5",
        borderRadius: 12,
        padding: "32px",
        textAlign: "center",
      }}
    >
      <p style={{ color: "#DC2626", fontSize: 15, marginBottom: 12 }}>
        ❌ {message}
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

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: "64px 32px",
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: 48 }}>📦</span>
      <p
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#374151",
          margin: "12px 0 6px",
        }}
      >
        Belum ada produk
      </p>
      <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 20 }}>
        Tambahkan produk pertama Anda sekarang
      </p>
      <button
        onClick={onAdd}
        style={{
          padding: "10px 24px",
          background: "#1D4ED8",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        + Tambah Produk
      </button>
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
        background: active ? "#1D4ED8" : disabled ? "#F9FAFB" : "#fff",
        color: active ? "#fff" : disabled ? "#D1D5DB" : "#374151",
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );
}
