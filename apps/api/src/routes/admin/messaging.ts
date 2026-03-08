import { KRONEN_BOX_RANGE, SOEN_BOX_RANGE } from "@greenspace/shared";
import { logAuditEvent } from "../../lib/audit.js";
import { queueAndSendEmail } from "../../lib/email-service.js";
import { badRequest, unauthorized } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import type { RequestContext, RouteResponse } from "../../router.js";

type Audience = "all" | "kronen" | "søen";

const VALID_AUDIENCES = new Set<string>(["all", "kronen", "søen"]);

interface Recipient {
  email: string;
  name: string;
  language: string;
}

function boxRangeForAudience(audience: Audience): { start: number; end: number } | null {
  switch (audience) {
    case "kronen":
      return KRONEN_BOX_RANGE;
    case "søen":
      return SOEN_BOX_RANGE;
    case "all":
      return null;
  }
}

async function queryRecipients(
  ctx: RequestContext,
  audience: Audience,
): Promise<Recipient[]> {
  let query = ctx.db
    .selectFrom("registrations")
    .innerJoin("planter_boxes", "planter_boxes.id", "registrations.box_id")
    .select([
      "registrations.email",
      "registrations.name",
      "registrations.language",
    ])
    .where("registrations.status", "=", "active");

  const range = boxRangeForAudience(audience);
  if (range) {
    query = query
      .where("registrations.box_id", ">=", range.start)
      .where("registrations.box_id", "<=", range.end);
  }

  const rows = await query.execute();

  const seen = new Set<string>();
  const unique: Recipient[] = [];
  for (const row of rows) {
    const key = row.email.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({ email: row.email, name: row.name, language: row.language });
    }
  }

  return unique;
}

interface RecipientsBody {
  audience?: string;
}

export async function handleGetRecipients(ctx: RequestContext): Promise<RouteResponse> {
  if (!ctx.adminId) {
    throw unauthorized();
  }

  const body = (ctx.body ?? {}) as RecipientsBody;
  const { audience } = body;

  if (!audience || !VALID_AUDIENCES.has(audience)) {
    throw badRequest("audience must be one of: all, kronen, søen");
  }

  const recipients = await queryRecipients(ctx, audience as Audience);

  return {
    statusCode: 200,
    body: {
      audience,
      count: recipients.length,
      recipients: recipients.map((r) => ({
        email: r.email,
        name: r.name,
        language: r.language,
      })),
    },
  };
}

interface SendBulkEmailBody {
  audience?: string;
  subject?: string;
  bodyHtml?: string;
}

export async function handleSendBulkEmail(ctx: RequestContext): Promise<RouteResponse> {
  const adminId = ctx.adminId;
  if (!adminId) {
    throw unauthorized();
  }

  const body = (ctx.body ?? {}) as SendBulkEmailBody;
  const { audience, subject, bodyHtml } = body;

  if (!audience || !VALID_AUDIENCES.has(audience)) {
    throw badRequest("audience must be one of: all, kronen, søen");
  }

  if (!subject || subject.trim().length === 0) {
    throw badRequest("subject is required");
  }

  if (!bodyHtml || bodyHtml.trim().length === 0) {
    throw badRequest("bodyHtml is required");
  }

  const recipients = await queryRecipients(ctx, audience as Audience);

  if (recipients.length === 0) {
    throw badRequest("No recipients found for the selected audience");
  }

  let queuedCount = 0;
  let queueFailedCount = 0;

  for (const recipient of recipients) {
    const emailId = await queueAndSendEmail(ctx.db, {
      recipientEmail: recipient.email,
      language: recipient.language as "da" | "en",
      subject,
      bodyHtml,
    });

    if (emailId) {
      queuedCount++;
    } else {
      queueFailedCount++;
    }
  }

  await logAuditEvent(ctx.db, {
    actor_type: "admin",
    actor_id: adminId,
    action: "bulk_email_sent",
    entity_type: "messaging",
    entity_id: `bulk-${Date.now()}`,
    after: {
      audience,
      recipient_count: recipients.length,
      queued_count: queuedCount,
      queue_failed_count: queueFailedCount,
      subject,
    },
  });

  logger.info(`Bulk email sent: audience=${audience}, queued=${queuedCount}, queue_failed=${queueFailedCount}`);

  return {
    statusCode: 200,
    body: {
      audience,
      recipientCount: recipients.length,
      queuedCount,
      queueFailedCount,
    },
  };
}
