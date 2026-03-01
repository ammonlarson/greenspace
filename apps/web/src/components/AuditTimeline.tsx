"use client";

import { AUDIT_ACTIONS } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";

interface AuditEvent {
  id: string;
  timestamp: string;
  actorType: "public" | "admin" | "system";
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  reason: string | null;
}

interface AuditTimelineProps {
  events: AuditEvent[];
  hasMore?: boolean;
  onLoadMore?: () => void;
  actionFilter?: string;
  actorTypeFilter?: string;
  onActionFilterChange?: (action: string) => void;
  onActorTypeFilterChange?: (actorType: string) => void;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("da-DK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatSnapshot(data: Record<string, unknown> | null): string {
  if (!data) return "\u2014";
  return Object.entries(data)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(", ");
}

export function AuditTimeline({
  events,
  hasMore,
  onLoadMore,
  actionFilter,
  actorTypeFilter,
  onActionFilterChange,
  onActorTypeFilterChange,
}: AuditTimelineProps) {
  const { t } = useLanguage();

  return (
    <section style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1rem" }}>
      <h2 style={{ marginBottom: "1rem" }}>{t("audit.title")}</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <label style={{ display: "flex", flexDirection: "column", fontSize: "0.85rem" }}>
          {t("audit.filterByAction")}
          <select
            value={actionFilter ?? ""}
            onChange={(e) => onActionFilterChange?.(e.target.value)}
            style={{ padding: "0.4rem", marginTop: "0.25rem", fontFamily: "inherit" }}
          >
            <option value="">{t("audit.allActions")}</option>
            {AUDIT_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", fontSize: "0.85rem" }}>
          {t("audit.filterByActor")}
          <select
            value={actorTypeFilter ?? ""}
            onChange={(e) => onActorTypeFilterChange?.(e.target.value)}
            style={{ padding: "0.4rem", marginTop: "0.25rem", fontFamily: "inherit" }}
          >
            <option value="">{t("audit.allActors")}</option>
            <option value="admin">admin</option>
            <option value="public">public</option>
            <option value="system">system</option>
          </select>
        </label>
      </div>

      {events.length === 0 ? (
        <p style={{ color: "#888", fontStyle: "italic" }}>{t("audit.noEvents")}</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.85rem",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>{t("audit.timestamp")}</th>
                <th style={{ padding: "0.5rem" }}>{t("audit.action")}</th>
                <th style={{ padding: "0.5rem" }}>{t("audit.actor")}</th>
                <th style={{ padding: "0.5rem" }}>{t("audit.entity")}</th>
                <th style={{ padding: "0.5rem" }}>{t("audit.details")}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((evt) => (
                <tr key={evt.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                    {formatTimestamp(evt.timestamp)}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <code style={{ fontSize: "0.8rem", background: "#f4f4f4", padding: "0.1rem 0.3rem", borderRadius: 3 }}>
                      {evt.action}
                    </code>
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {evt.actorType}
                    {evt.actorId ? ` (${evt.actorId.slice(0, 8)}...)` : ""}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {evt.entityType} / {evt.entityId.slice(0, 8)}...
                  </td>
                  <td style={{ padding: "0.5rem", fontSize: "0.8rem", color: "#555" }}>
                    {evt.before && (
                      <div>
                        <strong>Before:</strong> {formatSnapshot(evt.before)}
                      </div>
                    )}
                    {evt.after && (
                      <div>
                        <strong>After:</strong> {formatSnapshot(evt.after)}
                      </div>
                    )}
                    {evt.reason && (
                      <div>
                        <strong>Reason:</strong> {evt.reason}
                      </div>
                    )}
                    {!evt.before && !evt.after && !evt.reason && "\u2014"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasMore && onLoadMore && (
        <button
          type="button"
          onClick={onLoadMore}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1.5rem",
            border: "1px solid #ccc",
            borderRadius: 4,
            background: "#fff",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {t("audit.loadMore")}
        </button>
      )}
    </section>
  );
}
