"use client";

import type { PlanterBoxPublic } from "@greenspace/shared";
import { BoxCard } from "./BoxCard";
import { colors, fonts } from "@/styles/theme";

interface GreenhouseMapProps {
  boxes: PlanterBoxPublic[];
  onSelectBox?: (boxId: number) => void;
}

/**
 * Grid positions for the first 11 boxes in the floor plan.
 * Boxes are placed by catalog order (ID) to match physical layout.
 */
const MAP_SLOTS: { gridRow: string; gridColumn: string }[] = [
  { gridRow: "1", gridColumn: "1" },
  { gridRow: "1", gridColumn: "2" },
  { gridRow: "1", gridColumn: "5" },
  { gridRow: "1", gridColumn: "6" },
  { gridRow: "2", gridColumn: "6" },
  { gridRow: "3", gridColumn: "6" },
  { gridRow: "4", gridColumn: "6" },
  { gridRow: "5", gridColumn: "1" },
  { gridRow: "5", gridColumn: "6" },
  { gridRow: "6", gridColumn: "1" },
  { gridRow: "7", gridColumn: "6" },
];

const STRUCTURES: { gridRow: string; gridColumn: string }[] = [
  { gridRow: "2", gridColumn: "1 / 4" },
  { gridRow: "3 / 5", gridColumn: "1 / 3" },
  { gridRow: "5 / 8", gridColumn: "4 / 6" },
  { gridRow: "7", gridColumn: "1 / 3" },
];

const UTILITIES: { gridRow: string; gridColumn: string }[] = [
  { gridRow: "5", gridColumn: "3" },
  { gridRow: "6", gridColumn: "3" },
  { gridRow: "7", gridColumn: "3" },
];

const hatchBackground = `repeating-linear-gradient(
  45deg,
  ${colors.parchment},
  ${colors.parchment} 4px,
  ${colors.borderTan} 4px,
  ${colors.borderTan} 5px
)`;

export function GreenhouseMap({ boxes, onSelectBox }: GreenhouseMapProps) {
  const sortedById = [...boxes].sort((a, b) => a.id - b.id);
  const mapBoxes = sortedById.slice(0, MAP_SLOTS.length);
  const overflowBoxes = sortedById.slice(MAP_SLOTS.length);

  return (
    <div style={{ fontFamily: fonts.body }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gridTemplateRows: "repeat(7, auto)",
          gap: "0.5rem",
          marginBottom: overflowBoxes.length > 0 ? "1.5rem" : 0,
        }}
      >
        {mapBoxes.map((box, i) => (
          <div
            key={box.id}
            style={{
              gridRow: MAP_SLOTS[i].gridRow,
              gridColumn: MAP_SLOTS[i].gridColumn,
            }}
          >
            <BoxCard
              name={box.name}
              state={box.state}
              onClick={onSelectBox ? () => onSelectBox(box.id) : undefined}
            />
          </div>
        ))}

        {STRUCTURES.map((pos, i) => (
          <div
            key={`struct-${i}`}
            style={{
              gridRow: pos.gridRow,
              gridColumn: pos.gridColumn,
              background: hatchBackground,
              borderRadius: 6,
              border: `1px solid ${colors.borderTan}`,
              minHeight: 60,
            }}
          />
        ))}

        {UTILITIES.map((pos, i) => (
          <div
            key={`util-${i}`}
            style={{
              gridRow: pos.gridRow,
              gridColumn: pos.gridColumn,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: `2px solid ${colors.borderTan}`,
                background: colors.parchment,
              }}
            />
          </div>
        ))}
      </div>

      {overflowBoxes.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {overflowBoxes.map((box) => (
            <BoxCard
              key={box.id}
              name={box.name}
              state={box.state}
              onClick={onSelectBox ? () => onSelectBox(box.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
