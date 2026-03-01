"use client";

import { useLanguage } from "@/i18n/LanguageProvider";

export interface SwitchDetails {
  existingBoxId: number;
  existingBoxName: string;
  existingGreenhouse: string;
  newBoxId: number;
  newBoxName: string;
  newGreenhouse: string;
}

interface SwitchConfirmationDialogProps {
  switchDetails: SwitchDetails;
  onConfirm: () => void;
  onCancel: () => void;
  confirming?: boolean;
}

export function SwitchConfirmationDialog({
  switchDetails,
  onConfirm,
  onCancel,
  confirming = false,
}: SwitchConfirmationDialogProps) {
  const { t } = useLanguage();

  return (
    <div
      role="alertdialog"
      aria-labelledby="switch-title"
      aria-describedby="switch-explainer"
      style={{
        background: "#fff",
        border: "2px solid #e67e22",
        borderRadius: 10,
        padding: "1.5rem",
        maxWidth: 520,
        margin: "2rem auto",
      }}
    >
      <h3
        id="switch-title"
        style={{ margin: "0 0 1rem", color: "#d35400", fontSize: "1.1rem" }}
      >
        {t("registration.switchTitle")}
      </h3>

      <p
        id="switch-explainer"
        style={{
          background: "#fef9e7",
          border: "1px solid #f0c040",
          borderRadius: 6,
          padding: "0.75rem",
          fontSize: "0.9rem",
          lineHeight: 1.5,
          margin: "0 0 1.25rem",
        }}
      >
        {t("registration.switchExplainer")}
      </p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {/* Current box */}
        <div
          data-testid="current-box"
          style={{
            flex: 1,
            minWidth: 200,
            border: "1px solid #e74c3c",
            borderRadius: 8,
            padding: "0.75rem",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "0.25rem" }}>
            {t("registration.switchCurrentBox")}
          </div>
          <div style={{ fontWeight: 600 }}>
            #{switchDetails.existingBoxId} {switchDetails.existingBoxName}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#555" }}>
            {switchDetails.existingGreenhouse}
          </div>
        </div>

        {/* New box */}
        <div
          data-testid="new-box"
          style={{
            flex: 1,
            minWidth: 200,
            border: "1px solid #2d7a3a",
            borderRadius: 8,
            padding: "0.75rem",
          }}
        >
          <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "0.25rem" }}>
            {t("registration.switchNewBox")}
          </div>
          <div style={{ fontWeight: 600 }}>
            #{switchDetails.newBoxId} {switchDetails.newBoxName}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#555" }}>
            {switchDetails.newGreenhouse}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={confirming}
          style={{
            padding: "0.5rem 1rem",
            background: "#f5f5f5",
            border: "1px solid #ccc",
            borderRadius: 6,
            cursor: confirming ? "default" : "pointer",
            fontFamily: "inherit",
            fontSize: "0.9rem",
          }}
        >
          {t("registration.switchKeep")}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirming}
          style={{
            padding: "0.5rem 1rem",
            background: confirming ? "#999" : "#e67e22",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: confirming ? "default" : "pointer",
            fontFamily: "inherit",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          {confirming ? t("common.loading") : t("registration.switchConfirm")}
        </button>
      </div>
    </div>
  );
}
