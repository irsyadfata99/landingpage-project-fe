interface TrustBadge {
  id: string;
  label: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

interface TrustBadgesProps {
  badges: TrustBadge[];
}

// Ikon default jika tidak ada image_url
const DEFAULT_ICONS: Record<string, string> = {
  "BCA Virtual Account": "🏦",
  "BNI Virtual Account": "🏦",
  "BRI Virtual Account": "🏦",
  "Mandiri Virtual Account": "🏦",
  QRIS: "📱",
  "SSL Secured": "🔒",
  "100% Aman": "✅",
};

const getDefaultIcon = (label: string): string => {
  for (const [key, icon] of Object.entries(DEFAULT_ICONS)) {
    if (label.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return "✓";
};

export default function TrustBadges({ badges }: TrustBadgesProps) {
  const active = badges.filter((b) => b.is_active);
  if (active.length === 0) return null;

  return (
    <section
      style={{
        background: "#fff",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "20px 0",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginRight: 8,
              whiteSpace: "nowrap",
            }}
          >
            Pembayaran & Keamanan:
          </span>
          {active.map((badge, i) => (
            <div key={badge.id}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  background: "var(--bg-gray)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-full)",
                  whiteSpace: "nowrap",
                }}
              >
                {badge.image_url ? (
                  <img
                    src={badge.image_url}
                    alt={badge.label}
                    style={{ height: 18, width: "auto", objectFit: "contain" }}
                  />
                ) : (
                  <span style={{ fontSize: 14 }}>
                    {getDefaultIcon(badge.label)}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  {badge.label}
                </span>
              </div>
              {/* Divider kecuali item terakhir */}
              {i < active.length - 1 && <span style={{ display: "none" }} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
