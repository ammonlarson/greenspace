import { describe, expect, it } from "vitest";
import type { Kysely } from "kysely";
import type { Database } from "../db/types.js";
import type { RequestContext } from "../router.js";
import { AppError } from "../lib/errors.js";
import { handleValidateAddress, handleValidateRegistration } from "./public.js";

function makeCtx(overrides: Partial<RequestContext> = {}): RequestContext {
  return {
    db: {} as Kysely<Database>,
    method: "POST",
    path: "/public/validate-address",
    body: undefined,
    headers: {},
    ...overrides,
  };
}

describe("handleValidateAddress", () => {
  it("returns eligible for a valid address", async () => {
    const res = await handleValidateAddress(
      makeCtx({
        body: { street: "Else Alfelts Vej", houseNumber: 130, floor: null, door: null },
      }),
    );
    expect(res.statusCode).toBe(200);
    const body = res.body as Record<string, unknown>;
    expect(body.eligible).toBe(true);
    expect(body.error).toBeNull();
    expect(body.apartmentKey).toBe("else alfelts vej 130");
  });

  it("returns eligible with floor/door info for apartment addresses", async () => {
    const res = await handleValidateAddress(
      makeCtx({
        body: { street: "Else Alfelts Vej", houseNumber: 170, floor: "2", door: "th" },
      }),
    );
    expect(res.statusCode).toBe(200);
    const body = res.body as Record<string, unknown>;
    expect(body.eligible).toBe(true);
    expect(body.floorDoorRequired).toBe(true);
    expect(body.apartmentKey).toBe("else alfelts vej 170/2-th");
  });

  it("returns not eligible for invalid street", async () => {
    const res = await handleValidateAddress(
      makeCtx({
        body: { street: "Main Street", houseNumber: 130, floor: null, door: null },
      }),
    );
    expect(res.statusCode).toBe(200);
    const body = res.body as Record<string, unknown>;
    expect(body.eligible).toBe(false);
    expect(body.error).toBeDefined();
  });

  it("returns not eligible for out-of-range house number", async () => {
    const res = await handleValidateAddress(
      makeCtx({
        body: { street: "Else Alfelts Vej", houseNumber: 50, floor: null, door: null },
      }),
    );
    expect(res.statusCode).toBe(200);
    const body = res.body as Record<string, unknown>;
    expect(body.eligible).toBe(false);
  });

  it("throws badRequest when body is missing", async () => {
    try {
      await handleValidateAddress(makeCtx({ body: undefined }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });
});

describe("handleValidateRegistration", () => {
  const validBody = {
    name: "Alice",
    email: "alice@example.com",
    street: "Else Alfelts Vej",
    houseNumber: 130,
    floor: null,
    door: null,
    boxId: 1,
    language: "da",
  };

  it("returns valid for complete input", async () => {
    const res = await handleValidateRegistration(makeCtx({ body: validBody }));
    expect(res.statusCode).toBe(200);
    const body = res.body as Record<string, unknown>;
    expect(body.valid).toBe(true);
    expect(body.apartmentKey).toBe("else alfelts vej 130");
  });

  it("returns 422 with errors for empty input", async () => {
    const res = await handleValidateRegistration(makeCtx({ body: {} }));
    expect(res.statusCode).toBe(422);
    const body = res.body as Record<string, unknown>;
    expect(body.valid).toBe(false);
    const errors = body.errors as Record<string, string>;
    expect(Object.keys(errors).length).toBeGreaterThan(0);
  });

  it("returns floorDoorRequired info", async () => {
    const res = await handleValidateRegistration(
      makeCtx({
        body: { ...validBody, houseNumber: 170, floor: "2", door: "th" },
      }),
    );
    expect(res.statusCode).toBe(200);
    const body = res.body as Record<string, unknown>;
    expect(body.floorDoorRequired).toBe(true);
  });

  it("throws badRequest when body is missing", async () => {
    try {
      await handleValidateRegistration(makeCtx({ body: undefined }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });
});
