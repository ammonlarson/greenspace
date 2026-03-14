"use client";

import type { PlanterBoxPublic } from "@greenspace/shared";
import { MapBox, CommunityBox } from "./MapBox";
import { colors, fonts } from "@/styles/theme";
import { useLanguage } from "@/i18n/LanguageProvider";

/**
 * Kronen greenhouse visual map.
 *
 * Ticket #290 program boxes (flower names):
 *  1. Buttercup      8. Linden
 *  2. Daisy          9. Seabuck
 *  3. Harebell      10. Stellaria
 *  4. Yarrow        11. Honeysuckle
 *  5. Hawthorn      12. Thistle
 *  6. Jenny         13. Anemone
 *  7. Linaria       14. Alder
 *
 * Community shared boxes: 4 total (not part of program).
 *
 * Corrections:
 *  - Box 14 (Alder) moved to be just north of box 13 (Anemone).
 *  - Box 4 (Yarrow) moved to be just east of box 12 (Thistle).
 *
 * Layout: Rectangular greenhouse, north at top.
 * Two rows of boxes along west and east walls, central walkway.
 * Community boxes shown at the north end.
 */

interface BoxPosition {
  name: string;
  gridRow: number;
  gridColumn: number;
}

/**
 * West column: community boxes at top, then program boxes going south.
 * East column: program boxes.
 *
 * After corrections:
 *  - Alder (#14) is just north of Anemone (#13)
 *  - Yarrow (#4) is just east of Thistle (#12)
 *
 * West side (top to bottom): Community1, Community2, 1(Buttercup), 3(Harebell), 5(Hawthorn), 7(Linaria), 9(Seabuck), 11(Honeysuckle), 13(Anemone)
 * With Alder just north of Anemone: ..., 11(Honeysuckle), 14(Alder), 13(Anemone)
 *
 * East side (top to bottom): Community1, Community2, 2(Daisy), 6(Jenny), 8(Linden), 10(Stellaria), 12(Thistle)+4(Yarrow side-by-side)
 * With Yarrow just east of Thistle: Yarrow is in a 3rd column next to Thistle
 */

const westBoxes: BoxPosition[] = [
  { name: "Buttercup",   gridRow: 3,  gridColumn: 1 },
  { name: "Harebell",    gridRow: 4,  gridColumn: 1 },
  { name: "Hawthorn",    gridRow: 5,  gridColumn: 1 },
  { name: "Linaria",     gridRow: 6,  gridColumn: 1 },
  { name: "Seabuck",     gridRow: 7,  gridColumn: 1 },
  { name: "Honeysuckle", gridRow: 8,  gridColumn: 1 },
  { name: "Alder",       gridRow: 9,  gridColumn: 1 },  // moved north of Anemone
  { name: "Anemone",     gridRow: 10, gridColumn: 1 },
];

const eastBoxes: BoxPosition[] = [
  { name: "Daisy",     gridRow: 3,  gridColumn: 3 },
  { name: "Jenny",     gridRow: 4,  gridColumn: 3 },
  { name: "Linden",    gridRow: 5,  gridColumn: 3 },
  { name: "Stellaria", gridRow: 6,  gridColumn: 3 },
  { name: "Thistle",   gridRow: 7,  gridColumn: 3 },
  { name: "Yarrow",    gridRow: 7,  gridColumn: 4 },  // moved east of Thistle
];

const ALL_POSITIONS = [...westBoxes, ...eastBoxes];

interface CommunityPosition {
  label: string;
  gridRow: number;
  gridColumn: number;
}

const communityBoxes: CommunityPosition[] = [
  { label: "Community 1", gridRow: 1, gridColumn: 1 },
  { label: "Community 2", gridRow: 2, gridColumn: 1 },
  { label: "Community 1", gridRow: 1, gridColumn: 3 },
  { label: "Community 2", gridRow: 2, gridColumn: 3 },
];

interface KronenMapProps {
  boxes: PlanterBoxPublic[];
  onSelectBox?: (boxId: number) => void;
}

export function KronenMap({ boxes, onSelectBox }: KronenMapProps) {
  const { t } = useLanguage();
  const boxByName = new Map(boxes.map((b) => [b.name, b]));

  return (
    <div style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}>
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
            gridTemplateColumns: "1fr 24px 1fr auto",
            gridTemplateRows: "repeat(10, 48px)",
            gap: "6px",
            alignItems: "stretch",
          }}
        >
          {/* Community shared boxes */}
          {communityBoxes.map((cb, i) => (
            <div
              key={`community-${i}`}
              style={{
                gridRow: cb.gridRow,
                gridColumn: cb.gridColumn,
              }}
            >
              <CommunityBox label={cb.label} />
            </div>
          ))}

          {/* Program boxes */}
          {ALL_POSITIONS.map((pos) => {
            const box = boxByName.get(pos.name);
            if (!box) return null;
            return (
              <div
                key={box.id}
                style={{
                  gridRow: pos.gridRow,
                  gridColumn: pos.gridColumn,
                  ...(pos.gridColumn === 4 ? { width: 80 } : {}),
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
