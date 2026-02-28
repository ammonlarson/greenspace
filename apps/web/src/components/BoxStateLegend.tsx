"use client";

import { BOX_STATES, type BoxState } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";

const LEGEND_COLORS: Record<BoxState, { background: string; border: string }> = {
  available: { background: "#e8f5e9", border: "#a5d6a7" },
  occupied: { background: "#fff3e0", border: "#ffcc80" },
  reserved: { background: "#e3f2fd", border: "#90caf9" },
};

export function BoxStateLegend() {
  const { t } = useLanguage();

  return (
    <div
      role="list"
      aria-label={t("map.legend")}
      style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
    >
      {BOX_STATES.map((state) => {
        const colors = LEGEND_COLORS[state];
        return (
          <div
            key={state}
            role="listitem"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 16,
                borderRadius: 4,
                border: `2px solid ${colors.border}`,
                background: colors.background,
              }}
            />
            <span style={{ fontSize: "0.85rem" }}>{t(`map.state.${state}`)}</span>
          </div>
        );
      })}
    </div>
  );
}
