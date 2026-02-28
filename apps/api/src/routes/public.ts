import { GREENHOUSES } from "@greenspace/shared";
import type { RequestContext, RouteResponse } from "../router.js";

export async function handlePublicStatus(ctx: RequestContext): Promise<RouteResponse> {
  const settings = await ctx.db
    .selectFrom("system_settings")
    .select(["opening_datetime"])
    .executeTakeFirst();

  const openingDatetime = settings?.opening_datetime
    ? new Date(settings.opening_datetime).toISOString()
    : null;

  const isOpen = openingDatetime ? new Date(openingDatetime).getTime() <= Date.now() : false;

  return {
    statusCode: 200,
    body: { isOpen, openingDatetime },
  };
}

export async function handlePublicGreenhouses(ctx: RequestContext): Promise<RouteResponse> {
  const boxes = await ctx.db
    .selectFrom("planter_boxes")
    .select(["greenhouse_name", "state"])
    .execute();

  const summaries = GREENHOUSES.map((name) => {
    const ghBoxes = boxes.filter((b) => b.greenhouse_name === name);
    return {
      name,
      totalBoxes: ghBoxes.length,
      availableBoxes: ghBoxes.filter((b) => b.state === "available").length,
      occupiedBoxes: ghBoxes.filter((b) => b.state === "occupied").length,
      reservedBoxes: ghBoxes.filter((b) => b.state === "reserved").length,
    };
  });

  return {
    statusCode: 200,
    body: summaries,
  };
}

export async function handlePublicBoxes(ctx: RequestContext): Promise<RouteResponse> {
  const boxes = await ctx.db
    .selectFrom("planter_boxes")
    .select(["id", "name", "greenhouse_name", "state"])
    .orderBy("id", "asc")
    .execute();

  const publicBoxes = boxes.map((b) => ({
    id: b.id,
    name: b.name,
    greenhouse: b.greenhouse_name,
    state: b.state,
  }));

  return {
    statusCode: 200,
    body: publicBoxes,
  };
}
