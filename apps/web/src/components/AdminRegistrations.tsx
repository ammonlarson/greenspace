"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BOX_CATALOG,
  ELIGIBLE_STREET,
  HOUSE_NUMBER_MIN,
  HOUSE_NUMBER_MAX,
  isFloorDoorRequired,
  validateRegistrationInput,
} from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatDate } from "@/utils/formatDate";
import { NotificationComposer, type NotificationValue } from "./NotificationComposer";

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
  language: string;
  status: string;
  created_at: string;
}

interface DuplicateExisting {
  id: string;
  boxId: number;
  name: string;
  email: string;
}

type ActiveDialog =
  | { type: "add" }
  | { type: "move"; registration: Registration }
  | { type: "remove"; registration: Registration }
  | null;

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.4rem",
  border: "1px solid #ccc",
  borderRadius: 4,
  fontSize: "0.85rem",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  marginBottom: "0.25rem",
};

const requiredLabelStyle: React.CSSProperties = {
  ...labelStyle,
  color: "#333",
};

function formatBoxLabel(box: { id: number; name: string; greenhouse: string }): string {
  return `${box.greenhouse} ${box.id} - ${box.name}`;
}

const dialogStyle: React.CSSProperties = {
  border: "1px solid #e0e0e0",
  borderRadius: 8,
  padding: "1.25rem",
  marginBottom: "1.5rem",
  background: "#fff",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

export function AdminRegistrations() {
  const { t, language } = useLanguage();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);

  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addHouseNumber, setAddHouseNumber] = useState("");
  const [addFloor, setAddFloor] = useState("");
  const [addDoor, setAddDoor] = useState("");
  const [addBoxId, setAddBoxId] = useState("");
  const [addLanguage, setAddLanguage] = useState<"da" | "en">("da");
  const [addNotification, setAddNotification] = useState<NotificationValue>({ sendEmail: true, subject: "", bodyHtml: "", valid: true });
  const [addErrors, setAddErrors] = useState<string[]>([]);
  const [addDuplicateWarning, setAddDuplicateWarning] = useState<DuplicateExisting[] | null>(null);
  const [moveNewBoxId, setMoveNewBoxId] = useState("");
  const [moveNotification, setMoveNotification] = useState<NotificationValue>({ sendEmail: true, subject: "", bodyHtml: "", valid: true });
  const [removeMakePublic, setRemoveMakePublic] = useState(true);
  const [removeNotification, setRemoveNotification] = useState<NotificationValue>({ sendEmail: true, subject: "", bodyHtml: "", valid: true });

  const fetchRegistrations = useCallback(async () => {
    try {
      const res = await fetch("/admin/registrations", { credentials: "include" });
      if (res.ok) {
        setRegistrations(await res.json());
      } else {
        setMessage({ type: "error", text: t("common.error") });
      }
    } catch {
      setMessage({ type: "error", text: t("common.error") });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  function openAddDialog() {
    setAddName("");
    setAddEmail("");
    setAddHouseNumber("");
    setAddFloor("");
    setAddDoor("");
    setAddBoxId("");
    setAddLanguage("da");
    setAddNotification({ sendEmail: true, subject: "", bodyHtml: "", valid: true });
    setAddErrors([]);
    setAddDuplicateWarning(null);
    setMessage(null);
    setActiveDialog({ type: "add" });
  }

  function openMoveDialog(reg: Registration) {
    setMoveNewBoxId("");
    setMoveNotification({ sendEmail: true, subject: "", bodyHtml: "", valid: true });
    setMessage(null);
    setActiveDialog({ type: "move", registration: reg });
  }

  function openRemoveDialog(reg: Registration) {
    setRemoveMakePublic(true);
    setRemoveNotification({ sendEmail: true, subject: "", bodyHtml: "", valid: true });
    setMessage(null);
    setActiveDialog({ type: "remove", registration: reg });
  }

  function closeDialog() {
    setActiveDialog(null);
  }

  const parsedAddHouseNumber = parseInt(addHouseNumber, 10);
  const addNeedsUnitFields = !isNaN(parsedAddHouseNumber) && isFloorDoorRequired(parsedAddHouseNumber);

  async function handleAdd(confirmDuplicate = false) {
    setAddErrors([]);

    const input = {
      name: addName.trim(),
      email: addEmail.trim(),
      street: ELIGIBLE_STREET,
      houseNumber: parsedAddHouseNumber,
      floor: addFloor.trim() || null,
      door: addDoor.trim() || null,
      language: addLanguage,
      boxId: Number(addBoxId),
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
      setAddErrors(fieldErrors.length > 0 ? fieldErrors : [t("common.error")]);
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/admin/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          boxId: input.boxId,
          name: input.name,
          email: input.email,
          street: input.street,
          houseNumber: input.houseNumber,
          floor: input.floor,
          door: input.door,
          language: input.language,
          confirmDuplicate,
          notification: {
            sendEmail: addNotification.sendEmail,
            subject: addNotification.subject || undefined,
            bodyHtml: addNotification.bodyHtml || undefined,
          },
        }),
      });

      if (res.ok) {
        setAddDuplicateWarning(null);
        setMessage({ type: "success", text: t("admin.registrations.added") });
        setActiveDialog(null);
        await fetchRegistrations();
      } else {
        const body = await res.json();
        if (body.code === "DUPLICATE_ADDRESS_WARNING") {
          setAddDuplicateWarning(body.existingRegistrations);
        } else {
          setMessage({ type: "error", text: body.error ?? t("common.error") });
        }
      }
    } catch {
      setMessage({ type: "error", text: t("common.error") });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMove() {
    if (!activeDialog || activeDialog.type !== "move") return;
    const newBoxId = Number(moveNewBoxId);
    if (isNaN(newBoxId) || newBoxId < 1) {
      setMessage({ type: "error", text: t("common.error") });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/admin/registrations/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          registrationId: activeDialog.registration.id,
          newBoxId,
          notification: {
            sendEmail: moveNotification.sendEmail,
            subject: moveNotification.subject || undefined,
            bodyHtml: moveNotification.bodyHtml || undefined,
          },
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: t("admin.registrations.moved") });
        setActiveDialog(null);
        await fetchRegistrations();
      } else {
        const body = await res.json();
        setMessage({ type: "error", text: body.error ?? t("common.error") });
      }
    } catch {
      setMessage({ type: "error", text: t("common.error") });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove() {
    if (!activeDialog || activeDialog.type !== "remove") return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/admin/registrations/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          registrationId: activeDialog.registration.id,
          makeBoxPublic: removeMakePublic,
          notification: {
            sendEmail: removeNotification.sendEmail,
            subject: removeNotification.subject || undefined,
            bodyHtml: removeNotification.bodyHtml || undefined,
          },
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: t("admin.registrations.removed") });
        setActiveDialog(null);
        await fetchRegistrations();
      } else {
        const body = await res.json();
        setMessage({ type: "error", text: body.error ?? t("common.error") });
      }
    } catch {
      setMessage({ type: "error", text: t("common.error") });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p>{t("common.loading")}</p>;
  }

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>{t("admin.registrations.title")}</h2>
        <button
          type="button"
          onClick={openAddDialog}
          disabled={activeDialog !== null}
          style={{
            padding: "0.4rem 1rem",
            border: "1px solid #2d7a3a",
            borderRadius: 4,
            background: "#2d7a3a",
            color: "#fff",
            cursor: activeDialog !== null ? "not-allowed" : "pointer",
            fontSize: "0.85rem",
            fontFamily: "inherit",
          }}
        >
          {t("admin.registrations.add")}
        </button>
      </div>

      {message && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          style={{
            color: message.type === "error" ? "#c62828" : "#2d7a3a",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          {message.text}
        </p>
      )}

      {/* Add Dialog */}
      {activeDialog?.type === "add" && (
        <div role="dialog" aria-labelledby="add-dialog-title" style={dialogStyle}>
          <h3 id="add-dialog-title" style={{ margin: "0 0 1rem 0", fontSize: "1rem" }}>{t("admin.registrations.add")}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label htmlFor="add-name" style={requiredLabelStyle}>{t("admin.registrations.addName")} *</label>
              <input id="add-name" type="text" value={addName} onChange={(e) => setAddName(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="add-email" style={requiredLabelStyle}>{t("admin.registrations.addEmail")} *</label>
              <input id="add-email" type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label htmlFor="add-street" style={labelStyle}>{t("admin.registrations.addStreet")}</label>
              <input id="add-street" type="text" value={ELIGIBLE_STREET} disabled style={{ ...inputStyle, background: "#f0f0f0", color: "#888" }} />
            </div>
            <div>
              <label htmlFor="add-house-number" style={requiredLabelStyle}>{t("admin.registrations.addHouseNumber")} *</label>
              <input
                id="add-house-number"
                type="number"
                min={HOUSE_NUMBER_MIN}
                max={HOUSE_NUMBER_MAX}
                value={addHouseNumber}
                onChange={(e) => { setAddHouseNumber(e.target.value); setAddFloor(""); setAddDoor(""); }}
                placeholder={String(HOUSE_NUMBER_MIN)}
                style={inputStyle}
              />
            </div>
            {addNeedsUnitFields && (
              <>
                <div>
                  <label htmlFor="add-floor" style={requiredLabelStyle}>{t("admin.registrations.addFloor")} *</label>
                  <input id="add-floor" type="text" value={addFloor} onChange={(e) => setAddFloor(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="add-door" style={labelStyle}>{t("admin.registrations.addDoor")}</label>
                  <input id="add-door" type="text" value={addDoor} onChange={(e) => setAddDoor(e.target.value)} style={inputStyle} />
                </div>
              </>
            )}
            <div>
              <label htmlFor="add-box-id" style={requiredLabelStyle}>{t("admin.registrations.addBoxId")} *</label>
              <select id="add-box-id" value={addBoxId} onChange={(e) => setAddBoxId(e.target.value)} style={inputStyle}>
                <option value="">{t("admin.registrations.selectBox")}</option>
                {BOX_CATALOG.map((box) => (
                  <option key={box.id} value={String(box.id)}>
                    {formatBoxLabel(box)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="add-language" style={requiredLabelStyle}>{t("admin.registrations.addLanguage")} *</label>
              <select id="add-language" value={addLanguage} onChange={(e) => setAddLanguage(e.target.value as "da" | "en")} style={inputStyle}>
                <option value="da">Dansk</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {addNeedsUnitFields && (
            <p style={{ fontSize: "0.8rem", color: "#666", margin: "0.5rem 0 0" }}>
              {t("address.floorDoorHint")}
            </p>
          )}

          {addErrors.length > 0 && (
            <div
              role="alert"
              style={{
                background: "#fef0f0",
                border: "1px solid #e74c3c",
                borderRadius: 6,
                padding: "0.75rem",
                marginTop: "0.75rem",
                fontSize: "0.85rem",
                color: "#c0392b",
              }}
            >
              {addErrors.map((err) => (
                <p key={err} style={{ margin: "0.25rem 0" }}>{err}</p>
              ))}
            </div>
          )}

          {addName && addEmail && addBoxId && Number(addBoxId) > 0 && (
            <NotificationComposer
              action="add"
              recipientName={addName}
              recipientEmail={addEmail}
              recipientLanguage={addLanguage}
              boxId={Number(addBoxId)}
              value={addNotification}
              onChange={setAddNotification}
            />
          )}

          {addDuplicateWarning && (
            <div
              role="alert"
              style={{
                background: "#fff3e0",
                border: "1px solid #e67e22",
                borderRadius: 6,
                padding: "0.75rem",
                marginTop: "0.75rem",
              }}
            >
              <p style={{ margin: "0 0 0.5rem", fontWeight: 600, color: "#d35400", fontSize: "0.85rem" }}>
                {t("admin.registrations.duplicateWarning")}
              </p>
              <ul style={{ margin: "0 0 0.5rem", paddingLeft: "1.25rem", fontSize: "0.8rem" }}>
                {addDuplicateWarning.map((r) => (
                  <li key={r.id}>
                    {r.name} ({r.email}) — {t("admin.registrations.box")} #{r.boxId}
                  </li>
                ))}
              </ul>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#555" }}>
                {t("admin.registrations.duplicateConfirmHint")}
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            {addDuplicateWarning ? (
              <button
                type="button"
                onClick={() => handleAdd(true)}
                disabled={submitting || (addNotification.sendEmail && !addNotification.valid)}
                style={{
                  padding: "0.4rem 1rem",
                  border: "none",
                  borderRadius: 4,
                  background: "#e67e22",
                  color: "#fff",
                  cursor: submitting || (addNotification.sendEmail && !addNotification.valid) ? "not-allowed" : "pointer",
                  fontSize: "0.85rem",
                  fontFamily: "inherit",
                  fontWeight: 600,
                }}
              >
                {t("admin.registrations.confirmDuplicate")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleAdd()}
                disabled={submitting || (addNotification.sendEmail && !addNotification.valid)}
                style={{
                  padding: "0.4rem 1rem",
                  border: "none",
                  borderRadius: 4,
                  background: "#2d7a3a",
                  color: "#fff",
                  cursor: submitting || (addNotification.sendEmail && !addNotification.valid) ? "not-allowed" : "pointer",
                  fontSize: "0.85rem",
                  fontFamily: "inherit",
                }}
              >
                {t("common.confirm")}
              </button>
            )}
            <button
              type="button"
              onClick={closeDialog}
              disabled={submitting}
              style={{
                padding: "0.4rem 1rem",
                border: "1px solid #ccc",
                borderRadius: 4,
                background: "#fff",
                cursor: submitting ? "not-allowed" : "pointer",
                fontSize: "0.85rem",
                fontFamily: "inherit",
              }}
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Move Dialog */}
      {activeDialog?.type === "move" && (
        <div role="dialog" aria-labelledby="move-dialog-title" style={dialogStyle}>
          <h3 id="move-dialog-title" style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
            {t("admin.registrations.move")} – {activeDialog.registration.name} (#{activeDialog.registration.box_id})
          </h3>
          <div style={{ marginBottom: "0.75rem" }}>
            <label htmlFor="move-new-box-id" style={labelStyle}>{t("admin.registrations.newBoxId")}</label>
            <select
              id="move-new-box-id"
              value={moveNewBoxId}
              onChange={(e) => setMoveNewBoxId(e.target.value)}
              style={{ ...inputStyle, maxWidth: 300 }}
            >
              <option value="">{t("admin.registrations.selectBox")}</option>
              {BOX_CATALOG.map((box) => (
                <option key={box.id} value={String(box.id)}>
                  {formatBoxLabel(box)}
                </option>
              ))}
            </select>
          </div>

          {moveNewBoxId && Number(moveNewBoxId) > 0 && (
            <NotificationComposer
              action="move"
              recipientName={activeDialog.registration.name}
              recipientEmail={activeDialog.registration.email}
              recipientLanguage={activeDialog.registration.language}
              boxId={Number(moveNewBoxId)}
              oldBoxId={activeDialog.registration.box_id}
              value={moveNotification}
              onChange={setMoveNotification}
            />
          )}

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={handleMove}
              disabled={submitting || (moveNotification.sendEmail && !moveNotification.valid)}
              style={{
                padding: "0.4rem 1rem",
                border: "none",
                borderRadius: 4,
                background: "#1565c0",
                color: "#fff",
                cursor: submitting || (moveNotification.sendEmail && !moveNotification.valid) ? "not-allowed" : "pointer",
                fontSize: "0.85rem",
                fontFamily: "inherit",
              }}
            >
              {t("common.confirm")}
            </button>
            <button
              type="button"
              onClick={closeDialog}
              disabled={submitting}
              style={{
                padding: "0.4rem 1rem",
                border: "1px solid #ccc",
                borderRadius: 4,
                background: "#fff",
                cursor: submitting ? "not-allowed" : "pointer",
                fontSize: "0.85rem",
                fontFamily: "inherit",
              }}
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      )}

      {/* Remove Dialog */}
      {activeDialog?.type === "remove" && (
        <div role="dialog" aria-labelledby="remove-dialog-title" style={dialogStyle}>
          <h3 id="remove-dialog-title" style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
            {t("admin.registrations.confirmRemove")} – {activeDialog.registration.name} (#{activeDialog.registration.box_id})
          </h3>

          <fieldset style={{ border: "none", padding: 0, margin: "0 0 0.75rem 0" }}>
            <legend style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              {t("admin.registrations.releaseType")}
            </legend>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", cursor: "pointer" }}>
              <input
                type="radio"
                name="release-type"
                checked={removeMakePublic}
                onChange={() => setRemoveMakePublic(true)}
              />
              <span style={{ fontSize: "0.85rem" }}>{t("admin.registrations.releasePublic")}</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="radio"
                name="release-type"
                checked={!removeMakePublic}
                onChange={() => setRemoveMakePublic(false)}
              />
              <span style={{ fontSize: "0.85rem" }}>{t("admin.registrations.releaseReserved")}</span>
            </label>
          </fieldset>

          <NotificationComposer
            action="remove"
            recipientName={activeDialog.registration.name}
            recipientEmail={activeDialog.registration.email}
            recipientLanguage={activeDialog.registration.language}
            boxId={activeDialog.registration.box_id}
            value={removeNotification}
            onChange={setRemoveNotification}
          />

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={handleRemove}
              disabled={submitting || (removeNotification.sendEmail && !removeNotification.valid)}
              style={{
                padding: "0.4rem 1rem",
                border: "none",
                borderRadius: 4,
                background: "#c62828",
                color: "#fff",
                cursor: submitting || (removeNotification.sendEmail && !removeNotification.valid) ? "not-allowed" : "pointer",
                fontSize: "0.85rem",
                fontFamily: "inherit",
              }}
            >
              {t("common.confirm")}
            </button>
            <button
              type="button"
              onClick={closeDialog}
              disabled={submitting}
              style={{
                padding: "0.4rem 1rem",
                border: "1px solid #ccc",
                borderRadius: 4,
                background: "#fff",
                cursor: submitting ? "not-allowed" : "pointer",
                fontSize: "0.85rem",
                fontFamily: "inherit",
              }}
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
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
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        <button
                          type="button"
                          onClick={() => openMoveDialog(reg)}
                          disabled={activeDialog !== null}
                          style={{
                            padding: "0.25rem 0.75rem",
                            border: "1px solid #1565c0",
                            borderRadius: 4,
                            background: "#fff",
                            color: "#1565c0",
                            cursor: activeDialog !== null ? "not-allowed" : "pointer",
                            fontSize: "0.8rem",
                            fontFamily: "inherit",
                          }}
                        >
                          {t("admin.registrations.move")}
                        </button>
                        <button
                          type="button"
                          onClick={() => openRemoveDialog(reg)}
                          disabled={activeDialog !== null}
                          style={{
                            padding: "0.25rem 0.75rem",
                            border: "1px solid #c62828",
                            borderRadius: 4,
                            background: "#fff",
                            color: "#c62828",
                            cursor: activeDialog !== null ? "not-allowed" : "pointer",
                            fontSize: "0.8rem",
                            fontFamily: "inherit",
                          }}
                        >
                          {t("admin.registrations.remove")}
                        </button>
                      </div>
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
