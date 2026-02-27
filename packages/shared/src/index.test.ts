import { describe, expect, it } from "vitest";
import { GREENHOUSES } from "./index.js";

describe("shared constants", () => {
  it("exports greenhouse names", () => {
    expect(GREENHOUSES).toEqual(["Kronen", "Søen"]);
  });
});
