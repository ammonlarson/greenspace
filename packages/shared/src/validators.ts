import {
  ELIGIBLE_STREET,
  FLOOR_DOOR_REQUIRED_NUMBERS,
  HOUSE_NUMBER_MAX,
  HOUSE_NUMBER_MIN,
  TOTAL_BOX_COUNT,
} from "./constants";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate email format */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "Email is required" };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: "Invalid email format" };
  }
  return { valid: true };
}

/** Validate street name */
export function validateStreet(street: string): ValidationResult {
  if (!street || typeof street !== "string") {
    return { valid: false, error: "Street is required" };
  }
  if (street.trim() !== ELIGIBLE_STREET) {
    return {
      valid: false,
      error: `Street must be ${ELIGIBLE_STREET}`,
    };
  }
  return { valid: true };
}

/** Validate house number is in eligible range */
export function validateHouseNumber(houseNumber: number): ValidationResult {
  if (houseNumber == null || typeof houseNumber !== "number") {
    return { valid: false, error: "House number is required" };
  }
  if (!Number.isInteger(houseNumber)) {
    return { valid: false, error: "House number must be a whole number" };
  }
  if (houseNumber < HOUSE_NUMBER_MIN || houseNumber > HOUSE_NUMBER_MAX) {
    return {
      valid: false,
      error: `House number must be between ${HOUSE_NUMBER_MIN} and ${HOUSE_NUMBER_MAX}`,
    };
  }
  return { valid: true };
}

/** Check whether floor and door are required for a given house number */
export function isFloorDoorRequired(houseNumber: number): boolean {
  return FLOOR_DOOR_REQUIRED_NUMBERS.includes(houseNumber);
}

/** Validate floor/door fields based on house number rules */
export function validateFloorDoor(
  houseNumber: number,
  floor: string | null | undefined,
  door: string | null | undefined,
): ValidationResult {
  if (!isFloorDoorRequired(houseNumber)) {
    return { valid: true };
  }
  const hasFloor = floor != null && typeof floor === "string" && floor.trim().length > 0;
  const hasDoor = door != null && typeof door === "string" && door.trim().length > 0;
  if (!hasFloor || !hasDoor) {
    return {
      valid: false,
      error: `Floor and door are required for house number ${houseNumber}`,
    };
  }
  return { valid: true };
}

/** Validate a complete address for eligibility */
export function validateAddress(
  street: string,
  houseNumber: number,
  floor: string | null | undefined,
  door: string | null | undefined,
): ValidationResult {
  const streetResult = validateStreet(street);
  if (!streetResult.valid) return streetResult;

  const houseResult = validateHouseNumber(houseNumber);
  if (!houseResult.valid) return houseResult;

  const floorDoorResult = validateFloorDoor(houseNumber, floor, door);
  if (!floorDoorResult.valid) return floorDoorResult;

  return { valid: true };
}

/**
 * Generate a normalized apartment key from address components.
 * Used as the uniqueness constraint for one-box-per-apartment rule.
 *
 * Format: "else alfelts vej <number>[/<floor>-<door>]"
 */
export function normalizeApartmentKey(
  street: string,
  houseNumber: number,
  floor: string | null | undefined,
  door: string | null | undefined,
): string {
  const base = `${street.trim().toLowerCase()} ${houseNumber}`;
  const floorPart = floor?.trim().toLowerCase();
  const doorPart = door?.trim().toLowerCase();
  if (floorPart && doorPart) {
    return `${base}/${floorPart}-${doorPart}`;
  }
  if (floorPart) {
    return `${base}/${floorPart}`;
  }
  return base;
}

/** Validate registrant name */
export function validateName(name: string): ValidationResult {
  if (!name || typeof name !== "string") {
    return { valid: false, error: "Name is required" };
  }
  if (name.trim().length === 0) {
    return { valid: false, error: "Name is required" };
  }
  return { valid: true };
}

/** Validate box ID is in valid range (1-TOTAL_BOX_COUNT) */
export function validateBoxId(boxId: number): ValidationResult {
  if (boxId == null || typeof boxId !== "number") {
    return { valid: false, error: "Box ID is required" };
  }
  if (!Number.isInteger(boxId) || boxId < 1 || boxId > TOTAL_BOX_COUNT) {
    return { valid: false, error: `Box ID must be between 1 and ${TOTAL_BOX_COUNT}` };
  }
  return { valid: true };
}
