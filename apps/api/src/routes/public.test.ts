import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Kysely } from "kysely";
import type { Database } from "../db/types.js";
import type { RequestContext } from "../router.js";
import { AppError } from "../lib/errors.js";
import { setSesClient } from "../lib/email-service.js";
import {
  handleJoinWaitlist,
  handlePublicRegister,
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

describe("handlePublicRegister", () => {
  const validRegBody = {
    name: "Alice",
    email: "alice@example.com",
    street: "Else Alfelts Vej",
    houseNumber: 130,
    floor: null,
    door: null,
    boxId: 1,
    language: "da",
  };

  beforeEach(() => {
    const mockSes = { send: vi.fn().mockResolvedValue({}) };
    setSesClient(mockSes as never);
  });

  it("throws badRequest when body is missing", async () => {
    try {
      await handlePublicRegister(makeCtx({ body: undefined }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });

  it("returns 422 for invalid input", async () => {
    const res = await handlePublicRegister(makeCtx({ body: {} }));
    expect(res.statusCode).toBe(422);
    const body = res.body as Record<string, unknown>;
    expect(body.valid).toBe(false);
  });

  it("throws badRequest when registration is not open", async () => {
    const futureDate = new Date(Date.now() + 86400000);
    const executeTakeFirstFn = vi.fn().mockResolvedValue({
      opening_datetime: futureDate,
    });
    const selectFn = vi.fn().mockReturnValue({ executeTakeFirst: executeTakeFirstFn });
    const selectFromFn = vi.fn().mockReturnValue({ select: selectFn });
    const mockDb = { selectFrom: selectFromFn } as unknown as Kysely<Database>;

    try {
      await handlePublicRegister(makeCtx({ db: mockDb, body: validRegBody }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).message).toBe("Registration is not yet open");
    }
  });

  it("throws badRequest when box not found", async () => {
    const pastDate = new Date(Date.now() - 86400000);
    const mockDb = makeMockDbForRegister({
      openingDatetime: pastDate,
      box: undefined,
    });

    try {
      await handlePublicRegister(makeCtx({ db: mockDb, body: validRegBody }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).message).toBe("Box not found");
    }
  });

  it("throws 409 when box is not available", async () => {
    const pastDate = new Date(Date.now() - 86400000);
    const mockDb = makeMockDbForRegister({
      openingDatetime: pastDate,
      box: { id: 1, state: "occupied" },
    });

    try {
      await handlePublicRegister(makeCtx({ db: mockDb, body: validRegBody }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(409);
      expect((err as AppError).code).toBe("BOX_UNAVAILABLE");
    }
  });

  it("returns 409 when apartment has existing registration and no confirmSwitch", async () => {
    const pastDate = new Date(Date.now() - 86400000);
    const mockDb = makeMockDbForRegister({
      openingDatetime: pastDate,
      box: { id: 1, state: "available" },
      existingReg: { id: "reg-old", box_id: 5, name: "Alice", email: "a@b.com", status: "active" },
    });

    const res = await handlePublicRegister(makeCtx({ db: mockDb, body: validRegBody }));
    expect(res.statusCode).toBe(409);
    const body = res.body as Record<string, unknown>;
    expect(body.code).toBe("SWITCH_REQUIRED");
    expect(body.existingBoxId).toBe(5);
  });

  it("creates registration for new apartment (no existing)", async () => {
    const pastDate = new Date(Date.now() - 86400000);
    const mockDb = makeMockDbForRegister({
      openingDatetime: pastDate,
      box: { id: 1, state: "available" },
      existingReg: undefined,
      newRegId: "reg-new",
    });

    const res = await handlePublicRegister(makeCtx({ db: mockDb, body: validRegBody }));
    expect(res.statusCode).toBe(200);
    const body = res.body as Record<string, unknown>;
    expect(body.registrationId).toBe("reg-new");
    expect(body.boxId).toBe(1);
    expect(body.apartmentKey).toBe("else alfelts vej 130");
  });

  it("performs switch when confirmSwitch is true", async () => {
    const pastDate = new Date(Date.now() - 86400000);
    const mockDb = makeMockDbForRegister({
      openingDatetime: pastDate,
      box: { id: 1, state: "available" },
      existingReg: { id: "reg-old", box_id: 5, name: "Alice", email: "a@b.com", status: "active" },
      newRegId: "reg-new",
    });

    const res = await handlePublicRegister(
      makeCtx({ db: mockDb, body: { ...validRegBody, confirmSwitch: true } }),
    );
    expect(res.statusCode).toBe(200);
    const body = res.body as Record<string, unknown>;
    expect(body.registrationId).toBe("reg-new");
    expect(body.boxId).toBe(1);
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

describe("handleJoinWaitlist (happy path)", () => {
  const validWaitlistBody = {
    name: "Alice",
    email: "alice@example.com",
    street: "Else Alfelts Vej",
    houseNumber: 130,
    floor: null,
    door: null,
    language: "da",
  };

  it("creates a new waitlist entry when no boxes available and apartment not on waitlist", async () => {
    const mockDb = makeMockDbForWaitlist({
      availableCount: 0,
      existingEntry: undefined,
      newEntryId: "wl-1",
      positionEntryCreatedAt: "2026-03-01T10:00:00Z",
      positionCount: 1,
    });

    const res = await handleJoinWaitlist(makeCtx({ db: mockDb, body: validWaitlistBody }));
    expect(res.statusCode).toBe(201);
    const body = res.body as Record<string, unknown>;
    expect(body.alreadyOnWaitlist).toBe(false);
    expect(body.waitlistEntryId).toBe("wl-1");
    expect(body.position).toBe(1);
  });

  it("returns existing entry when apartment is already on waitlist, preserving original timestamp", async () => {
    const existingCreatedAt = "2026-03-01T08:00:00Z";
    const mockDb = makeMockDbForWaitlist({
      availableCount: 0,
      existingEntry: { id: "wl-existing", created_at: existingCreatedAt },
      positionEntryCreatedAt: existingCreatedAt,
      positionCount: 3,
    });

    const res = await handleJoinWaitlist(makeCtx({ db: mockDb, body: validWaitlistBody }));
    expect(res.statusCode).toBe(200);
    const body = res.body as Record<string, unknown>;
    expect(body.alreadyOnWaitlist).toBe(true);
    expect(body.position).toBe(3);
    expect(body.joinedAt).toBe(new Date(existingCreatedAt).toISOString());
  });

  it("logs waitlist_reorder_preserve audit event for duplicate apartment", async () => {
    const existingCreatedAt = "2026-03-01T08:00:00Z";
    const mockDb = makeMockDbForWaitlist({
      availableCount: 0,
      existingEntry: { id: "wl-existing", created_at: existingCreatedAt },
      positionEntryCreatedAt: existingCreatedAt,
      positionCount: 1,
    });

    await handleJoinWaitlist(makeCtx({ db: mockDb, body: validWaitlistBody }));

    const insertCalls = (mockDb.insertInto as ReturnType<typeof vi.fn>).mock.calls;
    const auditCalls = insertCalls.filter(
      (call: string[]) => call[0] === "audit_events",
    );
    expect(auditCalls.length).toBeGreaterThan(0);
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

interface MockRegisterOpts {
  openingDatetime: Date;
  box?: { id: number; state: string };
  existingReg?: { id: string; box_id: number; name: string; email: string; status: string };
  newRegId?: string;
}

function makeMockDbForRegister(opts: MockRegisterOpts): Kysely<Database> {
  const settingsResult = { opening_datetime: opts.openingDatetime };

  const mockTrx = {
    selectFrom: vi.fn().mockImplementation((table: string) => {
      if (table === "planter_boxes") {
        return {
          select: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              forUpdate: vi.fn().mockReturnValue({
                executeTakeFirst: vi.fn().mockResolvedValue(opts.box),
              }),
            }),
          }),
        };
      }
      if (table === "registrations") {
        return {
          select: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                executeTakeFirst: vi.fn().mockResolvedValue(opts.existingReg),
              }),
            }),
          }),
        };
      }
      return {};
    }),
    updateTable: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    }),
    insertInto: vi.fn().mockImplementation((table: string) => {
      if (table === "registrations") {
        return {
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([{ id: opts.newRegId ?? "reg-id" }]),
            }),
          }),
        };
      }
      if (table === "audit_events") {
        return {
          values: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue(undefined),
          }),
        };
      }
      return {};
    }),
  };

  return {
    selectFrom: vi.fn().mockImplementation((table: string) => {
      if (table === "system_settings") {
        return {
          select: vi.fn().mockReturnValue({
            executeTakeFirst: vi.fn().mockResolvedValue(settingsResult),
          }),
        };
      }
      return {};
    }),
    transaction: vi.fn().mockReturnValue({
      execute: vi.fn().mockImplementation(
        async (fn: (trx: unknown) => Promise<unknown>) => fn(mockTrx),
      ),
    }),
    insertInto: vi.fn().mockImplementation((table: string) => {
      if (table === "emails") {
        return {
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockReturnValue({
              execute: vi.fn().mockResolvedValue([{ id: "email-1" }]),
            }),
          }),
        };
      }
      if (table === "audit_events") {
        return {
          values: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue(undefined),
          }),
        };
      }
      return {};
    }),
    updateTable: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    }),
  } as unknown as Kysely<Database>;
}

