import { describe, expect, it } from "vitest";
import { buildAdminNotification } from "./admin-email-templates.js";
import type { NotificationPreviewInput } from "./admin-email-templates.js";

const baseInput: NotificationPreviewInput = {
  action: "add",
  recipientName: "Anna Jensen",
  recipientEmail: "anna@example.com",
  language: "da",
  boxId: 3,
};

describe("buildAdminNotification — add", () => {
  it("returns Danish subject for da language", () => {
    const result = buildAdminNotification(baseInput);
    expect(result.subject).toContain("Bekræftelse");
    expect(result.subject).toContain("Greenspace 2026");
  });

  it("returns English subject for en language", () => {
    const result = buildAdminNotification({ ...baseInput, language: "en" });
    expect(result.subject).toContain("Confirmation");
    expect(result.subject).toContain("Greenspace 2026");
  });

  it("includes recipient name in greeting", () => {
    const result = buildAdminNotification(baseInput);
    expect(result.bodyHtml).toContain("Anna Jensen");
  });

  it("includes box details", () => {
    const result = buildAdminNotification(baseInput);
    expect(result.bodyHtml).toContain("#3");
    expect(result.bodyHtml).toContain("Stellaria");
    expect(result.bodyHtml).toContain("Kronen");
  });

  it("sets correct recipient email", () => {
    const result = buildAdminNotification(baseInput);
    expect(result.recipientEmail).toBe("anna@example.com");
  });

  it("sets correct language", () => {
    const result = buildAdminNotification(baseInput);
    expect(result.language).toBe("da");
  });

  it("sets html lang attribute", () => {
    const daResult = buildAdminNotification(baseInput);
    expect(daResult.bodyHtml).toContain('lang="da"');

    const enResult = buildAdminNotification({ ...baseInput, language: "en" });
    expect(enResult.bodyHtml).toContain('lang="en"');
  });

  it("includes contact info", () => {
    const result = buildAdminNotification(baseInput);
    expect(result.bodyHtml).toContain("elise7284@gmail.com");
  });

  it("escapes HTML in recipient name", () => {
    const result = buildAdminNotification({
      ...baseInput,
      recipientName: '<script>alert("xss")</script>',
    });
    expect(result.bodyHtml).not.toContain("<script>");
    expect(result.bodyHtml).toContain("&lt;script&gt;");
  });
});

describe("buildAdminNotification — waitlist_assign", () => {
  it("uses same template as add action", () => {
    const addResult = buildAdminNotification(baseInput);
    const waitlistResult = buildAdminNotification({
      ...baseInput,
      action: "waitlist_assign",
    });
    expect(waitlistResult.subject).toBe(addResult.subject);
  });
});

describe("buildAdminNotification — move", () => {
  const moveInput: NotificationPreviewInput = {
    action: "move",
    recipientName: "Anna Jensen",
    recipientEmail: "anna@example.com",
    language: "da",
    boxId: 20,
    oldBoxId: 3,
  };

  it("returns Danish move subject", () => {
    const result = buildAdminNotification(moveInput);
    expect(result.subject).toContain("Ændring");
    expect(result.subject).toContain("Greenspace 2026");
  });

  it("returns English move subject", () => {
    const result = buildAdminNotification({ ...moveInput, language: "en" });
    expect(result.subject).toContain("Change");
    expect(result.subject).toContain("Greenspace 2026");
  });

  it("includes old and new box names", () => {
    const result = buildAdminNotification(moveInput);
    expect(result.bodyHtml).toContain("Stellaria");
    expect(result.bodyHtml).toContain("Kronen");
    expect(result.bodyHtml).toContain("Great tit");
    expect(result.bodyHtml).toContain("Søen");
  });

  it("includes move detail callout with blue styling", () => {
    const result = buildAdminNotification(moveInput);
    expect(result.bodyHtml).toContain("#1976d2");
  });

  it("includes new box details table", () => {
    const result = buildAdminNotification(moveInput);
    expect(result.bodyHtml).toContain("#20");
  });

  it("includes contact info", () => {
    const result = buildAdminNotification(moveInput);
    expect(result.bodyHtml).toContain("elise7284@gmail.com");
  });
});

describe("buildAdminNotification — remove", () => {
  const removeInput: NotificationPreviewInput = {
    action: "remove",
    recipientName: "Anna Jensen",
    recipientEmail: "anna@example.com",
    language: "da",
    boxId: 3,
  };

  it("returns Danish remove subject", () => {
    const result = buildAdminNotification(removeInput);
    expect(result.subject).toContain("fjernet");
    expect(result.subject).toContain("Greenspace 2026");
  });

  it("returns English remove subject", () => {
    const result = buildAdminNotification({ ...removeInput, language: "en" });
    expect(result.subject).toContain("removed");
    expect(result.subject).toContain("Greenspace 2026");
  });

  it("includes removed box info", () => {
    const result = buildAdminNotification(removeInput);
    expect(result.bodyHtml).toContain("Stellaria");
    expect(result.bodyHtml).toContain("Kronen");
  });

  it("includes remove detail callout with red styling", () => {
    const result = buildAdminNotification(removeInput);
    expect(result.bodyHtml).toContain("#c62828");
  });

  it("does not include box details table for remove action", () => {
    const result = buildAdminNotification(removeInput);
    expect(result.bodyHtml).not.toContain("boxDetailsTitle");
  });

  it("includes contact info", () => {
    const result = buildAdminNotification(removeInput);
    expect(result.bodyHtml).toContain("elise7284@gmail.com");
  });

  it("includes Greenspace header", () => {
    const result = buildAdminNotification(removeInput);
    expect(result.bodyHtml).toContain("Greenspace 2026");
    expect(result.bodyHtml).toContain("#2e7d32");
  });
});

describe("buildAdminNotification — unknown box", () => {
  it("handles unknown box ID gracefully", () => {
    const result = buildAdminNotification({ ...baseInput, boxId: 999 });
    expect(result.bodyHtml).toContain("#999");
    expect(result.bodyHtml).toContain("Unknown");
  });
});
