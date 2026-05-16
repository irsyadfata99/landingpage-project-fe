import { useNavigate } from "react-router-dom";
import type { SiteConfig, PromoSection } from "@/types/content.types";
import CountdownTimer from "./CountdownTimer";

interface ClosingCTAProps {
  siteConfig: SiteConfig | null;
  promo?: PromoSection | null;
}

export default function ClosingCTA({ siteConfig, promo }: ClosingCTAProps) {
  const navigate = useNavigate();

  const headline = siteConfig?.closing_cta_headline;
  const subtext = siteConfig?.closing_cta_subtext;
  const ctaText = siteConfig?.closing_cta_text;

  // Jangan render jika tidak ada konten sama sekali
  if (!headline && !ctaText) return null;

  const primaryColor = siteConfig?.primary_color ?? "#3B82F6";

  // Tampilkan countdown jika promo aktif dan ada end_date yang belum lewat
  const showCountdown =
    promo?.is_active &&
    promo.end_date &&
    new Date(promo.end_date).getTime() > Date.now();

  return (
    <section
      style={{
        background: primaryColor,
        padding: "64px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background circles */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: -80,
          left: -40,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }}
      />

      <div
        className="container"
        style={{
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* Countdown jika ada promo aktif */}
        {showCountdown && promo?.end_date && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(255,255,255,0.75)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              ⏰ Penawaran berakhir dalam
            </p>
            <CountdownTimer
              endDate={promo.end_date}
              primaryColor={primaryColor}
            />
          </div>
        )}

        {/* Headline */}
        {headline && (
          <h2
            style={{
              fontSize: "clamp(26px, 4vw, 42px)",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              maxWidth: 600,
              margin: 0,
            }}
          >
            {headline}
          </h2>
        )}

        {/* Subtext */}
        {subtext && (
          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.82)",
              lineHeight: 1.65,
              maxWidth: 520,
              margin: 0,
            }}
          >
            {subtext}
          </p>
        )}

        {/* CTA Button */}
        {ctaText && (
          <button
            onClick={() => navigate("/checkout")}
            style={{
              background: "#fff",
              color: primaryColor,
              border: "none",
              borderRadius: "var(--radius)",
              padding: "16px 40px",
              fontSize: 16,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              transition: "transform 0.15s, box-shadow 0.15s",
              marginTop: 4,
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 8px 28px rgba(0,0,0,0.2)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 20px rgba(0,0,0,0.15)";
            }}
          >
            {ctaText}
          </button>
        )}
      </div>
    </section>
  );
}
