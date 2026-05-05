import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// ==========================================
// MENU CONFIG
// ==========================================
interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

export const MENU_ITEMS: MenuItem[] = [
  { path: "/admin", label: "Dashboard", icon: "📊" },
  { path: "/admin/orders", label: "Pesanan", icon: "🛒" },
  { path: "/admin/products", label: "Produk", icon: "📦" },
  { path: "/admin/content", label: "Landing Page", icon: "🖼️" },
  { path: "/admin/vouchers", label: "Voucher", icon: "🏷️" },
  { path: "/admin/reviews", label: "Review", icon: "⭐" },
  { path: "/admin/withdrawal", label: "Penarikan Dana", icon: "💰" },
  { path: "/admin/settings", label: "Pengaturan", icon: "⚙️" },
];

// ==========================================
// PROPS
// ==========================================
interface SidebarProps {
  onNavigate?: () => void; // dipanggil saat item diklik (untuk tutup mobile menu)
}

// ==========================================
// SIDEBAR COMPONENT
// ==========================================
export default function Sidebar({ onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* ---- Brand ---- */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid #1F2937",
          flexShrink: 0,
        }}
      >
        <Link
          to="/"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
          onClick={onNavigate}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "#3B82F6",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            🏪
          </div>
          <div>
            <p
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#fff",
                lineHeight: 1.2,
              }}
            >
              Admin Panel
            </p>
            <p style={{ fontSize: 11, color: "#6B7280" }}>Kelola toko Anda</p>
          </div>
        </Link>
      </div>

      {/* ---- Nav ---- */}
      <nav style={{ flex: 1, padding: "12px", overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {MENU_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 12px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#fff" : "#9CA3AF",
                  background: active ? "#1D4ED8" : "transparent",
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseOver={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "#1F2937";
                }}
                onMouseOut={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "transparent";
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ---- User ---- */}
      <div
        style={{
          padding: "16px 12px",
          borderTop: "1px solid #1F2937",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
            padding: "8px 12px",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#374151",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {user?.username?.charAt(0).toUpperCase() ?? "A"}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.username}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "#6B7280",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            width: "100%",
            padding: "8px 12px",
            background: "transparent",
            color: "#9CA3AF",
            border: "1px solid #374151",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#1F2937";
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
          }}
        >
          🚪 Keluar
        </button>
      </div>
    </div>
  );
}
