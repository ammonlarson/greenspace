import { describe, expect, it } from "vitest";
import { GREENHOUSES } from "@greenspace/shared";

describe("web", () => {
  it("shared package exports greenhouses", () => {
    expect(GREENHOUSES.length).toBeGreaterThan(0);
  });
});
