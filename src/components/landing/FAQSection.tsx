import { useState } from "react";
import type { FAQ } from "@/types/content.types";

interface FAQSectionProps {
  faqs: FAQ[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const active = faqs.filter((f) => f.is_active);
  if (active.length === 0) return null;

  return (
    <section
      id="faq"
      className="section"
      style={{ background: "var(--bg-gray)" }}
    >
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            Pertanyaan yang Sering Ditanyakan
          </h2>
          <p style={{ fontSize: 17, color: "var(--text-muted)" }}>
            Temukan jawaban untuk pertanyaan umum Anda
          </p>
        </div>

        {/* Accordion */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {active.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                style={{
                  background: "#fff",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "18px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  <span>{faq.question}</span>
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: 20,
                      color: "var(--text-muted)",
                      transition: "transform 0.2s",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    +
                  </span>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: "0 20px 18px",
                      fontSize: 15,
                      color: "var(--text-muted)",
                      lineHeight: 1.7,
                      borderTop: "1px solid var(--border)",
                      paddingTop: 16,
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
