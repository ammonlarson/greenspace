import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import type { PlanterBoxPublic, GreenhouseGridConfig } from "@greenspace/shared";

vi.mock("@/i18n/LanguageProvider", () => ({
  useLanguage: () => ({ language: "en", ready: true, setLanguage: vi.fn(), t: (key: string) => key }),
}));

const testConfig: GreenhouseGridConfig = {
  greenhouse: "Kronen",
  rows: 6,
  cols: 4,
  items: [
    { type: "door", row: 1, col: 1, width: 4, height: 1, label: "Door" },
    { type: "planter_box", row: 2, col: 1, width: 1, height: 2, label: "Stellaria", boxId: 1 },
    { type: "planter_box", row: 2, col: 3, width: 2, height: 1, label: "Harebell", boxId: 2 },
    { type: "shared_box", row: 4, col: 2, width: 2, height: 1, label: "Community A" },
    { type: "column", row: 5, col: 1, width: 1, height: 1, label: "Column" },
    { type: "table", row: 5, col: 2, width: 2, height: 1, label: "Table" },
    { type: "chair", row: 5, col: 4, width: 1, height: 1, label: "Chair" },
    { type: "door", row: 6, col: 1, width: 4, height: 1, label: "Door" },
  ],
};

function makeBoxes(overrides?: Partial<PlanterBoxPublic>[]): PlanterBoxPublic[] {
  const defaults: PlanterBoxPublic[] = [
    { id: 1, name: "Stellaria", greenhouse: "Kronen", state: "available" },
    { id: 2, name: "Harebell", greenhouse: "Kronen", state: "occupied" },
  ];
  if (!overrides) return defaults;
  return defaults.map((b, i) => ({ ...b, ...overrides[i] }));
}

describe("GreenhouseGrid", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders the grid container", async () => {
    const { GreenhouseGrid } = await import("./GreenhouseGrid");

    render(
      <GreenhouseGrid config={testConfig} boxes={makeBoxes()} />,
    );

    expect(screen.getByTestId("greenhouse-grid")).toBeDefined();
  });

  it("renders doors", async () => {
    const { GreenhouseGrid } = await import("./GreenhouseGrid");

    render(
      <GreenhouseGrid config={testConfig} boxes={makeBoxes()} />,
    );

    const doors = screen.getAllByText("map.grid.door");
    expect(doors.length).toBe(2);
  });

  it("renders planter boxes with correct state labels", async () => {
    const { GreenhouseGrid } = await import("./GreenhouseGrid");

    render(
      <GreenhouseGrid config={testConfig} boxes={makeBoxes()} />,
    );

    expect(screen.getByText("Stellaria")).toBeDefined();
    expect(screen.getByText("Harebell")).toBeDefined();
  });

  it("renders shared boxes as non-clickable", async () => {
    const { GreenhouseGrid } = await import("./GreenhouseGrid");
    const onSelectBox = vi.fn();

    render(
      <GreenhouseGrid config={testConfig} boxes={makeBoxes()} onSelectBox={onSelectBox} />,
    );

    const sharedLabel = screen.getByText("Community A");
    expect(sharedLabel).toBeDefined();

    const sharedContainer = sharedLabel.closest("[role='img']");
    expect(sharedContainer).toBeDefined();
  });

  it("calls onSelectBox when an available box is clicked", async () => {
    const { GreenhouseGrid } = await import("./GreenhouseGrid");
    const onSelectBox = vi.fn();

    render(
      <GreenhouseGrid config={testConfig} boxes={makeBoxes()} onSelectBox={onSelectBox} />,
    );

    const stellariaButton = screen.getByLabelText("Stellaria – map.state.available");
    fireEvent.click(stellariaButton);

    expect(onSelectBox).toHaveBeenCalledWith(1);
  });

  it("does not call onSelectBox when an occupied box is clicked", async () => {
    const { GreenhouseGrid } = await import("./GreenhouseGrid");
    const onSelectBox = vi.fn();

    render(
      <GreenhouseGrid config={testConfig} boxes={makeBoxes()} onSelectBox={onSelectBox} />,
    );

    const harebellButton = screen.getByLabelText("Harebell – map.state.occupied");
    fireEvent.click(harebellButton);

    expect(onSelectBox).not.toHaveBeenCalled();
  });

  it("renders fixed elements (columns, tables, chairs)", async () => {
    const { GreenhouseGrid } = await import("./GreenhouseGrid");

    render(
      <GreenhouseGrid config={testConfig} boxes={makeBoxes()} />,
    );

    expect(screen.getByText("map.grid.table")).toBeDefined();
    expect(screen.getByText("map.grid.chair")).toBeDefined();
    const columnElements = screen.getAllByRole("img", { name: "map.grid.column" });
    expect(columnElements.length).toBe(1);
  });

  it("renders shared box with 'shared' state label", async () => {
    const { GreenhouseGrid } = await import("./GreenhouseGrid");

    render(
      <GreenhouseGrid config={testConfig} boxes={makeBoxes()} />,
    );

    const sharedLabels = screen.getAllByText("map.state.shared");
    expect(sharedLabels.length).toBeGreaterThanOrEqual(1);
  });
});
