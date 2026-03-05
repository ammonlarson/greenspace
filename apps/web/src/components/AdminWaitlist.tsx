"use client";

import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatDate } from "@/utils/formatDate";

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  apartment_key: string;
  status: string;
  created_at: string;
}

export function AdminWaitlist() {
  const { t, language } = useLanguage();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  async function handleAssign(entry: WaitlistEntry) {
    const boxIdStr = window.prompt(t("admin.waitlist.assignBoxPrompt"));
    if (!boxIdStr) return;

    const boxId = Number(boxIdStr);
    if (isNaN(boxId) || boxId < 1) {
      setMessage({ type: "error", text: t("common.error") });
      return;
    }

    setAssigning(entry.id);
    setMessage(null);

    try {
      const res = await fetch("/admin/waitlist/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ waitlistEntryId: entry.id, boxId }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: t("admin.waitlist.assigned") });
        await fetchWaitlist();
      } else {
        const body = await res.json();
        setMessage({ type: "error", text: body.error ?? t("common.error") });
      }
    } catch {
      setMessage({ type: "error", text: t("common.error") });
    } finally {
      setAssigning(null);
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
          role="alert"
          style={{
            color: message.type === "error" ? "#c62828" : "#2d7a3a",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          {message.text}
        </p>
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
                        onClick={() => handleAssign(entry)}
                        disabled={assigning === entry.id}
                        style={{
                          padding: "0.25rem 0.75rem",
                          border: "1px solid #1565c0",
                          borderRadius: 4,
                          background: "#fff",
                          color: "#1565c0",
                          cursor: assigning === entry.id ? "not-allowed" : "pointer",
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
