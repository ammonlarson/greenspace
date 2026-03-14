"use client";

import type { PlanterBoxPublic } from "@greenspace/shared";
import { MapBox } from "./MapBox";
import { colors, fonts } from "@/styles/theme";
import { useLanguage } from "@/i18n/LanguageProvider";

/**
 * Søen greenhouse visual map.
 *
 * Ticket #290 box numbering (bird names):
 *  1. Magpie         9. Wagtail
 *  2. Mallard       10. Mute swan
 *  3. Coot          11. Robin
 *  4. Nuthatch      12. Barn swallow
 *  5. Hooded crow   13. Black bird
 *  6. Graylag goose 14. Blue tit
 *  7. Greenfinch    15. Chaffinch
 *  8. Great tit
 *
 * Corrections:
 *  - Box 2 (Mallard) moved to be just north of box 9 (Wagtail).
 *
 * Layout: Rectangular greenhouse, north at top.
 * Two rows of boxes along west and east walls, central walkway.
 */

/**
 * Grid positions for each box.
 * The greenhouse is laid out as a grid:
 *   Columns: west-boxes | walkway | east-boxes
 *   Rows: north (top) to south (bottom)
 *
 * After corrections, Mallard (#2) is just north of Wagtail (#9).
 *
 * West column (top to bottom): 1,3,5,7, then 2(moved),9,11,13,15
 * East column (top to bottom): 4,6,8,10,12,14
 *
 * But with the correction: Mallard is just north of Wagtail,
 * so west column becomes: 1,3,5,7,2,9,11,13,15
 */

interface BoxPosition {
  name: string;
  gridRow: number;
  gridColumn: number;
}

const westBoxes: BoxPosition[] = [
  { name: "Magpie",        gridRow: 1,  gridColumn: 1 },
  { name: "Coot",          gridRow: 2,  gridColumn: 1 },
  { name: "Hooded crow",   gridRow: 3,  gridColumn: 1 },
  { name: "Greenfinch",    gridRow: 4,  gridColumn: 1 },
  { name: "Mallard",       gridRow: 5,  gridColumn: 1 },  // moved north of Wagtail
  { name: "Wagtail",       gridRow: 6,  gridColumn: 1 },
  { name: "Robin",         gridRow: 7,  gridColumn: 1 },
  { name: "Black bird",    gridRow: 8,  gridColumn: 1 },
  { name: "Chaffinch",     gridRow: 9,  gridColumn: 1 },
];

const eastBoxes: BoxPosition[] = [
  { name: "Nuthatch",      gridRow: 1,  gridColumn: 3 },
  { name: "Graylag goose", gridRow: 2,  gridColumn: 3 },
  { name: "Great tit",     gridRow: 3,  gridColumn: 3 },
  { name: "Mute swan",     gridRow: 4,  gridColumn: 3 },
  { name: "Barn swallow",  gridRow: 6,  gridColumn: 3 },
  { name: "Blue tit",      gridRow: 7,  gridColumn: 3 },
];

const ALL_POSITIONS = [...westBoxes, ...eastBoxes];

interface SoenMapProps {
  boxes: PlanterBoxPublic[];
  onSelectBox?: (boxId: number) => void;
}

export function SoenMap({ boxes, onSelectBox }: SoenMapProps) {
  const { t } = useLanguage();
  const boxByName = new Map(boxes.map((b) => [b.name, b]));

  return (
    <div style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
      <div
        style={{
          fontSize: "0.7rem",
          textAlign: "center",
          color: colors.warmBrown,
          fontFamily: fonts.body,
          marginBottom: "0.25rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {t("map.north") ?? "N"}
      </div>
      <div
        style={{
          border: `2px solid ${colors.borderTan}`,
          borderRadius: 12,
          background: colors.cream,
          padding: "1rem",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 24px 1fr",
            gridTemplateRows: "repeat(9, 48px)",
            gap: "6px",
            alignItems: "stretch",
          }}
        >
          {ALL_POSITIONS.map((pos) => {
            const box = boxByName.get(pos.name);
            if (!box) return null;
            return (
              <div
                key={box.id}
                style={{
                  gridRow: pos.gridRow,
                  gridColumn: pos.gridColumn,
                }}
              >
                <MapBox
                  name={box.name}
                  state={box.state}
                  onClick={onSelectBox ? () => onSelectBox(box.id) : undefined}
                />
              </div>
            );
          })}

          {/* Walkway label */}
          <div
            style={{
              gridRow: "1 / -1",
              gridColumn: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                fontSize: "0.55rem",
                color: colors.borderTan,
                fontFamily: fonts.body,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontWeight: 600,
              }}
            >
              {t("map.walkway") ?? "Walkway"}
            </span>
          </div>
        </div>

        {/* Entrance indicator at bottom (south) */}
        <div
          style={{
            textAlign: "center",
            marginTop: "0.5rem",
            fontSize: "0.6rem",
            color: colors.borderTan,
            fontFamily: fonts.body,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {t("map.entrance") ?? "Entrance"}
        </div>
      </div>
    </div>
  );
}
