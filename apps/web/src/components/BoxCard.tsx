"use client";

import type { Greenhouse, PublicBoxState } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { BOX_STATE_COLORS } from "./boxStateColors";
import { colors as themeColors, fonts } from "@/styles/theme";

function FlowerSketch({ color }: { color: string }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      {/* Stem */}
      <path
        d="M18 36 V20"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Leaves */}
      <path
        d="M18 26 Q22 24 21 21"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M18 29 Q14 27 15 24"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      {/* Petals */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx="18"
          cy="11"
          rx="3.2"
          ry="6"
          transform={`rotate(${angle} 18 15)`}
          stroke={color}
          strokeWidth="1"
          fill="none"
          opacity="0.7"
        />
      ))}
      {/* Center */}
      <circle cx="18" cy="15" r="2.5" stroke={color} strokeWidth="1" fill="none" opacity="0.8" />
    </svg>
  );
}

function BirdSketch({ color }: { color: string }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      {/* Body */}
      <ellipse
        cx="17"
        cy="20"
        rx="8"
        ry="5.5"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
        opacity="0.7"
      />
      {/* Head */}
      <circle cx="26" cy="14" r="4" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
      {/* Beak */}
      <path
        d="M30 13.5 L34 14 L30 15"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />
      {/* Eye */}
      <circle cx="27.5" cy="13" r="0.8" fill={color} opacity="0.6" />
      {/* Neck */}
      <path
        d="M23 17 Q25 16 25 14"
        stroke={color}
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      {/* Tail */}
      <path
        d="M9 19 Q4 15 3 12"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M9 20 Q5 17 2 15"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      {/* Legs */}
      <path
        d="M14 25 L13 31 M14 31 L12 31"
        stroke={color}
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M19 25 L18 31 M19 31 L17 31"
        stroke={color}
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      {/* Wing detail */}
      <path
        d="M13 18 Q16 16 20 18"
        stroke={color}
        strokeWidth="0.8"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}

interface BoxCardProps {
  name: string;
  greenhouse: Greenhouse;
  state: PublicBoxState;
  onClick?: () => void;
}

export function BoxCard({ name, greenhouse, state, onClick }: BoxCardProps) {
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
      {greenhouse === "Søen" ? (
        <BirdSketch color={colors.text} />
      ) : (
        <FlowerSketch color={colors.text} />
      )}
      <span style={{ fontSize: "0.85rem", color: themeColors.warmBrown }}>{name}</span>
    </button>
  );
}
