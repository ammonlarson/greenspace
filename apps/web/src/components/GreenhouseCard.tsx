"use client";

import type { Greenhouse } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";

interface GreenhouseCardProps {
  name: Greenhouse;
  totalBoxes: number;
  availableBoxes: number;
  occupiedBoxes: number;
  onSelect?: () => void;
}

export function GreenhouseCard({
  name,
  totalBoxes,
  availableBoxes,
  occupiedBoxes,
  onSelect,
}: GreenhouseCardProps) {
  const { t } = useLanguage();

  return (
    <article
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
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
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: "1.25rem",
        minWidth: 240,
        flex: 1,
        cursor: onSelect ? "pointer" : "default",
        transition: "box-shadow 0.15s",
      }}
    >
      <h3 style={{ margin: "0 0 0.75rem" }}>{name}</h3>
      <dl style={{ margin: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
          <dt>{t("greenhouse.totalBoxes")}</dt>
          <dd style={{ margin: 0, fontWeight: 600 }}>{totalBoxes}</dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
          <dt>{t("greenhouse.available")}</dt>
          <dd style={{ margin: 0, fontWeight: 600, color: "#2d7a3a" }}>{availableBoxes}</dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
          <dt>{t("greenhouse.occupied")}</dt>
          <dd style={{ margin: 0, fontWeight: 600 }}>{occupiedBoxes}</dd>
        </div>
      </dl>
      {onSelect && (
        <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "#555" }}>
          {t("map.viewMap")} &rarr;
        </p>
      )}
    </article>
  );
}
