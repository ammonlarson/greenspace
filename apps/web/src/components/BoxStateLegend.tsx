"use client";

import { BOX_STATES } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { BOX_STATE_COLORS } from "./boxStateColors";

export function BoxStateLegend() {
  const { t } = useLanguage();

  return (
    <div
      role="list"
      aria-label={t("map.legend")}
      style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
    >
      {BOX_STATES.map((state) => {
        const colors = BOX_STATE_COLORS[state];
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
