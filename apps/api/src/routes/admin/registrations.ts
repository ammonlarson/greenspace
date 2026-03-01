import { normalizeApartmentKey } from "@greenspace/shared";
import { logAuditEvent } from "../../lib/audit.js";
import { badRequest, conflict, notFound, unauthorized } from "../../lib/errors.js";
import type { RequestContext, RouteResponse } from "../../router.js";

export async function handleListRegistrations(ctx: RequestContext): Promise<RouteResponse> {
  if (!ctx.adminId) {
    throw unauthorized();
  }

  const registrations = await ctx.db
    .selectFrom("registrations")
    .select([
      "registrations.id",
      "registrations.box_id",
      "registrations.name",
      "registrations.email",
      "registrations.street",
      "registrations.house_number",
      "registrations.floor",
      "registrations.door",
      "registrations.apartment_key",
      "registrations.language",
      "registrations.status",
      "registrations.created_at",
      "registrations.updated_at",
    ])
    .orderBy("registrations.created_at", "desc")
    .execute();

  return {
    statusCode: 200,
    body: registrations,
  };
}

interface CreateRegistrationBody {
  boxId?: number;
  name?: string;
  email?: string;
  street?: string;
  houseNumber?: number;
  floor?: string | null;
  door?: string | null;
  language?: string;
}

export async function handleCreateRegistration(ctx: RequestContext): Promise<RouteResponse> {
  const adminId = ctx.adminId;
  if (!adminId) {
    throw unauthorized();
  }

  const body = (ctx.body ?? {}) as CreateRegistrationBody;
  const { boxId, name, email, street, houseNumber, language } = body;

  if (!boxId || !name || !email || !street || houseNumber == null || !language) {
    throw badRequest("boxId, name, email, street, houseNumber, and language are required");
  }

  if (language !== "da" && language !== "en") {
    throw badRequest("language must be 'da' or 'en'");
  }

  const apartmentKey = normalizeApartmentKey(
    street,
    houseNumber,
    body.floor ?? null,
    body.door ?? null,
  );

  const result = await ctx.db.transaction().execute(async (trx) => {
    const box = await trx
      .selectFrom("planter_boxes")
      .select(["id", "state"])
      .where("id", "=", boxId)
      .forUpdate()
      .executeTakeFirst();

    if (!box) {
      throw badRequest("Box not found");
    }
    if (box.state === "occupied") {
      throw conflict("Box is already occupied", "BOX_OCCUPIED");
    }

    const existingReg = await trx
      .selectFrom("registrations")
      .select(["id"])
      .where("apartment_key", "=", apartmentKey)
      .where("status", "=", "active")
      .executeTakeFirst();

    if (existingReg) {
      throw conflict(
        "This apartment already has an active registration",
        "APARTMENT_HAS_REGISTRATION",
      );
    }

    const [newReg] = await trx
      .insertInto("registrations")
      .values({
        box_id: boxId,
        name,
        email,
        street,
        house_number: houseNumber,
        floor: body.floor ?? null,
        door: body.door ?? null,
        apartment_key: apartmentKey,
        language: language as "da" | "en",
        status: "active",
      })
      .returning(["id"])
      .execute();

    await trx
      .updateTable("planter_boxes")
      .set({ state: "occupied", reserved_label: null, updated_at: new Date().toISOString() })
      .where("id", "=", boxId)
      .execute();

    await logAuditEvent(trx, {
      actor_type: "admin",
      actor_id: adminId,
      action: "registration_create",
      entity_type: "registration",
      entity_id: newReg.id,
      after: { box_id: boxId, apartment_key: apartmentKey, name, email },
    });

    await logAuditEvent(trx, {
      actor_type: "admin",
      actor_id: adminId,
      action: "box_state_change",
      entity_type: "planter_box",
      entity_id: String(boxId),
      before: { state: box.state },
      after: { state: "occupied" },
    });

    return newReg;
  });

  return {
    statusCode: 201,
    body: { id: result.id, boxId, apartmentKey },
  };
}

interface MoveRegistrationBody {
  registrationId?: string;
  newBoxId?: number;
}

