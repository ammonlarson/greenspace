import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { render, screen, act, cleanup, fireEvent } from "@testing-library/react";
import type { PlanterBoxPublic } from "@greenspace/shared";

vi.mock("@/i18n/LanguageProvider", () => ({
  useLanguage: () => ({ language: "en", ready: true, setLanguage: vi.fn(), t: (key: string) => key }),
}));
vi.mock("@/hooks/useHistoryState", async () => {
  const react = await vi.importActual<typeof import("react")>("react");
  return {
    useHistoryState: <T,>(_key: string, initial: T): [T, (v: T) => void] => {
      return react.useState<T>(initial);
    },
  };
});
vi.mock("./GreenhouseMap", () => ({
  GreenhouseMap: ({ boxes, onSelectBox }: { boxes: PlanterBoxPublic[]; onSelectBox: (id: number) => void }) => (
    <div data-testid="greenhouse-map">
      <span data-testid="box-count">{boxes.length}</span>
      <span data-testid="available-count">{boxes.filter((b) => b.state === "available").length}</span>
      <button data-testid="select-box-1" onClick={() => onSelectBox(1)}>Select 1</button>
    </div>
  ),
}));
vi.mock("./BoxStateLegend", () => ({
  BoxStateLegend: () => <div data-testid="box-state-legend" />,
}));
vi.mock("./WaitlistForm", () => ({
  WaitlistForm: ({ onCancel }: { onCancel: () => void }) => (
    <div data-testid="waitlist-form">
      <button data-testid="waitlist-cancel" onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

let capturedOnSuccess: (() => void) | undefined;
let capturedOnCancel: (() => void) | undefined;

vi.mock("./RegistrationForm", () => ({
  RegistrationForm: ({ onSuccess, onCancel }: { boxId: number; onCancel: () => void; onBoxUnavailable?: () => void; onSuccess?: () => void }) => {
    capturedOnSuccess = onSuccess;
    capturedOnCancel = onCancel;
    return (
      <div data-testid="registration-form">
        <button data-testid="reg-success" onClick={onSuccess ?? onCancel}>Close (success)</button>
        <button data-testid="reg-cancel" onClick={onCancel}>Cancel</button>
      </div>
    );
  },
}));

function makeBoxes(overrides?: Partial<PlanterBoxPublic>[]): PlanterBoxPublic[] {
  const defaults: PlanterBoxPublic[] = [
    { id: 1, name: "Stellaria", greenhouse: "Kronen", state: "available" },
    { id: 2, name: "Rosemary", greenhouse: "Kronen", state: "occupied" },
  ];
  if (!overrides) return defaults;
  return defaults.map((b, i) => ({ ...b, ...overrides[i] }));
}

describe("GreenhouseMapPage", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    capturedOnSuccess = undefined;
    capturedOnCancel = undefined;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("fetches boxes on mount and renders map", async () => {
    const boxes = makeBoxes();
    fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(boxes), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { GreenhouseMapPage } = await import("./GreenhouseMapPage");

    await act(async () => {
      render(<GreenhouseMapPage greenhouse="Kronen" onBack={vi.fn()} />);
    });

    expect(fetchMock).toHaveBeenCalledWith("/public/boxes");
    expect(screen.getByTestId("greenhouse-map")).toBeDefined();
    expect(screen.getByTestId("box-count").textContent).toBe("2");
  });

  it("refetches boxes when returning from successful registration", async () => {
    const initialBoxes = makeBoxes();
    const updatedBoxes = makeBoxes([{ state: "occupied" }]);

    let callCount = 0;
    fetchMock = vi.fn().mockImplementation(() => {
      callCount++;
      const data = callCount === 1 ? initialBoxes : updatedBoxes;
      return Promise.resolve(new Response(JSON.stringify(data), { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);

    const { GreenhouseMapPage } = await import("./GreenhouseMapPage");

    await act(async () => {
      render(<GreenhouseMapPage greenhouse="Kronen" onBack={vi.fn()} />);
    });

    expect(screen.getByTestId("available-count").textContent).toBe("1");

    await act(async () => {
      fireEvent.click(screen.getByTestId("select-box-1"));
    });

    expect(screen.getByTestId("registration-form")).toBeDefined();

    await act(async () => {
      fireEvent.click(screen.getByTestId("reg-success"));
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId("greenhouse-map")).toBeDefined();
    expect(screen.getByTestId("available-count").textContent).toBe("0");
  });

  it("does not refetch boxes when cancelling registration", async () => {
    const boxes = makeBoxes();
    fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(boxes), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { GreenhouseMapPage } = await import("./GreenhouseMapPage");

    await act(async () => {
      render(<GreenhouseMapPage greenhouse="Kronen" onBack={vi.fn()} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("select-box-1"));
    });

    expect(screen.getByTestId("registration-form")).toBeDefined();

    await act(async () => {
      fireEvent.click(screen.getByTestId("reg-cancel"));
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("greenhouse-map")).toBeDefined();
  });

  it("passes onSuccess prop to RegistrationForm", async () => {
    const boxes = makeBoxes();
    fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(boxes), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { GreenhouseMapPage } = await import("./GreenhouseMapPage");

    await act(async () => {
      render(<GreenhouseMapPage greenhouse="Kronen" onBack={vi.fn()} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("select-box-1"));
    });

    expect(capturedOnSuccess).toBeDefined();
    expect(capturedOnCancel).toBeDefined();
    expect(capturedOnSuccess).not.toBe(capturedOnCancel);
  });
});
