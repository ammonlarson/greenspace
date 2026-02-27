import { describe, expect, it } from "vitest";
import { getGreenhouses } from "./index.js";

describe("api", () => {
  it("returns greenhouse list", () => {
    expect(getGreenhouses()).toEqual(["Kronen", "Søen"]);
  });
});
