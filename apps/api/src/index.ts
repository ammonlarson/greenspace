import { GREENHOUSES } from "@greenspace/shared";
import { createDatabase } from "./db/connection.js";
import { requireAdmin } from "./middleware/auth.js";
import { Router } from "./router.js";
import type { RequestContext } from "./router.js";
import { handleCreateAdmin, handleDeleteAdmin, handleListAdmins } from "./routes/admin/admins.js";
import { handleListAuditEvents } from "./routes/admin/audit.js";
import { handleChangePassword, handleLogin, handleLogout } from "./routes/admin/auth.js";
import {
  handleAssignWaitlist,
  handleCreateRegistration,
  handleListRegistrations,
  handleMoveRegistration,
  handleNotificationPreview,
  handleRemoveRegistration,
} from "./routes/admin/registrations.js";
import {
  handleGetOpeningTime,
  handleUpdateOpeningTime,
} from "./routes/admin/settings.js";
import { handleHealth } from "./routes/health.js";
import {
  handleJoinWaitlist,
  handlePublicBoxes,
  handlePublicGreenhouses,
  handlePublicRegister,
  handlePublicStatus,
  handleValidateAddress,
  handleValidateRegistration,
  handleWaitlistPosition,
} from "./routes/public.js";

export function getGreenhouses(): readonly string[] {
  return GREENHOUSES;
}

export function createRouter(): Router {
  const router = new Router();

  router.get("/health", handleHealth);

  router.get("/public/status", handlePublicStatus);
  router.get("/public/greenhouses", handlePublicGreenhouses);
  router.get("/public/boxes", handlePublicBoxes);
  router.post("/public/validate-address", handleValidateAddress);
  router.post("/public/validate-registration", handleValidateRegistration);
  router.post("/public/register", handlePublicRegister);
  router.post("/public/waitlist", handleJoinWaitlist);
  router.get("/public/waitlist/position/:apartmentKey", handleWaitlistPosition);

  router.post("/admin/auth/login", handleLogin);
  router.post("/admin/auth/logout", requireAdmin(handleLogout));
  router.post("/admin/auth/change-password", requireAdmin(handleChangePassword));

  router.get("/admin/admins", requireAdmin(handleListAdmins));
  router.post("/admin/admins", requireAdmin(handleCreateAdmin));
  router.delete("/admin/admins/:id", requireAdmin(handleDeleteAdmin));

  router.get("/admin/registrations", requireAdmin(handleListRegistrations));
  router.post("/admin/registrations", requireAdmin(handleCreateRegistration));
  router.post("/admin/registrations/move", requireAdmin(handleMoveRegistration));
  router.post("/admin/registrations/remove", requireAdmin(handleRemoveRegistration));
  router.post("/admin/waitlist/assign", requireAdmin(handleAssignWaitlist));
  router.post("/admin/notifications/preview", requireAdmin(handleNotificationPreview));
  router.post("/admin/audit-events", requireAdmin(handleListAuditEvents));

  router.get("/admin/settings/opening-time", requireAdmin(handleGetOpeningTime));
  router.patch("/admin/settings/opening-time", requireAdmin(handleUpdateOpeningTime));

  return router;
}

export interface LambdaEvent {
  httpMethod: string;
  path: string;
  headers: Record<string, string | undefined>;
  body: string | null;
}

export interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

let router: Router | undefined;
let db: ReturnType<typeof createDatabase> | undefined;

async function resolveDbPassword(): Promise<string> {
  if (process.env["DB_PASSWORD"]) {
    return process.env["DB_PASSWORD"];
  }
  const secretArn = process.env["DB_SECRET_ARN"];
  if (!secretArn) {
    return "";
  }
  const { SecretsManagerClient, GetSecretValueCommand } = await import(
    "@aws-sdk/client-secrets-manager"
  );
  const client = new SecretsManagerClient({});
  const result = await client.send(
    new GetSecretValueCommand({ SecretId: secretArn }),
  );
  const secret = JSON.parse(result.SecretString ?? "{}") as Record<string, string>;
  return secret["password"] ?? "";
}

export async function handler(event: LambdaEvent): Promise<LambdaResponse> {
  if (!router) {
    router = createRouter();
  }
  if (!db) {
    const password = await resolveDbPassword();
    db = createDatabase({
      host: process.env["DB_HOST"] ?? "localhost",
      port: Number(process.env["DB_PORT"] ?? "5432"),
      database: process.env["DB_NAME"] ?? "greenspace",
      user: process.env["DB_USER"] ?? "greenspace",
      password,
      ssl: process.env["DB_SSL"] === "true",
    });
  }

  let body: unknown = undefined;
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Invalid JSON body" }),
      };
    }
  }

  const normalizedHeaders: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(event.headers ?? {})) {
    normalizedHeaders[key.toLowerCase()] = value;
  }

  const ctx: RequestContext = {
    db,
    method: event.httpMethod,
    path: event.path,
    body,
    headers: normalizedHeaders,
    params: {},
  };

  const response = await router.handle(ctx);

  return {
    statusCode: response.statusCode,
    headers: {
      "Content-Type": "application/json",
      ...response.headers,
    },
    body: JSON.stringify(response.body),
  };
}
