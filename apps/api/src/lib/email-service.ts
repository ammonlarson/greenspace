import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import type { Kysely, Transaction } from "kysely";
import { EMAIL_FROM, EMAIL_REPLY_TO } from "@greenspace/shared";
import type { Database } from "../db/types.js";
import { logAuditEvent } from "./audit.js";

let sesClient: SESClient | null = null;

function getSesClient(): SESClient {
  if (!sesClient) {
    sesClient = new SESClient({
      region: process.env.AWS_REGION ?? "eu-north-1",
    });
  }
  return sesClient;
}

/** Visible for testing. */
export function setSesClient(client: SESClient | null): void {
  sesClient = client;
}

interface QueueEmailInput {
  recipientEmail: string;
  language: "da" | "en";
  subject: string;
  bodyHtml: string;
}

/**
 * Queue a confirmation email in the database and attempt to send it via SES.
 * Email send failures are caught and logged — they never fail the caller.
 */
export async function queueAndSendEmail(
  db: Kysely<Database> | Transaction<Database>,
  input: QueueEmailInput,
): Promise<string> {
  const [row] = await db
    .insertInto("emails")
    .values({
      recipient_email: input.recipientEmail,
      language: input.language,
      subject: input.subject,
      body_html: input.bodyHtml,
      status: "pending",
    })
    .returning(["id"])
    .execute();

  const emailId = row.id;

  try {
    await sendViaSes(input);

    await db
      .updateTable("emails")
      .set({ status: "sent", sent_at: new Date().toISOString() })
      .where("id", "=", emailId)
      .execute();

    await logAuditEvent(db, {
      actor_type: "system",
      actor_id: null,
      action: "email_sent",
      entity_type: "email",
      entity_id: emailId,
      after: {
        recipient: input.recipientEmail,
        subject: input.subject,
        language: input.language,
      },
    });
  } catch (err) {
    console.error("Failed to send email via SES:", err);

    await db
      .updateTable("emails")
      .set({ status: "failed" })
      .where("id", "=", emailId)
      .execute();
  }

  return emailId;
}

async function sendViaSes(input: QueueEmailInput): Promise<void> {
  const client = getSesClient();

  const command = new SendEmailCommand({
    Source: EMAIL_FROM,
    ReplyToAddresses: [EMAIL_REPLY_TO],
    Destination: {
      ToAddresses: [input.recipientEmail],
    },
    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: input.subject,
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: input.bodyHtml,
        },
      },
    },
  });

  await client.send(command);
}
