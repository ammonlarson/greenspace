export {
  BOX_STATES,
  REGISTRATION_STATUSES,
  WAITLIST_ENTRY_STATUSES,
  ACTOR_TYPES,
  LANGUAGES,
  AUDIT_ACTIONS,
  EMAIL_STATUSES,
} from "./enums";

export type {
  BoxState,
  RegistrationStatus,
  WaitlistEntryStatus,
  ActorType,
  Language,
  AuditAction,
  EmailStatus,
} from "./enums";

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
} from "./constants";

export type { Greenhouse, BoxCatalogEntry } from "./constants";

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
} from "./types";

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
} from "./validators";

export type { ValidationResult } from "./validators";

export { I18N_KEYS, LANGUAGE_LABELS } from "./i18n";

export type { I18nKey } from "./i18n";
