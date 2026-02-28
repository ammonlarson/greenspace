import { handler as coreHandler } from "./index.js";
import type { LambdaResponse } from "./index.js";

interface FunctionUrlEvent {
  version?: string;
  rawPath?: string;
  requestContext?: { http?: { method?: string; path?: string } };
  headers?: Record<string, string>;
  body?: string | null;
  isBase64Encoded?: boolean;
  httpMethod?: string;
  path?: string;
}

export async function handler(event: FunctionUrlEvent): Promise<LambdaResponse> {
  return coreHandler({
    httpMethod: event.httpMethod ?? event.requestContext?.http?.method ?? "GET",
    path: event.path ?? event.rawPath ?? "/",
    headers: (event.headers ?? {}) as Record<string, string | undefined>,
    body:
      event.isBase64Encoded && event.body
        ? Buffer.from(event.body, "base64").toString()
        : (event.body ?? null),
  });
}
