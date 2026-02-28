import { GREENHOUSES } from "@greenspace/shared";
import { createDatabase } from "./db/connection.js";
import { requireAdmin } from "./middleware/auth.js";
import { Router } from "./router.js";
import type { RequestContext, RouteResponse } from "./router.js";
import { handleChangePassword, handleLogin, handleLogout } from "./routes/admin/auth.js";
import { handleHealth } from "./routes/health.js";
import {
  handlePublicBoxes,
  handlePublicGreenhouses,
  handlePublicStatus,
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

  router.post("/admin/auth/login", handleLogin);
  router.post("/admin/auth/logout", handleLogout);
  router.post("/admin/auth/change-password", requireAdmin(handleChangePassword));

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

export async function handler(event: LambdaEvent): Promise<LambdaResponse> {
  if (!router) {
    router = createRouter();
  }

  const db = createDatabase({
    host: process.env["DB_HOST"] ?? "localhost",
    port: Number(process.env["DB_PORT"] ?? "5432"),
    database: process.env["DB_NAME"] ?? "greenspace",
    user: process.env["DB_USER"] ?? "greenspace",
    password: process.env["DB_PASSWORD"] ?? "",
    ssl: process.env["DB_SSL"] === "true",
  });

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
  };

  let response: RouteResponse;
  try {
    response = await router.handle(ctx);
  } finally {
    await db.destroy();
  }

  return {
    statusCode: response.statusCode,
    headers: {
      "Content-Type": "application/json",
      ...response.headers,
    },
    body: JSON.stringify(response.body),
  };
}
