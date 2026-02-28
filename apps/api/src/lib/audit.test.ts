import { describe, expect, it } from "vitest";
import { logAuditEvent } from "./audit.js";

describe("logAuditEvent", () => {
  it("is a function", () => {
    expect(typeof logAuditEvent).toBe("function");
  });
});
