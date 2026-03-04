"use client";

import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

interface Registration {
  id: string;
  box_id: number;
  name: string;
  email: string;
  street: string;
  house_number: number;
  floor: string | null;
  door: string | null;
  apartment_key: string;
  status: string;
  created_at: string;
}

const LOCALE_MAP: Record<string, string> = { da: "da-DK", en: "en-GB" };

function formatDate(iso: string, lang: string): string {
  return new Date(iso).toLocaleDateString(LOCALE_MAP[lang] ?? "da-DK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AdminRegistrations() {
  const { t, language } = useLanguage();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      const res = await fetch("/admin/registrations", { credentials: "include" });
      if (res.ok) {
        setRegistrations(await res.json());
      }
    } catch {
      /* network error */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  async function handleRemove(reg: Registration) {
    const confirmed = window.confirm(t("admin.registrations.confirmRemove"));
    if (!confirmed) return;

    setRemoving(reg.id);
    setMessage(null);

    try {
      const res = await fetch("/admin/registrations/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ registrationId: reg.id }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: t("admin.registrations.removed") });
        await fetchRegistrations();
      } else {
        const body = await res.json();
        setMessage({ type: "error", text: body.error ?? t("common.error") });
      }
    } catch {
      setMessage({ type: "error", text: t("common.error") });
    } finally {
      setRemoving(null);
    }
  }

  if (loading) {
    return <p>{t("common.loading")}</p>;
  }

  return (
    <section>
      <h2 style={{ marginBottom: "1rem" }}>{t("admin.registrations.title")}</h2>

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

      {registrations.length === 0 ? (
        <p style={{ color: "#888", fontStyle: "italic" }}>
          {t("admin.registrations.noRegistrations")}
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
                <th style={{ padding: "0.5rem" }}>{t("admin.registrations.name")}</th>
                <th style={{ padding: "0.5rem" }}>{t("admin.registrations.email")}</th>
                <th style={{ padding: "0.5rem" }}>{t("admin.registrations.box")}</th>
                <th style={{ padding: "0.5rem" }}>{t("admin.registrations.apartment")}</th>
                <th style={{ padding: "0.5rem" }}>{t("admin.registrations.status")}</th>
                <th style={{ padding: "0.5rem" }}>{t("admin.registrations.date")}</th>
                <th style={{ padding: "0.5rem" }}>{t("admin.registrations.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.5rem" }}>{reg.name}</td>
                  <td style={{ padding: "0.5rem" }}>{reg.email}</td>
                  <td style={{ padding: "0.5rem" }}>#{reg.box_id}</td>
                  <td style={{ padding: "0.5rem", fontSize: "0.8rem" }}>{reg.apartment_key}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.15rem 0.5rem",
                        borderRadius: 12,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: reg.status === "active" ? "#e8f5e9" : "#f5f5f5",
                        color: reg.status === "active" ? "#2d7a3a" : "#888",
                      }}
                    >
                      {reg.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                    {formatDate(reg.created_at, language)}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {reg.status === "active" && (
                      <button
                        type="button"
                        onClick={() => handleRemove(reg)}
                        disabled={removing === reg.id}
                        style={{
                          padding: "0.25rem 0.75rem",
                          border: "1px solid #c62828",
                          borderRadius: 4,
                          background: "#fff",
                          color: "#c62828",
                          cursor: removing === reg.id ? "not-allowed" : "pointer",
                          fontSize: "0.8rem",
                          fontFamily: "inherit",
                        }}
                      >
                        {t("admin.registrations.remove")}
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
