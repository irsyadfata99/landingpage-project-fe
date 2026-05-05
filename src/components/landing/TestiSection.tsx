import type { Testimonial } from "@/types/content.types";

interface TestiSectionProps {
  testimonials: Testimonial[];
}

const StarRating = ({ rating }: { rating: number }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        style={{ color: i <= rating ? "#F59E0B" : "#E5E7EB", fontSize: 16 }}
      >
        ★
      </span>
    ))}
  </div>
);

export default function TestiSection({ testimonials }: TestiSectionProps) {
  const active = testimonials.filter((t) => t.is_active);
  if (active.length === 0) return null;

  return (
    <section
      id="testimonials"
      className="section"
      style={{ background: "#fff" }}
    >
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            Apa Kata Pelanggan Kami?
          </h2>
          <p style={{ fontSize: 17, color: "var(--text-muted)" }}>
            Ribuan pelanggan sudah merasakan manfaatnya
          </p>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {active.map((t) => (
            <div
              key={t.id}
              style={{
                background: "var(--bg-gray)",
                borderRadius: "var(--radius-lg)",
                padding: "28px 24px",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Stars */}
              <StarRating rating={t.rating} />

              {/* Content */}
              <p
                style={{
                  fontSize: 15,
                  color: "var(--text-muted)",
                  lineHeight: 1.7,
                  flex: 1,
                  fontStyle: "italic",
                }}
              >
                "{t.content}"
              </p>

              {/* Customer */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {t.customer_photo_url ? (
                  <img
                    src={t.customer_photo_url}
                    alt={t.customer_name}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "var(--primary-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#3B82F6",
                      flexShrink: 0,
                    }}
                  >
                    {t.customer_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "var(--text)",
                    }}
                  >
                    {t.customer_name}
                  </p>
                  {t.testimonial_date && (
                    <p style={{ fontSize: 12, color: "var(--text-light)" }}>
                      {new Date(t.testimonial_date).toLocaleDateString(
                        "id-ID",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
