import { AUDIT_ACTIONS } from "@greenspace/shared";
import type { AuditAction } from "@greenspace/shared";
import { badRequest, unauthorized } from "../../lib/errors.js";
import type { RequestContext, RouteResponse } from "../../router.js";

interface AuditQueryParams {
  action?: string;
  entityType?: string;
  entityId?: string;
  actorType?: string;
  before?: string;
  after?: string;
  limit?: string;
  cursor?: string;
}

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;

function parseQueryParams(body: unknown): AuditQueryParams {
  if (!body || typeof body !== "object") return {};
  return body as AuditQueryParams;
}

export async function handleListAuditEvents(ctx: RequestContext): Promise<RouteResponse> {
  if (!ctx.adminId) {
    throw unauthorized();
  }

  const params = parseQueryParams(ctx.body);

  if (params.action && !(AUDIT_ACTIONS as readonly string[]).includes(params.action)) {
    throw badRequest(`Invalid action filter. Must be one of: ${AUDIT_ACTIONS.join(", ")}`);
  }

  if (params.actorType && !["public", "admin", "system"].includes(params.actorType)) {
    throw badRequest("Invalid actorType filter. Must be one of: public, admin, system");
  }

  if (params.before && isNaN(new Date(params.before).getTime())) {
    throw badRequest("Invalid 'before' date format");
  }

  if (params.after && isNaN(new Date(params.after).getTime())) {
    throw badRequest("Invalid 'after' date format");
  }

  const limit = Math.min(
    Math.max(1, Number(params.limit) || DEFAULT_PAGE_SIZE),
    MAX_PAGE_SIZE,
  );

  let query = ctx.db
    .selectFrom("audit_events")
    .select([
      "id",
      "timestamp",
      "actor_type",
      "actor_id",
      "action",
      "entity_type",
      "entity_id",
      "before",
      "after",
      "reason",
    ])
    .orderBy("timestamp", "desc")
    .orderBy("id", "desc")
    .limit(limit + 1);

  if (params.action) {
    query = query.where("action", "=", params.action as AuditAction);
  }

  if (params.entityType) {
    query = query.where("entity_type", "=", params.entityType);
  }

  if (params.entityId) {
    query = query.where("entity_id", "=", params.entityId);
  }

  if (params.actorType) {
    query = query.where("actor_type", "=", params.actorType as "public" | "admin" | "system");
  }

  if (params.before) {
    query = query.where("timestamp", "<", new Date(params.before));
  }

  if (params.after) {
    query = query.where("timestamp", ">", new Date(params.after));
  }

  if (params.cursor) {
    query = query.where("id", "<", params.cursor);
  }

  const rows = await query.execute();

  const hasMore = rows.length > limit;
  const events = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? events[events.length - 1].id : null;

  return {
    statusCode: 200,
    body: {
      events: events.map((e) => ({
        id: e.id,
        timestamp: new Date(e.timestamp).toISOString(),
        actorType: e.actor_type,
        actorId: e.actor_id,
        action: e.action,
        entityType: e.entity_type,
        entityId: e.entity_id,
        before: e.before,
        after: e.after,
        reason: e.reason,
      })),
      nextCursor,
      hasMore,
    },
  };
}
