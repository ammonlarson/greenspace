import { describe, expect, it, vi } from "vitest";
import {
  GREENHOUSES,
  DEFAULT_OPENING_DATETIME,
  OPENING_TIMEZONE,
  LANGUAGES,
  LANGUAGE_LABELS,
  ORGANIZER_CONTACTS,
  BOX_CATALOG,
  BOX_STATES,
} from "@greenspace/shared";
import { translations } from "@/i18n/translations";
import { isBeforeOpening } from "@/utils/opening";

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

  it("includes map state translations for all box states", () => {
    for (const lang of LANGUAGES) {
      for (const state of BOX_STATES) {
        const key = `map.state.${state}`;
        expect(translations[lang][key], `${lang}.${key} missing`).toBeDefined();
      }
    }
  });

  it("includes map navigation translations", () => {
    for (const lang of LANGUAGES) {
      expect(translations[lang]["map.viewMap"]).toBeTruthy();
      expect(translations[lang]["map.back"]).toBeTruthy();
      expect(translations[lang]["map.legend"]).toBeTruthy();
    }
  });

  it("includes waitlist translations", () => {
    const waitlistKeys = [
      "waitlist.title",
      "waitlist.description",
      "waitlist.joinButton",
      "waitlist.positionLabel",
      "waitlist.alreadyOnWaitlist",
      "waitlist.success",
    ];
    for (const lang of LANGUAGES) {
      for (const key of waitlistKeys) {
        expect(translations[lang][key], `${lang}.${key} missing`).toBeTruthy();
      }
    }
  });

  it("includes email translations", () => {
    const emailKeys = [
      "email.confirmationSubject",
      "email.switchNote",
      "email.careGuidelines",
    ];
    for (const lang of LANGUAGES) {
      for (const key of emailKeys) {
        expect(translations[lang][key], `${lang}.${key} missing`).toBeTruthy();
      }
    }
  });

  it("includes audit timeline translations", () => {
    const auditKeys = [
      "audit.title",
      "audit.timestamp",
      "audit.action",
      "audit.actor",
      "audit.entity",
      "audit.details",
      "audit.noEvents",
      "audit.loadMore",
      "audit.filterByAction",
      "audit.filterByActor",
      "audit.allActions",
      "audit.allActors",
    ];
    for (const lang of LANGUAGES) {
      for (const key of auditKeys) {
        expect(translations[lang][key], `${lang}.${key} missing`).toBeTruthy();
      }
    }
  });

  it("includes registration form translations", () => {
    const registrationKeys = [
      "registration.formTitle",
      "registration.nameLabel",
      "registration.emailLabel",
      "registration.streetLabel",
      "registration.houseNumberLabel",
      "registration.floorLabel",
      "registration.doorLabel",
      "registration.boxLabel",
      "registration.switchWarning",
      "registration.switchConfirm",
      "registration.success",
      "registration.unregisterInfo",
    ];
    for (const lang of LANGUAGES) {
      for (const key of registrationKeys) {
        expect(translations[lang][key], `${lang}.${key} missing`).toBeTruthy();
      }
    }
  });

  it("includes validation translations", () => {
    const validationKeys = [
      "validation.emailRequired",
      "validation.emailInvalid",
      "validation.nameRequired",
      "validation.streetInvalid",
      "validation.houseNumberInvalid",
      "validation.floorDoorRequired",
      "validation.boxIdInvalid",
    ];
    for (const lang of LANGUAGES) {
      for (const key of validationKeys) {
        expect(translations[lang][key], `${lang}.${key} missing`).toBeTruthy();
      }
    }
  });

  it("includes consent translations", () => {
    const consentKeys = [
      "consent.title",
      "consent.dataCollected",
      "consent.purpose",
      "consent.retention",
      "consent.contact",
      "consent.acknowledgment",
    ];
    for (const lang of LANGUAGES) {
      for (const key of consentKeys) {
        expect(translations[lang][key], `${lang}.${key} missing`).toBeTruthy();
      }
    }
  });

  it("includes policy translations", () => {
    const policyKeys = [
      "policy.oneApartmentRule",
      "policy.noSelfUnregister",
    ];
    for (const lang of LANGUAGES) {
      for (const key of policyKeys) {
        expect(translations[lang][key], `${lang}.${key} missing`).toBeTruthy();
      }
    }
  });

  it("includes admin translations", () => {
    const adminKeys = [
      "admin.link",
      "admin.login",
      "admin.email",
      "admin.password",
      "admin.loginFailed",
      "admin.backToPublic",
      "admin.openingTimeTitle",
      "admin.openingTimeDescription",
      "admin.currentValue",
      "admin.lastUpdated",
      "admin.newOpeningTime",
      "admin.save",
      "admin.settingsSaved",
    ];
    for (const lang of LANGUAGES) {
      for (const key of adminKeys) {
        expect(translations[lang][key], `${lang}.${key} missing`).toBeTruthy();
      }
    }
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

  it("uses global numbering 1-29", () => {
    const ids = BOX_CATALOG.map((b) => b.id);
    expect(ids).toEqual(Array.from({ length: 29 }, (_, i) => i + 1));
  });

  it("Kronen boxes are 1-14 and Søen boxes are 15-29", () => {
    const kronen = BOX_CATALOG.filter((b) => b.greenhouse === "Kronen");
    const soen = BOX_CATALOG.filter((b) => b.greenhouse === "Søen");
    expect(kronen.map((b) => b.id)).toEqual(Array.from({ length: 14 }, (_, i) => i + 1));
    expect(soen.map((b) => b.id)).toEqual(Array.from({ length: 15 }, (_, i) => i + 15));
  });
});

describe("isBeforeOpening", () => {
  it("returns true when current time is before opening", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-01T10:00:00Z"));
    expect(isBeforeOpening("2026-04-01T10:00:00")).toBe(true);
    vi.useRealTimers();
  });

  it("returns false when current time is after opening", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-01T10:00:00Z"));
    expect(isBeforeOpening("2026-04-01T10:00:00")).toBe(false);
    vi.useRealTimers();
  });

  it("returns true for the default opening datetime when well before", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    expect(isBeforeOpening(DEFAULT_OPENING_DATETIME)).toBe(true);
    vi.useRealTimers();
  });
});
