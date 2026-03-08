import { describe, expect, it, vi } from "vitest";
import type { Kysely } from "kysely";
import type { Database } from "../../db/types.js";
import type { RequestContext } from "../../router.js";
import { handleAdminBoxes } from "./boxes.js";

function makeCtx(overrides: Partial<RequestContext> = {}): RequestContext {
  return {
    db: {} as Kysely<Database>,
    method: "GET",
    path: "/admin/boxes",
    body: undefined,
    headers: {},
    params: {},
    ...overrides,
  };
}

describe("handleAdminBoxes", () => {
  it("returns boxes with true state including reserved", async () => {
    const mockRows = [
      { id: 1, name: "Linaria", greenhouse_name: "Kronen", state: "available" },
      { id: 2, name: "Harebell", greenhouse_name: "Kronen", state: "occupied" },
      { id: 15, name: "Robin", greenhouse_name: "Søen", state: "reserved" },
    ];
    const executeFn = vi.fn().mockResolvedValue(mockRows);
    const orderByFn = vi.fn().mockReturnValue({ execute: executeFn });
    const selectFn = vi.fn().mockReturnValue({ orderBy: orderByFn });
    const selectFromFn = vi.fn().mockReturnValue({ select: selectFn });
    const mockDb = { selectFrom: selectFromFn } as unknown as Kysely<Database>;

    const res = await handleAdminBoxes(makeCtx({ db: mockDb }));
    expect(res.statusCode).toBe(200);
    const body = res.body as Array<Record<string, unknown>>;
    expect(body).toHaveLength(3);

    expect(body[0]).toEqual({ id: 1, name: "Linaria", greenhouse: "Kronen", state: "available" });
    expect(body[1]).toEqual({ id: 2, name: "Harebell", greenhouse: "Kronen", state: "occupied" });
    expect(body[2]).toEqual({ id: 15, name: "Robin", greenhouse: "Søen", state: "reserved" });
  });

  it("returns empty array when no boxes exist", async () => {
    const executeFn = vi.fn().mockResolvedValue([]);
    const orderByFn = vi.fn().mockReturnValue({ execute: executeFn });
    const selectFn = vi.fn().mockReturnValue({ orderBy: orderByFn });
    const selectFromFn = vi.fn().mockReturnValue({ select: selectFn });
    const mockDb = { selectFrom: selectFromFn } as unknown as Kysely<Database>;

    const res = await handleAdminBoxes(makeCtx({ db: mockDb }));
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });
});
