import { describe, expect, it } from "vitest";
import {
  GREENHOUSES,
  DEFAULT_OPENING_DATETIME,
  OPENING_TIMEZONE,
  LANGUAGES,
  LANGUAGE_LABELS,
  ORGANIZER_CONTACTS,
  BOX_CATALOG,
} from "@greenspace/shared";
import { translations } from "@/i18n/translations";

describe("shared package integration", () => {
  it("exports greenhouses", () => {
    expect(GREENHOUSES.length).toBeGreaterThan(0);
  });

  it("exports opening datetime and timezone", () => {
    expect(DEFAULT_OPENING_DATETIME).toBe("2026-04-01T10:00:00");
    expect(OPENING_TIMEZONE).toBe("Europe/Copenhagen");
  });

  it("exports supported languages", () => {
    expect(LANGUAGES).toContain("da");
    expect(LANGUAGES).toContain("en");
  });

  it("exports organizer contacts", () => {
    expect(ORGANIZER_CONTACTS.length).toBeGreaterThan(0);
    for (const contact of ORGANIZER_CONTACTS) {
      expect(contact.name).toBeTruthy();
      expect(contact.email).toBeTruthy();
    }
  });
});

describe("translations", () => {
  it("provides translations for all supported languages", () => {
    for (const lang of LANGUAGES) {
      expect(translations[lang]).toBeDefined();
    }
  });

  it("has matching keys across da and en", () => {
    const daKeys = Object.keys(translations.da).sort();
    const enKeys = Object.keys(translations.en).sort();
    expect(daKeys).toEqual(enKeys);
  });

  it("has no empty translation values", () => {
    for (const lang of LANGUAGES) {
      for (const [key, value] of Object.entries(translations[lang])) {
        expect(value.length, `${lang}.${key} should not be empty`).toBeGreaterThan(0);
      }
    }
  });

  it("includes language labels for selector", () => {
    expect(LANGUAGE_LABELS.da).toBe("Dansk");
    expect(LANGUAGE_LABELS.en).toBe("English");
  });
});

describe("greenhouse data", () => {
  it("has boxes for each greenhouse", () => {
    for (const gh of GREENHOUSES) {
      const boxes = BOX_CATALOG.filter((b) => b.greenhouse === gh);
      expect(boxes.length).toBeGreaterThan(0);
    }
  });

  it("Kronen has 14 boxes and Søen has 15 boxes", () => {
    const kronen = BOX_CATALOG.filter((b) => b.greenhouse === "Kronen");
    const soen = BOX_CATALOG.filter((b) => b.greenhouse === "Søen");
    expect(kronen.length).toBe(14);
    expect(soen.length).toBe(15);
  });
});
