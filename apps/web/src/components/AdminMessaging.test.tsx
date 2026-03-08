import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup, waitFor } from "@testing-library/react";
import { AdminMessaging } from "./AdminMessaging";

vi.mock("@/i18n/LanguageProvider", () => ({
  useLanguage: () => ({ language: "en", setLanguage: vi.fn(), t: (key: string) => key }),
}));

describe("AdminMessaging", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("renders title and audience options", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ count: 5, recipients: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await act(async () => {
      render(<AdminMessaging />);
    });

    expect(screen.getByText("admin.messaging.title")).toBeDefined();
    expect(screen.getByText("admin.messaging.audienceAll")).toBeDefined();
    expect(screen.getByText("admin.messaging.audienceKronen")).toBeDefined();
    expect(screen.getByText("admin.messaging.audienceSøen")).toBeDefined();
  });

  it("fetches recipient count on mount", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ count: 12, recipients: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await act(async () => {
      render(<AdminMessaging />);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/admin/messaging/recipients",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ audience: "all" }),
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("12 admin.messaging.recipientCount")).toBeDefined();
    });
  });

  it("re-fetches recipients when audience changes", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ count: 3, recipients: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await act(async () => {
      render(<AdminMessaging />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("admin.messaging.audienceKronen"));
    });

    const calls = fetchMock.mock.calls.filter(
      (c: unknown[]) => (c[0] as string) === "/admin/messaging/recipients",
    );
    expect(calls.length).toBeGreaterThanOrEqual(2);
  });

  it("shows error when subject is empty on send", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ count: 5, recipients: [{ email: "a@b.com", name: "A", language: "da" }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await act(async () => {
      render(<AdminMessaging />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("admin.messaging.send"));
    });

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("admin.messaging.subjectRequired")).toBeDefined();
  });

  it("renders subject input and body textarea", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ count: 0, recipients: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await act(async () => {
      render(<AdminMessaging />);
    });

    expect(screen.getByLabelText("admin.messaging.body")).toBeDefined();
    const subjectInput = document.getElementById("messaging-subject");
    expect(subjectInput).toBeDefined();
  });

  it("switches between preview and source tabs", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ count: 0, recipients: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await act(async () => {
      render(<AdminMessaging />);
    });

    fireEvent.click(screen.getByText("admin.messaging.preview"));
    expect(screen.getByTitle("admin.messaging.preview")).toBeDefined();

    fireEvent.click(screen.getByText("admin.messaging.source"));
    expect(screen.getByLabelText("admin.messaging.body")).toBeDefined();
  });
});
