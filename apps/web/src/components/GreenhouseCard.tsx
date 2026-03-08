"use client";

import type { Greenhouse } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { colors, fonts, shadows } from "@/styles/theme";

interface GreenhouseCardProps {
  name: Greenhouse;
  totalBoxes: number;
  availableBoxes: number;
  occupiedBoxes: number;
  onSelect?: () => void;
}

function KronenIllustration() {
  return (
    <svg
      width="120"
      height="80"
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block", margin: "0 auto 0.75rem" }}
    >
      {/* Greenhouse frame */}
      <rect x="15" y="30" width="90" height="45" rx="2" stroke={colors.sage} strokeWidth="1.5" fill={colors.borderTan} fillOpacity="0.3" />
      {/* Roof */}
      <path d="M15 30 L60 8 L105 30" stroke={colors.sage} strokeWidth="1.5" fill={colors.borderTan} fillOpacity="0.15" />
      {/* Roof lines */}
      <line x1="37" y1="19" x2="37" y2="30" stroke={colors.sage} strokeWidth="1" />
      <line x1="60" y1="8" x2="60" y2="30" stroke={colors.sage} strokeWidth="1" />
      <line x1="83" y1="19" x2="83" y2="30" stroke={colors.sage} strokeWidth="1" />
      {/* Flowers / plants */}
      <circle cx="35" cy="58" r="4" stroke={colors.sage} strokeWidth="1.2" fill="none" />
      <circle cx="35" cy="52" r="3" stroke={colors.sage} strokeWidth="1" fill="none" />
      <line x1="35" y1="62" x2="35" y2="75" stroke={colors.sage} strokeWidth="1.2" />
      <ellipse cx="32" cy="66" rx="3" ry="1.5" stroke={colors.sage} strokeWidth="0.8" fill="none" />
      <circle cx="60" cy="55" r="5" stroke={colors.sage} strokeWidth="1.2" fill="none" />
      <circle cx="57" cy="50" r="3" stroke={colors.sage} strokeWidth="1" fill="none" />
      <circle cx="63" cy="50" r="3" stroke={colors.sage} strokeWidth="1" fill="none" />
      <line x1="60" y1="60" x2="60" y2="75" stroke={colors.sage} strokeWidth="1.2" />
      <circle cx="85" cy="56" r="4" stroke={colors.sage} strokeWidth="1.2" fill="none" />
      <line x1="85" y1="60" x2="85" y2="75" stroke={colors.sage} strokeWidth="1.2" />
      <ellipse cx="88" cy="64" rx="3" ry="1.5" stroke={colors.sage} strokeWidth="0.8" fill="none" />
      {/* Ground */}
      <line x1="10" y1="75" x2="110" y2="75" stroke={colors.sage} strokeWidth="1.2" />
    </svg>
  );
}

function SoenIllustration() {
  return (
    <svg
      width="120"
      height="80"
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block", margin: "0 auto 0.75rem" }}
    >
      {/* Greenhouse frame */}
      <rect x="15" y="30" width="90" height="45" rx="2" stroke={colors.sage} strokeWidth="1.5" fill={colors.borderTan} fillOpacity="0.3" />
      {/* Roof */}
      <path d="M15 30 L60 8 L105 30" stroke={colors.sage} strokeWidth="1.5" fill={colors.borderTan} fillOpacity="0.15" />
      {/* Roof lines */}
      <line x1="37" y1="19" x2="37" y2="30" stroke={colors.sage} strokeWidth="1" />
      <line x1="60" y1="8" x2="60" y2="30" stroke={colors.sage} strokeWidth="1" />
      <line x1="83" y1="19" x2="83" y2="30" stroke={colors.sage} strokeWidth="1" />
      {/* Bird on roof - left */}
      <path d="M30 18 Q35 12 40 16" stroke={colors.sage} strokeWidth="1.3" fill="none" />
      <path d="M40 16 Q45 12 50 18" stroke={colors.sage} strokeWidth="1.3" fill="none" />
      {/* Bird flying - right */}
      <path d="M75 5 Q80 0 85 4" stroke={colors.sage} strokeWidth="1.2" fill="none" />
      <path d="M85 4 Q90 0 95 5" stroke={colors.sage} strokeWidth="1.2" fill="none" />
      {/* Plants inside */}
      <path d="M35 75 Q37 62 40 68 Q43 58 45 75" stroke={colors.sage} strokeWidth="1.2" fill="none" />
      <path d="M75 75 Q78 60 81 66 Q84 56 87 75" stroke={colors.sage} strokeWidth="1.2" fill="none" />
      {/* Ground */}
      <line x1="10" y1="75" x2="110" y2="75" stroke={colors.sage} strokeWidth="1.2" />
    </svg>
  );
}

export function GreenhouseCard({
  name,
  totalBoxes,
  availableBoxes,
  occupiedBoxes,
  onSelect,
}: GreenhouseCardProps) {
  const { t } = useLanguage();

  const isKronen = name.includes("Kronen");

  return (
    <article
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? `${name} – ${t("map.viewMap")}` : undefined}
      onClick={onSelect}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      style={{
        background: colors.parchment,
        border: `1px solid ${colors.borderTan}`,
        borderRadius: 10,
        boxShadow: shadows.card,
        padding: "1.25rem",
        minWidth: 240,
        flex: 1,
        cursor: onSelect ? "pointer" : "default",
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = shadows.cardHover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = shadows.card;
      }}
    >
      {isKronen ? <KronenIllustration /> : <SoenIllustration />}
      <h3 style={{ margin: "0 0 0.75rem", fontFamily: fonts.heading, color: colors.warmBrown }}>{name}</h3>
      <dl style={{ margin: 0, fontFamily: fonts.body, color: colors.inkBrown }}>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
          <dt>{t("greenhouse.totalBoxes")}</dt>
          <dd style={{ margin: 0, fontWeight: 600 }}>{totalBoxes}</dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
          <dt>{t("greenhouse.available")}</dt>
          <dd style={{ margin: 0, fontWeight: 600, color: colors.sageDark }}>{availableBoxes}</dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
          <dt>{t("greenhouse.occupied")}</dt>
          <dd style={{ margin: 0, fontWeight: 600 }}>{occupiedBoxes}</dd>
        </div>
      </dl>
      {onSelect && (
        <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: colors.sage }}>
          {t("map.viewMap")} &rarr;
        </p>
      )}
    </article>
  );
}
