"use client";

import type { BoxState } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";

interface BoxCardProps {
  id: number;
  name: string;
  state: BoxState;
  onClick?: () => void;
}

const STATE_COLORS: Record<BoxState, { background: string; text: string; border: string }> = {
  available: { background: "#e8f5e9", text: "#2d7a3a", border: "#a5d6a7" },
  occupied: { background: "#fff3e0", text: "#e65100", border: "#ffcc80" },
  reserved: { background: "#e3f2fd", text: "#1565c0", border: "#90caf9" },
};

export function BoxCard({ id, name, state, onClick }: BoxCardProps) {
  const { t } = useLanguage();
  const colors = STATE_COLORS[state];
  const isClickable = state === "available" && onClick;

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      aria-label={`${id}. ${name} – ${t(`map.state.${state}`)}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.25rem",
        padding: "0.75rem 0.5rem",
        border: `2px solid ${colors.border}`,
        borderRadius: 8,
        background: colors.background,
        cursor: isClickable ? "pointer" : "default",
        opacity: state === "reserved" ? 0.7 : 1,
        minWidth: 100,
        textAlign: "center",
        fontFamily: "inherit",
        fontSize: "inherit",
        transition: "box-shadow 0.15s",
      }}
    >
      <span
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          color: colors.text,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {t(`map.state.${state}`)}
      </span>
      <span style={{ fontSize: "1.25rem", fontWeight: 700 }}>#{id}</span>
      <span style={{ fontSize: "0.85rem", color: "#555" }}>{name}</span>
    </button>
  );
}
