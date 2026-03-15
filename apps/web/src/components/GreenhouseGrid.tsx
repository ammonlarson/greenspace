"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function FitText({
  text,
  color,
  fontWeight,
  vertical,
}: {
  text: string;
  color: string;
  fontWeight: number;
  vertical?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(10);

  const fit = useCallback(() => {
    const container = containerRef.current;
    const span = textRef.current;
    if (!container || !span) return;

    const maxW = container.clientWidth;
    const maxH = container.clientHeight;
    if (maxW === 0 || maxH === 0) return;

    if (vertical) {
      let size = maxW;
      span.style.fontSize = `${size}px`;
      while (size > 4 && (span.scrollHeight > maxH || span.scrollWidth > maxW)) {
        size -= 1;
        span.style.fontSize = `${size}px`;
      }
      setFontSize(size);
    } else {
      let size = maxH;
      span.style.fontSize = `${size}px`;
      while (size > 4 && span.scrollWidth > maxW) {
        size -= 1;
        span.style.fontSize = `${size}px`;
      }
      setFontSize(size);
    }
  }, [vertical]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [fit]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        alignItems: vertical ? "flex-start" : "center",
        justifyContent: vertical ? "center" : undefined,
      }}
    >
      <span
        ref={textRef}
        style={{
          fontSize,
          color,
          fontWeight,
          whiteSpace: "nowrap",
          fontFamily: fonts.body,
          writingMode: vertical ? "vertical-rl" : undefined,
        }}
      >
        {text}
      </span>
    </div>
  );
}

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
      style={{
        gridRow: `${item.row} / span ${item.height}`,
        gridColumn: `${item.col} / span ${item.width}`,
        display: "flex",
        alignItems: item.verticalAlign === "top" ? "flex-start" : "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        role="img"
        aria-label={t("map.grid.door")}
        style={{
          width: "100%",
          height: "50%",
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
        }}
      >
      </div>
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

  const isChair = item.type === "chair";
  const isBench = item.type === "bench";
  const needsWrapper = isChair || isBench;

  const inner = (
    <div
      role="img"
      aria-label={t(labelKey)}
      style={{
        background: style.background,
        border: `1px solid ${style.border}`,
        borderRadius: 4,
        aspectRatio: item.type === "column" ? "1" : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.6rem",
        color: style.text,
        fontFamily: fonts.body,
        minHeight: 24,
        width: isChair ? "50%" : isBench ? "85%" : undefined,
        height: "100%",
        ...(needsWrapper ? {} : {
          gridRow: `${item.row} / span ${item.height}`,
          gridColumn: `${item.col} / span ${item.width}`,
        }),
      }}
    >
      {item.type === "door" ? t(labelKey) : ""}
    </div>
  );

  if (needsWrapper) {
    return (
      <div
        style={{
          gridRow: `${item.row} / span ${item.height}`,
          gridColumn: `${item.col} / span ${item.width}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {inner}
      </div>
    );
  }

  return inner;
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
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        gap: "0.15rem",
        border: `2px solid ${boxColors.border}`,
        borderRadius: 6,
        background: "#fdfdfd",
        cursor: isClickable ? "pointer" : "default",
        padding: "0.25rem 0.15rem",
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
          width: "100%",
          textAlign: "center",
        }}
      >
        {t(`map.state.${state}` as TranslationKey)}
      </span>
      {isVertical ? (
        <>
          <Image
            src={boxImagePath(name)}
            alt=""
            width={40}
            height={40}
            style={{
              objectFit: "contain",
              flexShrink: 0,
              maxWidth: "80%",
              transform: "rotate(90deg)",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <FitText
            text={name}
            color={colors.warmBrown}
            fontWeight={500}
            vertical
          />
        </>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.25rem",
            flex: 1,
            minHeight: 0,
            width: "100%",
            overflow: "hidden",
          }}
        >
          <Image
            src={boxImagePath(name)}
            alt=""
            width={60}
            height={60}
            style={{
              objectFit: "contain",
              flexShrink: 0,
              height: "100%",
              width: "auto",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <FitText text={name} color={colors.warmBrown} fontWeight={500} />
        </div>
      )}
    </button>
  );
}

function GridSharedBox({
  item,
  t,
}: {
  item: GridItemPlacement;
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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.15rem",
        border: `2px solid ${SHARED_BOX_COLORS.border}`,
        borderRadius: 6,
        background: SHARED_BOX_COLORS.background,
        padding: "0.25rem 0.15rem",
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
        maxWidth: 750,
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
