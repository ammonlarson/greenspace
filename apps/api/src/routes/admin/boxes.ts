import type { RequestContext, RouteResponse } from "../../router.js";

export async function handleAdminBoxes(ctx: RequestContext): Promise<RouteResponse> {
  const boxes = await ctx.db
    .selectFrom("planter_boxes")
    .select(["id", "name", "greenhouse_name", "state"])
    .orderBy("id", "asc")
    .execute();

  const result = boxes.map((b) => ({
    id: b.id,
    name: b.name,
    greenhouse: b.greenhouse_name,
    state: b.state,
  }));

  return {
    statusCode: 200,
    body: result,
  };
}
