"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";

interface AdminPageProps {
  onBack: () => void;
}

export function AdminPage({ onBack }: AdminPageProps) {
  const { t } = useLanguage();
  const [authenticated, setAuthenticated] = useState(false);

  return (
    <div>
      <div style={{ padding: "0.5rem 1rem" }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "0.9rem",
            color: "#555",
            padding: "0.25rem 0",
            fontFamily: "inherit",
          }}
        >
          &larr; {t("admin.backToPublic")}
        </button>
      </div>

      {authenticated ? (
        <AdminDashboard />
      ) : (
        <AdminLogin onLogin={() => setAuthenticated(true)} />
      )}
    </div>
  );
}
