import type { PainPoint, SiteConfig } from "@/types/content.types";

interface PainPointSectionProps {
  painPoints: PainPoint[];
  siteConfig: SiteConfig | null;
}

export default function PainPointSection({
  painPoints,
  siteConfig,
}: PainPointSectionProps) {
  const active = painPoints.filter((p) => p.is_active);
  if (active.length === 0) return null;

  const primaryColor = siteConfig?.primary_color ?? "#3B82F6";
  const secondaryColor = siteConfig?.secondary_color ?? "#10B981";

  // Jika ada 2 item: kolom kiri = masalah, kolom kanan = solusi
  // Jika 1 atau >2 item: tampilkan sebagai grid card biasa
  const isTwoColumn = active.length === 2;

  return (
    <section className="section" style={{ background: "#fff" }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              marginBottom: 12,
              letterSpacing: "-0.02em",
            }}
          >
            Kenali Masalah Anda,{" "}
            <span style={{ color: primaryColor }}>Kami Punya Solusinya</span>
          </h2>
          <p
            style={{
              fontSize: 17,
              color: "var(--text-muted)",
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            Kami memahami tantangan yang Anda hadapi dan hadir dengan jawaban
            yang tepat.
          </p>
        </div>

        {/* Two-column layout (masalah vs solusi) */}
        {isTwoColumn ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              alignItems: "stretch",
            }}
          >
            {active.map((point, idx) => {
              const isProblem = idx === 0;
              return (
                <div
                  key={point.id}
                  style={{
                    borderRadius: "var(--radius-lg)",
                    padding: "32px 28px",
                    background: isProblem ? "#FEF2F2" : "#F0FDF4",
                    border: `1px solid ${isProblem ? "#FCA5A5" : "#86EFAC"}`,
                  }}
                >
                  {/* Icon + Headline */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 24,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "var(--radius)",
                        background: isProblem ? "#FEE2E2" : "#DCFCE7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      {isProblem ? "😔" : "✨"}
                    </div>
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: isProblem ? "#991B1B" : "#166534",
                        lineHeight: 1.3,
                      }}
                    >
                      {point.headline}
                    </h3>
                  </div>

                  {/* Items */}
                  <ul
                    style={{
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    {point.items.map((item: string, i: number) => (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          fontSize: 15,
                          color: isProblem ? "#7F1D1D" : "#14532D",
                          lineHeight: 1.5,
                        }}
                      >
                        <span
                          style={{
                            flexShrink: 0,
                            marginTop: 2,
                            fontSize: 16,
                          }}
                        >
                          {isProblem ? "✗" : "✓"}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          /* Grid biasa untuk 1 atau >2 pain points */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(active.length, 3)}, 1fr)`,
              gap: 24,
            }}
          >
            {active.map((point, idx) => (
              <div
                key={point.id}
                style={{
                  borderRadius: "var(--radius-lg)",
                  padding: "28px 24px",
                  background: "var(--bg-gray)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius)",
                    background: `${primaryColor}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    marginBottom: 16,
                  }}
                >
                  {["🎯", "💡", "🚀", "⭐"][idx % 4]}
                </div>
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 16,
                  }}
                >
                  {point.headline}
                </h3>
                <ul
                  style={{
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {point.items.map((item: string, i: number) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        fontSize: 14,
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
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
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          section > .container > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          section > .container > div[style*="repeat("] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
