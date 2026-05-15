import { useNavigate } from "react-router-dom";
import type {
  HeroSection as HeroSectionType,
  SiteConfig,
} from "@/types/content.types";
import type { PublicStats } from "@/services/api";

interface HeroSectionProps {
  hero: HeroSectionType | null;
  siteConfig: SiteConfig | null;
  stats?: PublicStats | null;
}

const resolveTarget = (
  target: string | null,
): { href?: string; anchor?: string } => {
  if (!target) return {};
  if (target.startsWith("#")) return { anchor: target };
  return { href: target };
};

// ==========================================
// HELPER: format angka ke "1.2rb", "10rb", dst
// ==========================================
const formatCount = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}rb+`;
  return `${n}+`;
};

// ==========================================
// SOCIAL PROOF BADGE
// Tampil hanya jika ada data (total_buyers > 0 atau ada review)
// ==========================================
function SocialProofBadge({ stats }: { stats: PublicStats }) {
  const showBuyers = stats.total_buyers > 0;
  const showRating = stats.total_reviews > 0 && stats.average_rating > 0;

  if (!showBuyers && !showRating) return null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: "var(--radius-full)",
        padding: "8px 16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        flexWrap: "wrap",
      }}
    >
      {/* Buyers */}
      {showBuyers && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Avatar stack dummy — 3 lingkaran warna */}
          <div style={{ display: "flex", marginRight: 2 }}>
            {["#F87171", "#60A5FA", "#34D399"].map((color, i) => (
              <div
                key={i}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: color,
                  border: "2px solid #fff",
                  marginLeft: i === 0 ? 0 : -6,
                  zIndex: 3 - i,
                  position: "relative",
                }}
              />
            ))}
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            {formatCount(stats.total_buyers)}
          </span>
          <span style={{ fontSize: 13, color: "#6B7280" }}>pembeli</span>
        </div>
      )}

      {/* Divider */}
      {showBuyers && showRating && (
        <div
          style={{
            width: 1,
            height: 16,
            background: "#E5E7EB",
          }}
        />
      )}

      {/* Rating */}
      {showRating && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ color: "#F59E0B", fontSize: 14 }}>★</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            {stats.average_rating.toFixed(1)}
          </span>
          <span style={{ fontSize: 13, color: "#6B7280" }}>
            ({stats.total_reviews} ulasan)
          </span>
        </div>
      )}
    </div>
  );
}

export default function HeroSection({
  hero,
  siteConfig,
  stats,
}: HeroSectionProps) {
  const navigate = useNavigate();
  const primaryColor = siteConfig?.primary_color ?? "#3B82F6";

  if (!hero?.is_active) return null;

  const secondaryTarget = resolveTarget(hero.secondary_cta_target ?? null);

  const handleSecondaryClick = () => {
    if (secondaryTarget.anchor) {
      const el = document.querySelector(secondaryTarget.anchor);
      el?.scrollIntoView({ behavior: "smooth" });
    } else if (secondaryTarget.href) {
      if (secondaryTarget.href.startsWith("/")) {
        navigate(secondaryTarget.href);
      } else {
        window.open(secondaryTarget.href, "_blank", "noopener");
      }
    }
  };

  return (
    <section
      style={{
        background:
          hero.bg_color ?? "linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)",
        padding: "80px 0",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: hero.image_url ? "1fr 1fr" : "1fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          {/* Text */}
          <div
            style={{
              textAlign: hero.image_url ? "left" : "center",
              maxWidth: hero.image_url ? "100%" : 640,
              margin: hero.image_url ? "0" : "0 auto",
            }}
          >
            {/* Social proof badge — tampil di atas headline */}
            {stats && (
              <div
                style={{
                  marginBottom: 20,
                  display: "flex",
                  justifyContent: hero.image_url ? "flex-start" : "center",
                }}
              >
                <SocialProofBadge stats={stats} />
              </div>
            )}

            <h1
              style={{
                fontSize: "clamp(32px, 5vw, 56px)",
                fontWeight: 800,
                lineHeight: 1.15,
                color: "var(--text)",
                marginBottom: 20,
                letterSpacing: "-0.02em",
              }}
            >
              {hero.headline}
            </h1>

            {hero.subheadline && (
              <p
                style={{
                  fontSize: 18,
                  color: "var(--text-muted)",
                  lineHeight: 1.7,
                  marginBottom: 36,
                }}
              >
                {hero.subheadline}
              </p>
            )}

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                justifyContent: hero.image_url ? "flex-start" : "center",
              }}
            >
              {/* Primary CTA */}
              <button
                onClick={() => navigate("/checkout")}
                style={{
                  background: primaryColor,
                  color: "#fff",
                  border: "none",
                  borderRadius: "var(--radius)",
                  padding: "14px 32px",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: `0 4px 14px ${primaryColor}40`,
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseOver={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    "translateY(0)";
                }}
              >
                {hero.cta_text}
              </button>

              {/* Secondary CTA */}
              {hero.secondary_cta_text && (
                <button
                  onClick={handleSecondaryClick}
                  style={{
                    background: "transparent",
                    color: primaryColor,
                    border: `2px solid ${primaryColor}`,
                    borderRadius: "var(--radius)",
                    padding: "13px 28px",
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      primaryColor;
                    (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      primaryColor;
                  }}
                >
                  {hero.secondary_cta_text}
                </button>
              )}
            </div>
          </div>

          {/* Image */}
          {hero.image_url && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img
                src={hero.image_url}
                alt="Hero"
                style={{
                  width: "100%",
                  maxWidth: 500,
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-xl)",
                }}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section > .container > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
