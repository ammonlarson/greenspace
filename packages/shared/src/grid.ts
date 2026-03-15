import type { Greenhouse } from "./constants.js";

/** Types of items that can be placed on the greenhouse grid */
export const GRID_ITEM_TYPES = [
  "planter_box",
  "shared_box",
  "column",
  "table",
  "chair",
  "bench",
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
    column(4, 9),
    column(4, 10),
    column(4, 11),
    column(5, 9),
    column(5, 10),
    column(5, 11),
    column(6, 9),
    column(6, 10),
    column(6, 11),
    column(7, 9),
    column(7, 10),
    column(7, 11),

    // Planter boxes
    planterBox(1, "Buttercup", 20, 3, "horizontal"),
    planterBox(2, "Daisy", 20, 1, "horizontal"),
    planterBox(3, "Harebell", 18, 1, "vertical"),
    planterBox(4, "Yarrow", 8, 1, "vertical"),
    planterBox(5, "Hawthorn", 6, 1, "vertical"),
    planterBox(6, "Jenny", 4, 1, "vertical"),
    planterBox(7, "Linaria", 1, 1, "horizontal"),
    planterBox(8, "Linden", 1, 3, "horizontal"),
    planterBox(9, "Seabuck", 1, 9, "horizontal"),
    planterBox(10, "Stellaria", 2, 12, "vertical"),
    planterBox(11, "Honeysuckle", 5, 8, "vertical"),
    planterBox(12, "Thistle", 9, 9, "horizontal"),
    planterBox(13, "Anemone", 18, 12, "vertical"),
    planterBox(14, "Alder", 20, 9, "horizontal"),
    
    // Shared community boxes (center area)
    sharedBox("Community A", 10, 12, "vertical"),
    sharedBox("Community B", 12, 12, "vertical"),

    // Tables (center)
    { type: "table", row: 8, col: 3, width: 3, height: 11, label: "Table" },

    // Chairs on left side of table
    { type: "chair", row: 9, col: 2, width: 1, height: 1, label: "Chair" },
    { type: "chair", row: 11, col: 2, width: 1, height: 1, label: "Chair" },
    { type: "chair", row: 13, col: 2, width: 1, height: 1, label: "Chair" },
    { type: "chair", row: 15, col: 2, width: 1, height: 1, label: "Chair" },
    { type: "chair", row: 17, col: 2, width: 1, height: 1, label: "Chair" },

    // Bench along right side of table
    { type: "bench", row: 9, col: 6, width: 1, height: 9, label: "Bench" },
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
