export {
  BOX_STATES,
  REGISTRATION_STATUSES,
  WAITLIST_ENTRY_STATUSES,
  ACTOR_TYPES,
  LANGUAGES,
  AUDIT_ACTIONS,
  EMAIL_STATUSES,
} from "./enums.js";

export type {
  BoxState,
  RegistrationStatus,
  WaitlistEntryStatus,
  ActorType,
  Language,
  AuditAction,
  EmailStatus,
} from "./enums.js";

export {
  GREENHOUSES,
  BOX_CATALOG,
  TOTAL_BOX_COUNT,
  KRONEN_BOX_RANGE,
  SOEN_BOX_RANGE,
  DEFAULT_OPENING_DATETIME,
  OPENING_TIMEZONE,
  EMAIL_FROM,
  EMAIL_REPLY_TO,
  ORGANIZER_CONTACTS,
  WHATSAPP_GROUP_URL,
  ELIGIBLE_STREET,
  HOUSE_NUMBER_MIN,
  HOUSE_NUMBER_MAX,
  FLOOR_DOOR_REQUIRED_NUMBERS,
  DEFAULT_LANGUAGE,
  RESERVED_LABEL_DEFAULT,
  SEED_ADMIN_EMAILS,
  PUBLIC_BOX_STATES,
} from "./constants.js";

export type { Greenhouse, BoxCatalogEntry } from "./constants.js";

export type {
  SystemSettings,
  GreenhouseSummary,
  PlanterBoxPublic,
  PlanterBox,
  NormalizedAddress,
  Registration,
  RegistrationPublic,
  WaitlistEntry,
  Admin,
  AuditEvent,
  EmailRecord,
  RegistrationInput,
  WaitlistInput,
  PublicStatus,
} from "./types.js";

export {
  validateEmail,
  validateStreet,
  validateHouseNumber,
  isFloorDoorRequired,
  validateFloorDoor,
  validateAddress,
  normalizeApartmentKey,
  validateName,
  validateBoxId,
} from "./validators.js";

export type { ValidationResult } from "./validators.js";

export { I18N_KEYS, LANGUAGE_LABELS } from "./i18n.js";

export type { I18nKey } from "./i18n.js";
