import {
  BOX_CATALOG,
  ORGANIZER_CONTACTS,
} from "@greenspace/shared";
import type { Language } from "@greenspace/shared";

export type AdminNotificationAction = "add" | "move" | "remove" | "waitlist_assign";

export interface NotificationPreviewInput {
  action: AdminNotificationAction;
  recipientName: string;
  recipientEmail: string;
  language: Language;
  boxId: number;
  oldBoxId?: number;
}

export interface NotificationPreview {
  subject: string;
  bodyHtml: string;
  recipientEmail: string;
  language: Language;
}

const translations = {
  da: {
    addSubject: "Bekræftelse af din plantekasse-registrering – Greenspace 2026",
    moveSubject: "Ændring af din plantekasse – Greenspace 2026",
    removeSubject: "Din plantekasse-registrering er fjernet – Greenspace 2026",

    greeting: (name: string) => `Kære ${name},`,
    addIntro: "Du er blevet tilmeldt en plantekasse i Greenspace 2026. Din registrering er nu bekræftet.",
    moveIntro: "Din plantekasse-registrering i Greenspace 2026 er blevet ændret.",
    moveDetail: (oldBoxName: string, oldGreenhouse: string, newBoxName: string, newGreenhouse: string) =>
      `Din plantekasse er blevet flyttet fra "${oldBoxName}" i ${oldGreenhouse} til "${newBoxName}" i ${newGreenhouse}.`,
    removeIntro: "Vi skriver for at informere dig om, at din plantekasse-registrering i Greenspace 2026 er blevet fjernet.",
    removeDetail: (boxName: string, greenhouse: string) =>
      `Din registrering for plantekasse "${boxName}" i ${greenhouse} er ikke længere aktiv.`,

    boxDetailsTitle: "Din plantekasse",
    boxLabel: "Kasse",
    greenhouseLabel: "Drivhus",
    boxNameLabel: "Navn",

    contactTitle: "Kontakt",
    contactText: "Hvis du har spørgsmål, er du velkommen til at kontakte os:",
    closing: "Med venlig hilsen,",
    teamSignature: "Greenspace-teamet",
  },
  en: {
    addSubject: "Confirmation of your planter box registration – Greenspace 2026",
    moveSubject: "Change to your planter box – Greenspace 2026",
    removeSubject: "Your planter box registration has been removed – Greenspace 2026",

    greeting: (name: string) => `Dear ${name},`,
    addIntro: "You have been registered for a planter box in Greenspace 2026. Your registration is now confirmed.",
    moveIntro: "Your planter box registration in Greenspace 2026 has been updated.",
    moveDetail: (oldBoxName: string, oldGreenhouse: string, newBoxName: string, newGreenhouse: string) =>
      `Your planter box has been moved from "${oldBoxName}" in ${oldGreenhouse} to "${newBoxName}" in ${newGreenhouse}.`,
    removeIntro: "We are writing to let you know that your planter box registration in Greenspace 2026 has been removed.",
    removeDetail: (boxName: string, greenhouse: string) =>
      `Your registration for planter box "${boxName}" in ${greenhouse} is no longer active.`,

    boxDetailsTitle: "Your planter box",
    boxLabel: "Box",
    greenhouseLabel: "Greenhouse",
    boxNameLabel: "Name",

    contactTitle: "Contact",
    contactText: "If you have any questions, feel free to reach out to us:",
    closing: "Best regards,",
    teamSignature: "The Greenspace Team",
  },
} as const;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildBoxDetailsHtml(
  t: (typeof translations)["da"] | (typeof translations)["en"],
  boxId: number,
): string {
  const box = BOX_CATALOG.find((b) => b.id === boxId);
  const boxName = box?.name ?? `#${boxId}`;
  const greenhouse = box?.greenhouse ?? "Unknown";

  return `
      <h2 style="color: #2e7d32; font-size: 18px; border-bottom: 2px solid #e8f5e9; padding-bottom: 8px;">${escapeHtml(t.boxDetailsTitle)}</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 40%;">${escapeHtml(t.boxLabel)}</td>
          <td style="padding: 8px 12px;">#${boxId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; background: #f5f5f5; font-weight: bold;">${escapeHtml(t.boxNameLabel)}</td>
          <td style="padding: 8px 12px;">${escapeHtml(boxName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; background: #f5f5f5; font-weight: bold;">${escapeHtml(t.greenhouseLabel)}</td>
          <td style="padding: 8px 12px;">${escapeHtml(greenhouse)}</td>
        </tr>
      </table>`;
}

function buildContactHtml(
  t: (typeof translations)["da"] | (typeof translations)["en"],
): string {
  const contactListHtml = ORGANIZER_CONTACTS.map(
    (c) =>
      `<li>${escapeHtml(c.name)} – <a href="mailto:${escapeHtml(c.email)}" style="color: #2e7d32;">${escapeHtml(c.email)}</a></li>`,
  ).join("");

  return `
      <h2 style="color: #2e7d32; font-size: 18px; border-bottom: 2px solid #e8f5e9; padding-bottom: 8px;">${escapeHtml(t.contactTitle)}</h2>
      <p>${escapeHtml(t.contactText)}</p>
      <ul style="padding-left: 20px; line-height: 1.8;">
        ${contactListHtml}
      </ul>`;
}

