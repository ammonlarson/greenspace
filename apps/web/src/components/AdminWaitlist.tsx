"use client";

import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatDate } from "@/utils/formatDate";
import { NotificationComposer } from "./NotificationComposer";

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  street: string;
  house_number: number;
  floor: string | null;
  door: string | null;
  apartment_key: string;
  language: string;
  status: string;
  created_at: string;
}

export function AdminWaitlist() {
  const { t, language } = useLanguage();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [assigningEntry, setAssigningEntry] = useState<WaitlistEntry | null>(null);
  const [assignBoxId, setAssignBoxId] = useState("");
  const [assignNotification, setAssignNotification] = useState({ sendEmail: true, subject: "", bodyHtml: "", valid: true });

  const fetchWaitlist = useCallback(async () => {
    try {
      const res = await fetch("/admin/waitlist", { credentials: "include" });
      if (res.ok) {
        setEntries(await res.json());
      } else {
        setMessage({ type: "error", text: t("common.error") });
      }
    } catch {
      setMessage({ type: "error", text: t("common.error") });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchWaitlist();
  }, [fetchWaitlist]);

  function openAssignDialog(entry: WaitlistEntry) {
    setAssignBoxId("");
    setAssignNotification({ sendEmail: true, subject: "", bodyHtml: "", valid: true });
    setMessage(null);
    setAssigningEntry(entry);
  }

  function closeAssignDialog() {
    setAssigningEntry(null);
  }

  async function handleAssign() {
    if (!assigningEntry) return;

    const boxId = Number(assignBoxId);
    if (isNaN(boxId) || boxId < 1) {
      setMessage({ type: "error", text: t("common.error") });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/admin/waitlist/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          waitlistEntryId: assigningEntry.id,
          boxId,
          notification: {
            sendEmail: assignNotification.sendEmail,
            subject: assignNotification.subject || undefined,
            bodyHtml: assignNotification.bodyHtml || undefined,
          },
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: t("admin.waitlist.assigned") });
        setAssigningEntry(null);
        await fetchWaitlist();
      } else {
        const body = await res.json();
        setMessage({ type: "error", text: body.error ?? t("common.error") });
      }
    } catch {
      setMessage({ type: "error", text: t("common.error") });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p>{t("common.loading")}</p>;
  }

  return (
    <section>
      <h2 style={{ marginBottom: "1rem" }}>{t("admin.waitlist.title")}</h2>

      {message && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          style={{
            color: message.type === "error" ? "#c62828" : "#2d7a3a",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          {message.text}
        </p>
      )}

      {/* Assign Dialog */}
      {assigningEntry && (
        <div
          role="dialog"
          aria-labelledby="assign-dialog-title"
          style={{
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            padding: "1.25rem",
            marginBottom: "1.5rem",
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <h3 id="assign-dialog-title" style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
            {t("admin.waitlist.confirmAssign")} – {assigningEntry.name}
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#555", margin: "0 0 0.75rem 0" }}>
            {assigningEntry.email} · {assigningEntry.apartment_key}
          </p>

          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="assign-box-id"
              style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}
            >
              {t("admin.waitlist.assignBoxId")}
            </label>
            <input
              id="assign-box-id"
              type="number"
              value={assignBoxId}
              onChange={(e) => setAssignBoxId(e.target.value)}
              style={{
                width: "100%",
                maxWidth: 200,
                padding: "0.4rem",
                border: "1px solid #ccc",
                borderRadius: 4,
                fontSize: "0.85rem",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          {assignBoxId && Number(assignBoxId) > 0 && (
            <NotificationComposer
              action="waitlist_assign"
              recipientName={assigningEntry.name}
              recipientEmail={assigningEntry.email}
              recipientLanguage={assigningEntry.language}
              boxId={Number(assignBoxId)}
              value={assignNotification}
              onChange={setAssignNotification}
            />
          )}

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={handleAssign}
              disabled={submitting || (assignNotification.sendEmail && !assignNotification.valid)}
              style={{
                padding: "0.4rem 1rem",
                border: "none",
                borderRadius: 4,
                background: "#1565c0",
                color: "#fff",
                cursor: submitting || (assignNotification.sendEmail && !assignNotification.valid) ? "not-allowed" : "pointer",
                fontSize: "0.85rem",
                fontFamily: "inherit",
              }}
            >
              {t("common.confirm")}
            </button>
            <button
              type="button"
              onClick={closeAssignDialog}
              disabled={submitting}
              style={{
                padding: "0.4rem 1rem",
                border: "1px solid #ccc",
                borderRadius: 4,
                background: "#fff",
                cursor: submitting ? "not-allowed" : "pointer",
                fontSize: "0.85rem",
                fontFamily: "inherit",
              }}
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <p style={{ color: "#888", fontStyle: "italic" }}>
          {t("admin.waitlist.noEntries")}
        </p>
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
                <th style={{ padding: "0.5rem" }}>{t("admin.waitlist.name")}</th>
                <th style={{ padding: "0.5rem" }}>{t("admin.waitlist.email")}</th>
                <th style={{ padding: "0.5rem" }}>{t("admin.waitlist.apartment")}</th>
                <th style={{ padding: "0.5rem" }}>{t("admin.waitlist.status")}</th>
                <th style={{ padding: "0.5rem" }}>{t("admin.waitlist.date")}</th>
                <th style={{ padding: "0.5rem" }}>{t("admin.waitlist.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.5rem" }}>{entry.name}</td>
                  <td style={{ padding: "0.5rem" }}>{entry.email}</td>
                  <td style={{ padding: "0.5rem", fontSize: "0.8rem" }}>
                    {entry.apartment_key}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.15rem 0.5rem",
                        borderRadius: 12,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: entry.status === "waiting" ? "#fef9e7" : "#f5f5f5",
                        color: entry.status === "waiting" ? "#8a6d00" : "#888",
                      }}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                    {formatDate(entry.created_at, language)}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {entry.status === "waiting" && (
                      <button
                        type="button"
                        onClick={() => openAssignDialog(entry)}
                        disabled={assigningEntry !== null}
                        style={{
                          padding: "0.25rem 0.75rem",
                          border: "1px solid #1565c0",
                          borderRadius: 4,
                          background: "#fff",
                          color: "#1565c0",
                          cursor: assigningEntry !== null ? "not-allowed" : "pointer",
                          fontSize: "0.8rem",
                          fontFamily: "inherit",
                        }}
                      >
                        {t("admin.waitlist.assign")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
