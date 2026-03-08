"use client";

import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { colors, fonts } from "@/styles/theme";

type Audience = "all" | "kronen" | "søen";
type Tab = "preview" | "source";

interface RecipientInfo {
  count: number;
  recipients: { email: string; name: string; language: string }[];
}

const AUDIENCE_OPTIONS: { value: Audience; labelKey: string }[] = [
  { value: "all", labelKey: "admin.messaging.audienceAll" },
  { value: "kronen", labelKey: "admin.messaging.audienceKronen" },
  { value: "søen", labelKey: "admin.messaging.audienceSøen" },
];

export function AdminMessaging() {
  const { t } = useLanguage();
  const [audience, setAudience] = useState<Audience>("all");
  const [recipientInfo, setRecipientInfo] = useState<RecipientInfo | null>(null);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("source");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchRecipients = useCallback(async (aud: Audience) => {
    setLoadingRecipients(true);
    setError("");
    try {
      const res = await fetch("/admin/messaging/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ audience: aud }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecipientInfo({ count: data.count, recipients: data.recipients });
      } else {
        setRecipientInfo(null);
      }
    } catch {
      setRecipientInfo(null);
    } finally {
      setLoadingRecipients(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipients(audience);
  }, [audience, fetchRecipients]);

  function handleAudienceChange(aud: Audience) {
    setAudience(aud);
    setSuccess("");
    setError("");
  }

  async function handleSend() {
    setError("");
    setSuccess("");

    if (!subject.trim()) {
      setError(t("admin.messaging.subjectRequired"));
      return;
    }
    if (!bodyHtml.trim()) {
      setError(t("admin.messaging.bodyRequired"));
      return;
    }
    if (!recipientInfo || recipientInfo.count === 0) {
      setError(t("admin.messaging.noRecipients"));
      return;
    }

    const confirmMsg = `${t("admin.messaging.confirmSend")} ${recipientInfo.count} ${t("admin.messaging.recipientCount")}?`;
    if (!window.confirm(confirmMsg)) return;

    setSending(true);
    try {
      const res = await fetch("/admin/messaging/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ audience, subject, bodyHtml }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(
          `${t("admin.messaging.sent")} (${data.queuedCount}/${data.recipientCount})`,
        );
        setSubject("");
        setBodyHtml("");
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? t("admin.messaging.failed"));
      }
    } catch {
      setError(t("admin.messaging.failed"));
    } finally {
      setSending(false);
    }
  }

  const tabButtonStyle = (tab: Tab): React.CSSProperties => ({
    padding: "0.4rem 1rem",
    border: "none",
    borderBottom: activeTab === tab ? `2px solid ${colors.sage}` : "2px solid transparent",
    background: "none",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontFamily: fonts.body,
    fontWeight: activeTab === tab ? 600 : 400,
    color: activeTab === tab ? colors.sageDark : colors.warmBrown,
  });

  return (
    <div style={{ fontFamily: fonts.body, color: colors.inkBrown }}>
      <h2 style={{ fontSize: "1.1rem", color: colors.warmBrown, marginBottom: "1rem" }}>
        {t("admin.messaging.title")}
      </h2>

      <div
        style={{
          border: `1px solid ${colors.borderTan}`,
          borderRadius: 6,
          padding: "1rem",
          background: colors.parchment,
          marginBottom: "1rem",
        }}
      >
        <label
          style={{
            display: "block",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "0.5rem",
            color: colors.warmBrown,
          }}
        >
          {t("admin.messaging.audience")}
        </label>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {AUDIENCE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
            >
              <input
                type="radio"
                name="audience"
                value={opt.value}
                checked={audience === opt.value}
                onChange={() => handleAudienceChange(opt.value)}
              />
              <span style={{ fontSize: "0.85rem" }}>{t(opt.labelKey as Parameters<typeof t>[0])}</span>
            </label>
          ))}
        </div>

        <div
          style={{
            marginTop: "0.75rem",
            padding: "0.5rem 0.75rem",
            background: colors.infoBg,
            border: `1px solid ${colors.skyMist}`,
            borderRadius: 4,
            fontSize: "0.85rem",
            color: colors.infoText,
          }}
        >
          {loadingRecipients
            ? t("common.loading")
            : recipientInfo
              ? `${recipientInfo.count} ${t("admin.messaging.recipientCount")}`
              : "—"}
        </div>
      </div>

      <div
        style={{
          border: `1px solid ${colors.borderTan}`,
          borderRadius: 6,
          padding: "1rem",
          background: colors.parchment,
          marginBottom: "1rem",
        }}
      >
        <div style={{ marginBottom: "0.75rem" }}>
          <label
            htmlFor="messaging-subject"
            style={{
              display: "block",
              fontSize: "0.8rem",
              fontWeight: 600,
              marginBottom: "0.25rem",
              color: colors.warmBrown,
            }}
          >
            {t("admin.messaging.subject")}
          </label>
          <input
            id="messaging-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{
              width: "100%",
              padding: "0.4rem",
              border: `1px solid ${colors.borderTan}`,
              borderRadius: 4,
              fontSize: "0.85rem",
              fontFamily: fonts.body,
              boxSizing: "border-box",
              color: colors.inkBrown,
              background: colors.white,
            }}
          />
        </div>

        <div
          role="tablist"
          style={{
            display: "flex",
            borderBottom: `1px solid ${colors.borderTan}`,
            marginBottom: "0.5rem",
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "preview"}
            onClick={() => setActiveTab("preview")}
            style={tabButtonStyle("preview")}
          >
            {t("admin.messaging.preview")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "source"}
            onClick={() => setActiveTab("source")}
            style={tabButtonStyle("source")}
          >
            {t("admin.messaging.source")}
          </button>
        </div>

        {activeTab === "preview" && (
          <div role="tabpanel" style={{ marginBottom: "0.5rem" }}>
            <iframe
              title={t("admin.messaging.preview")}
              srcDoc={bodyHtml}
              sandbox=""
              style={{
                width: "100%",
                height: 300,
                border: `1px solid ${colors.borderTan}`,
                borderRadius: 4,
                background: colors.white,
              }}
            />
          </div>
        )}

        {activeTab === "source" && (
          <div role="tabpanel" style={{ marginBottom: "0.5rem" }}>
            <textarea
              aria-label={t("admin.messaging.body")}
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              rows={12}
              style={{
                width: "100%",
                padding: "0.4rem",
                border: `1px solid ${colors.borderTan}`,
                borderRadius: 4,
                fontSize: "0.8rem",
                fontFamily: "monospace",
                resize: "vertical",
                boxSizing: "border-box",
                color: colors.inkBrown,
                background: colors.white,
              }}
            />
          </div>
        )}
      </div>

      {error && (
        <p
          role="alert"
          style={{
            fontSize: "0.85rem",
            color: colors.errorText,
            background: colors.errorBg,
            border: `1px solid ${colors.dustyRose}`,
            borderRadius: 4,
            padding: "0.5rem 0.75rem",
            marginBottom: "0.75rem",
          }}
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          style={{
            fontSize: "0.85rem",
            color: colors.sageDark,
            background: colors.lightSage,
            border: `1px solid ${colors.sage}`,
            borderRadius: 4,
            padding: "0.5rem 0.75rem",
            marginBottom: "0.75rem",
          }}
        >
          {success}
        </p>
      )}

      <button
        type="button"
        onClick={handleSend}
        disabled={sending}
        style={{
          padding: "0.5rem 1.25rem",
          background: sending ? colors.borderTan : colors.sage,
          color: colors.white,
          border: "none",
          borderRadius: 6,
          fontSize: "0.9rem",
          fontWeight: 600,
          fontFamily: fonts.body,
          cursor: sending ? "not-allowed" : "pointer",
        }}
      >
        {sending ? t("admin.messaging.sending") : t("admin.messaging.send")}
      </button>
    </div>
  );
}
