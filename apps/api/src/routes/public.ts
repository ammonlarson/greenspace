import {
  GREENHOUSES,
  isFloorDoorRequired,
  normalizeApartmentKey,
  validateAddress,
  validateRegistrationInput,
} from "@greenspace/shared";
import type { RegistrationInput } from "@greenspace/shared";
import { badRequest } from "../lib/errors.js";
import type { RequestContext, RouteResponse } from "../router.js";

export async function handlePublicStatus(ctx: RequestContext): Promise<RouteResponse> {
  const settings = await ctx.db
    .selectFrom("system_settings")
    .select(["opening_datetime"])
    .executeTakeFirst();

  const openingDate = settings?.opening_datetime
    ? new Date(settings.opening_datetime)
    : null;
  const isOpen = openingDate ? openingDate.getTime() <= Date.now() : false;
  const openingDatetime = openingDate ? openingDate.toISOString() : null;

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

export async function handleValidateAddress(ctx: RequestContext): Promise<RouteResponse> {
  const body = ctx.body as { street?: string; houseNumber?: number; floor?: string | null; door?: string | null } | undefined;
  if (!body) {
    throw badRequest("Request body is required");
  }

  const { street, houseNumber, floor, door } = body;

  const result = validateAddress(
    street as string,
    houseNumber as number,
    floor ?? null,
    door ?? null,
  );

  if (!result.valid) {
    return {
      statusCode: 200,
      body: {
        eligible: false,
        error: result.error,
        floorDoorRequired: false,
        apartmentKey: null,
      },
    };
  }

  return {
    statusCode: 200,
    body: {
      eligible: true,
      error: null,
      floorDoorRequired: isFloorDoorRequired(houseNumber as number),
      apartmentKey: normalizeApartmentKey(
        street as string,
        houseNumber as number,
        floor ?? null,
        door ?? null,
      ),
    },
  };
}

export async function handleValidateRegistration(ctx: RequestContext): Promise<RouteResponse> {
  const body = ctx.body as Partial<RegistrationInput> | undefined;
  if (!body) {
    throw badRequest("Request body is required");
  }

  const result = validateRegistrationInput(body);

  if (!result.valid) {
    return {
      statusCode: 422,
      body: { valid: false, errors: result.errors },
    };
  }

  return {
    statusCode: 200,
    body: {
      valid: true,
      errors: {},
      apartmentKey: normalizeApartmentKey(
        body.street!,
        body.houseNumber!,
        body.floor ?? null,
        body.door ?? null,
      ),
      floorDoorRequired: isFloorDoorRequired(body.houseNumber!),
    },
  };
}
