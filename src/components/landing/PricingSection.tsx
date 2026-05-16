import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { PricingItem, SiteConfig } from "@/types/content.types";
import type { Product } from "@/types/product.types";
import { getPublicProducts } from "@/services/api";

interface PricingSectionProps {
  pricing: PricingItem[];
  siteConfig: SiteConfig | null;
}

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

// ==========================================
// HELPER: hitung total stok dari semua produk aktif
// Produk digital (stock = null) tidak dihitung
// ==========================================
const calcTotalStock = (products: Product[]): number | null => {
  const physicalProducts = products.filter(
    (p) =>
      p.is_active &&
      p.stock !== null &&
      (p.product_type === "PHYSICAL" || p.product_type === "BOTH"),
  );
  if (physicalProducts.length === 0) return null; // semua digital, tidak perlu badge
  return physicalProducts.reduce((sum, p) => sum + (p.stock ?? 0), 0);
};

// ==========================================
// STOCK BADGE COMPONENT
// ==========================================
function StockBadge({ totalStock }: { totalStock: number }) {
  if (totalStock <= 0) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "#FEE2E2",
          border: "1px solid #FCA5A5",
          borderRadius: "var(--radius-full)",
          padding: "4px 12px",
          fontSize: 12,
          fontWeight: 700,
          color: "#DC2626",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#DC2626",
            display: "inline-block",
          }}
        />
        Stok Habis
      </div>
    );
  }

  if (totalStock < 5) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "#FEE2E2",
          border: "1px solid #FCA5A5",
          borderRadius: "var(--radius-full)",
          padding: "4px 12px",
          fontSize: 12,
          fontWeight: 700,
          color: "#DC2626",
          animation: "pulse-badge 2s ease-in-out infinite",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#DC2626",
            display: "inline-block",
          }}
        />
        Sisa {totalStock} lagi!
      </div>
    );
  }

  if (totalStock < 10) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "#FEF3C7",
          border: "1px solid #FCD34D",
          borderRadius: "var(--radius-full)",
          padding: "4px 12px",
          fontSize: 12,
          fontWeight: 700,
          color: "#D97706",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#D97706",
            display: "inline-block",
          }}
        />
        Stok Terbatas — Tersisa {totalStock}
      </div>
    );
  }

  return null; // stok >= 10, tidak perlu badge
}

export default function PricingSection({
  pricing,
  siteConfig,
}: PricingSectionProps) {
  const navigate = useNavigate();
  const primaryColor = siteConfig?.primary_color ?? "#3B82F6";
  const secondaryColor = siteConfig?.secondary_color ?? "#10B981";

  const [totalStock, setTotalStock] = useState<number | null>(null);

  // Fetch produk untuk cek stok — silent fail, tidak blokir render
  useEffect(() => {
    getPublicProducts()
      .then((products) => {
        const stock = calcTotalStock(products);
        setTotalStock(stock);
      })
      .catch(() => {
        // silent fail — badge tidak tampil jika gagal
      });
  }, []);

  const activePricing = pricing.filter((p) => p.is_active);
  if (activePricing.length === 0) return null;

  const showStockBadge = totalStock !== null && totalStock < 10;

  return (
    <section
      id="pricing"
      className="section"
      style={{ background: "var(--bg-gray)" }}
    >
      <style>{`
        @keyframes pulse-badge {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.03); }
        }
      `}</style>

      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              marginBottom: 12,
              letterSpacing: "-0.02em",
            }}
          >
            Pilih Paket Terbaik
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "var(--text-muted)",
              maxWidth: 500,
              margin: "0 auto",
            }}
          >
            Dapatkan penawaran terbaik sesuai kebutuhan Anda
          </p>

          {/* Stock badge — tampil di bawah subheading jika stok terbatas */}
          {showStockBadge && totalStock !== null && (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <StockBadge totalStock={totalStock} />
            </div>
          )}
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(activePricing.length, 3)}, 1fr)`,
            gap: 24,
            alignItems: "stretch",
          }}
        >
          {activePricing.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#fff",
                borderRadius: "var(--radius-lg)",
                padding: "32px 28px",
                border: item.is_popular
                  ? `2px solid ${primaryColor}`
                  : "1px solid var(--border)",
                boxShadow: item.is_popular
                  ? `0 8px 30px ${primaryColor}20`
                  : "var(--shadow-sm)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Popular badge */}
              {item.is_popular && (
                <div
                  style={{
                    position: "absolute",
                    top: -14,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: primaryColor,
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "4px 16px",
                    borderRadius: "var(--radius-full)",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.05em",
                  }}
                >
                  ⭐ PALING POPULER
                </div>
              )}

              {/* Name */}
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                {item.name}
              </h3>

              {/* Price */}
              <div style={{ marginBottom: 24 }}>
                {item.original_price && (
                  <p
                    style={{
                      fontSize: 14,
                      color: "var(--text-light)",
                      textDecoration: "line-through",
                      marginBottom: 2,
                    }}
                  >
                    {formatRupiah(item.original_price)}
                  </p>
                )}
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 4 }}
                >
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: 800,
                      color: primaryColor,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {formatRupiah(item.price)}
                  </span>
                </div>
                {item.original_price && (
                  <span
                    style={{
                      display: "inline-block",
                      background: "#FEF3C7",
                      color: "#92400E",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "2px 10px",
                      borderRadius: "var(--radius-full)",
                      marginTop: 6,
                    }}
                  >
                    Hemat {formatRupiah(item.original_price - item.price)}
                  </span>
                )}
              </div>

              {/* Stock badge per card — hanya jika stok kritis (< 5) */}
              {showStockBadge &&
                totalStock !== null &&
                totalStock < 5 &&
                totalStock > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <StockBadge totalStock={totalStock} />
                  </div>
                )}

              {/* Out of stock notice */}
              {totalStock === 0 && (
                <div
                  style={{
                    marginBottom: 16,
                    background: "#F3F4F6",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 12px",
                    fontSize: 13,
                    color: "#6B7280",
                    textAlign: "center",
                  }}
                >
                  Stok sedang kosong, hubungi kami
                </div>
              )}

              {/* Features */}
              <ul style={{ listStyle: "none", marginBottom: 32, flex: 1 }}>
                {item.features.map((feature, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      marginBottom: 10,
                      fontSize: 14,
                      color: "var(--text-muted)",
                    }}
                  >
                    <span
                      style={{
                        color: secondaryColor,
                        fontSize: 16,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => navigate("/checkout")}
                disabled={totalStock === 0}
                style={{
                  width: "100%",
                  background:
                    totalStock === 0
                      ? "#E5E7EB"
                      : item.is_popular
                        ? primaryColor
                        : "transparent",
                  color:
                    totalStock === 0
                      ? "#9CA3AF"
                      : item.is_popular
                        ? "#fff"
                        : primaryColor,
                  border:
                    totalStock === 0
                      ? "2px solid #E5E7EB"
                      : `2px solid ${primaryColor}`,
                  borderRadius: "var(--radius)",
                  padding: "12px 20px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: totalStock === 0 ? "not-allowed" : "pointer",
                  transition: "background 0.2s, color 0.2s",
                }}
                onMouseOver={(e) => {
                  if (totalStock === 0) return;
                  if (!item.is_popular) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      primaryColor;
                    (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                  }
                }}
                onMouseOut={(e) => {
                  if (totalStock === 0) return;
                  if (!item.is_popular) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      primaryColor;
                  }
                }}
              >
                {totalStock === 0 ? "Stok Habis" : item.cta_text}
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #pricing .container > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
