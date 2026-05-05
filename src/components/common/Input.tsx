import React from "react";

// ==========================================
// TYPES
// ==========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  prefix?: string; // contoh: "Rp"
  suffix?: string; // contoh: "jam"
  fullWidth?: boolean;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  fullWidth?: boolean;
  minHeight?: number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// ==========================================
// SHARED STYLES
// ==========================================
const baseInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #E5E7EB",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  background: "#fff",
  color: "#111827",
  fontFamily: "inherit",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};

const errorStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#DC2626",
  marginTop: 4,
};

const hintStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#9CA3AF",
  marginTop: 4,
};

// ==========================================
// INPUT
// ==========================================
export function Input({
  label,
  error,
  hint,
  required,
  prefix,
  suffix,
  fullWidth = true,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!error) {
      e.currentTarget.style.borderColor = "#3B82F6";
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
    }
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = error ? "#EF4444" : "#E5E7EB";
    e.currentTarget.style.boxShadow = "none";
    onBlur?.(e);
  };

  const inputEl = (
    <input
      style={{
        ...baseInputStyle,
        borderColor: error ? "#EF4444" : "#E5E7EB",
        paddingLeft: prefix ? 36 : 14,
        paddingRight: suffix ? 40 : 14,
        width: fullWidth ? "100%" : undefined,
        ...style,
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );

  return (
    <div style={{ width: fullWidth ? "100%" : undefined }}>
      {label && (
        <label style={labelStyle}>
          {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
        </label>
      )}
      {prefix || suffix ? (
        <div style={{ position: "relative" }}>
          {prefix && (
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 13,
                color: "#6B7280",
                fontWeight: 600,
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              {prefix}
            </span>
          )}
          {inputEl}
          {suffix && (
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 13,
                color: "#6B7280",
                pointerEvents: "none",
              }}
            >
              {suffix}
            </span>
          )}
        </div>
      ) : (
        inputEl
      )}
      {error && <p style={errorStyle}>{error}</p>}
      {hint && !error && <p style={hintStyle}>{hint}</p>}
    </div>
  );
}

// ==========================================
// TEXTAREA
// ==========================================
export function Textarea({
  label,
  error,
  hint,
  required,
  fullWidth = true,
  minHeight = 80,
  style,
  onFocus,
  onBlur,
  ...props
}: TextareaProps) {
  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!error) {
      e.currentTarget.style.borderColor = "#3B82F6";
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
    }
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = error ? "#EF4444" : "#E5E7EB";
    e.currentTarget.style.boxShadow = "none";
    onBlur?.(e);
  };

  return (
    <div style={{ width: fullWidth ? "100%" : undefined }}>
      {label && (
        <label style={labelStyle}>
          {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
        </label>
      )}
      <textarea
        style={{
          ...baseInputStyle,
          borderColor: error ? "#EF4444" : "#E5E7EB",
          minHeight,
          resize: "vertical",
          width: fullWidth ? "100%" : undefined,
          ...style,
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {error && <p style={errorStyle}>{error}</p>}
      {hint && !error && <p style={hintStyle}>{hint}</p>}
    </div>
  );
}

// ==========================================
// SELECT
// ==========================================
export function Select({
  label,
  error,
  hint,
  required,
  fullWidth = true,
  style,
  onFocus,
  onBlur,
  children,
  ...props
}: SelectProps) {
  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#3B82F6";
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = error ? "#EF4444" : "#E5E7EB";
    onBlur?.(e);
  };

  return (
    <div style={{ width: fullWidth ? "100%" : undefined }}>
      {label && (
        <label style={labelStyle}>
          {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
        </label>
      )}
      <select
        style={{
          ...baseInputStyle,
          borderColor: error ? "#EF4444" : "#E5E7EB",
          cursor: "pointer",
          width: fullWidth ? "100%" : undefined,
          ...style,
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {children}
      </select>
      {error && <p style={errorStyle}>{error}</p>}
      {hint && !error && <p style={hintStyle}>{hint}</p>}
    </div>
  );
}

// Default export untuk kemudahan import
export default Input;
