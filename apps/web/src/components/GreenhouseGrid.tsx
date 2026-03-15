"use client";

import { useMemo } from "react";
import Image from "next/image";
import type {
  PlanterBoxPublic,
  GreenhouseGridConfig,
  GridItemPlacement,
  GridItemType,
} from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/translations";
import { BOX_STATE_COLORS, SHARED_BOX_COLORS } from "./boxStateColors";
import { colors, fonts } from "@/styles/theme";

interface GreenhouseGridProps {
  config: GreenhouseGridConfig;
  boxes: PlanterBoxPublic[];
  onSelectBox?: (boxId: number) => void;
}

function boxImagePath(name: string): string {
  return `/${name.toLowerCase().replace(/ /g, "_")}.png`;
}

const ITEM_STYLES: Record<GridItemType, { background: string; border: string; text: string }> = {
  planter_box: BOX_STATE_COLORS.available,
  shared_box: SHARED_BOX_COLORS,
  column: { background: "#D4D4D4", border: "#999999", text: "#555555" },
  table: { background: "#E8DDD0", border: "#C4B5A0", text: "#6B5243" },
  chair: { background: "#E8DDD0", border: "#C4B5A0", text: "#6B5243" },
  bench: { background: "#D9CFC2", border: "#B5A48E", text: "#5A4A3A" },
  door: { background: "#D6E8F0", border: "#89B4C8", text: "#3D6B80" },
};

const FIXED_ITEM_LABELS: Record<string, TranslationKey> = {
  column: "map.grid.column",
  table: "map.grid.table",
  chair: "map.grid.chair",
  bench: "map.grid.bench",
  door: "map.grid.door",
};

function GridDoor({ item, t }: { item: GridItemPlacement; t: (key: TranslationKey) => string }) {
  return (
    <div
      role="img"
      aria-label={t("map.grid.door")}
      style={{
        gridRow: `${item.row} / span ${item.height}`,
        gridColumn: `${item.col} / span ${item.width}`,
        background: ITEM_STYLES.door.background,
        border: `1px solid ${ITEM_STYLES.door.border}`,
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.65rem",
        fontWeight: 600,
        color: ITEM_STYLES.door.text,
        fontFamily: fonts.body,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        minHeight: 24,
      }}
    >
      {t("map.grid.door")}
    </div>
  );
}

function GridFixedElement({
  item,
  t,
}: {
  item: GridItemPlacement;
  t: (key: TranslationKey) => string;
}) {
  const style = ITEM_STYLES[item.type];
  const labelKey = FIXED_ITEM_LABELS[item.type] ?? "map.grid.column" as TranslationKey;

  return (
    <div
      role="img"
      aria-label={t(labelKey)}
      style={{
        gridRow: `${item.row} / span ${item.height}`,
        gridColumn: `${item.col} / span ${item.width}`,
        background: style.background,
        border: `1px solid ${style.border}`,
        borderRadius: item.type === "column" ? "50%" : 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.6rem",
        color: style.text,
        fontFamily: fonts.body,
        minHeight: 24,
      }}
    >
      {item.type === "column" ? "" : t(labelKey)}
    </div>
  );
}

