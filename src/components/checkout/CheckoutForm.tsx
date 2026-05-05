import type { Product } from "@/types/product.types";
import type { Expedition } from "@/types/content.types";

interface CartItem {
  product: Product;
  quantity: number;
}

interface FormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_province: string;
  customer_postal_code: string;
  payment_method: "bank_transfer" | "qris";
  bank: "bca" | "bni" | "bri" | "mandiri" | "";
  expedition_id: string;
  notes: string;
  no_cancel_ack: boolean;
}

interface CheckoutFormProps {
  formData: FormData;
  cartItems: CartItem[];
  products: Product[];
  expeditions: Expedition[];
  hasPhysical: boolean;
  loading: boolean;
  error: string | null;
  onChange: (field: keyof FormData, value: string | boolean) => void;
  onQuantityChange: (productId: string, qty: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const BANKS = [
  { value: "bca", label: "BCA" },
  { value: "bni", label: "BNI" },
  { value: "bri", label: "BRI" },
  { value: "mandiri", label: "Mandiri" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.15s",
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text)",
  marginBottom: 6,
};

const FieldGroup = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <label style={labelStyle}>
      {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
    </label>
    {children}
  </div>
);

export default function CheckoutForm({
  formData,
  cartItems,
  products,
  expeditions,
  hasPhysical,
  loading,
  error,
  onChange,
  onQuantityChange,
  onSubmit,
}: CheckoutFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 32 }}
    >
      {/* ========== PILIH PRODUK ========== */}
      <section>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: "1px solid var(--border)",
          }}
        >
          1. Pilih Produk
        </h2>

        {products.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Tidak ada produk tersedia
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {products.map((product) => {
              const cartItem = cartItems.find(
                (c) => c.product.id === product.id,
              );
              const qty = cartItem?.quantity ?? 0;
              const isOutOfStock =
                product.stock !== null && product.stock === 0;

              return (
                <div
                  key={product.id}
                  style={{
                    border:
                      qty > 0
                        ? "2px solid var(--primary)"
                        : "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "16px",
                    background: qty > 0 ? "var(--primary-light)" : "#fff",
                    opacity: isOutOfStock ? 0.5 : 1,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                    }}
                  >
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: "var(--radius-sm)",
                          objectFit: "cover",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontWeight: 700,
                              fontSize: 15,
                              marginBottom: 2,
                            }}
                          >
                            {product.name}
                          </p>
                          {product.description && (
                            <p
                              style={{
                                fontSize: 13,
                                color: "var(--text-muted)",
                                marginBottom: 4,
                              }}
                            >
                              {product.description}
                            </p>
                          )}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 16,
                                fontWeight: 800,
                                color: "var(--primary)",
                              }}
                            >
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                              }).format(product.price)}
                            </span>
                            {product.original_price && (
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "var(--text-light)",
                                  textDecoration: "line-through",
                                }}
                              >
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                  minimumFractionDigits: 0,
                                }).format(product.original_price)}
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: 11,
                                background:
                                  product.product_type === "DIGITAL"
                                    ? "#EDE9FE"
                                    : "#DBEAFE",
                                color:
                                  product.product_type === "DIGITAL"
                                    ? "#7C3AED"
                                    : "#1D4ED8",
                                padding: "2px 8px",
                                borderRadius: "var(--radius-full)",
                                fontWeight: 600,
                              }}
                            >
                              {product.product_type === "DIGITAL"
                                ? "📥 Digital"
                                : product.product_type === "BOTH"
                                  ? "📦+📥 Fisik & Digital"
                                  : "📦 Fisik"}
                            </span>
                          </div>
                          {product.stock !== null && (
                            <p
                              style={{
                                fontSize: 12,
                                color:
                                  product.stock < 5
                                    ? "#EF4444"
                                    : "var(--text-muted)",
                                marginTop: 2,
                              }}
                            >
                              {isOutOfStock
                                ? "❌ Stok habis"
                                : `Stok: ${product.stock}`}
                            </p>
                          )}
                        </div>

                        {/* Qty control */}
                        {!isOutOfStock && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              flexShrink: 0,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                onQuantityChange(product.id, qty - 1)
                              }
                              disabled={qty === 0}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border)",
                                background: "#fff",
                                fontSize: 18,
                                cursor: qty === 0 ? "not-allowed" : "pointer",
                                opacity: qty === 0 ? 0.4 : 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              −
                            </button>
                            <span
                              style={{
                                minWidth: 24,
                                textAlign: "center",
                                fontWeight: 700,
                                fontSize: 15,
                              }}
                            >
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onQuantityChange(product.id, qty + 1)
                              }
                              disabled={
                                product.stock !== null && qty >= product.stock
                              }
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid var(--border)",
                                background: "var(--primary)",
                                color: "#fff",
                                fontSize: 18,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity:
                                  product.stock !== null && qty >= product.stock
                                    ? 0.4
                                    : 1,
                              }}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========== DATA CUSTOMER ========== */}
      <section>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: "1px solid var(--border)",
          }}
        >
          2. Data Pemesan
        </h2>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <FieldGroup label="Nama Lengkap" required>
            <input
              style={inputStyle}
              type="text"
              placeholder="Nama sesuai identitas"
              value={formData.customer_name}
              onChange={(e) => onChange("customer_name", e.target.value)}
              required
            />
          </FieldGroup>

          <FieldGroup label="Email" required>
            <input
              style={inputStyle}
              type="email"
              placeholder="email@example.com"
              value={formData.customer_email}
              onChange={(e) => onChange("customer_email", e.target.value)}
              required
            />
          </FieldGroup>

          <FieldGroup label="Nomor HP" required>
            <input
              style={inputStyle}
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={formData.customer_phone}
              onChange={(e) => onChange("customer_phone", e.target.value)}
              required
            />
          </FieldGroup>

          {/* Alamat hanya jika ada produk fisik */}
          {hasPhysical && (
            <>
              <div style={{ gridColumn: "1 / -1" }}>
                <FieldGroup label="Alamat Lengkap" required>
                  <textarea
                    style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                    placeholder="Jl. Contoh No. 1, RT/RW..."
                    value={formData.customer_address}
                    onChange={(e) =>
                      onChange("customer_address", e.target.value)
                    }
                    required
                  />
                </FieldGroup>
              </div>

              <FieldGroup label="Kota" required>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Jakarta"
                  value={formData.customer_city}
                  onChange={(e) => onChange("customer_city", e.target.value)}
                  required
                />
              </FieldGroup>

              <FieldGroup label="Provinsi" required>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="DKI Jakarta"
                  value={formData.customer_province}
                  onChange={(e) =>
                    onChange("customer_province", e.target.value)
                  }
                  required
                />
              </FieldGroup>

              <FieldGroup label="Kode Pos" required>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="12345"
                  maxLength={5}
                  value={formData.customer_postal_code}
                  onChange={(e) =>
                    onChange(
                      "customer_postal_code",
                      e.target.value.replace(/\D/g, ""),
                    )
                  }
                  required
                />
              </FieldGroup>
            </>
          )}

          <div style={{ gridColumn: "1 / -1" }}>
            <FieldGroup label="Catatan (opsional)">
              <textarea
                style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
                placeholder="Catatan tambahan untuk penjual..."
                value={formData.notes}
                onChange={(e) => onChange("notes", e.target.value)}
              />
            </FieldGroup>
          </div>
        </div>
      </section>

      {/* ========== EKSPEDISI ========== */}
      {hasPhysical && expeditions.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: "1px solid var(--border)",
            }}
          >
            3. Ekspedisi
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 10,
            }}
          >
            {expeditions.map((exp) => (
              <button
                key={exp.id}
                type="button"
                onClick={() => onChange("expedition_id", exp.id)}
                style={{
                  padding: "12px 16px",
                  border:
                    formData.expedition_id === exp.id
                      ? "2px solid var(--primary)"
                      : "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  background:
                    formData.expedition_id === exp.id
                      ? "var(--primary-light)"
                      : "#fff",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                {exp.logo_url ? (
                  <img
                    src={exp.logo_url}
                    alt={exp.name}
                    style={{ height: 28, objectFit: "contain" }}
                  />
                ) : (
                  <span style={{ fontSize: 20 }}>🚚</span>
                )}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color:
                      formData.expedition_id === exp.id
                        ? "var(--primary)"
                        : "var(--text)",
                  }}
                >
                  {exp.name}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ========== PEMBAYARAN ========== */}
      <section>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: "1px solid var(--border)",
          }}
        >
          {hasPhysical ? "4." : "3."} Metode Pembayaran
        </h2>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "bank_transfer", label: "🏦 Transfer Bank (VA)" },
            { value: "qris", label: "📱 QRIS" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange("payment_method", opt.value)}
              style={{
                padding: "11px 20px",
                border:
                  formData.payment_method === opt.value
                    ? "2px solid var(--primary)"
                    : "1px solid var(--border)",
                borderRadius: "var(--radius)",
                background:
                  formData.payment_method === opt.value
                    ? "var(--primary-light)"
                    : "#fff",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                color:
                  formData.payment_method === opt.value
                    ? "var(--primary)"
                    : "var(--text)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {formData.payment_method === "bank_transfer" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: 10,
            }}
          >
            {BANKS.map((bank) => (
              <button
                key={bank.value}
                type="button"
                onClick={() => onChange("bank", bank.value)}
                style={{
                  padding: "10px 16px",
                  border:
                    formData.bank === bank.value
                      ? "2px solid var(--primary)"
                      : "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  background:
                    formData.bank === bank.value
                      ? "var(--primary-light)"
                      : "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  color:
                    formData.bank === bank.value
                      ? "var(--primary)"
                      : "var(--text)",
                }}
              >
                {bank.label}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ========== KONFIRMASI ========== */}
      <section>
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            cursor: "pointer",
            background: formData.no_cancel_ack ? "#ECFDF5" : "#FEF3C7",
            border: `1px solid ${formData.no_cancel_ack ? "#6EE7B7" : "#FCD34D"}`,
            borderRadius: "var(--radius)",
            padding: "14px 16px",
          }}
        >
          <input
            type="checkbox"
            checked={formData.no_cancel_ack}
            onChange={(e) => onChange("no_cancel_ack", e.target.checked)}
            style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0 }}
          />
          <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text)" }}>
            Saya memahami dan menyetujui bahwa{" "}
            <strong>pesanan tidak dapat dibatalkan atau di-refund</strong>{" "}
            setelah pembayaran dilakukan.
          </span>
        </label>
      </section>

      {/* ========== ERROR & SUBMIT ========== */}
      {error && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: "var(--radius)",
            padding: "12px 16px",
            color: "#DC2626",
            fontSize: 14,
          }}
        >
          ❌ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || cartItems.length === 0}
        style={{
          width: "100%",
          padding: "15px 24px",
          background: "var(--primary)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--radius)",
          fontSize: 16,
          fontWeight: 700,
          cursor: loading || cartItems.length === 0 ? "not-allowed" : "pointer",
          opacity: loading || cartItems.length === 0 ? 0.6 : 1,
          transition: "opacity 0.15s",
        }}
      >
        {loading ? "⏳ Memproses..." : "🛒 Lanjut ke Pembayaran"}
      </button>

      <style>{`
        input:focus, textarea:focus, select:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        @media (max-width: 640px) {
          form > section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          form > section > div[style*="grid-template-columns: 1fr 1fr"] > div[style*="grid-column"] {
            grid-column: 1 !important;
          }
        }
      `}</style>
    </form>
  );
}
