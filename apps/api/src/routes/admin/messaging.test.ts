import { describe, expect, it, vi } from "vitest";
import type { Kysely } from "kysely";
import type { Database } from "../../db/types.js";
import type { RequestContext } from "../../router.js";
import { AppError } from "../../lib/errors.js";
import { handleGetRecipients, handleSendBulkEmail } from "./messaging.js";

vi.mock("../../lib/email-service.js", () => ({
  queueAndSendEmail: vi.fn().mockResolvedValue("email-mock-id"),
}));

vi.mock("../../lib/audit.js", () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

function makeCtx(overrides: Partial<RequestContext> = {}): RequestContext {
  return {
    db: {} as Kysely<Database>,
    method: "POST",
    path: "/admin/messaging/recipients",
    body: undefined,
    headers: {},
    params: {},
    adminId: "admin-1",
    ...overrides,
  };
}

function buildQueryMock(rows: unknown[]) {
  const executeFn = vi.fn().mockResolvedValue(rows);

  const queryObj: Record<string, unknown> = {};
  queryObj.execute = executeFn;
  queryObj.where = vi.fn().mockReturnValue(queryObj);
  queryObj.select = vi.fn().mockReturnValue(queryObj);
  queryObj.innerJoin = vi.fn().mockReturnValue(queryObj);

  const selectFromFn = vi.fn().mockReturnValue(queryObj);
  return { selectFrom: selectFromFn } as unknown as Kysely<Database>;
}

describe("handleGetRecipients", () => {
  it("throws 401 when adminId is missing", async () => {
    try {
      await handleGetRecipients(makeCtx({ adminId: undefined }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    }
  });

  it("throws 400 when audience is missing", async () => {
    try {
      await handleGetRecipients(makeCtx({ body: {} }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });

  it("throws 400 when audience is invalid", async () => {
    try {
      await handleGetRecipients(makeCtx({ body: { audience: "invalid" } }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });

  it("returns recipients for 'all' audience", async () => {
    const mockRows = [
      { email: "alice@test.com", name: "Alice", language: "da" },
      { email: "bob@test.com", name: "Bob", language: "en" },
    ];
    const mockDb = buildQueryMock(mockRows);

    const result = await handleGetRecipients(
      makeCtx({ db: mockDb, body: { audience: "all" } }),
    );

    expect(result.statusCode).toBe(200);
    const body = result.body as { audience: string; count: number; recipients: unknown[] };
    expect(body.audience).toBe("all");
    expect(body.count).toBe(2);
    expect(body.recipients).toHaveLength(2);
  });

  it("deduplicates recipients by email", async () => {
    const mockRows = [
      { email: "alice@test.com", name: "Alice", language: "da" },
      { email: "Alice@test.com", name: "Alice", language: "da" },
    ];
    const mockDb = buildQueryMock(mockRows);

    const result = await handleGetRecipients(
      makeCtx({ db: mockDb, body: { audience: "all" } }),
    );

    const body = result.body as { count: number };
    expect(body.count).toBe(1);
  });

  it("filters by greenhouse for 'kronen' audience", async () => {
    const mockRows = [
      { email: "alice@test.com", name: "Alice", language: "da" },
    ];
    const mockDb = buildQueryMock(mockRows);

    const result = await handleGetRecipients(
      makeCtx({ db: mockDb, body: { audience: "kronen" } }),
    );

    expect(result.statusCode).toBe(200);
    const body = result.body as { count: number };
    expect(body.count).toBe(1);
  });
});

describe("handleSendBulkEmail", () => {
  it("throws 401 when adminId is missing", async () => {
    try {
      await handleSendBulkEmail(makeCtx({ adminId: undefined }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    }
  });

  it("throws 400 when audience is missing", async () => {
    try {
      await handleSendBulkEmail(makeCtx({ body: { subject: "Hi", bodyHtml: "<p>Hi</p>" } }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });

  it("throws 400 when subject is missing", async () => {
    try {
      await handleSendBulkEmail(
        makeCtx({ body: { audience: "all", bodyHtml: "<p>Hi</p>" } }),
      );
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });

  it("throws 400 when bodyHtml is missing", async () => {
    try {
      await handleSendBulkEmail(
        makeCtx({ body: { audience: "all", subject: "Hi" } }),
      );
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });

  it("throws 400 when no recipients found", async () => {
    const mockDb = buildQueryMock([]);

    try {
      await handleSendBulkEmail(
        makeCtx({
          db: mockDb,
          body: { audience: "all", subject: "Test", bodyHtml: "<p>Test</p>" },
        }),
      );
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });

  it("sends emails to all recipients and returns counts", async () => {
    const mockRows = [
      { email: "alice@test.com", name: "Alice", language: "da" },
      { email: "bob@test.com", name: "Bob", language: "en" },
    ];
    const mockDb = buildQueryMock(mockRows);

    const result = await handleSendBulkEmail(
      makeCtx({
        db: mockDb,
        body: { audience: "all", subject: "Newsletter", bodyHtml: "<p>Hello!</p>" },
      }),
    );

    expect(result.statusCode).toBe(200);
    const body = result.body as {
      audience: string;
      recipientCount: number;
      sentCount: number;
      failedCount: number;
    };
    expect(body.audience).toBe("all");
    expect(body.recipientCount).toBe(2);
    expect(body.sentCount).toBe(2);
    expect(body.failedCount).toBe(0);
  });
});
