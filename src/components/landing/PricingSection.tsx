import { useNavigate } from "react-router-dom";
import type { PricingItem, SiteConfig } from "@/types/content.types";

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

export default function PricingSection({
  pricing,
  siteConfig,
}: PricingSectionProps) {
  const navigate = useNavigate();
  const primaryColor = siteConfig?.primary_color ?? "#3B82F6";
  const secondaryColor = siteConfig?.secondary_color ?? "#10B981";

  const activePricing = pricing.filter((p) => p.is_active);
  if (activePricing.length === 0) return null;

  return (
    <section
      id="pricing"
      className="section"
      style={{ background: "var(--bg-gray)" }}
    >
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
                style={{
                  width: "100%",
                  background: item.is_popular ? primaryColor : "transparent",
                  color: item.is_popular ? "#fff" : primaryColor,
                  border: `2px solid ${primaryColor}`,
                  borderRadius: "var(--radius)",
                  padding: "12px 20px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background 0.2s, color 0.2s",
                }}
                onMouseOver={(e) => {
                  if (!item.is_popular) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      primaryColor;
                    (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                  }
                }}
                onMouseOut={(e) => {
                  if (!item.is_popular) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      primaryColor;
                  }
                }}
              >
                {item.cta_text}
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
