"use client";

import type { PlanterBoxPublic, Greenhouse } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/translations";
import { BOX_STATE_COLORS } from "./boxStateColors";
import { getGreenhouseLayout } from "./greenhouseLayouts";
import type { BoxPosition, FixedElement } from "./greenhouseLayouts";
import { colors, fonts } from "@/styles/theme";

interface GreenhouseMapProps {
  boxes: PlanterBoxPublic[];
  greenhouse: Greenhouse;
  onSelectBox?: (boxId: number) => void;
}

function findBox(boxes: PlanterBoxPublic[], name: string): PlanterBoxPublic | undefined {
  return boxes.find((b) => b.name === name);
}

function BoxRect({
  pos,
  box,
  t,
  onSelect,
}: {
  pos: BoxPosition;
  box: PlanterBoxPublic | undefined;
  t: (key: TranslationKey) => string;
  onSelect?: () => void;
}) {
  const state = box?.state ?? "occupied";
  const stateColors = BOX_STATE_COLORS[state];
  const isClickable = state === "available" && onSelect;
  const stateKey = `map.state.${state}` as TranslationKey;

  const fontSize = Math.min(pos.width, pos.height) > 50 ? 9 : 7.5;
  const statusFontSize = fontSize - 1;
  const cx = pos.x + pos.width / 2;
  const cy = pos.y + pos.height / 2;

  return (
    <g
      role="button"
      aria-label={`${pos.name} – ${t(stateKey)}`}
      tabIndex={isClickable ? 0 : undefined}
      style={{ cursor: isClickable ? "pointer" : "default" }}
      onClick={isClickable ? onSelect : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
    >
      <rect
        x={pos.x}
        y={pos.y}
        width={pos.width}
        height={pos.height}
        rx={4}
        ry={4}
        fill={stateColors.background}
        stroke={stateColors.border}
        strokeWidth={1.5}
      />
      <text
        x={cx}
        y={cy - statusFontSize * 0.3}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight={600}
        fontFamily="Inter, system-ui, sans-serif"
        fill={stateColors.text}
      >
        {pos.name}
      </text>
      <text
        x={cx}
        y={cy + fontSize * 0.9}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={statusFontSize}
        fontFamily="Inter, system-ui, sans-serif"
        fill={stateColors.text}
        opacity={0.7}
      >
        {t(stateKey)}
      </text>
    </g>
  );
}

function FixedElementRect({ element }: { element: FixedElement }) {
  if (element.type === "door") {
    return (
      <g>
        <rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill={colors.parchment}
          stroke={colors.borderTan}
          strokeWidth={1}
          strokeDasharray="4 2"
        />
        <text
          x={element.x + element.width / 2}
          y={element.y + element.height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={7}
          fontFamily="Inter, system-ui, sans-serif"
          fill={colors.warmBrown}
          opacity={0.6}
        >
          ↕
        </text>
      </g>
    );
  }

  if (element.type === "label") {
    const lines = (element.label ?? "").split("\n");
    return (
      <g>
        <rect
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          rx={4}
          fill={colors.parchmentDark}
          stroke={colors.borderTan}
          strokeWidth={1}
          strokeDasharray="6 3"
          opacity={0.5}
        />
        {lines.map((line, i) => (
          <text
            key={i}
            x={element.x + element.width / 2}
            y={element.y + element.height / 2 + (i - (lines.length - 1) / 2) * 14}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontFamily="Inter, system-ui, sans-serif"
            fill={colors.warmBrown}
            opacity={0.5}
            fontStyle="italic"
          >
            {line}
          </text>
        ))}
      </g>
    );
  }

  // Table / fixed structure
  return (
    <rect
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rx={3}
      fill={colors.parchmentDark}
      stroke={colors.borderTan}
      strokeWidth={1}
      opacity={0.4}
    />
  );
}

export function GreenhouseMap({ boxes, greenhouse, onSelectBox }: GreenhouseMapProps) {
  const { t } = useLanguage();
  const layout = getGreenhouseLayout(greenhouse);

  return (
    <div style={{ width: "100%", fontFamily: fonts.body }}>
      <div style={{ textAlign: "center", marginBottom: "0.25rem" }}>
        <span
          style={{
            fontSize: "0.7rem",
            color: colors.warmBrown,
            opacity: 0.6,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          ▲ N
        </span>
      </div>
      <svg
        viewBox={layout.viewBox}
        style={{
          width: "100%",
          maxWidth: 600,
          height: "auto",
          display: "block",
          margin: "0 auto",
        }}
        role="img"
        aria-label={`${greenhouse} greenhouse map`}
      >
        {/* Greenhouse walls */}
        <rect
          x={layout.walls.x}
          y={layout.walls.y}
          width={layout.walls.width}
          height={layout.walls.height}
          rx={6}
          fill="none"
          stroke={colors.borderTan}
          strokeWidth={2}
        />

        {/* Fixed elements */}
        {layout.fixedElements.map((el, i) => (
          <FixedElementRect key={i} element={el} />
        ))}

        {/* Planter boxes */}
        {layout.boxes.map((pos) => {
          const box = findBox(boxes, pos.name);
          return (
            <BoxRect
              key={pos.name}
              pos={pos}
              box={box}
              t={t}
              onSelect={
                box && onSelectBox
                  ? () => onSelectBox(box.id)
                  : undefined
              }
            />
          );
        })}
      </svg>
    </div>
  );
}