interface MockWaitlistOpts {
  availableCount: number;
  existingEntry?: { id: string; created_at: string };
  newEntryId?: string;
  positionEntryCreatedAt?: string;
  positionCount?: number;
}

function makeMockDbForWaitlist(opts: MockWaitlistOpts): Kysely<Database> {
  let waitlistCallNum = 0;

  const mockTrx = {
    insertInto: vi.fn().mockImplementation((table: string) => {
      if (table === "waitlist_entries") {
        return {
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockReturnValue({
              executeTakeFirstOrThrow: vi.fn().mockResolvedValue({
                id: opts.newEntryId ?? "wl-id",
              }),
            }),
          }),
        };
      }
      if (table === "audit_events") {
        return {
          values: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue(undefined),
          }),
        };
      }
      return {};
    }),
  };

  const asFn = vi.fn().mockReturnValue("position");
  const countAllFn = vi.fn().mockReturnValue({ as: asFn });
  const fnObj = { countAll: countAllFn };

  function makeWaitlistSelect() {
    waitlistCallNum++;
    const n = waitlistCallNum;

    // Call 1: check existing entry by apartment_key (executeTakeFirst)
    if (n === 1) {
      return {
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              executeTakeFirst: vi.fn().mockResolvedValue(opts.existingEntry),
            }),
          }),
        }),
      };
    }

    // Call 2: getWaitlistPosition first query - get entry's created_at (executeTakeFirst)
    if (n === 2) {
      return {
        select: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              executeTakeFirst: vi.fn().mockResolvedValue(
                opts.positionEntryCreatedAt
                  ? { created_at: opts.positionEntryCreatedAt }
                  : undefined,
              ),
            }),
          }),
        }),
      };
    }

    // Call 3: getWaitlistPosition second query - COUNT (executeTakeFirstOrThrow)
    return {
      select: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            executeTakeFirstOrThrow: vi.fn().mockResolvedValue({
              position: opts.positionCount ?? 0,
            }),
          }),
        }),
      }),
    };
  }

  return {
    selectFrom: vi.fn().mockImplementation((table: string) => {
      if (table === "planter_boxes") {
        return {
          select: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              executeTakeFirstOrThrow: vi.fn().mockResolvedValue({
                count: opts.availableCount,
              }),
            }),
          }),
        };
      }
      if (table === "waitlist_entries") {
        return makeWaitlistSelect();
      }
      return {};
    }),
    fn: fnObj,
    transaction: vi.fn().mockReturnValue({
      execute: vi.fn().mockImplementation(
        async (fn: (trx: unknown) => Promise<unknown>) => fn(mockTrx),
      ),
    }),
    insertInto: vi.fn().mockImplementation((table: string) => {
      if (table === "audit_events") {
        return {
          values: vi.fn().mockReturnValue({
            execute: vi.fn().mockResolvedValue(undefined),
          }),
        };
      }
      return {};
    }),
  } as unknown as Kysely<Database>;
}
