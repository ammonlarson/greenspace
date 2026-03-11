"use client";

import Image from "next/image";
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

function KronenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M10 16 C10 16 10 10 10 8 M10 8 C8 6 6 7 5 9 M10 8 C12 6 14 7 15 9 M10 12 C8.5 11 7 12 6.5 13.5 M10 12 C11.5 11 13 12 13.5 13.5" stroke={colors.sage} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function SoenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 12 C4 12 6 10 8 11 C10 12 9 14 7 14 C5 14 4 12 4 12Z" stroke={colors.sage} strokeWidth="1.2" fill="none" />
      <circle cx="6" cy="11.5" r="0.8" fill={colors.sage} />
      <path d="M8 13 L10 14 L12 13" stroke={colors.sage} strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M12 11 L14 10 L16 11" stroke={colors.sage} strokeWidth="1.2" strokeLinecap="round" fill="none" />
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
  const imageSrc = isKronen ? "/kronen.png" : "/soen.png";

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
        position: "relative",
        flex: 1,
        minWidth: 200,
        cursor: onSelect ? "pointer" : "default",
      }}
    >
      {/* Greenhouse image */}
      <div style={{
        width: "100%",
        aspectRatio: "2.2 / 1",
        position: "relative",
        marginBottom: "-2rem",
      }}>
        <Image
          src={imageSrc}
          alt={name}
          fill
          style={{ objectFit: "contain", objectPosition: "bottom" }}
          sizes="(max-width: 600px) 45vw, 300px"
          priority
        />
      </div>

      {/* Info card overlay */}
      <div style={{
        position: "relative",
        background: colors.overlayWhite,
        borderRadius: 10,
        padding: "0.75rem 1rem",
        boxShadow: shadows.overlay,
        border: `1px solid ${colors.overlayBorder}`,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          marginBottom: "0.35rem",
        }}>
          {isKronen ? <KronenIcon /> : <SoenIcon />}
          <h3 style={{
            margin: 0,
            fontFamily: fonts.heading,
            fontSize: "1.05rem",
            color: colors.inkBrown,
            fontWeight: 600,
          }}>{name}</h3>
        </div>

        <div style={{
          fontFamily: fonts.body,
          fontSize: "0.85rem",
          color: colors.sage,
          lineHeight: 1.6,
        }}>
          <span><strong style={{ color: colors.inkBrown }}>{totalBoxes}</strong> {t("greenhouse.totalBoxes")}</span>
          <span style={{ margin: "0 0.15rem", color: colors.borderTan }}> · </span>
          <span><strong style={{ color: colors.sageDark }}>{availableBoxes}</strong> {t("greenhouse.available")}</span>
          <span style={{ margin: "0 0.15rem", color: colors.borderTan }}> · </span>
          <span><strong style={{ color: colors.inkBrown }}>{occupiedBoxes}</strong> {t("greenhouse.occupied")}</span>
        </div>

        {onSelect && (
          <p style={{
            margin: "0.5rem 0 0",
            fontSize: "0.8rem",
            color: colors.sage,
            fontFamily: fonts.body,
          }}>
            {t("map.viewMap")} &rsaquo;
          </p>
        )}
      </div>
    </article>
  );
}
