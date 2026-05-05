import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { SiteConfig } from "@/types/content.types";

interface NavbarProps {
  siteConfig: SiteConfig | null;
}

export default function Navbar({ siteConfig }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const brandName = siteConfig?.brand_name ?? "Toko";
  const primaryColor = siteConfig?.primary_color ?? "#3B82F6";

  return (
    <nav
      style={{
        background: "#fff",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        {/* Logo / Brand */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 700,
            fontSize: 20,
            color: primaryColor,
          }}
        >
          {siteConfig?.logo_url ? (
            <img
              src={siteConfig.logo_url}
              alt={brandName}
              style={{ height: 36 }}
            />
          ) : (
            <span>{brandName}</span>
          )}
        </Link>

        {/* Desktop Links */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 32 }}
          className="nav-desktop"
        >
          <a
            href="#pricing"
            style={{
              color: "var(--text-muted)",
              fontWeight: 500,
              fontSize: 15,
            }}
          >
            Harga
          </a>
          <a
            href="#testimonials"
            style={{
              color: "var(--text-muted)",
              fontWeight: 500,
              fontSize: 15,
            }}
          >
            Testimoni
          </a>
          <a
            href="#faq"
            style={{
              color: "var(--text-muted)",
              fontWeight: 500,
              fontSize: 15,
            }}
          >
            FAQ
          </a>
          <button
            onClick={() => navigate("/track")}
            style={{
              color: "var(--text-muted)",
              fontWeight: 500,
              fontSize: 15,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Lacak Pesanan
          </button>
          <button
            onClick={() => navigate("/checkout")}
            style={{
              background: primaryColor,
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius)",
              padding: "9px 20px",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Beli Sekarang
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            flexDirection: "column",
            gap: 5,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
          }}
          aria-label="Menu"
        >
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "var(--text)",
              borderRadius: 2,
            }}
          />
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "var(--text)",
              borderRadius: 2,
            }}
          />
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "var(--text)",
              borderRadius: 2,
            }}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            background: "#fff",
          }}
        >
          <a
            href="#pricing"
            onClick={() => setMenuOpen(false)}
            style={{ color: "var(--text)", fontWeight: 500 }}
          >
            Harga
          </a>
          <a
            href="#testimonials"
            onClick={() => setMenuOpen(false)}
            style={{ color: "var(--text)", fontWeight: 500 }}
          >
            Testimoni
          </a>
          <a
            href="#faq"
            onClick={() => setMenuOpen(false)}
            style={{ color: "var(--text)", fontWeight: 500 }}
          >
            FAQ
          </a>
          <button
            onClick={() => {
              navigate("/track");
              setMenuOpen(false);
            }}
            style={{ textAlign: "left", color: "var(--text)", fontWeight: 500 }}
          >
            Lacak Pesanan
          </button>
          <button
            onClick={() => {
              navigate("/checkout");
              setMenuOpen(false);
            }}
            style={{
              background: primaryColor,
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius)",
              padding: "10px 20px",
              fontWeight: 600,
            }}
          >
            Beli Sekarang
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