function GridPlanterBox({
  item,
  box,
  isVertical,
  onSelect,
  t,
}: {
  item: GridItemPlacement;
  box: PlanterBoxPublic | undefined;
  isVertical: boolean;
  onSelect?: () => void;
  t: (key: TranslationKey) => string;
}) {
  const state = box?.state ?? "available";
  const boxColors = BOX_STATE_COLORS[state];
  const isClickable = state === "available" && onSelect;
  const name = item.label ?? "";

  return (
    <button
      type="button"
      onClick={isClickable ? onSelect : undefined}
      disabled={!isClickable}
      aria-label={`${name} – ${t(`map.state.${state}` as TranslationKey)}`}
      style={{
        gridRow: `${item.row} / span ${item.height}`,
        gridColumn: `${item.col} / span ${item.width}`,
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        gap: isVertical ? "0.15rem" : "0.35rem",
        border: `2px solid ${boxColors.border}`,
        borderRadius: 6,
        background: "#fdfdfd",
        cursor: isClickable ? "pointer" : "default",
        padding: isVertical ? "0.25rem 0.15rem" : "0.15rem 0.35rem",
        fontFamily: fonts.body,
        fontSize: "inherit",
        overflow: "hidden",
        transition: "box-shadow 0.15s",
        minHeight: 0,
      }}
    >
      <span
        style={{
          fontSize: "0.55rem",
          fontWeight: 700,
          color: boxColors.text,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          background: boxColors.background,
          padding: "0.1rem 0.25rem",
          borderRadius: 3,
          whiteSpace: "nowrap",
        }}
      >
        {t(`map.state.${state}` as TranslationKey)}
      </span>
      <Image
        src={boxImagePath(name)}
        alt=""
        width={20}
        height={20}
        style={{ objectFit: "contain", flexShrink: 0 }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <span
        style={{
          fontSize: "0.6rem",
          color: colors.warmBrown,
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          writingMode: isVertical ? "vertical-rl" : undefined,
          textOrientation: isVertical ? "mixed" : undefined,
          maxHeight: isVertical ? "100%" : undefined,
          maxWidth: isVertical ? undefined : "100%",
        }}
      >
        {name}
      </span>
    </button>
  );
}

function GridSharedBox({
  item,
  isVertical,
  t,
}: {
  item: GridItemPlacement;
  isVertical: boolean;
  t: (key: TranslationKey) => string;
}) {
  const name = item.label ?? "";

  return (
    <div
      role="img"
      aria-label={`${name} – ${t("map.state.shared")}`}
      style={{
        gridRow: `${item.row} / span ${item.height}`,
        gridColumn: `${item.col} / span ${item.width}`,
        display: "flex",
        flexDirection: isVertical ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        gap: isVertical ? "0.15rem" : "0.35rem",
        border: `2px solid ${SHARED_BOX_COLORS.border}`,
        borderRadius: 6,
        background: SHARED_BOX_COLORS.background,
        padding: isVertical ? "0.25rem 0.15rem" : "0.15rem 0.35rem",
        fontFamily: fonts.body,
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <span
        style={{
          fontSize: "0.55rem",
          fontWeight: 700,
          color: SHARED_BOX_COLORS.text,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
        }}
      >
        {t("map.state.shared")}
      </span>
      <span
        style={{
          fontSize: "0.6rem",
          color: SHARED_BOX_COLORS.text,
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {name}
      </span>
    </div>
  );
}

export function GreenhouseGrid({ config, boxes, onSelectBox }: GreenhouseGridProps) {
  const { t } = useLanguage();

  const boxMap = useMemo(() => new Map(boxes.map((b) => [b.id, b])), [boxes]);

  return (
    <div
      data-testid="greenhouse-grid"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
        gridTemplateRows: `repeat(${config.rows}, 1fr)`,
        aspectRatio: `${config.cols} / ${config.rows}`,
        gap: "3px",
        width: "100%",
        maxWidth: 600,
        margin: "0 auto",
        fontFamily: fonts.body,
        background: colors.parchment,
        border: `1px solid ${colors.borderTan}`,
        borderRadius: 8,
        padding: "6px",
      }}
    >
      {config.items.map((item, idx) => {
        const key = `${item.type}-${item.row}-${item.col}-${idx}`;
        const isVertical = item.height > item.width;

        switch (item.type) {
          case "door":
            return <GridDoor key={key} item={item} t={t} />;

          case "planter_box": {
            const boxId = item.boxId;
            return (
              <GridPlanterBox
                key={key}
                item={item}
                box={boxId ? boxMap.get(boxId) : undefined}
                isVertical={isVertical}
                onSelect={
                  boxId && onSelectBox
                    ? () => onSelectBox(boxId)
                    : undefined
                }
                t={t}
              />
            );
          }

          case "shared_box":
            return (
              <GridSharedBox
                key={key}
                item={item}
                isVertical={isVertical}
                t={t}
              />
            );

          default:
            return (
              <GridFixedElement key={key} item={item} t={t} />
            );
        }
      })}
    </div>
  );
}
