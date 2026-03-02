"use client";

import { useState } from "react";
import {
  BOX_CATALOG,
  ELIGIBLE_STREET,
  ORGANIZER_CONTACTS,
  validateRegistrationInput,
  type Language,
} from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { DawaAddressInput, type DawaAddressResult } from "./DawaAddressInput";

interface RegistrationFormProps {
  boxId: number;
  onCancel: () => void;
}

export function RegistrationForm({ boxId, onCancel }: RegistrationFormProps) {
  const { language, t } = useLanguage();
  const box = BOX_CATALOG.find((b) => b.id === boxId);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<DawaAddressResult | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    if (!consentChecked) {
      setErrors([t("consent.required")]);
      return;
    }

    if (!selectedAddress) {
      setErrors([t("address.ineligible")]);
      return;
    }

    const input = {
      name: name.trim(),
      email: email.trim(),
      street: ELIGIBLE_STREET,
      houseNumber: selectedAddress.houseNumber,
      floor: selectedAddress.floor,
      door: selectedAddress.door,
      language: language as Language,
      boxId,
    };

    const validation = validateRegistrationInput(input);
    if (!validation.valid) {
      const fieldErrors: string[] = [];
      if (validation.errors["name"]) fieldErrors.push(t("validation.nameRequired"));
      if (validation.errors["email"]) {
        const isRequired = validation.errors["email"].toLowerCase().includes("required");
        fieldErrors.push(t(isRequired ? "validation.emailRequired" : "validation.emailInvalid"));
      }
      if (validation.errors["houseNumber"]) fieldErrors.push(t("validation.houseNumberInvalid"));
      if (validation.errors["floorDoor"]) fieldErrors.push(t("validation.floorDoorRequired"));
      if (validation.errors["boxId"]) fieldErrors.push(t("validation.boxIdInvalid"));
      setErrors(fieldErrors.length > 0 ? fieldErrors : [t("common.error")]);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/public/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setErrors([body?.error ?? t("common.error")]);
        return;
      }

      setSuccess(true);
    } catch {
      setErrors([t("common.error")]);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "2rem 1rem" }}>
        <h2 style={{ color: "#2d7a3a" }}>{t("registration.success")}</h2>
        <p style={{ marginTop: "1rem" }}>
          {t("registration.unregisterInfo")}
        </p>
        <button
          type="button"
          onClick={onCancel}
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1rem",
            background: "#2d7a3a",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "0.95rem",
          }}
        >
          {t("common.close")}
        </button>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 560, margin: "0 auto", padding: "2rem 1rem" }}>
      <button
        type="button"
        onClick={onCancel}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "0.9rem",
          color: "#555",
          padding: "0.25rem 0",
          marginBottom: "1rem",
          fontFamily: "inherit",
        }}
      >
        &larr; {t("common.cancel")}
      </button>

      <h2 style={{ margin: "0 0 0.25rem" }}>{t("registration.formTitle")}</h2>
      {box && (
        <p style={{ color: "#555", margin: "0 0 1.5rem" }}>
          {t("registration.boxLabel")}: <strong>#{box.id} {box.name}</strong> ({box.greenhouse})
        </p>
      )}

      {/* Policy notices */}
      <div
        style={{
          background: "#f5f5f0",
          borderRadius: 8,
          padding: "1rem",
          marginBottom: "1.25rem",
          fontSize: "0.9rem",
          lineHeight: 1.5,
        }}
      >
        <p style={{ margin: "0 0 0.5rem" }}>{t("policy.oneApartmentRule")}</p>
        <p style={{ margin: 0 }}>{t("policy.noSelfUnregister")}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="reg-name" style={labelStyle}>
            {t("registration.nameLabel")} *
          </label>
          <input
            id="reg-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="reg-email" style={labelStyle}>
            {t("registration.emailLabel")} *
          </label>
          <input
            id="reg-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* DAWA Address Autocomplete */}
        <DawaAddressInput
          selectedAddress={selectedAddress}
          onSelect={setSelectedAddress}
          onClear={() => setSelectedAddress(null)}
        />

        {/* Consent section */}
        <fieldset
          style={{
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: "1rem",
            marginBottom: "1.25rem",
          }}
        >
          <legend style={{ fontWeight: 600, fontSize: "0.95rem", padding: "0 0.25rem" }}>
            {t("consent.title")}
          </legend>

          <ul style={{ margin: "0.5rem 0", paddingLeft: "1.25rem", fontSize: "0.9rem", lineHeight: 1.6 }}>
            <li>{t("consent.dataCollected")}</li>
            <li>{t("consent.purpose")}</li>
            <li>{t("consent.retention")}</li>
            <li>
              {t("consent.contact")}{" "}
              {ORGANIZER_CONTACTS.map((c, i) => (
                <span key={c.email}>
                  {i > 0 && ", "}
                  <a href={`mailto:${c.email}`}>{c.name} ({c.email})</a>
                </span>
              ))}
            </li>
          </ul>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
              marginTop: "0.75rem",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              style={{ marginTop: "0.2rem" }}
            />
            <span>{t("consent.acknowledgment")}</span>
          </label>
        </fieldset>

        {/* Errors */}
        {errors.length > 0 && (
          <div
            role="alert"
            style={{
              background: "#fef0f0",
              border: "1px solid #e74c3c",
              borderRadius: 6,
              padding: "0.75rem",
              marginBottom: "1rem",
              fontSize: "0.9rem",
              color: "#c0392b",
            }}
          >
            {errors.map((err) => (
              <p key={err} style={{ margin: "0.25rem 0" }}>{err}</p>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: submitting ? "#999" : "#2d7a3a",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: submitting ? "default" : "pointer",
            fontFamily: "inherit",
            fontSize: "1rem",
            fontWeight: 600,
          }}
        >
          {submitting ? t("common.loading") : t("common.submit")}
        </button>
      </form>
    </section>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.9rem",
  fontWeight: 500,
  marginBottom: "0.25rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: 6,
  fontFamily: "inherit",
  fontSize: "0.95rem",
  boxSizing: "border-box",
};
