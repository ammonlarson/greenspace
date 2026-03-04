"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { AdminRegistrations } from "./AdminRegistrations";
import { AdminWaitlist } from "./AdminWaitlist";
import { AdminBoxes } from "./AdminBoxes";
import { AdminSettings } from "./AdminSettings";
import { AdminAuditLog } from "./AdminAuditLog";

type Tab = "registrations" | "waitlist" | "boxes" | "settings" | "audit";

const TABS: Tab[] = ["registrations", "waitlist", "boxes", "settings", "audit"];

const TAB_KEYS: Record<Tab, "admin.tab.registrations" | "admin.tab.waitlist" | "admin.tab.boxes" | "admin.tab.settings" | "admin.tab.audit"> = {
  registrations: "admin.tab.registrations",
  waitlist: "admin.tab.waitlist",
  boxes: "admin.tab.boxes",
  settings: "admin.tab.settings",
  audit: "admin.tab.audit",
};

export function AdminDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("registrations");

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem" }}>
      <nav
        role="tablist"
        style={{
          display: "flex",
          gap: "0.25rem",
          borderBottom: "2px solid #e0e0e0",
          marginBottom: "1.5rem",
          overflowX: "auto",
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

      <div role="tabpanel">
        {activeTab === "registrations" && <AdminRegistrations />}
        {activeTab === "waitlist" && <AdminWaitlist />}
        {activeTab === "boxes" && <AdminBoxes />}
        {activeTab === "settings" && <AdminSettings />}
        {activeTab === "audit" && <AdminAuditLog />}
      </div>
    </div>
  );
}
