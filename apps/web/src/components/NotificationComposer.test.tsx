import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { NotificationComposer } from "./NotificationComposer";

const stableT = (key: string) => key;
vi.mock("@/i18n/LanguageProvider", () => ({
  useLanguage: () => ({ language: "en", setLanguage: vi.fn(), t: stableT }),
}));

const baseProps = {
  action: "add" as const,
  recipientName: "Alice",
  recipientEmail: "alice@test.com",
  recipientLanguage: "en",
  boxId: 1,
  value: { sendEmail: true, subject: "Test Subject", bodyHtml: "<p>Test</p>" },
  onChange: vi.fn(),
};

function mockFetchPreview(ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    json: async () => ({
      subject: "Default Subject",
      bodyHtml: "<p>Default body</p>",
      recipientEmail: "alice@test.com",
      language: "en",
    }),
  });
}

describe("NotificationComposer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("fetches preview on mount and calls onChange with result", async () => {
    const fetchMock = mockFetchPreview();
    vi.stubGlobal("fetch", fetchMock);
    const onChange = vi.fn();

    await act(async () => {
      render(<NotificationComposer {...baseProps} onChange={onChange} />);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/admin/notifications/preview",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "Default Subject", bodyHtml: "<p>Default body</p>" }),
    );
  });

  it("shows send checkbox and subject/body fields when sendEmail is true", async () => {
    vi.stubGlobal("fetch", mockFetchPreview());

    await act(async () => {
      render(<NotificationComposer {...baseProps} />);
    });

    expect(screen.getByText("admin.notification.send")).toBeDefined();
    expect(screen.getByLabelText("admin.notification.subject")).toBeDefined();
    expect(screen.getByLabelText("admin.notification.body")).toBeDefined();
  });

  it("hides subject/body fields when sendEmail is false", async () => {
    vi.stubGlobal("fetch", mockFetchPreview());

    await act(async () => {
      render(
        <NotificationComposer
          {...baseProps}
          value={{ sendEmail: false, subject: "", bodyHtml: "" }}
        />,
      );
    });

    expect(screen.queryByLabelText("admin.notification.subject")).toBeNull();
    expect(screen.queryByLabelText("admin.notification.body")).toBeNull();
  });

  it("calls onChange when subject is edited", async () => {
    vi.stubGlobal("fetch", mockFetchPreview());
    const onChange = vi.fn();

    await act(async () => {
      render(<NotificationComposer {...baseProps} onChange={onChange} />);
    });

    const subjectInput = screen.getByLabelText("admin.notification.subject");
    fireEvent.change(subjectInput, { target: { value: "New Subject" } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "New Subject" }),
    );
  });

  it("shows error when preview fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));

    await act(async () => {
      render(<NotificationComposer {...baseProps} />);
    });

    expect(screen.getByText("admin.notification.previewError")).toBeDefined();
  });

  it("resets to default when reset button is clicked", async () => {
    vi.stubGlobal("fetch", mockFetchPreview());
    const onChange = vi.fn();

    await act(async () => {
      render(<NotificationComposer {...baseProps} onChange={onChange} />);
    });

    const resetButton = screen.getByText("admin.notification.reset");
    fireEvent.click(resetButton);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "Default Subject", bodyHtml: "<p>Default body</p>" }),
    );
  });

  it("does not fetch preview when required fields are missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await act(async () => {
      render(
        <NotificationComposer
          {...baseProps}
          recipientName=""
          recipientEmail=""
          boxId={0}
        />,
      );
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
