import { useNavigate } from "react-router-dom";
import type {
  HeroSection as HeroSectionType,
  SiteConfig,
} from "@/types/content.types";

interface HeroSectionProps {
  hero: HeroSectionType | null;
  siteConfig: SiteConfig | null;
}

export default function HeroSection({ hero, siteConfig }: HeroSectionProps) {
  const navigate = useNavigate();
  const primaryColor = siteConfig?.primary_color ?? "#3B82F6";

  if (!hero?.is_active) return null;

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
              <button
                onClick={() => navigate("/track")}
                style={{
                  background: "transparent",
                  color: primaryColor,
                  border: `2px solid ${primaryColor}`,
                  borderRadius: "var(--radius)",
                  padding: "13px 28px",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Lacak Pesanan
              </button>
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