export async function handleMoveRegistration(ctx: RequestContext): Promise<RouteResponse> {
  const adminId = ctx.adminId;
  if (!adminId) {
    throw unauthorized();
  }

  const body = (ctx.body ?? {}) as MoveRegistrationBody;
  const { registrationId, newBoxId } = body;

  if (!registrationId || !newBoxId) {
    throw badRequest("registrationId and newBoxId are required");
  }

  await ctx.db.transaction().execute(async (trx) => {
    const reg = await trx
      .selectFrom("registrations")
      .select(["id", "box_id", "status"])
      .where("id", "=", registrationId)
      .forUpdate()
      .executeTakeFirst();

    if (!reg) {
      throw notFound("Registration not found");
    }
    if (reg.status !== "active") {
      throw badRequest("Only active registrations can be moved");
    }

    const oldBoxId = reg.box_id;
    if (oldBoxId === newBoxId) {
      throw badRequest("New box must be different from current box");
    }

    const oldBox = await trx
      .selectFrom("planter_boxes")
      .select(["id", "state"])
      .where("id", "=", oldBoxId)
      .forUpdate()
      .executeTakeFirst();

    if (!oldBox) {
      throw badRequest("Current box not found");
    }

    const newBox = await trx
      .selectFrom("planter_boxes")
      .select(["id", "state"])
      .where("id", "=", newBoxId)
      .forUpdate()
      .executeTakeFirst();

    if (!newBox) {
      throw badRequest("Target box not found");
    }
    if (newBox.state === "occupied") {
      throw conflict("Target box is already occupied", "BOX_OCCUPIED");
    }

    await trx
      .updateTable("registrations")
      .set({ box_id: newBoxId, updated_at: new Date().toISOString() })
      .where("id", "=", registrationId)
      .execute();

    await trx
      .updateTable("planter_boxes")
      .set({ state: "available", reserved_label: null, updated_at: new Date().toISOString() })
      .where("id", "=", oldBoxId)
      .execute();

    await trx
      .updateTable("planter_boxes")
      .set({ state: "occupied", reserved_label: null, updated_at: new Date().toISOString() })
      .where("id", "=", newBoxId)
      .execute();

    await logAuditEvent(trx, {
      actor_type: "admin",
      actor_id: adminId,
      action: "registration_move",
      entity_type: "registration",
      entity_id: registrationId,
      before: { box_id: oldBoxId },
      after: { box_id: newBoxId },
    });

    await logAuditEvent(trx, {
      actor_type: "admin",
      actor_id: adminId,
      action: "box_state_change",
      entity_type: "planter_box",
      entity_id: String(oldBoxId),
      before: { state: "occupied" },
      after: { state: "available" },
    });

    await logAuditEvent(trx, {
      actor_type: "admin",
      actor_id: adminId,
      action: "box_state_change",
      entity_type: "planter_box",
      entity_id: String(newBoxId),
      before: { state: newBox.state },
      after: { state: "occupied" },
    });
  });

  return {
    statusCode: 200,
    body: { registrationId, newBoxId },
  };
}

interface RemoveRegistrationBody {
  registrationId?: string;
  makeBoxPublic?: boolean;
}

export async function handleRemoveRegistration(ctx: RequestContext): Promise<RouteResponse> {
  const adminId = ctx.adminId;
  if (!adminId) {
    throw unauthorized();
  }

  const body = (ctx.body ?? {}) as RemoveRegistrationBody;
  const { registrationId } = body;
  const makeBoxPublic = body.makeBoxPublic ?? true;

  if (!registrationId) {
    throw badRequest("registrationId is required");
  }

  await ctx.db.transaction().execute(async (trx) => {
    const reg = await trx
      .selectFrom("registrations")
      .select(["id", "box_id", "status", "name", "email", "apartment_key"])
      .where("id", "=", registrationId)
      .forUpdate()
      .executeTakeFirst();

    if (!reg) {
      throw notFound("Registration not found");
    }
    if (reg.status !== "active") {
      throw badRequest("Only active registrations can be removed");
    }

    await trx
      .updateTable("registrations")
      .set({ status: "removed", updated_at: new Date().toISOString() })
      .where("id", "=", registrationId)
      .execute();

    const newBoxState = makeBoxPublic ? "available" : "reserved";
    const reservedLabel = makeBoxPublic ? null : "Admin Hold";

    await trx
      .updateTable("planter_boxes")
      .set({
        state: newBoxState,
        reserved_label: reservedLabel,
        updated_at: new Date().toISOString(),
      })
      .where("id", "=", reg.box_id)
      .execute();

    await logAuditEvent(trx, {
      actor_type: "admin",
      actor_id: adminId,
      action: "registration_remove",
      entity_type: "registration",
      entity_id: registrationId,
      before: { box_id: reg.box_id, status: "active", name: reg.name },
      after: { status: "removed" },
    });

    await logAuditEvent(trx, {
      actor_type: "admin",
      actor_id: adminId,
      action: "box_state_change",
      entity_type: "planter_box",
      entity_id: String(reg.box_id),
      before: { state: "occupied" },
      after: { state: newBoxState, reserved_label: reservedLabel },
    });
  });

  return {
    statusCode: 200,
    body: { registrationId, boxReleased: makeBoxPublic },
  };
}

