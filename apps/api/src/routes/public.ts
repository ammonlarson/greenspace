import {
  GREENHOUSES,
  isFloorDoorRequired,
  normalizeApartmentKey,
  validateAddress,
  validateRegistrationInput,
  validateWaitlistInput,
} from "@greenspace/shared";
import type { RegistrationInput, WaitlistInput } from "@greenspace/shared";
import { logAuditEvent } from "../lib/audit.js";
import { badRequest, conflict } from "../lib/errors.js";
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

  const availableCount = await ctx.db
    .selectFrom("planter_boxes")
    .select(ctx.db.fn.countAll<number>().as("count"))
    .where("state", "=", "available")
    .executeTakeFirstOrThrow();

  return {
    statusCode: 200,
    body: {
      isOpen,
      openingDatetime,
      hasAvailableBoxes: Number(availableCount.count) > 0,
    },
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

interface ValidateAddressBody {
  street?: string;
  houseNumber?: number;
  floor?: string | null;
  door?: string | null;
}

export async function handleValidateAddress(ctx: RequestContext): Promise<RouteResponse> {
  const body = ctx.body as ValidateAddressBody | undefined;
  if (!body) {
    throw badRequest("Request body is required");
  }

  const street = body.street ?? "";
  const houseNumber = body.houseNumber ?? NaN;
  const floor = body.floor ?? null;
  const door = body.door ?? null;

  const result = validateAddress(street, houseNumber, floor, door);

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
      floorDoorRequired: isFloorDoorRequired(houseNumber),
      apartmentKey: normalizeApartmentKey(street, houseNumber, floor, door),
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

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "23505"
  );
}

export async function handleJoinWaitlist(ctx: RequestContext): Promise<RouteResponse> {
  const body = ctx.body as Partial<WaitlistInput> | undefined;
  if (!body) {
    throw badRequest("Request body is required");
  }

  const validation = validateWaitlistInput(body);
  if (!validation.valid) {
    return {
      statusCode: 422,
      body: { valid: false, errors: validation.errors },
    };
  }

  const apartmentKey = normalizeApartmentKey(
    body.street!,
    body.houseNumber!,
    body.floor ?? null,
    body.door ?? null,
  );

  const availableCount = await ctx.db
    .selectFrom("planter_boxes")
    .select(ctx.db.fn.countAll<number>().as("count"))
    .where("state", "=", "available")
    .executeTakeFirstOrThrow();

  if (Number(availableCount.count) > 0) {
    throw badRequest(
      "Boxes are still available. Please register for a box instead.",
      "BOXES_AVAILABLE",
    );
  }

  const existing = await ctx.db
    .selectFrom("waitlist_entries")
    .select(["id", "created_at"])
    .where("apartment_key", "=", apartmentKey)
    .where("status", "=", "waiting")
    .executeTakeFirst();

  if (existing) {
    const position = await getWaitlistPosition(ctx, apartmentKey);
    return {
      statusCode: 200,
      body: {
        alreadyOnWaitlist: true,
        position,
        joinedAt: new Date(existing.created_at).toISOString(),
      },
    };
  }

  let entryId: string;
  try {
    entryId = await ctx.db.transaction().execute(async (trx) => {
      const entry = await trx
        .insertInto("waitlist_entries")
        .values({
          name: body.name!,
          email: body.email!,
          street: body.street!,
          house_number: body.houseNumber!,
          floor: body.floor ?? null,
          door: body.door ?? null,
          apartment_key: apartmentKey,
          language: body.language!,
        })
        .returning("id")
        .executeTakeFirstOrThrow();

      await logAuditEvent(trx, {
        actor_type: "public",
        actor_id: null,
        action: "waitlist_add",
        entity_type: "waitlist_entry",
        entity_id: entry.id,
        after: { email: body.email!, apartmentKey },
      });

      return entry.id;
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw conflict(
        "This apartment is already on the waitlist",
        "ALREADY_ON_WAITLIST",
      );
    }
    throw err;
  }

  const position = await getWaitlistPosition(ctx, apartmentKey);

  return {
    statusCode: 201,
    body: {
      alreadyOnWaitlist: false,
      waitlistEntryId: entryId,
      position,
    },
  };
}

async function getWaitlistPosition(
  ctx: RequestContext,
  apartmentKey: string,
): Promise<number> {
  const waitingEntries = await ctx.db
    .selectFrom("waitlist_entries")
    .select(["apartment_key"])
    .where("status", "=", "waiting")
    .orderBy("created_at", "asc")
    .execute();

  const index = waitingEntries.findIndex((e) => e.apartment_key === apartmentKey);
  return index >= 0 ? index + 1 : 0;
}

export async function handleWaitlistPosition(ctx: RequestContext): Promise<RouteResponse> {
  const apartmentKey = decodeURIComponent(ctx.params["apartmentKey"] ?? "");
  if (!apartmentKey) {
    throw badRequest("Apartment key is required");
  }

  const entry = await ctx.db
    .selectFrom("waitlist_entries")
    .select(["id", "created_at"])
    .where("apartment_key", "=", apartmentKey)
    .where("status", "=", "waiting")
    .executeTakeFirst();

  if (!entry) {
    return {
      statusCode: 200,
      body: { onWaitlist: false, position: null },
    };
  }

  const position = await getWaitlistPosition(ctx, apartmentKey);

  return {
    statusCode: 200,
    body: {
      onWaitlist: true,
      position,
      joinedAt: new Date(entry.created_at).toISOString(),
    },
  };
}
