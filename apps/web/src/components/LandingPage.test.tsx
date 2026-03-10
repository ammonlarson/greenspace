import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import { LandingPage } from "./LandingPage";

vi.mock("@/i18n/LanguageProvider", () => ({
  useLanguage: () => ({ language: "en", ready: true, setLanguage: vi.fn(), t: (key: string) => key }),
}));

vi.mock("./GreenhouseCard", () => ({
  GreenhouseCard: ({ name }: { name: string }) => <div data-testid={`card-${name}`}>{name}</div>,
}));

vi.mock("./WaitlistBanner", () => ({
  WaitlistBanner: ({ onJoinWaitlist }: { onJoinWaitlist?: () => void }) => (
    <div data-testid="waitlist-banner">
      {onJoinWaitlist && (
        <button type="button" data-testid="join-waitlist-btn" onClick={onJoinWaitlist}>
          Join
        </button>
      )}
    </div>
  ),
}));

vi.mock("./LoadingSplash", () => ({
  LoadingSplash: () => <div data-testid="loading-splash" />,
}));

describe("LandingPage", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows loading splash while greenhouses are being fetched", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    render(<LandingPage />);

    expect(screen.getByTestId("loading-splash")).toBeDefined();
    expect(screen.queryByText("greenhouse.title")).toBeNull();
  });

  it("does not show waitlist banner when hasAvailableBoxes is true", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    ));

    await act(async () => {
      render(<LandingPage hasAvailableBoxes />);
    });

    expect(screen.queryByTestId("waitlist-banner")).toBeNull();
  });

  it("shows waitlist banner with join button when hasAvailableBoxes is false", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    ));

    const handler = vi.fn();
    await act(async () => {
      render(<LandingPage hasAvailableBoxes={false} onJoinWaitlist={handler} />);
    });

    expect(screen.getByTestId("waitlist-banner")).toBeDefined();
    expect(screen.getByTestId("join-waitlist-btn")).toBeDefined();
  });

  it("does not show join button when onJoinWaitlist is not provided", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    ));

    await act(async () => {
      render(<LandingPage hasAvailableBoxes={false} />);
    });

    expect(screen.getByTestId("waitlist-banner")).toBeDefined();
    expect(screen.queryByTestId("join-waitlist-btn")).toBeNull();
  });
});
