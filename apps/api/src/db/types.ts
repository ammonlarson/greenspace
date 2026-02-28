import type { ColumnType, Generated, Insertable, Selectable } from "kysely";

export interface Database {
  greenhouses: GreenhouseTable;
  planter_boxes: PlanterBoxTable;
  admins: AdminTable;
  admin_credentials: AdminCredentialTable;
  sessions: SessionTable;
  system_settings: SystemSettingsTable;
  registrations: RegistrationTable;
  waitlist_entries: WaitlistEntryTable;
  emails: EmailTable;
  audit_events: AuditEventTable;
}

export interface GreenhouseTable {
  name: string;
  created_at: ColumnType<Date, string | undefined, never>;
}

export interface PlanterBoxTable {
  id: number;
  name: string;
  greenhouse_name: string;
  state: "available" | "occupied" | "reserved";
  reserved_label: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string>;
}

export interface AdminTable {
  id: Generated<string>;
  email: string;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string>;
}

export interface AdminCredentialTable {
  admin_id: string;
  password_hash: string;
  updated_at: ColumnType<Date, string | undefined, string>;
}

export interface SessionTable {
  id: Generated<string>;
  admin_id: string;
  expires_at: ColumnType<Date, string, string>;
  created_at: ColumnType<Date, string | undefined, never>;
}

export interface SystemSettingsTable {
  id: Generated<string>;
  opening_datetime: ColumnType<Date, string, string>;
  updated_at: ColumnType<Date, string | undefined, string>;
}

export interface RegistrationTable {
  id: Generated<string>;
  box_id: number;
  name: string;
  email: string;
  street: string;
  house_number: number;
  floor: string | null;
  door: string | null;
  apartment_key: string;
  language: "da" | "en";
  status: "active" | "switched" | "removed";
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string>;
}

export interface WaitlistEntryTable {
  id: Generated<string>;
  name: string;
  email: string;
  street: string;
  house_number: number;
  floor: string | null;
  door: string | null;
  apartment_key: string;
  language: "da" | "en";
  status: "waiting" | "assigned" | "cancelled";
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string>;
}

export interface EmailTable {
  id: Generated<string>;
  recipient_email: string;
  language: "da" | "en";
  subject: string;
  body_html: string;
  status: "pending" | "sent" | "failed";
  edited_before_send: ColumnType<boolean, boolean | undefined, boolean>;
  sent_at: ColumnType<Date, string | null | undefined, string | null>;
  created_at: ColumnType<Date, string | undefined, never>;
}

export interface AuditEventTable {
  id: Generated<string>;
  timestamp: ColumnType<Date, string | undefined, never>;
  actor_type: "public" | "admin" | "system";
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  before: ColumnType<Record<string, unknown> | null, string | null, never>;
  after: ColumnType<Record<string, unknown> | null, string | null, never>;
  reason: string | null;
}

export type Greenhouse = Selectable<GreenhouseTable>;
export type NewGreenhouse = Insertable<GreenhouseTable>;
export type PlanterBox = Selectable<PlanterBoxTable>;
export type NewPlanterBox = Insertable<PlanterBoxTable>;
export type Admin = Selectable<AdminTable>;
export type NewAdmin = Insertable<AdminTable>;
export type AdminCredential = Selectable<AdminCredentialTable>;
export type Session = Selectable<SessionTable>;
export type SystemSettings = Selectable<SystemSettingsTable>;
export type Registration = Selectable<RegistrationTable>;
export type WaitlistEntry = Selectable<WaitlistEntryTable>;
export type Email = Selectable<EmailTable>;
export type AuditEvent = Selectable<AuditEventTable>;
