import { describe, expect, it } from "vitest";
import { buildConfirmationEmail } from "./email-templates.js";

describe("buildConfirmationEmail", () => {
  const baseData = {
    recipientName: "Anna Jensen",
    recipientEmail: "anna@example.com",
    boxId: 3,
    language: "da" as const,
  };

  it("returns Danish subject for da language", () => {
    const result = buildConfirmationEmail(baseData);
    expect(result.subject).toContain("Bekræftelse");
    expect(result.subject).toContain("Greenspace 2026");
  });

  it("returns English subject for en language", () => {
    const result = buildConfirmationEmail({ ...baseData, language: "en" });
    expect(result.subject).toContain("Confirmation");
    expect(result.subject).toContain("Greenspace 2026");
  });

  it("includes recipient name in greeting", () => {
    const result = buildConfirmationEmail(baseData);
    expect(result.bodyHtml).toContain("Anna Jensen");
  });

  it("includes box details", () => {
    const result = buildConfirmationEmail(baseData);
    expect(result.bodyHtml).toContain("#3");
    expect(result.bodyHtml).toContain("Stellaria");
    expect(result.bodyHtml).toContain("Kronen");
  });

  it("includes greenhouse map with highlighted box", () => {
    const result = buildConfirmationEmail(baseData);
    expect(result.bodyHtml).toContain("<table");
    expect(result.bodyHtml).toContain("#2e7d32");
  });

  it("includes care guidelines", () => {
    const daResult = buildConfirmationEmail(baseData);
    expect(daResult.bodyHtml).toContain("økologisk");

    const enResult = buildConfirmationEmail({ ...baseData, language: "en" });
    expect(enResult.bodyHtml).toContain("organic");
  });

  it("includes WhatsApp link", () => {
    const result = buildConfirmationEmail(baseData);
    expect(result.bodyHtml).toContain("chat.whatsapp.com");
  });

  it("includes organizer contact info", () => {
    const result = buildConfirmationEmail(baseData);
    expect(result.bodyHtml).toContain("elise7284@gmail.com");
  });

  it("uses correct from and replyTo addresses", () => {
    const result = buildConfirmationEmail(baseData);
    expect(result.from).toBe("greenspace@un17hub.com");
    expect(result.replyTo).toBe("elise7284@gmail.com");
  });

  it("does not include switch note when no switch occurred", () => {
    const result = buildConfirmationEmail(baseData);
    expect(result.bodyHtml).not.toContain("ff9800");
  });

  it("includes switch note when switchedFromBoxId is provided", () => {
    const result = buildConfirmationEmail({
      ...baseData,
      switchedFromBoxId: 7,
    });
    expect(result.bodyHtml).toContain("ff9800");
    expect(result.bodyHtml).toContain("Alder");
    expect(result.bodyHtml).toContain("Kronen");
  });

  it("renders Søen greenhouse for box 15+", () => {
    const result = buildConfirmationEmail({ ...baseData, boxId: 20 });
    expect(result.bodyHtml).toContain("Søen");
    expect(result.bodyHtml).toContain("Great tit");
  });

  it("sets html lang attribute to match language", () => {
    const daResult = buildConfirmationEmail(baseData);
    expect(daResult.bodyHtml).toContain('lang="da"');

    const enResult = buildConfirmationEmail({ ...baseData, language: "en" });
    expect(enResult.bodyHtml).toContain('lang="en"');
  });

  it("escapes HTML in recipient name", () => {
    const result = buildConfirmationEmail({
      ...baseData,
      recipientName: '<script>alert("xss")</script>',
    });
    expect(result.bodyHtml).not.toContain("<script>");
    expect(result.bodyHtml).toContain("&lt;script&gt;");
  });
});