function wrapEmailHtml(language: Language, subject: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff;">
    <div style="background: #2e7d32; padding: 24px 32px;">
      <h1 style="margin: 0; color: #fff; font-size: 22px;">Greenspace 2026</h1>
    </div>

    <div style="padding: 32px;">
      ${contentHtml}
    </div>

    <div style="background: #f5f5f5; padding: 16px 32px; font-size: 12px; color: #888; text-align: center;">
      <p style="margin: 0;">Greenspace 2026 &ndash; UN17 Hub</p>
    </div>
  </div>
</body>
</html>`;
}

function buildAddNotification(data: NotificationPreviewInput): NotificationPreview {
  const t = translations[data.language];
  const boxDetailsHtml = buildBoxDetailsHtml(t, data.boxId);
  const contactHtml = buildContactHtml(t);

  const contentHtml = `
      <p style="margin-top: 0;">${escapeHtml(t.greeting(data.recipientName))}</p>
      <p>${escapeHtml(t.addIntro)}</p>
      ${boxDetailsHtml}
      ${contactHtml}
      <p style="margin-top: 28px;">${escapeHtml(t.closing)}</p>
      <p style="font-weight: bold;">${escapeHtml(t.teamSignature)}</p>`;

  return {
    subject: t.addSubject,
    bodyHtml: wrapEmailHtml(data.language, t.addSubject, contentHtml),
    recipientEmail: data.recipientEmail,
    language: data.language,
  };
}

function buildMoveNotification(data: NotificationPreviewInput): NotificationPreview {
  const t = translations[data.language];

  const oldBox = data.oldBoxId ? BOX_CATALOG.find((b) => b.id === data.oldBoxId) : null;
  const oldBoxName = oldBox?.name ?? `#${data.oldBoxId}`;
  const oldGreenhouse = oldBox?.greenhouse ?? "Unknown";
  const newBox = BOX_CATALOG.find((b) => b.id === data.boxId);
  const newBoxName = newBox?.name ?? `#${data.boxId}`;
  const newGreenhouse = newBox?.greenhouse ?? "Unknown";

  const boxDetailsHtml = buildBoxDetailsHtml(t, data.boxId);
  const contactHtml = buildContactHtml(t);

  const contentHtml = `
      <p style="margin-top: 0;">${escapeHtml(t.greeting(data.recipientName))}</p>
      <p>${escapeHtml(t.moveIntro)}</p>
      <div style="background: #e3f2fd; border-left: 4px solid #1976d2; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
        <p style="margin: 0; color: #0d47a1;">${escapeHtml(t.moveDetail(oldBoxName, oldGreenhouse, newBoxName, newGreenhouse))}</p>
      </div>
      ${boxDetailsHtml}
      ${contactHtml}
      <p style="margin-top: 28px;">${escapeHtml(t.closing)}</p>
      <p style="font-weight: bold;">${escapeHtml(t.teamSignature)}</p>`;

  return {
    subject: t.moveSubject,
    bodyHtml: wrapEmailHtml(data.language, t.moveSubject, contentHtml),
    recipientEmail: data.recipientEmail,
    language: data.language,
  };
}

function buildRemoveNotification(data: NotificationPreviewInput): NotificationPreview {
  const t = translations[data.language];

  const box = BOX_CATALOG.find((b) => b.id === data.boxId);
  const boxName = box?.name ?? `#${data.boxId}`;
  const greenhouse = box?.greenhouse ?? "Unknown";

  const contactHtml = buildContactHtml(t);

  const contentHtml = `
      <p style="margin-top: 0;">${escapeHtml(t.greeting(data.recipientName))}</p>
      <p>${escapeHtml(t.removeIntro)}</p>
      <div style="background: #fce4ec; border-left: 4px solid #c62828; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
        <p style="margin: 0; color: #b71c1c;">${escapeHtml(t.removeDetail(boxName, greenhouse))}</p>
      </div>
      ${contactHtml}
      <p style="margin-top: 28px;">${escapeHtml(t.closing)}</p>
      <p style="font-weight: bold;">${escapeHtml(t.teamSignature)}</p>`;

  return {
    subject: t.removeSubject,
    bodyHtml: wrapEmailHtml(data.language, t.removeSubject, contentHtml),
    recipientEmail: data.recipientEmail,
    language: data.language,
  };
}

export function buildAdminNotification(data: NotificationPreviewInput): NotificationPreview {
  switch (data.action) {
    case "add":
    case "waitlist_assign":
      return buildAddNotification(data);
    case "move":
      return buildMoveNotification(data);
    case "remove":
      return buildRemoveNotification(data);
  }
}
