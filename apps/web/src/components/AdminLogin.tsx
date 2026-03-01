"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? t("admin.loginFailed"));
        return;
      }

      onLogin();
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ maxWidth: 400, margin: "2rem auto", padding: "0 1rem" }}>
      <h2>{t("admin.login")}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{t("admin.email")}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: 4, fontSize: "1rem" }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{t("admin.password")}</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={{ padding: "0.5rem", border: "1px solid #ccc", borderRadius: 4, fontSize: "1rem" }}
          />
        </label>
        {error && (
          <p role="alert" style={{ color: "#c62828", margin: 0, fontSize: "0.85rem" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            background: "#1565c0",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1rem",
            fontFamily: "inherit",
          }}
        >
          {loading ? t("common.loading") : t("admin.login")}
        </button>
      </form>
    </section>
  );
}
