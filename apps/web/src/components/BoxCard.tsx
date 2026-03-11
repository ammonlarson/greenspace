"use client";

import type { PublicBoxState } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { BOX_STATE_COLORS } from "./boxStateColors";
import { colors as themeColors, fonts } from "@/styles/theme";

function boxImagePath(name: string): string {
  return `/${name.toLowerCase().replace(/ /g, "_")}.png`;
}

interface BoxCardProps {
  name: string;
  state: PublicBoxState;
  onClick?: () => void;
}

export function BoxCard({ name, state, onClick }: BoxCardProps) {
  const { t } = useLanguage();
  const colors = BOX_STATE_COLORS[state];
  const isClickable = state === "available" && onClick;

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      aria-label={`${name} – ${t(`map.state.${state}`)}`}
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
        opacity: state !== "available" ? 0.7 : 1,
        minWidth: 100,
        textAlign: "center",
        fontFamily: fonts.body,
        fontSize: "inherit",
        overflow: "hidden",
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
      <img
        src={boxImagePath(name)}
        alt={name}
        width={48}
        height={48}
        style={{ objectFit: "contain", opacity: state !== "available" ? 0.6 : 1 }}
      />
      <span style={{ fontSize: "0.85rem", color: themeColors.warmBrown }}>{name}</span>
    </button>
  );
}
