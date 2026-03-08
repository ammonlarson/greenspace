"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { AdminRegistrations } from "./AdminRegistrations";
import { AdminWaitlist } from "./AdminWaitlist";
import { AdminBoxes } from "./AdminBoxes";
import { AdminSettings } from "./AdminSettings";
import { AdminAuditLog } from "./AdminAuditLog";
import { AdminAccount } from "./AdminAccount";

type Tab = "registrations" | "waitlist" | "boxes" | "settings" | "audit" | "account";

const TABS: Tab[] = ["registrations", "waitlist", "boxes", "settings", "audit", "account"];

const TAB_KEYS: Record<Tab, "admin.tab.registrations" | "admin.tab.waitlist" | "admin.tab.boxes" | "admin.tab.settings" | "admin.tab.audit" | "admin.tab.account"> = {
  registrations: "admin.tab.registrations",
  waitlist: "admin.tab.waitlist",
  boxes: "admin.tab.boxes",
  settings: "admin.tab.settings",
  audit: "admin.tab.audit",
  account: "admin.tab.account",
};

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("registrations");
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (!window.confirm(t("admin.logoutConfirm"))) return;

    setLoggingOut(true);
    try {
      await fetch("/admin/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* proceed with logout even on network error */
    } finally {
      setLoggingOut(false);
      onLogout();
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <nav
          role="tablist"
          style={{
            display: "flex",
            gap: "0.25rem",
            borderBottom: "2px solid #e0e0e0",
            overflowX: "auto",
            flex: 1,
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.6rem 1.25rem",
                border: "none",
                borderBottom: activeTab === tab ? "2px solid #1565c0" : "2px solid transparent",
                background: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "0.9rem",
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? "#1565c0" : "#555",
                whiteSpace: "nowrap",
                marginBottom: "-2px",
              }}
            >
              {t(TAB_KEYS[tab])}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            padding: "0.5rem 1rem",
            background: "none",
            border: "1px solid #c62828",
            color: "#c62828",
            borderRadius: 4,
            cursor: loggingOut ? "not-allowed" : "pointer",
            fontSize: "0.85rem",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
            marginLeft: "1rem",
          }}
        >
          {loggingOut ? t("common.loading") : t("admin.logout")}
        </button>
      </div>

      <div role="tabpanel">
        {activeTab === "registrations" && <AdminRegistrations />}
        {activeTab === "waitlist" && <AdminWaitlist />}
        {activeTab === "boxes" && <AdminBoxes />}
        {activeTab === "settings" && <AdminSettings />}
        {activeTab === "audit" && <AdminAuditLog />}
        {activeTab === "account" && <AdminAccount />}
      </div>
    </div>
  );
}
