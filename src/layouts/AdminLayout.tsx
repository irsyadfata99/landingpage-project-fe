import { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar, { MENU_ITEMS } from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ---- Loading check auth ----
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

  // ---- Auth guard ----
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const currentMenu = MENU_ITEMS.find((m) => isActive(m.path));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F9FAFB" }}>
      {/* ---- Sidebar ---- */}

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 40,
          }}
          className="sidebar-overlay"
        />
      )}

      <aside
        className={`admin-sidebar${sidebarOpen ? " sidebar-open" : ""}`}
        style={{
          width: 240,
          background: "#111827",
          color: "#fff",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

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
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  width: 20,
                  height: 2,
                  background: "#374151",
                  borderRadius: 2,
                }}
              />
            ))}
          </button>

          {/* Page title */}
          <div>
            {currentMenu && (
              <p style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
                {currentMenu.icon} {currentMenu.label}
              </p>
            )}
          </div>

          {/* Right side */}
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
              transition: "background 0.15s",
            }}
            onMouseOver={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                "#F9FAFB")
            }
            onMouseOut={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                "transparent")
            }
          >
            🌐 Lihat Toko
          </a>
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
          .sidebar-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
