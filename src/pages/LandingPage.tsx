import { useEffect } from "react";
import { useContent } from "@/hooks/useContent";
import Navbar from "@/components/common/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import PricingSection from "@/components/landing/PricingSection";
import TestiSection from "@/components/landing/TestiSection";
import FAQSection from "@/components/landing/FAQSection";

export default function LandingPage() {
  const { data, loading, error } = useContent();

  // Apply dynamic meta & font dari site_config
  useEffect(() => {
    if (!data?.site_config) return;
    const {
      meta_title,
      meta_description,
      font_url,
      primary_color,
      secondary_color,
      favicon_url,
    } = data.site_config;

    document.title = meta_title;

    // Meta description
    let metaDesc = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = meta_description;

    // Font
    if (font_url) {
      let link = document.querySelector<HTMLLinkElement>("link[data-font]");
      if (!link) {
        link = document.createElement("link");
        link.rel = "stylesheet";
        link.setAttribute("data-font", "true");
        document.head.appendChild(link);
      }
      link.href = font_url;
    }

    // CSS vars override dari DB
    document.documentElement.style.setProperty("--primary", primary_color);
    document.documentElement.style.setProperty("--secondary", secondary_color);

    // Favicon
    if (favicon_url) {
      let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }
      favicon.href = favicon_url;
    }
  }, [data?.site_config]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid var(--border)",
              borderTopColor: "var(--primary)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "var(--text-muted)" }}>Memuat halaman...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#EF4444" }}>{error}</p>
      </div>
    );
  }

  const contact = data?.contact_person;

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Navbar siteConfig={data?.site_config ?? null} />

      <main style={{ flex: 1 }}>
        <HeroSection
          hero={data?.hero ?? null}
          siteConfig={data?.site_config ?? null}
        />

        {/* Promo Banner */}
        {data?.promo?.is_active && (
          <section
            style={{
              background: data.site_config?.primary_color ?? "#3B82F6",
              padding: "20px 0",
            }}
          >
            <div
              className="container"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                flexWrap: "wrap",
                textAlign: "center",
              }}
            >
              {data.promo.badge_text && (
                <span
                  style={{
                    background: "#fff",
                    color: data.site_config?.primary_color ?? "#3B82F6",
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "3px 12px",
                    borderRadius: "var(--radius-full)",
                  }}
                >
                  {data.promo.badge_text}
                </span>
              )}
              <p style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>
                {data.promo.title}
              </p>
              {data.promo.description && (
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
                  {data.promo.description}
                </p>
              )}
            </div>
          </section>
        )}

        <PricingSection
          pricing={data?.pricing ?? []}
          siteConfig={data?.site_config ?? null}
        />
        <TestiSection testimonials={data?.testimonials ?? []} />
        <FAQSection faqs={data?.faqs ?? []} />
      </main>

      {/* Footer / Contact */}
      <footer
        style={{ background: "#111827", color: "#fff", padding: "48px 0 32px" }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 32,
              marginBottom: 40,
            }}
          >
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                {data?.site_config?.brand_name ?? "Toko"}
              </h3>
              <p
                style={{
                  color: "#9CA3AF",
                  fontSize: 14,
                  maxWidth: 280,
                  lineHeight: 1.7,
                }}
              >
                {data?.site_config?.meta_description}
              </p>
            </div>

            {contact?.is_active && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <p style={{ fontWeight: 600, marginBottom: 4 }}>Hubungi Kami</p>
                {contact.whatsapp_number && (
                  <a
                    href={`https://wa.me/${contact.whatsapp_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#25D366",
                      color: "#fff",
                      padding: "10px 20px",
                      borderRadius: "var(--radius)",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    💬 {contact.cta_text}
                  </a>
                )}
                {contact.instagram_url && (
                  <a
                    href={contact.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#9CA3AF", fontSize: 14 }}
                  >
                    📸 Instagram
                  </a>
                )}
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    style={{ color: "#9CA3AF", fontSize: 14 }}
                  >
                    ✉️ {contact.email}
                  </a>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              borderTop: "1px solid #1F2937",
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <p style={{ color: "#6B7280", fontSize: 13 }}>
              © {new Date().getFullYear()}{" "}
              {data?.site_config?.brand_name ?? "Toko"}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
