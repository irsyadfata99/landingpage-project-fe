import React from "react";

// ==========================================
// TYPES
// ==========================================
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "success";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// ==========================================
// STYLE CONFIG
// ==========================================
const VARIANT_STYLES: Record<
  ButtonVariant,
  { bg: string; color: string; border: string; hoverBg: string }
> = {
  primary: {
    bg: "#1D4ED8",
    color: "#fff",
    border: "transparent",
    hoverBg: "#1E40AF",
  },
  secondary: {
    bg: "#fff",
    color: "#374151",
    border: "#E5E7EB",
    hoverBg: "#F9FAFB",
  },
  danger: {
    bg: "#DC2626",
    color: "#fff",
    border: "transparent",
    hoverBg: "#B91C1C",
  },
  ghost: {
    bg: "transparent",
    color: "#6B7280",
    border: "#E5E7EB",
    hoverBg: "#F3F4F6",
  },
  success: {
    bg: "#10B981",
    color: "#fff",
    border: "transparent",
    hoverBg: "#059669",
  },
};

const SIZE_STYLES: Record<
  ButtonSize,
  { padding: string; fontSize: number; height: number }
> = {
  sm: { padding: "6px 12px", fontSize: 12, height: 32 },
  md: { padding: "9px 18px", fontSize: 14, height: 38 },
  lg: { padding: "12px 24px", fontSize: 15, height: 44 },
};

// ==========================================
// COMPONENT
// ==========================================
export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  style,
  onMouseOver,
  onMouseOut,
  ...props
}: ButtonProps) {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: s.padding,
        height: s.height,
        fontSize: s.fontSize,
        fontWeight: 600,
        fontFamily: "inherit",
        background: isDisabled ? "#E5E7EB" : v.bg,
        color: isDisabled ? "#9CA3AF" : v.color,
        border: `1px solid ${isDisabled ? "#E5E7EB" : v.border}`,
        borderRadius: 8,
        cursor: isDisabled ? "not-allowed" : "pointer",
        width: fullWidth ? "100%" : undefined,
        transition: "background 0.15s, color 0.15s, box-shadow 0.15s",
        whiteSpace: "nowrap",
        ...style,
      }}
      onMouseOver={(e) => {
        if (!isDisabled) {
          (e.currentTarget as HTMLButtonElement).style.background = v.hoverBg;
        }
        onMouseOver?.(e);
      }}
      onMouseOut={(e) => {
        if (!isDisabled) {
          (e.currentTarget as HTMLButtonElement).style.background = v.bg;
        }
        onMouseOut?.(e);
      }}
      {...props}
    >
      {loading ? (
        <>
          <span
            style={{
              display: "inline-block",
              width: 13,
              height: 13,
              border: "2px solid currentColor",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "btn-spin 0.7s linear infinite",
              flexShrink: 0,
            }}
          />
          Memproses...
        </>
      ) : (
        <>
          {icon && <span style={{ flexShrink: 0 }}>{icon}</span>}
          {children}
        </>
      )}
      <style>{`@keyframes btn-spin { to { transform: rotate(360deg) } }`}</style>
    </button>
  );
}
