"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

type Tab = "preview" | "source";

export interface NotificationValue {
  sendEmail: boolean;
  subject: string;
  bodyHtml: string;
  valid: boolean;
}

interface NotificationComposerProps {
  action: "add" | "move" | "remove" | "waitlist_assign";
  recipientName: string;
  recipientEmail: string;
  recipientLanguage: string;
  boxId: number;
  oldBoxId?: number;
  value: NotificationValue;
  onChange: (value: NotificationValue) => void;
}

function isHtmlValid(html: string): boolean {
  return html.trim().length > 0;
}

export function NotificationComposer({
  action,
  recipientName,
  recipientEmail,
  recipientLanguage,
  boxId,
  oldBoxId,
  value,
  onChange,
}: NotificationComposerProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [defaultSubject, setDefaultSubject] = useState("");
  const [defaultBodyHtml, setDefaultBodyHtml] = useState("");
  const sendEmailRef = useRef(value.sendEmail);
  sendEmailRef.current = value.sendEmail;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const fetchPreview = useCallback(async () => {
    if (!recipientName || !recipientEmail || !boxId) return;

    setPreviewLoading(true);
    setPreviewError(false);

    try {
      const res = await fetch("/admin/notifications/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action,
          recipientName,
          recipientEmail,
          language: recipientLanguage,
          boxId,
          oldBoxId,
        }),
      });

      if (res.ok) {
        const preview = await res.json();
        setDefaultSubject(preview.subject);
        setDefaultBodyHtml(preview.bodyHtml);
        onChangeRef.current({
          sendEmail: sendEmailRef.current,
          subject: preview.subject,
          bodyHtml: preview.bodyHtml,
          valid: isHtmlValid(preview.bodyHtml),
        });
      } else {
        setPreviewError(true);
      }
    } catch {
      setPreviewError(true);
    } finally {
      setPreviewLoading(false);
    }
  }, [action, recipientName, recipientEmail, recipientLanguage, boxId, oldBoxId]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  function handleReset() {
    onChange({
      sendEmail: value.sendEmail,
      subject: defaultSubject,
      bodyHtml: defaultBodyHtml,
      valid: isHtmlValid(defaultBodyHtml),
    });
  }

  function handleBodyChange(bodyHtml: string) {
    onChange({ ...value, bodyHtml, valid: isHtmlValid(bodyHtml) });
  }

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    padding: "0.4rem 1rem",
    border: "none",
    borderBottom: activeTab === tab ? "2px solid #1565c0" : "2px solid transparent",
    background: "none",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontFamily: "inherit",
    fontWeight: activeTab === tab ? 600 : 400,
    color: activeTab === tab ? "#1565c0" : "#555",
  });

  return (
    <div
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: 6,
        padding: "1rem",
        marginTop: "0.75rem",
        background: "#fafafa",
      }}
    >
      <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem" }}>
        {t("admin.notification.title")}
      </h4>

      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={value.sendEmail}
          onChange={(e) => onChange({ ...value, sendEmail: e.target.checked })}
        />
        <span style={{ fontSize: "0.85rem" }}>{t("admin.notification.send")}</span>
      </label>

      {value.sendEmail && (
        <>
          {previewLoading && (
            <p style={{ fontSize: "0.8rem", color: "#888" }}>
              {t("admin.notification.previewLoading")}
            </p>
          )}
          {previewError && (
            <p role="alert" style={{ fontSize: "0.8rem", color: "#c62828" }}>
              {t("admin.notification.previewError")}
            </p>
          )}
          {!previewLoading && !previewError && (
            <>
              <div style={{ marginBottom: "0.5rem" }}>
                <label
                  htmlFor="notification-subject"
                  style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.25rem" }}
                >
                  {t("admin.notification.subject")}
                </label>
                <input
                  id="notification-subject"
                  type="text"
                  value={value.subject}
                  onChange={(e) => onChange({ ...value, subject: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.4rem",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    fontSize: "0.85rem",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                role="tablist"
                style={{
                  display: "flex",
                  borderBottom: "1px solid #e0e0e0",
                  marginBottom: "0.5rem",
                }}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "preview"}
                  aria-controls="notification-tab-preview"
                  onClick={() => setActiveTab("preview")}
                  style={tabStyle("preview")}
                >
                  {t("admin.notification.preview")}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "source"}
                  aria-controls="notification-tab-source"
                  onClick={() => setActiveTab("source")}
                  style={tabStyle("source")}
                >
                  {t("admin.notification.source")}
                </button>
              </div>

              {activeTab === "preview" && (
                <div
                  id="notification-tab-preview"
                  role="tabpanel"
                  style={{ marginBottom: "0.5rem" }}
                >
                  <iframe
                    title={t("admin.notification.preview")}
                    srcDoc={value.bodyHtml}
                    sandbox=""
                    style={{
                      width: "100%",
                      height: 300,
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      background: "#fff",
                    }}
                  />
                </div>
              )}

              {activeTab === "source" && (
                <div
                  id="notification-tab-source"
                  role="tabpanel"
                  style={{ marginBottom: "0.5rem" }}
                >
                  <textarea
                    id="notification-body"
                    aria-label={t("admin.notification.body")}
                    value={value.bodyHtml}
                    onChange={(e) => handleBodyChange(e.target.value)}
                    rows={12}
                    style={{
                      width: "100%",
                      padding: "0.4rem",
                      border: `1px solid ${!value.valid ? "#c62828" : "#ccc"}`,
                      borderRadius: 4,
                      fontSize: "0.8rem",
                      fontFamily: "monospace",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                  {!value.valid && (
                    <p role="alert" style={{ fontSize: "0.8rem", color: "#c62828", margin: "0.25rem 0 0 0" }}>
                      {t("admin.notification.sourceError")}
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: "0.25rem 0.75rem",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontFamily: "inherit",
                }}
              >
                {t("admin.notification.reset")}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
