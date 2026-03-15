"use client";

import { PUBLIC_BOX_STATES } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { BOX_STATE_COLORS, SHARED_BOX_COLORS } from "./boxStateColors";
import { colors as themeColors, fonts } from "@/styles/theme";
import type { TranslationKey } from "@/i18n/translations";

const LEGEND_ITEMS: { key: TranslationKey; colors: { background: string; border: string } }[] = [
  ...PUBLIC_BOX_STATES.map((state) => ({
    key: `map.state.${state}` as TranslationKey,
    colors: BOX_STATE_COLORS[state],
  })),
  {
    key: "map.state.shared" as TranslationKey,
    colors: SHARED_BOX_COLORS,
  },
];

export function BoxStateLegend() {
  const { t } = useLanguage();

  return (
    <div
      role="list"
      aria-label={t("map.legend")}
      style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
    >
      {LEGEND_ITEMS.map(({ key, colors }) => (
        <div
          key={key}
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
          <span style={{ fontSize: "0.85rem", fontFamily: fonts.body, color: themeColors.inkBrown }}>{t(key)}</span>
        </div>
      ))}
    </div>
  );
}
