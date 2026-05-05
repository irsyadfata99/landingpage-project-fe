import { useState } from "react";
import type { Product } from "@/types/product.types";
import type { ValidateVoucherResponse } from "@/types/order.types";

interface CartItem {
  product: Product;
  quantity: number;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  voucher: ValidateVoucherResponse | null;
  voucherCode: string;
  voucherLoading: boolean;
  voucherError: string | null;
  customerEmail: string;
  onVoucherCodeChange: (code: string) => void;
  onApplyVoucher: () => void;
  onRemoveVoucher: () => void;
}

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export default function OrderSummary({
  cartItems,
  voucher,
  voucherCode,
  voucherLoading,
  voucherError,
  customerEmail,
  onVoucherCodeChange,
  onApplyVoucher,
  onRemoveVoucher,
}: OrderSummaryProps) {
  const [voucherOpen, setVoucherOpen] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const discount = voucher?.discount_amount ?? 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        overflow: "hidden",
        position: "sticky",
        top: 80,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "var(--bg-gray)",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Ringkasan Pesanan</h3>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Items */}
        {cartItems.length === 0 ? (
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: 14,
              textAlign: "center",
              padding: "16px 0",
            }}
          >
            Belum ada produk dipilih
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {cartItems.map(({ product, quantity }) => (
              <div
                key={product.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>
                    {product.name}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {formatRupiah(product.price)} × {quantity}
                  </p>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatRupiah(product.price * quantity)}
                </p>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          {/* Subtotal */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
              Subtotal
            </span>
            <span style={{ fontSize: 14 }}>{formatRupiah(subtotal)}</span>
          </div>

          {/* Voucher toggle */}
          {!voucher && (
            <div style={{ marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => setVoucherOpen(!voucherOpen)}
                style={{
                  fontSize: 13,
                  color: "var(--primary)",
                  fontWeight: 600,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {voucherOpen ? "✕ Tutup" : "🏷️ Punya kode voucher?"}
              </button>

              {voucherOpen && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Kode voucher"
                      value={voucherCode}
                      onChange={(e) =>
                        onVoucherCodeChange(e.target.value.toUpperCase())
                      }
                      onKeyDown={(e) => e.key === "Enter" && onApplyVoucher()}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 13,
                        outline: "none",
                        textTransform: "uppercase",
                      }}
                    />
                    <button
                      type="button"
                      onClick={onApplyVoucher}
                      disabled={voucherLoading || !voucherCode}
                      style={{
                        padding: "8px 14px",
                        background: "var(--primary)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        opacity: voucherLoading || !voucherCode ? 0.6 : 1,
                      }}
                    >
                      {voucherLoading ? "..." : "Pakai"}
                    </button>
                  </div>
                  {!customerEmail && (
                    <p style={{ fontSize: 12, color: "#F59E0B", marginTop: 4 }}>
                      ⚠️ Isi email dulu sebelum pakai voucher
                    </p>
                  )}
                  {voucherError && (
                    <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>
                      {voucherError}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Applied voucher */}
          {voucher && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#ECFDF5",
                border: "1px solid #6EE7B7",
                borderRadius: "var(--radius-sm)",
                padding: "8px 12px",
                marginBottom: 8,
              }}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}>
                  🏷️ {voucher.code}
                </p>
                <p style={{ fontSize: 12, color: "#059669" }}>
                  Hemat {formatRupiah(voucher.discount_amount)}
                </p>
              </div>
              <button
                type="button"
                onClick={onRemoveVoucher}
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✕ Hapus
              </button>
            </div>
          )}

          {/* Discount row */}
          {discount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 14, color: "#059669" }}>Diskon</span>
              <span style={{ fontSize: 14, color: "#059669", fontWeight: 600 }}>
                -{formatRupiah(discount)}
              </span>
            </div>
          )}

          {/* Total */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid var(--border)",
              paddingTop: 12,
              marginTop: 8,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
            <span
              style={{ fontWeight: 800, fontSize: 18, color: "var(--primary)" }}
            >
              {formatRupiah(total)}
            </span>
          </div>
        </div>

        {/* No cancel notice */}
        <div
          style={{
            marginTop: 16,
            background: "#FEF3C7",
            border: "1px solid #FCD34D",
            borderRadius: "var(--radius-sm)",
            padding: "10px 12px",
          }}
        >
          <p style={{ fontSize: 12, color: "#92400E", lineHeight: 1.5 }}>
            ⚠️ <strong>Perhatian:</strong> Semua transaksi bersifat final.
            Pesanan tidak dapat dibatalkan atau di-refund setelah pembayaran.
          </p>
        </div>
      </div>
    </div>
  );
}
