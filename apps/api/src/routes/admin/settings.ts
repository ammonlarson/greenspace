import { OPENING_TIMEZONE } from "@greenspace/shared";
import type { Transaction } from "kysely";
import { badRequest } from "../../lib/errors.js";
import type { Database } from "../../db/types.js";
import type { RequestContext, RouteResponse } from "../../router.js";

export async function handleGetOpeningTime(ctx: RequestContext): Promise<RouteResponse> {
  const settings = await ctx.db
    .selectFrom("system_settings")
    .select(["opening_datetime", "updated_at"])
    .executeTakeFirst();

  return {
    statusCode: 200,
    body: {
      openingDatetime: settings?.opening_datetime
        ? new Date(settings.opening_datetime).toISOString()
        : null,
      timezone: OPENING_TIMEZONE,
      updatedAt: settings?.updated_at
        ? new Date(settings.updated_at).toISOString()
        : null,
    },
  };
}

interface UpdateOpeningTimeBody {
  openingDatetime?: string;
}

export async function handleUpdateOpeningTime(ctx: RequestContext): Promise<RouteResponse> {
  const { openingDatetime } = (ctx.body ?? {}) as UpdateOpeningTimeBody;

  if (!openingDatetime) {
    throw badRequest("openingDatetime is required");
  }

  const parsed = new Date(openingDatetime);
  if (isNaN(parsed.getTime())) {
    throw badRequest("openingDatetime must be a valid ISO 8601 datetime");
  }

  const current = await ctx.db
    .selectFrom("system_settings")
    .select(["id", "opening_datetime"])
    .executeTakeFirst();

  if (!current) {
    throw badRequest("System settings not initialized");
  }

  const beforeDatetime = new Date(current.opening_datetime).toISOString();
  const afterDatetime = parsed.toISOString();
  const now = new Date().toISOString();
  const adminId = ctx.adminId!;

  await ctx.db.transaction().execute(async (trx: Transaction<Database>) => {
    await trx
      .updateTable("system_settings")
      .set({
        opening_datetime: afterDatetime,
        updated_at: now,
      })
      .where("id", "=", current.id)
      .execute();

    await trx
      .insertInto("audit_events")
      .values({
        timestamp: now,
        actor_type: "admin",
        actor_id: adminId,
        action: "opening_datetime_change",
        entity_type: "system_settings",
        entity_id: current.id,
        before: JSON.stringify({ opening_datetime: beforeDatetime }),
        after: JSON.stringify({ opening_datetime: afterDatetime }),
        reason: null,
      })
      .execute();
  });

  return {
    statusCode: 200,
    body: {
      openingDatetime: afterDatetime,
      timezone: OPENING_TIMEZONE,
      updatedAt: now,
    },
  };
}
