"use client";

import { useState } from "react";
import {
  ELIGIBLE_STREET,
  HOUSE_NUMBER_MIN,
  HOUSE_NUMBER_MAX,
  ORGANIZER_CONTACTS,
  isFloorDoorRequired,
  validateWaitlistInput,
  type Language,
} from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { WaitlistBanner } from "./WaitlistBanner";

interface WaitlistFormProps {
  onCancel: () => void;
}

export function WaitlistForm({ onCancel }: WaitlistFormProps) {
  const { language, t } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [door, setDoor] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    alreadyOnWaitlist: boolean;
    position: number;
    joinedAt?: string;
  } | null>(null);

  const parsedHouseNumber = parseInt(houseNumber, 10);
  const needsFloorDoor = !isNaN(parsedHouseNumber) && isFloorDoorRequired(parsedHouseNumber);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);

    if (!consentChecked) {
      setErrors([t("consent.required")]);
      return;
    }

    const input = {
      name: name.trim(),
      email: email.trim(),
      street: ELIGIBLE_STREET,
      houseNumber: parsedHouseNumber,
      floor: floor.trim() || null,
      door: door.trim() || null,
      language: language as Language,
    };

    const validation = validateWaitlistInput(input);
    if (!validation.valid) {
      const fieldErrors: string[] = [];
      if (validation.errors["name"]) fieldErrors.push(t("validation.nameRequired"));
      if (validation.errors["email"]) {
        const isRequired = validation.errors["email"].toLowerCase().includes("required");
        fieldErrors.push(t(isRequired ? "validation.emailRequired" : "validation.emailInvalid"));
      }
      if (validation.errors["houseNumber"]) fieldErrors.push(t("validation.houseNumberInvalid"));
      if (validation.errors["floorDoor"]) fieldErrors.push(t("validation.floorDoorRequired"));
      setErrors(fieldErrors.length > 0 ? fieldErrors : [t("common.error")]);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/public/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setErrors([body?.error ?? t("common.error")]);
        return;
      }

      setResult({
        alreadyOnWaitlist: body.alreadyOnWaitlist ?? false,
        position: body.position ?? 0,
        joinedAt: body.joinedAt,
      });
    } catch {
      setErrors([t("common.error")]);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <section style={{ maxWidth: 560, margin: "0 auto", padding: "2rem 1rem" }}>
        <h2 style={{ color: "#b8860b" }}>{t("waitlist.success")}</h2>
        <WaitlistBanner
          position={result.position}
          alreadyOnWaitlist={result.alreadyOnWaitlist}
        />
        <button
          type="button"
          onClick={onCancel}
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1rem",
            background: "#b8860b",
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

      <h2 style={{ margin: "0 0 0.25rem" }}>{t("waitlist.title")}</h2>
      <p style={{ color: "#555", margin: "0 0 1.5rem", fontSize: "0.95rem" }}>
        {t("waitlist.description")}
      </p>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="wl-name" style={labelStyle}>
            {t("registration.nameLabel")} *
          </label>
          <input
            id="wl-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="wl-email" style={labelStyle}>
            {t("registration.emailLabel")} *
          </label>
          <input
            id="wl-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Street (fixed) */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="wl-street" style={labelStyle}>
            {t("registration.streetLabel")}
          </label>
          <input
            id="wl-street"
            type="text"
            value={ELIGIBLE_STREET}
            disabled
            style={{ ...inputStyle, background: "#f0f0f0", color: "#888" }}
          />
        </div>

        {/* House number */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="wl-house" style={labelStyle}>
            {t("registration.houseNumberLabel")} *
          </label>
          <input
            id="wl-house"
            type="number"
            required
            min={HOUSE_NUMBER_MIN}
            max={HOUSE_NUMBER_MAX}
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Floor */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="wl-floor" style={labelStyle}>
            {t("registration.floorLabel")} {needsFloorDoor ? "*" : ""}
          </label>
          <input
            id="wl-floor"
            type="text"
            required={needsFloorDoor}
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Door */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="wl-door" style={labelStyle}>
            {t("registration.doorLabel")} {needsFloorDoor ? "*" : ""}
          </label>
          <input
            id="wl-door"
            type="text"
            required={needsFloorDoor}
            value={door}
            onChange={(e) => setDoor(e.target.value)}
            style={inputStyle}
          />
        </div>

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
            background: submitting ? "#999" : "#b8860b",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: submitting ? "default" : "pointer",
            fontFamily: "inherit",
            fontSize: "1rem",
            fontWeight: 600,
          }}
        >
          {submitting ? t("common.loading") : t("waitlist.joinButton")}
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
