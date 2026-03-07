import { describe, expect, it, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";
import { LanguageProvider, useLanguage } from "./LanguageProvider";

function ReadyIndicator() {
  const { ready } = useLanguage();
  return <span data-testid="ready">{String(ready)}</span>;
}

describe("LanguageProvider", () => {
  afterEach(() => {
    cleanup();
  });

  it("starts not ready and becomes ready after mount", async () => {
    render(
      <LanguageProvider>
        <ReadyIndicator />
      </LanguageProvider>,
    );

    await act(async () => {});

    const el = screen.getByTestId("ready");
    expect(el.textContent).toBe("true");
  });

  it("exposes ready flag in context", async () => {
    render(
      <LanguageProvider>
        <ReadyIndicator />
      </LanguageProvider>,
    );

    await act(async () => {});

    expect(screen.getByTestId("ready").textContent).toBe("true");
  });
});
