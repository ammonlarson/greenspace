import type { Kysely } from "kysely";
import type { Database } from "./db/types.js";
import { AppError, methodNotAllowed, notFound, toErrorBody } from "./lib/errors.js";

export interface RequestContext {
  db: Kysely<Database>;
  method: string;
  path: string;
  body: unknown;
  headers: Record<string, string | undefined>;
  adminId?: string;
}

export interface RouteResponse {
  statusCode: number;
  body: unknown;
  headers?: Record<string, string>;
}

export type RouteHandler = (ctx: RequestContext) => Promise<RouteResponse>;

interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
}

export class Router {
  private routes: Route[] = [];

  get(path: string, handler: RouteHandler): void {
    this.routes.push({ method: "GET", path, handler });
  }

  post(path: string, handler: RouteHandler): void {
    this.routes.push({ method: "POST", path, handler });
  }

  patch(path: string, handler: RouteHandler): void {
    this.routes.push({ method: "PATCH", path, handler });
  }

  delete(path: string, handler: RouteHandler): void {
    this.routes.push({ method: "DELETE", path, handler });
  }

  async handle(ctx: RequestContext): Promise<RouteResponse> {
    try {
      const matchingPath = this.routes.filter((r) => r.path === ctx.path);
      if (matchingPath.length === 0) {
        throw notFound();
      }

      const route = matchingPath.find((r) => r.method === ctx.method);
      if (!route) {
        throw methodNotAllowed();
      }

      return await route.handler(ctx);
    } catch (err: unknown) {
      if (err instanceof AppError) {
        return {
          statusCode: err.statusCode,
          body: toErrorBody(err),
        };
      }

      console.error("Unhandled error:", err);
      return {
        statusCode: 500,
        body: { error: "Internal server error" },
      };
    }
  }
}
