import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AdminStagingTools } from "./AdminStagingTools";

vi.mock("@/i18n/LanguageProvider", () => ({
  useLanguage: () => ({ language: "en", setLanguage: vi.fn(), t: (key: string) => key }),
}));

describe("AdminStagingTools", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders title and both action buttons", () => {
    render(<AdminStagingTools />);

    expect(screen.getByText("admin.staging.title")).toBeDefined();
    expect(screen.getByText("admin.staging.warning")).toBeDefined();
    expect(screen.getAllByText("admin.staging.fillBoxes")).toHaveLength(2);
    expect(screen.getAllByText("admin.staging.clearRegistrations")).toHaveLength(2);
  });

  it("renders descriptions for both actions", () => {
    render(<AdminStagingTools />);

    expect(screen.getByText("admin.staging.fillBoxesDescription")).toBeDefined();
    expect(screen.getByText("admin.staging.clearRegistrationsDescription")).toBeDefined();
  });
});
