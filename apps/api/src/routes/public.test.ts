import { describe, expect, it, vi } from "vitest";
import type { Kysely } from "kysely";
import type { Database } from "../db/types.js";
import type { RequestContext } from "../router.js";
import { AppError } from "../lib/errors.js";
import {
  handleJoinWaitlist,
  handleValidateAddress,
  handleValidateRegistration,
  handleWaitlistPosition,
} from "./public.js";

function makeCtx(overrides: Partial<RequestContext> = {}): RequestContext {
  return {
    db: {} as Kysely<Database>,
    method: "POST",
    path: "/public/validate-address",
    body: undefined,
    headers: {},
    params: {},
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

describe("handleJoinWaitlist", () => {
  const validWaitlistBody = {
    name: "Alice",
    email: "alice@example.com",
    street: "Else Alfelts Vej",
    houseNumber: 130,
    floor: null,
    door: null,
    language: "da",
  };

  it("throws badRequest when body is missing", async () => {
    try {
      await handleJoinWaitlist(makeCtx({ body: undefined }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });

  it("returns 422 for invalid input", async () => {
    const res = await handleJoinWaitlist(makeCtx({ body: {} }));
    expect(res.statusCode).toBe(422);
    const body = res.body as Record<string, unknown>;
    expect(body.valid).toBe(false);
  });

  it("throws 400 when boxes are still available", async () => {
    const executeTakeFirstOrThrowFn = vi.fn().mockResolvedValue({ count: 5 });
    const asFn = vi.fn().mockReturnValue("count");
    const countAllFn = vi.fn().mockReturnValue({ as: asFn });
    const fnObj = { countAll: countAllFn };
    const whereFn = vi.fn().mockReturnValue({ executeTakeFirstOrThrow: executeTakeFirstOrThrowFn });
    const selectFn = vi.fn().mockReturnValue({ where: whereFn });
    const selectFromFn = vi.fn().mockReturnValue({ select: selectFn });
    const mockDb = { selectFrom: selectFromFn, fn: fnObj } as unknown as Kysely<Database>;

    try {
      await handleJoinWaitlist(makeCtx({ db: mockDb, body: validWaitlistBody }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).code).toBe("BOXES_AVAILABLE");
    }
  });
});

describe("handleWaitlistPosition", () => {
  it("throws badRequest when apartmentKey param is missing", async () => {
    try {
      await handleWaitlistPosition(makeCtx({ params: {} }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });

  it("returns onWaitlist false when no entry found", async () => {
    const executeTakeFirstFn = vi.fn().mockResolvedValue(undefined);
    const whereFn2 = vi.fn().mockReturnValue({ executeTakeFirst: executeTakeFirstFn });
    const whereFn1 = vi.fn().mockReturnValue({ where: whereFn2 });
    const selectFn = vi.fn().mockReturnValue({ where: whereFn1 });
    const selectFromFn = vi.fn().mockReturnValue({ select: selectFn });
    const mockDb = { selectFrom: selectFromFn } as unknown as Kysely<Database>;

    const res = await handleWaitlistPosition(
      makeCtx({
        db: mockDb,
        params: { apartmentKey: "else alfelts vej 130" },
      }),
    );
    expect(res.statusCode).toBe(200);
    const body = res.body as Record<string, unknown>;
    expect(body.onWaitlist).toBe(false);
    expect(body.position).toBeNull();
  });
});
