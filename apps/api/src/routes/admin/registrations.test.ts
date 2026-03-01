import { describe, expect, it, vi } from "vitest";
import type { Kysely } from "kysely";
import type { Database } from "../../db/types.js";
import type { RequestContext } from "../../router.js";
import { AppError } from "../../lib/errors.js";
import {
  handleAssignWaitlist,
  handleCreateRegistration,
  handleListRegistrations,
  handleMoveRegistration,
  handleRemoveRegistration,
} from "./registrations.js";

function makeCtx(overrides: Partial<RequestContext> = {}): RequestContext {
  return {
    db: {} as Kysely<Database>,
    method: "GET",
    path: "/admin/registrations",
    body: undefined,
    headers: {},
    params: {},
    adminId: "admin-1",
    ...overrides,
  };
}

describe("handleListRegistrations", () => {
  it("throws 401 when adminId is missing", async () => {
    try {
      await handleListRegistrations(makeCtx({ adminId: undefined }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    }
  });

  it("returns registrations from database", async () => {
    const mockRegs = [
      { id: "r1", box_id: 1, name: "Alice", status: "active" },
    ];
    const executeFn = vi.fn().mockResolvedValue(mockRegs);
    const orderByFn = vi.fn().mockReturnValue({ execute: executeFn });
    const selectFn = vi.fn().mockReturnValue({ orderBy: orderByFn });
    const selectFromFn = vi.fn().mockReturnValue({ select: selectFn });
    const mockDb = { selectFrom: selectFromFn } as unknown as Kysely<Database>;

    const result = await handleListRegistrations(makeCtx({ db: mockDb }));
    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(mockRegs);
    expect(selectFromFn).toHaveBeenCalledWith("registrations");
  });
});

describe("handleCreateRegistration", () => {
  it("throws 401 when adminId is missing", async () => {
    try {
      await handleCreateRegistration(makeCtx({ adminId: undefined }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    }
  });

  it("throws 400 when required fields are missing", async () => {
    try {
      await handleCreateRegistration(makeCtx({ body: { boxId: 1 } }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });

  it("throws 400 when box not found", async () => {
    const mockDb = makeMockTrxDb({
      boxResult: undefined,
    });

    try {
      await handleCreateRegistration(
        makeCtx({
          db: mockDb,
          body: {
            boxId: 99,
            name: "Alice",
            email: "a@b.com",
            street: "Else Alfelts Vej",
            houseNumber: 130,
            language: "da",
          },
        }),
      );
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).message).toBe("Box not found");
    }
  });

  it("throws 409 when box is occupied", async () => {
    const mockDb = makeMockTrxDb({
      boxResult: { id: 1, state: "occupied" },
    });

    try {
      await handleCreateRegistration(
        makeCtx({
          db: mockDb,
          body: {
            boxId: 1,
            name: "Alice",
            email: "a@b.com",
            street: "Else Alfelts Vej",
            houseNumber: 130,
            language: "da",
          },
        }),
      );
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(409);
      expect((err as AppError).code).toBe("BOX_OCCUPIED");
    }
  });
});

describe("handleCreateRegistration (happy path)", () => {
  it("creates registration and returns 201", async () => {
    const mockDb = makeMockTrxDb({
      boxResult: { id: 1, state: "available" },
      existingReg: undefined,
    });

    const result = await handleCreateRegistration(
      makeCtx({
        db: mockDb,
        body: {
          boxId: 1,
          name: "Alice",
          email: "a@b.com",
          street: "Else Alfelts Vej",
          houseNumber: 130,
          language: "da",
        },
      }),
    );
    expect(result.statusCode).toBe(201);
    const body = result.body as Record<string, unknown>;
    expect(body.id).toBe("new-reg-id");
    expect(body.boxId).toBe(1);
    expect(body.apartmentKey).toBe("else alfelts vej 130");
  });

  it("throws 400 for invalid language", async () => {
    try {
      await handleCreateRegistration(
        makeCtx({
          body: {
            boxId: 1,
            name: "Alice",
            email: "a@b.com",
            street: "Else Alfelts Vej",
            houseNumber: 130,
            language: "fr",
          },
        }),
      );
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).message).toBe("language must be 'da' or 'en'");
    }
  });
});

describe("handleMoveRegistration", () => {
  it("throws 401 when adminId is missing", async () => {
    try {
      await handleMoveRegistration(makeCtx({ adminId: undefined }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    }
  });

  it("throws 400 when required fields are missing", async () => {
    try {
      await handleMoveRegistration(makeCtx({ body: {} }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });
});

describe("handleRemoveRegistration", () => {
  it("throws 401 when adminId is missing", async () => {
    try {
      await handleRemoveRegistration(makeCtx({ adminId: undefined }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    }
  });

  it("throws 400 when registrationId is missing", async () => {
    try {
      await handleRemoveRegistration(makeCtx({ body: {} }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });
});

describe("handleAssignWaitlist", () => {
  it("throws 401 when adminId is missing", async () => {
    try {
      await handleAssignWaitlist(makeCtx({ adminId: undefined }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    }
  });

  it("throws 400 when required fields are missing", async () => {
    try {
      await handleAssignWaitlist(makeCtx({ body: {} }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });
});

function makeMockTrxDb(opts: {
  boxResult?: { id: number; state: string };
  existingReg?: { id: string };
}): Kysely<Database> {
  const mockTrx = {
    selectFrom: vi.fn().mockImplementation((table: string) => {
      if (table === "planter_boxes") {
        return {
          select: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              forUpdate: vi.fn().mockReturnValue({
                executeTakeFirst: vi.fn().mockResolvedValue(opts.boxResult),
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
    insertInto: vi.fn().mockImplementation(() => ({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockReturnValue({
          execute: vi.fn().mockResolvedValue([{ id: "new-reg-id" }]),
        }),
        execute: vi.fn().mockResolvedValue(undefined),
      }),
    })),
  };

  return {
    transaction: vi.fn().mockReturnValue({
      execute: vi.fn().mockImplementation(
        async (fn: (trx: unknown) => Promise<unknown>) => fn(mockTrx),
      ),
    }),
  } as unknown as Kysely<Database>;
}
