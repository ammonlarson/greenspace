import { describe, expect, it, vi } from "vitest";
import type { Kysely } from "kysely";
import type { Database } from "../../db/types.js";
import type { RequestContext } from "../../router.js";
import { AppError } from "../../lib/errors.js";
import { handleListAuditEvents } from "./audit.js";

function makeCtx(overrides: Partial<RequestContext> = {}): RequestContext {
  return {
    db: {} as Kysely<Database>,
    method: "POST",
    path: "/admin/audit-events",
    body: undefined,
    headers: {},
    params: {},
    ...overrides,
  };
}

describe("handleListAuditEvents", () => {
  it("throws 401 when adminId is missing", async () => {
    try {
      await handleListAuditEvents(makeCtx());
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    }
  });

  it("throws 400 for invalid action filter", async () => {
    try {
      await handleListAuditEvents(
        makeCtx({ adminId: "admin-1", body: { action: "invalid_action" } }),
      );
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).message).toContain("Invalid action filter");
    }
  });

  it("throws 400 for invalid actorType filter", async () => {
    try {
      await handleListAuditEvents(
        makeCtx({ adminId: "admin-1", body: { actorType: "invalid" } }),
      );
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).message).toContain("Invalid actorType");
    }
  });

  it("throws 400 for invalid before date", async () => {
    try {
      await handleListAuditEvents(
        makeCtx({ adminId: "admin-1", body: { before: "not-a-date" } }),
      );
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).message).toContain("before");
    }
  });

  it("throws 400 for invalid after date", async () => {
    try {
      await handleListAuditEvents(
        makeCtx({ adminId: "admin-1", body: { after: "not-a-date" } }),
      );
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).message).toContain("after");
    }
  });

  it("returns events with pagination from mock db", async () => {
    const mockEvents = [
      {
        id: "evt-1",
        timestamp: new Date("2026-03-01T10:00:00Z"),
        actor_type: "admin" as const,
        actor_id: "admin-1",
        action: "admin_create",
        entity_type: "admin",
        entity_id: "admin-2",
        before: null,
        after: { email: "new@example.com" },
        reason: null,
      },
    ];

    const executeFn = vi.fn().mockResolvedValue(mockEvents);
    const limitFn = vi.fn().mockReturnValue({ execute: executeFn });
    const orderBy2 = vi.fn().mockReturnValue({ limit: limitFn });
    const orderBy1 = vi.fn().mockReturnValue({ orderBy: orderBy2 });
    const selectFn = vi.fn().mockReturnValue({ orderBy: orderBy1 });
    const selectFromFn = vi.fn().mockReturnValue({ select: selectFn });
    const mockDb = { selectFrom: selectFromFn } as unknown as Kysely<Database>;

    const res = await handleListAuditEvents(
      makeCtx({ adminId: "admin-1", db: mockDb, body: {} }),
    );

    expect(res.statusCode).toBe(200);
    const body = res.body as { events: unknown[]; nextCursor: string | null; hasMore: boolean };
    expect(body.events).toHaveLength(1);
    expect(body.hasMore).toBe(false);
    expect(body.nextCursor).toBeNull();
    expect((body.events[0] as Record<string, unknown>).action).toBe("admin_create");
    expect((body.events[0] as Record<string, unknown>).actorType).toBe("admin");
  });

  it("applies action filter to query", async () => {
    const whereFn = vi.fn();
    const executeFn = vi.fn().mockResolvedValue([]);
    const limitFn = vi.fn().mockReturnValue({ where: whereFn });
    whereFn.mockReturnValue({ execute: executeFn });
    const orderBy2 = vi.fn().mockReturnValue({ limit: limitFn });
    const orderBy1 = vi.fn().mockReturnValue({ orderBy: orderBy2 });
    const selectFn = vi.fn().mockReturnValue({ orderBy: orderBy1 });
    const selectFromFn = vi.fn().mockReturnValue({ select: selectFn });
    const mockDb = { selectFrom: selectFromFn } as unknown as Kysely<Database>;

    const res = await handleListAuditEvents(
      makeCtx({ adminId: "admin-1", db: mockDb, body: { action: "admin_create" } }),
    );

    expect(res.statusCode).toBe(200);
    expect(whereFn).toHaveBeenCalledWith("action", "=", "admin_create");
  });

  it("detects hasMore and returns nextCursor when extra rows returned", async () => {
    const events = Array.from({ length: 51 }, (_, i) => ({
      id: `evt-${50 - i}`,
      timestamp: new Date(`2026-03-01T10:${String(50 - i).padStart(2, "0")}:00Z`),
      actor_type: "admin" as const,
      actor_id: "admin-1",
      action: "admin_create",
      entity_type: "admin",
      entity_id: `admin-${i}`,
      before: null,
      after: null,
      reason: null,
    }));

    const executeFn = vi.fn().mockResolvedValue(events);
    const limitFn = vi.fn().mockReturnValue({ execute: executeFn });
    const orderBy2 = vi.fn().mockReturnValue({ limit: limitFn });
    const orderBy1 = vi.fn().mockReturnValue({ orderBy: orderBy2 });
    const selectFn = vi.fn().mockReturnValue({ orderBy: orderBy1 });
    const selectFromFn = vi.fn().mockReturnValue({ select: selectFn });
    const mockDb = { selectFrom: selectFromFn } as unknown as Kysely<Database>;

    const res = await handleListAuditEvents(
      makeCtx({ adminId: "admin-1", db: mockDb, body: {} }),
    );

    expect(res.statusCode).toBe(200);
    const body = res.body as { events: unknown[]; nextCursor: string | null; hasMore: boolean };
    expect(body.events).toHaveLength(50);
    expect(body.hasMore).toBe(true);
    expect(body.nextCursor).toBe("evt-1");
  });
});
