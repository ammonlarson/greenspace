import { describe, expect, it } from "vitest";
import {
  validateEmail,
  validateStreet,
  validateHouseNumber,
  isFloorDoorRequired,
  validateFloorDoor,
  validateAddress,
  normalizeApartmentKey,
  validateName,
  validateBoxId,
} from "./validators.js";

describe("validateEmail", () => {
  it("accepts valid emails", () => {
    expect(validateEmail("user@example.com")).toEqual({ valid: true });
    expect(validateEmail("a.b@c.dk")).toEqual({ valid: true });
  });

  it("rejects empty string", () => {
    expect(validateEmail("").valid).toBe(false);
  });

  it("rejects whitespace-only string", () => {
    expect(validateEmail("   ").valid).toBe(false);
  });

  it("rejects missing @", () => {
    expect(validateEmail("userexample.com").valid).toBe(false);
  });

  it("rejects missing domain", () => {
    expect(validateEmail("user@").valid).toBe(false);
  });
});

describe("validateStreet", () => {
  it("accepts Else Alfelts Vej", () => {
    expect(validateStreet("Else Alfelts Vej")).toEqual({ valid: true });
  });

  it("rejects other streets", () => {
    expect(validateStreet("Main Street").valid).toBe(false);
  });

  it("rejects empty string", () => {
    expect(validateStreet("").valid).toBe(false);
  });
});

describe("validateHouseNumber", () => {
  it("accepts numbers in range 122-202", () => {
    expect(validateHouseNumber(122)).toEqual({ valid: true });
    expect(validateHouseNumber(150)).toEqual({ valid: true });
    expect(validateHouseNumber(202)).toEqual({ valid: true });
  });

  it("rejects numbers below range", () => {
    expect(validateHouseNumber(121).valid).toBe(false);
    expect(validateHouseNumber(0).valid).toBe(false);
  });

  it("rejects numbers above range", () => {
    expect(validateHouseNumber(203).valid).toBe(false);
  });

  it("rejects non-integers", () => {
    expect(validateHouseNumber(122.5).valid).toBe(false);
  });
});

describe("isFloorDoorRequired", () => {
  it("returns true for 138", () => {
    expect(isFloorDoorRequired(138)).toBe(true);
  });

  it("returns true for 144", () => {
    expect(isFloorDoorRequired(144)).toBe(true);
  });

  it("returns true for 161-202", () => {
    expect(isFloorDoorRequired(161)).toBe(true);
    expect(isFloorDoorRequired(180)).toBe(true);
    expect(isFloorDoorRequired(202)).toBe(true);
  });

  it("returns false for numbers not requiring floor/door", () => {
    expect(isFloorDoorRequired(122)).toBe(false);
    expect(isFloorDoorRequired(130)).toBe(false);
    expect(isFloorDoorRequired(139)).toBe(false);
    expect(isFloorDoorRequired(160)).toBe(false);
  });
});

describe("validateFloorDoor", () => {
  it("passes when floor/door not required", () => {
    expect(validateFloorDoor(130, null, null)).toEqual({ valid: true });
  });

  it("passes when required and both provided", () => {
    expect(validateFloorDoor(138, "2", "th")).toEqual({ valid: true });
    expect(validateFloorDoor(170, "st", "1")).toEqual({ valid: true });
  });

  it("fails when required but floor missing", () => {
    expect(validateFloorDoor(138, null, "th").valid).toBe(false);
  });

  it("fails when required but door missing", () => {
    expect(validateFloorDoor(144, "2", null).valid).toBe(false);
  });

  it("fails when required but both empty strings", () => {
    expect(validateFloorDoor(170, "", "").valid).toBe(false);
  });
});

describe("validateAddress", () => {
  it("accepts a valid full address", () => {
    expect(validateAddress("Else Alfelts Vej", 130, null, null)).toEqual({
      valid: true,
    });
  });

  it("accepts valid address with floor/door", () => {
    expect(validateAddress("Else Alfelts Vej", 170, "2", "th")).toEqual({
      valid: true,
    });
  });

  it("rejects invalid street", () => {
    expect(validateAddress("Other Street", 130, null, null).valid).toBe(false);
  });

  it("rejects invalid house number", () => {
    expect(validateAddress("Else Alfelts Vej", 100, null, null).valid).toBe(
      false,
    );
  });

  it("rejects missing floor/door when required", () => {
    expect(validateAddress("Else Alfelts Vej", 170, null, null).valid).toBe(
      false,
    );
  });
});

describe("normalizeApartmentKey", () => {
  it("normalizes a simple address", () => {
    expect(normalizeApartmentKey("Else Alfelts Vej", 130, null, null)).toBe(
      "else alfelts vej 130",
    );
  });

  it("normalizes address with floor and door", () => {
    expect(normalizeApartmentKey("Else Alfelts Vej", 170, "2", "TH")).toBe(
      "else alfelts vej 170/2-th",
    );
  });

  it("normalizes address with floor only", () => {
    expect(normalizeApartmentKey("Else Alfelts Vej", 140, "ST", null)).toBe(
      "else alfelts vej 140/st",
    );
  });

  it("trims whitespace", () => {
    expect(
      normalizeApartmentKey("  Else Alfelts Vej  ", 130, null, null),
    ).toBe("else alfelts vej 130");
  });

  it("produces consistent keys regardless of case", () => {
    const key1 = normalizeApartmentKey("Else Alfelts Vej", 170, "2", "Th");
    const key2 = normalizeApartmentKey("ELSE ALFELTS VEJ", 170, "2", "th");
    expect(key1).toBe(key2);
  });
});

describe("validateName", () => {
  it("accepts non-empty names", () => {
    expect(validateName("Alice")).toEqual({ valid: true });
  });

  it("rejects empty string", () => {
    expect(validateName("").valid).toBe(false);
  });

  it("rejects whitespace-only string", () => {
    expect(validateName("   ").valid).toBe(false);
  });
});

describe("validateBoxId", () => {
  it("accepts valid box IDs 1-29", () => {
    expect(validateBoxId(1)).toEqual({ valid: true });
    expect(validateBoxId(15)).toEqual({ valid: true });
    expect(validateBoxId(29)).toEqual({ valid: true });
  });

  it("rejects 0", () => {
    expect(validateBoxId(0).valid).toBe(false);
  });

  it("rejects 30", () => {
    expect(validateBoxId(30).valid).toBe(false);
  });

  it("rejects non-integers", () => {
    expect(validateBoxId(1.5).valid).toBe(false);
  });
});
