import { useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// ==========================================
// MENU CONFIG
// ==========================================
interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

const MENU_ITEMS: MenuItem[] = [
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
// ADMIN LAYOUT
// ==========================================
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Loading check auth
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F9FAFB",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid #E5E7EB",
              borderTopColor: "#3B82F6",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ color: "#6B7280", fontSize: 14 }}>
            Memverifikasi sesi...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  // Auth guard
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F9FAFB" }}>
      {/* ---- Sidebar ---- */}
      <>
        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 40,
              display: "none",
            }}
            className="sidebar-overlay"
          />
        )}

        <aside
          className={`admin-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
          style={{
            width: 240,
            background: "#111827",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            position: "sticky",
            top: 0,
            height: "100vh",
            overflowY: "auto",
          }}
        >
          {/* Brand */}
          <div
            style={{
              padding: "20px 20px 16px",
              borderBottom: "1px solid #1F2937",
            }}
          >
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
              }}
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
                <p style={{ fontSize: 11, color: "#6B7280" }}>
                  Kelola toko Anda
                </p>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {MENU_ITEMS.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
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
                        (
                          e.currentTarget as HTMLAnchorElement
                        ).style.background = "#1F2937";
                    }}
                    onMouseOut={(e) => {
                      if (!active)
                        (
                          e.currentTarget as HTMLAnchorElement
                        ).style.background = "transparent";
                    }}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User */}
          <div
            style={{
              padding: "16px 12px",
              borderTop: "1px solid #1F2937",
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
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#1F2937";
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
        </aside>
      </>

      {/* ---- Main Content ---- */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Topbar */}
        <header
          style={{
            background: "#fff",
            borderBottom: "1px solid #E5E7EB",
            padding: "0 24px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 30,
            flexShrink: 0,
          }}
        >
          {/* Mobile hamburger */}
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              flexDirection: "column",
              gap: 4,
            }}
            aria-label="Toggle sidebar"
          >
            <span
              style={{
                display: "block",
                width: 20,
                height: 2,
                background: "#374151",
                borderRadius: 2,
              }}
            />
            <span
              style={{
                display: "block",
                width: 20,
                height: 2,
                background: "#374151",
                borderRadius: 2,
              }}
            />
            <span
              style={{
                display: "block",
                width: 20,
                height: 2,
                background: "#374151",
                borderRadius: 2,
              }}
            />
          </button>

          {/* Breadcrumb / Page title */}
          <div>
            {(() => {
              const current = MENU_ITEMS.find((m) => isActive(m.path));
              return current ? (
                <p style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                  {current.icon} {current.label}
                </p>
              ) : null;
            })()}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13,
                color: "#6B7280",
                display: "flex",
                alignItems: "center",
                gap: 4,
                textDecoration: "none",
                padding: "6px 12px",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
              }}
            >
              🌐 Lihat Toko
            </a>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "28px 24px", overflowY: "auto" }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed !important;
            left: -240px;
            top: 0;
            bottom: 0;
            z-index: 50;
            transition: left 0.25s ease;
          }
          .admin-sidebar.sidebar-open {
            left: 0;
          }
          .sidebar-overlay {
            display: block !important;
          }
          .sidebar-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