interface AssignWaitlistBody {
  waitlistEntryId?: string;
  boxId?: number;
}

export async function handleAssignWaitlist(ctx: RequestContext): Promise<RouteResponse> {
  const adminId = ctx.adminId;
  if (!adminId) {
    throw unauthorized();
  }

  const body = (ctx.body ?? {}) as AssignWaitlistBody;
  const { waitlistEntryId, boxId } = body;

  if (!waitlistEntryId || !boxId) {
    throw badRequest("waitlistEntryId and boxId are required");
  }

  const result = await ctx.db.transaction().execute(async (trx) => {
    const entry = await trx
      .selectFrom("waitlist_entries")
      .select([
        "id", "name", "email", "street", "house_number",
        "floor", "door", "apartment_key", "language", "status",
      ])
      .where("id", "=", waitlistEntryId)
      .forUpdate()
      .executeTakeFirst();

    if (!entry) {
      throw notFound("Waitlist entry not found");
    }
    if (entry.status !== "waiting") {
      throw badRequest("Waitlist entry is not in waiting status");
    }

    const box = await trx
      .selectFrom("planter_boxes")
      .select(["id", "state"])
      .where("id", "=", boxId)
      .forUpdate()
      .executeTakeFirst();

    if (!box) {
      throw badRequest("Box not found");
    }
    if (box.state === "occupied") {
      throw conflict("Box is already occupied", "BOX_OCCUPIED");
    }

    const existingReg = await trx
      .selectFrom("registrations")
      .select(["id"])
      .where("apartment_key", "=", entry.apartment_key)
      .where("status", "=", "active")
      .executeTakeFirst();

    if (existingReg) {
      throw conflict(
        "This apartment already has an active registration",
        "APARTMENT_HAS_REGISTRATION",
      );
    }

    const [newReg] = await trx
      .insertInto("registrations")
      .values({
        box_id: boxId,
        name: entry.name,
        email: entry.email,
        street: entry.street,
        house_number: entry.house_number,
        floor: entry.floor,
        door: entry.door,
        apartment_key: entry.apartment_key,
        language: entry.language,
        status: "active",
      })
      .returning(["id"])
      .execute();

    await trx
      .updateTable("planter_boxes")
      .set({ state: "occupied", reserved_label: null, updated_at: new Date().toISOString() })
      .where("id", "=", boxId)
      .execute();

    await trx
      .updateTable("waitlist_entries")
      .set({ status: "assigned", updated_at: new Date().toISOString() })
      .where("id", "=", waitlistEntryId)
      .execute();

    await logAuditEvent(trx, {
      actor_type: "admin",
      actor_id: adminId,
      action: "waitlist_assign",
      entity_type: "waitlist_entry",
      entity_id: waitlistEntryId,
      before: { status: "waiting" },
      after: { status: "assigned", registration_id: newReg.id, box_id: boxId },
    });

    await logAuditEvent(trx, {
      actor_type: "admin",
      actor_id: adminId,
      action: "registration_create",
      entity_type: "registration",
      entity_id: newReg.id,
      after: {
        box_id: boxId,
        apartment_key: entry.apartment_key,
        from_waitlist: waitlistEntryId,
      },
    });

    await logAuditEvent(trx, {
      actor_type: "admin",
      actor_id: adminId,
      action: "box_state_change",
      entity_type: "planter_box",
      entity_id: String(boxId),
      before: { state: box.state },
      after: { state: "occupied" },
    });

    return { registrationId: newReg.id };
  });

  return {
    statusCode: 201,
    body: {
      registrationId: result.registrationId,
      waitlistEntryId,
      boxId,
    },
  };
}
