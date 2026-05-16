import { useState, useEffect } from "react";

interface CountdownTimerProps {
  endDate: string; // ISO string dari promo.end_date
  primaryColor?: string;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  days: number;
  expired: boolean;
}

const calcTimeLeft = (endDate: string): TimeLeft => {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0)
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
};

const pad = (n: number) => String(n).padStart(2, "0");

function Digit({
  value,
  label,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.25)",
          borderRadius: 8,
          padding: "8px 12px",
          minWidth: 52,
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#fff",
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            display: "block",
          }}
        >
          {pad(value)}
        </span>
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "rgba(255,255,255,0.7)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer({
  endDate,
  primaryColor = "#3B82F6",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calcTimeLeft(endDate),
  );

  useEffect(() => {
    if (timeLeft.expired) return;
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(endDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate, timeLeft.expired]);

  if (timeLeft.expired) return null;

  const showDays = timeLeft.days > 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {showDays && (
        <>
          <Digit value={timeLeft.days} label="Hari" color={primaryColor} />
          <span
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "rgba(255,255,255,0.5)",
              marginBottom: 16,
            }}
          >
            :
          </span>
        </>
      )}
      <Digit value={timeLeft.hours} label="Jam" color={primaryColor} />
      <span
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: "rgba(255,255,255,0.5)",
          marginBottom: 16,
        }}
      >
        :
      </span>
      <Digit value={timeLeft.minutes} label="Menit" color={primaryColor} />
      <span
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: "rgba(255,255,255,0.5)",
          marginBottom: 16,
        }}
      >
        :
      </span>
      <Digit value={timeLeft.seconds} label="Detik" color={primaryColor} />
    </div>
  );
}
