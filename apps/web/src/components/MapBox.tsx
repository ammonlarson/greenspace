"use client";

import type { PublicBoxState } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { BOX_STATE_COLORS } from "./boxStateColors";
import { colors as themeColors, fonts } from "@/styles/theme";

interface MapBoxProps {
  name: string;
  state: PublicBoxState;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function MapBox({ name, state, onClick, style }: MapBoxProps) {
  const { t } = useLanguage();
  const stateColors = BOX_STATE_COLORS[state];
  const isClickable = state === "available" && !!onClick;

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
        justifyContent: "center",
        border: `2px solid ${stateColors.border}`,
        borderRadius: 6,
        background: "#fdfdfd",
        cursor: isClickable ? "pointer" : "default",
        textAlign: "center",
        fontFamily: fonts.body,
        fontSize: "inherit",
        overflow: "hidden",
        transition: "box-shadow 0.15s",
        padding: 0,
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      <span
        style={{
          fontSize: "0.6rem",
          fontWeight: 700,
          color: stateColors.text,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          background: stateColors.background,
          width: "100%",
          padding: "0.2rem 0.25rem",
        }}
      >
        {t(`map.state.${state}`)}
      </span>
      <span
        style={{
          fontSize: "0.7rem",
          color: themeColors.warmBrown,
          padding: "0.15rem 0.25rem 0.25rem",
          lineHeight: 1.2,
          fontWeight: 500,
        }}
      >
        {name}
      </span>
    </button>
  );
}

interface CommunityBoxProps {
  label: string;
  style?: React.CSSProperties;
}

export function CommunityBox({ label, style }: CommunityBoxProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px dashed ${themeColors.borderTan}`,
        borderRadius: 6,
        background: themeColors.parchment,
        textAlign: "center",
        fontFamily: fonts.body,
        fontSize: "0.6rem",
        color: themeColors.warmBrown,
        padding: "0.25rem",
        width: "100%",
        height: "100%",
        opacity: 0.7,
        ...style,
      }}
    >
      {label}
    </div>
  );
}
