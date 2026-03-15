import type { Greenhouse } from "./constants.js";

/** Types of items that can be placed on the greenhouse grid */
export const GRID_ITEM_TYPES = [
  "planter_box",
  "shared_box",
  "column",
  "table",
  "chair",
  "door",
] as const;
export type GridItemType = (typeof GRID_ITEM_TYPES)[number];

/** Orientation for items that support rotation */
export type Orientation = "horizontal" | "vertical";

/** A single item placed on the greenhouse grid */
export interface GridItemPlacement {
  type: GridItemType;
  /** 1-indexed row position */
  row: number;
  /** 1-indexed column position */
  col: number;
  /** Number of columns spanned */
  width: number;
  /** Number of rows spanned */
  height: number;
  /** Display label for the item */
  label?: string;
  /** Reference to planter box ID (for planter_box and shared_box types) */
  boxId?: number;
}

/** Grid configuration for a single greenhouse */
export interface GreenhouseGridConfig {
  greenhouse: Greenhouse;
  rows: number;
  cols: number;
  items: GridItemPlacement[];
}

/** Default planter box size: 2 cells long, 1 cell wide */
const BOX_H = { width: 2, height: 1 } as const;
const BOX_V = { width: 1, height: 2 } as const;

function planterBox(
  boxId: number,
  label: string,
  row: number,
  col: number,
  orientation: Orientation,
): GridItemPlacement {
  const size = orientation === "horizontal" ? BOX_H : BOX_V;
  return { type: "planter_box", row, col, ...size, label, boxId };
}

function sharedBox(
  label: string,
  row: number,
  col: number,
  orientation: Orientation,
): GridItemPlacement {
  const size = orientation === "horizontal" ? BOX_H : BOX_V;
  return { type: "shared_box", row, col, ...size, label };
}

function door(row: number, col: number): GridItemPlacement {
  return { type: "door", row, col, width: 4, height: 1, label: "Door" };
}

function column(row: number, col: number): GridItemPlacement {
  return { type: "column", row, col, width: 1, height: 1, label: "Column" };
}

/**
 * Kronen greenhouse grid configuration.
 * 20 rows x 12 columns, 14 planter boxes.
 * Sliding glass doors at middle 4 columns (5-8), top and bottom rows.
 */
export const KRONEN_GRID: GreenhouseGridConfig = {
  greenhouse: "Kronen",
  rows: 20,
  cols: 12,
  items: [
    // Sliding glass doors (middle 4 columns at top and bottom)
    door(1, 5),
    door(20, 5),

    // Structural columns
    column(5, 1),
    column(5, 12),
    column(10, 1),
    column(10, 12),
    column(15, 1),
    column(15, 12),

    // Planter boxes - left side (vertical orientation along walls)
    planterBox(1, "Linaria", 3, 1, "vertical"),
    planterBox(2, "Harebell", 3, 3, "vertical"),
    planterBox(3, "Stellaria", 6, 1, "vertical"),
    planterBox(4, "Honeysuckle", 6, 3, "vertical"),
    planterBox(5, "Daisy", 8, 1, "vertical"),
    planterBox(6, "Hawthorn", 8, 3, "vertical"),
    planterBox(7, "Alder", 11, 1, "vertical"),

    // Planter boxes - right side (vertical orientation along walls)
    planterBox(8, "Linden", 3, 10, "vertical"),
    planterBox(9, "Thistle", 3, 12, "vertical"),
    planterBox(10, "Yarrow", 6, 10, "vertical"),
    planterBox(11, "Seabuck", 6, 12, "vertical"),
    planterBox(12, "Anemone", 8, 10, "vertical"),
    planterBox(13, "Jenny", 8, 12, "vertical"),
    planterBox(14, "Buttercup", 11, 10, "vertical"),

    // Shared community boxes (center area)
    sharedBox("Community A", 12, 5, "horizontal"),
    sharedBox("Community B", 12, 8, "horizontal"),

    // Tables (center)
    { type: "table", row: 14, col: 5, width: 4, height: 2, label: "Table" },

    // Chairs around table
    { type: "chair", row: 14, col: 4, width: 1, height: 1, label: "Chair" },
    { type: "chair", row: 14, col: 9, width: 1, height: 1, label: "Chair" },
    { type: "chair", row: 15, col: 4, width: 1, height: 1, label: "Chair" },
    { type: "chair", row: 15, col: 9, width: 1, height: 1, label: "Chair" },
  ],
};

/**
 * Søen greenhouse grid configuration.
 * 24 rows x 12 columns, 15 planter boxes.
 * Sliding glass doors at middle 4 columns (5-8), top and bottom rows.
 */
export const SOEN_GRID: GreenhouseGridConfig = {
  greenhouse: "Søen",
  rows: 24,
  cols: 12,
  items: [
    // Sliding glass doors (middle 4 columns at top and bottom)
    door(1, 5),
    door(24, 5),

    // Structural columns
    column(6, 1),
    column(6, 12),
    column(12, 1),
    column(12, 12),
    column(18, 1),
    column(18, 12),

    // Planter boxes - left side
    planterBox(15, "Robin", 3, 1, "vertical"),
    planterBox(16, "Mallard", 3, 3, "vertical"),
    planterBox(17, "Wagtail", 7, 1, "vertical"),
    planterBox(18, "Greenfinch", 7, 3, "vertical"),
    planterBox(19, "Blue tit", 9, 1, "vertical"),
    planterBox(20, "Great tit", 9, 3, "vertical"),
    planterBox(21, "Mute swan", 13, 1, "vertical"),
    planterBox(22, "Nuthatch", 13, 3, "vertical"),

    // Planter boxes - right side
    planterBox(23, "Coot", 3, 10, "vertical"),
    planterBox(24, "Hooded crow", 3, 12, "vertical"),
    planterBox(25, "Gray goose", 7, 10, "vertical"),
    planterBox(26, "Barn swallow", 7, 12, "vertical"),
    planterBox(27, "Magpie", 9, 10, "vertical"),
    planterBox(28, "Chaffinch", 9, 12, "vertical"),
    planterBox(29, "Black bird", 13, 10, "vertical"),

    // Shared community boxes (center area)
    sharedBox("Community C", 15, 5, "horizontal"),
    sharedBox("Community D", 15, 8, "horizontal"),

    // Tables (center)
    { type: "table", row: 17, col: 5, width: 4, height: 2, label: "Table" },

    // Chairs around table
    { type: "chair", row: 17, col: 4, width: 1, height: 1, label: "Chair" },
    { type: "chair", row: 17, col: 9, width: 1, height: 1, label: "Chair" },
    { type: "chair", row: 18, col: 4, width: 1, height: 1, label: "Chair" },
    { type: "chair", row: 18, col: 9, width: 1, height: 1, label: "Chair" },
  ],
};

/** Map from greenhouse name to grid configuration */
export const GREENHOUSE_GRIDS: Record<Greenhouse, GreenhouseGridConfig> = {
  Kronen: KRONEN_GRID,
  Søen: SOEN_GRID,
};
