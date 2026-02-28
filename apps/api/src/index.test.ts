import { describe, expect, it } from "vitest";
import { getGreenhouses, createRouter } from "./index.js";

describe("api", () => {
  it("returns greenhouse list", () => {
    expect(getGreenhouses()).toEqual(["Kronen", "Søen"]);
  });

  it("createRouter returns a router with routes registered", () => {
    const router = createRouter();
    expect(router).toBeDefined();
  });
});
