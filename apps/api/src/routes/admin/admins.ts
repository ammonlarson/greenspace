import { badRequest, conflict, notFound, unauthorized } from "../../lib/errors.js";
import { hashPassword } from "../../lib/password.js";
import { logAuditEvent } from "../../lib/audit.js";
import type { RequestContext, RouteResponse } from "../../router.js";

export async function handleListAdmins(ctx: RequestContext): Promise<RouteResponse> {
  const admins = await ctx.db
    .selectFrom("admins")
    .select(["id", "email", "created_at"])
    .orderBy("created_at", "asc")
    .execute();

  return {
    statusCode: 200,
    body: admins,
  };
}

interface CreateAdminBody {
  email?: string;
  password?: string;
}

export async function handleCreateAdmin(ctx: RequestContext): Promise<RouteResponse> {
  const adminId = ctx.adminId;
  if (!adminId) {
    throw unauthorized();
  }

  const { email, password } = (ctx.body ?? {}) as CreateAdminBody;

  if (!email || !password) {
    throw badRequest("Email and password are required");
  }

  if (password.length < 8) {
    throw badRequest("Password must be at least 8 characters");
  }

  const existing = await ctx.db
    .selectFrom("admins")
    .select("id")
    .where("email", "=", email)
    .executeTakeFirst();

  if (existing) {
    throw conflict("An admin with this email already exists", "ADMIN_EXISTS");
  }

  const passwordHash = await hashPassword(password);

  const newAdmin = await ctx.db.transaction().execute(async (trx) => {
    const inserted = await trx
      .insertInto("admins")
      .values({ email })
      .returning(["id", "email", "created_at"])
      .executeTakeFirstOrThrow();

    await trx
      .insertInto("admin_credentials")
      .values({ admin_id: inserted.id, password_hash: passwordHash })
      .execute();

    await logAuditEvent(trx, {
      actor_type: "admin",
      actor_id: adminId,
      action: "admin_create",
      entity_type: "admin",
      entity_id: inserted.id,
      after: { email: inserted.email },
    });

    return inserted;
  });

  return {
    statusCode: 201,
    body: { id: newAdmin.id, email: newAdmin.email, created_at: newAdmin.created_at },
  };
}

export async function handleDeleteAdmin(ctx: RequestContext): Promise<RouteResponse> {
  const adminId = ctx.adminId;
  if (!adminId) {
    throw unauthorized();
  }

  const targetId = ctx.params["id"];
  if (!targetId) {
    throw badRequest("Admin ID is required");
  }

  if (targetId === adminId) {
    throw badRequest("Cannot delete your own account", "SELF_DELETE");
  }

  const target = await ctx.db
    .selectFrom("admins")
    .select(["id", "email"])
    .where("id", "=", targetId)
    .executeTakeFirst();

  if (!target) {
    throw notFound("Admin not found");
  }

  await ctx.db.transaction().execute(async (trx) => {
    await logAuditEvent(trx, {
      actor_type: "admin",
      actor_id: adminId,
      action: "admin_delete",
      entity_type: "admin",
      entity_id: target.id,
      before: { email: target.email },
    });

    await trx.deleteFrom("admins").where("id", "=", targetId).execute();
  });

  return {
    statusCode: 204,
    body: null,
  };
}
