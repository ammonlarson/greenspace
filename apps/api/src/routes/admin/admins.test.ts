import { describe, expect, it } from "vitest";
import type { Kysely } from "kysely";
import type { Database } from "../../db/types.js";
import type { RequestContext } from "../../router.js";
import { AppError } from "../../lib/errors.js";
import { handleCreateAdmin, handleDeleteAdmin, handleListAdmins } from "./admins.js";

function makeCtx(overrides: Partial<RequestContext> = {}): RequestContext {
  return {
    db: {} as Kysely<Database>,
    method: "GET",
    path: "/admin/admins",
    body: undefined,
    headers: {},
    params: {},
    adminId: "admin-1",
    ...overrides,
  };
}

describe("handleCreateAdmin", () => {
  it("throws 401 when adminId is missing", async () => {
    try {
      await handleCreateAdmin(makeCtx({ adminId: undefined }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    }
  });

  it("throws 400 when email is missing", async () => {
    try {
      await handleCreateAdmin(makeCtx({ body: { password: "test1234" } }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).message).toBe("Email and password are required");
    }
  });

  it("throws 400 when password is missing", async () => {
    try {
      await handleCreateAdmin(makeCtx({ body: { email: "new@test.com" } }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).message).toBe("Email and password are required");
    }
  });

  it("throws 400 when password is too short", async () => {
    try {
      await handleCreateAdmin(
        makeCtx({ body: { email: "new@test.com", password: "short" } }),
      );
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).message).toBe("Password must be at least 8 characters");
    }
  });
});

describe("handleDeleteAdmin", () => {
  it("throws 401 when adminId is missing", async () => {
    try {
      await handleDeleteAdmin(makeCtx({ adminId: undefined, params: { id: "other" } }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    }
  });

  it("throws 400 when target id is missing", async () => {
    try {
      await handleDeleteAdmin(makeCtx({ params: {} }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
    }
  });

  it("throws 400 when attempting self-delete", async () => {
    try {
      await handleDeleteAdmin(makeCtx({ adminId: "admin-1", params: { id: "admin-1" } }));
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).code).toBe("SELF_DELETE");
      expect((err as AppError).message).toBe("Cannot delete your own account");
    }
  });
});

describe("handleListAdmins", () => {
  it("is a function", () => {
    expect(typeof handleListAdmins).toBe("function");
  });
});
