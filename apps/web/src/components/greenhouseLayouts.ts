import type { Greenhouse } from "@greenspace/shared";

export interface BoxPosition {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FixedElement {
  type: "table" | "door" | "wall" | "label";
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface GreenhouseLayout {
  viewBox: string;
  boxes: BoxPosition[];
  fixedElements: FixedElement[];
  walls: { x: number; y: number; width: number; height: number };
}

const BOX_W = 80;
const BOX_H = 40;
const BOX_W_V = 40;
const BOX_H_V = 80;

/**
 * Kronen greenhouse layout based on reference image.
 *
 * Corrections applied:
 * - Box 14 (Alder) moved to just north of box 13 (Anemone)
 * - Box 4 (Yarrow) moved to just east of box 12 (Thistle)
 *
 * Community shared boxes shown but not part of program.
 */
const kronenLayout: GreenhouseLayout = {
  viewBox: "0 0 600 700",
  walls: { x: 20, y: 20, width: 560, height: 660 },
  boxes: [
    // Top row (north) - left to right
    { name: "Linaria", x: 35, y: 40, width: BOX_W, height: BOX_H },
    { name: "Linden", x: 125, y: 40, width: BOX_W, height: BOX_H },
    // Seabuck - right of north door
    { name: "Seabuck", x: 330, y: 35, width: 100, height: 50 },
    // Stellaria - top right corner
    { name: "Stellaria", x: 475, y: 35, width: BOX_W, height: BOX_H },

    // Left column (west side), middle - vertical orientation
    { name: "Hawthorn", x: 35, y: 200, width: BOX_W_V, height: BOX_H_V },
    { name: "Jenny", x: 85, y: 200, width: BOX_W_V, height: BOX_H_V },

    // Left side, lower
    { name: "Harebell", x: 35, y: 420, width: BOX_W, height: BOX_H },

    // Right side (east) - Honeysuckle
    { name: "Honeysuckle", x: 380, y: 170, width: 90, height: 60 },
    // Thistle below Honeysuckle
    { name: "Thistle", x: 370, y: 270, width: BOX_W, height: BOX_H },
    // Yarrow - moved east of Thistle (correction)
    { name: "Yarrow", x: 460, y: 270, width: BOX_W, height: BOX_H },

    // Bottom right area
    // Alder - moved north of Anemone (correction)
    { name: "Alder", x: 460, y: 520, width: BOX_W, height: BOX_H },
    // Anemone - bottom right
    { name: "Anemone", x: 460, y: 570, width: BOX_W, height: BOX_H },

    // Bottom row (south) - left side
    { name: "Daisy", x: 35, y: 635, width: BOX_W_V, height: BOX_H },
    { name: "Buttercup", x: 85, y: 635, width: BOX_W_V, height: BOX_H },
  ],
  fixedElements: [
    // North door
    { type: "door", x: 245, y: 20, width: 50, height: 14 },
    // South door
    { type: "door", x: 245, y: 666, width: 50, height: 14 },
    // Central potting table
    { type: "table", x: 150, y: 340, width: 90, height: 180 },
    // Community shared boxes (not program boxes)
    { type: "label", x: 370, y: 390, width: 160, height: 110, label: "Community\nShared Boxes" },
  ],
};

/**
 * Søen greenhouse layout based on reference image.
 *
 * Corrections applied:
 * - Box 2 (Mallard) moved to just north of box 9 (Wagtail)
 * - "Gray goose" renamed to "Graylag goose"
 */
const soenLayout: GreenhouseLayout = {
  viewBox: "0 0 600 720",
  walls: { x: 20, y: 20, width: 560, height: 680 },
  boxes: [
    // Top left - Magpie near fixed structure
    { name: "Magpie", x: 35, y: 55, width: BOX_W, height: BOX_H },

    // Right side, top to bottom
    { name: "Coot", x: 510, y: 100, width: BOX_W_V, height: BOX_H_V },
    { name: "Nuthatch", x: 510, y: 190, width: BOX_W_V, height: BOX_H_V },
    { name: "Hooded crow", x: 510, y: 280, width: BOX_W_V, height: BOX_H_V },
    { name: "Graylag goose", x: 490, y: 380, width: BOX_W, height: BOX_H },
    { name: "Greenfinch", x: 490, y: 430, width: BOX_W, height: BOX_H },
    { name: "Great tit", x: 490, y: 480, width: BOX_W, height: BOX_H },

    // Bottom right area
    // Mallard moved north of Wagtail (correction)
    { name: "Mallard", x: 400, y: 560, width: BOX_W, height: BOX_H },
    { name: "Wagtail", x: 400, y: 610, width: BOX_W, height: BOX_H },
    { name: "Mute swan", x: 490, y: 610, width: BOX_W, height: BOX_H },

    // Left side, bottom to top
    { name: "Robin", x: 35, y: 500, width: 100, height: 70 },
    { name: "Barn swallow", x: 35, y: 410, width: BOX_W_V, height: BOX_H_V },
    { name: "Black bird", x: 85, y: 410, width: BOX_W_V, height: BOX_H_V },
    { name: "Blue tit", x: 35, y: 320, width: BOX_W_V, height: BOX_H_V },
    { name: "Chaffinch", x: 85, y: 320, width: BOX_W_V, height: BOX_H_V },
  ],
  fixedElements: [
    // North door
    { type: "door", x: 270, y: 20, width: 50, height: 14 },
    // South door
    { type: "door", x: 270, y: 686, width: 50, height: 14 },
    // Top-left fixed structure (raised bed area)
    { type: "table", x: 35, y: 110, width: 150, height: 170 },
    // Central work tables
    { type: "table", x: 250, y: 190, width: 60, height: 120 },
    { type: "table", x: 250, y: 380, width: 60, height: 120 },
  ],
};

export function getGreenhouseLayout(greenhouse: Greenhouse): GreenhouseLayout {
  return greenhouse === "Kronen" ? kronenLayout : soenLayout;
}
