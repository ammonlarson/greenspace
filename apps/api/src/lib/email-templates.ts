import {
  BOX_CATALOG,
  EMAIL_FROM,
  EMAIL_REPLY_TO,
  ORGANIZER_CONTACTS,
  WHATSAPP_GROUP_URL,
} from "@greenspace/shared";
import type { Language } from "@greenspace/shared";

export interface ConfirmationEmailData {
  recipientName: string;
  recipientEmail: string;
  language: Language;
  boxId: number;
  switchedFromBoxId?: number;
}

interface EmailContent {
  subject: string;
  bodyHtml: string;
  from: string;
  replyTo: string;
}

const translations = {
  da: {
    subject: "Bekræftelse af din plantekasse-registrering – Greenspace 2026",
    greeting: (name: string) => `Kære ${name},`,
    confirmationIntro:
      "Tak for din tilmelding til Greenspace 2026! Din registrering er nu bekræftet.",
    switchNote: (oldBoxName: string, oldGreenhouse: string) =>
      `Bemærk: Din tidligere plantekasse "${oldBoxName}" i ${oldGreenhouse} er blevet frigivet, og din registrering er flyttet til den nye kasse nedenfor.`,
    boxDetailsTitle: "Din plantekasse",
    boxLabel: "Kasse",
    greenhouseLabel: "Drivhus",
    boxNameLabel: "Navn",
    locationTitle: "Placering",
    kronenLocation:
      "Kronen-drivhuset ligger på taget af Else Alfelts Vej bygning, ved den nordlige indgang.",
    soenLocation:
      "Søen-drivhuset ligger på taget af Else Alfelts Vej bygning, ved den sydlige indgang tæt på søen.",
    mapTitle: "Plantekasse-kort",
    kronenMapDesc:
      "Kronen-drivhuset: Kasserne 1-14 er arrangeret i to rækker. Kasserne 1-7 langs den nordlige væg, kasserne 8-14 langs den sydlige væg.",
    soenMapDesc:
      "Søen-drivhuset: Kasserne 15-29 er arrangeret i to rækker. Kasserne 15-22 langs den vestlige væg, kasserne 23-29 langs den østlige væg.",
    careTitle: "Retningslinjer for pasning",
    careGuidelines: [
      "Vand dine planter regelmæssigt, især i varme perioder.",
      "Brug kun økologisk jord og gødning.",
      "Hold din kasse ren og ryddelig.",
      "Respektér de fælles områder og dine naboers planter.",
      "Høst kun fra din egen plantekasse.",
    ],
    whatsappTitle: "Fællesskab",
    whatsappText:
      "Deltag i vores WhatsApp-gruppe for at holde dig opdateret og forbinde med andre grønne naboer:",
    whatsappLink: "Deltag i WhatsApp-gruppen",
    contactTitle: "Kontakt",
    contactText: "Hvis du har spørgsmål, er du velkommen til at kontakte os:",
    closing: "Vi glæder os til at se dig i drivhuset!",
    teamSignature: "Greenspace-teamet",
  },
  en: {
    subject:
      "Confirmation of your planter box registration – Greenspace 2026",
    greeting: (name: string) => `Dear ${name},`,
    confirmationIntro:
      "Thank you for signing up for Greenspace 2026! Your registration is now confirmed.",
    switchNote: (oldBoxName: string, oldGreenhouse: string) =>
      `Note: Your previous planter box "${oldBoxName}" in ${oldGreenhouse} has been released, and your registration has been moved to the new box below.`,
    boxDetailsTitle: "Your planter box",
    boxLabel: "Box",
    greenhouseLabel: "Greenhouse",
    boxNameLabel: "Name",
    locationTitle: "Location",
    kronenLocation:
      "The Kronen greenhouse is located on the rooftop of the Else Alfelts Vej building, at the northern entrance.",
    soenLocation:
      "The Søen greenhouse is located on the rooftop of the Else Alfelts Vej building, at the southern entrance near the lake.",
    mapTitle: "Planter box map",
    kronenMapDesc:
      "Kronen greenhouse: Boxes 1-14 are arranged in two rows. Boxes 1-7 along the north wall, boxes 8-14 along the south wall.",
    soenMapDesc:
      "Søen greenhouse: Boxes 15-29 are arranged in two rows. Boxes 15-22 along the west wall, boxes 23-29 along the east wall.",
    careTitle: "Care guidelines",
    careGuidelines: [
      "Water your plants regularly, especially during warm periods.",
      "Use only organic soil and fertilizer.",
      "Keep your box clean and tidy.",
      "Respect the common areas and your neighbors' plants.",
      "Only harvest from your own planter box.",
    ],
    whatsappTitle: "Community",
    whatsappText:
      "Join our WhatsApp group to stay updated and connect with fellow green neighbors:",
    whatsappLink: "Join the WhatsApp group",
    contactTitle: "Contact",
    contactText:
      "If you have any questions, feel free to reach out to us:",
    closing: "We look forward to seeing you in the greenhouse!",
    teamSignature: "The Greenspace Team",
  },
} as const;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildGreenhouseMap(greenhouse: string, boxId: number): string {
  if (greenhouse === "Kronen") {
    const northRow = Array.from({ length: 7 }, (_, i) => i + 1);
    const southRow = Array.from({ length: 7 }, (_, i) => i + 8);
    return `
      <table style="border-collapse: collapse; margin: 0 auto; font-size: 13px;">
        <tr>
          <td style="padding: 4px 8px; color: #888; font-size: 11px;">N &uarr;</td>
          ${northRow.map((id) => `<td style="border: 2px solid ${id === boxId ? "#2e7d32" : "#ccc"}; padding: 6px 10px; text-align: center; background: ${id === boxId ? "#e8f5e9" : "#fafafa"}; font-weight: ${id === boxId ? "bold" : "normal"};">${id}</td>`).join("")}
        </tr>
        <tr>
          <td style="padding: 4px 8px; color: #888; font-size: 11px;">S &darr;</td>
          ${southRow.map((id) => `<td style="border: 2px solid ${id === boxId ? "#2e7d32" : "#ccc"}; padding: 6px 10px; text-align: center; background: ${id === boxId ? "#e8f5e9" : "#fafafa"}; font-weight: ${id === boxId ? "bold" : "normal"};">${id}</td>`).join("")}
        </tr>
      </table>`;
  }

  const westRow = Array.from({ length: 8 }, (_, i) => i + 15);
  const eastRow = Array.from({ length: 7 }, (_, i) => i + 23);
  return `
    <table style="border-collapse: collapse; margin: 0 auto; font-size: 13px;">
      <tr>
        <td style="padding: 4px 8px; color: #888; font-size: 11px;">W &larr;</td>
        ${westRow.map((id) => `<td style="border: 2px solid ${id === boxId ? "#2e7d32" : "#ccc"}; padding: 6px 10px; text-align: center; background: ${id === boxId ? "#e8f5e9" : "#fafafa"}; font-weight: ${id === boxId ? "bold" : "normal"};">${id}</td>`).join("")}
      </tr>
      <tr>
        <td style="padding: 4px 8px; color: #888; font-size: 11px;">E &rarr;</td>
        ${eastRow.map((id) => `<td style="border: 2px solid ${id === boxId ? "#2e7d32" : "#ccc"}; padding: 6px 10px; text-align: center; background: ${id === boxId ? "#e8f5e9" : "#fafafa"}; font-weight: ${id === boxId ? "bold" : "normal"};">${id}</td>`).join("")}
        <td></td>
      </tr>
    </table>`;
}

export function buildConfirmationEmail(data: ConfirmationEmailData): EmailContent {
  const t = translations[data.language];
  const box = BOX_CATALOG.find((b) => b.id === data.boxId);
  const boxName = box?.name ?? `#${data.boxId}`;
  const greenhouse = box?.greenhouse ?? "Unknown";

  const switchedBox = data.switchedFromBoxId
    ? BOX_CATALOG.find((b) => b.id === data.switchedFromBoxId)
    : null;

  const locationDesc = greenhouse === "Kronen" ? t.kronenLocation : t.soenLocation;
  const mapDesc = greenhouse === "Kronen" ? t.kronenMapDesc : t.soenMapDesc;
  const mapHtml = buildGreenhouseMap(greenhouse, data.boxId);

  const switchHtml = switchedBox
    ? `<div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
        <p style="margin: 0; color: #e65100;">${escapeHtml(t.switchNote(switchedBox.name, switchedBox.greenhouse))}</p>
      </div>`
    : "";

  const careListHtml = t.careGuidelines
    .map((g) => `<li style="margin-bottom: 6px;">${escapeHtml(g)}</li>`)
    .join("");

  const contactListHtml = ORGANIZER_CONTACTS.map(
    (c) =>
      `<li>${escapeHtml(c.name)} – <a href="mailto:${escapeHtml(c.email)}" style="color: #2e7d32;">${escapeHtml(c.email)}</a></li>`,
  ).join("");

  const bodyHtml = `<!DOCTYPE html>
<html lang="${data.language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(t.subject)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; background: #fff;">
    <div style="background: #2e7d32; padding: 24px 32px;">
      <h1 style="margin: 0; color: #fff; font-size: 22px;">Greenspace 2026</h1>
    </div>

    <div style="padding: 32px;">
      <p style="margin-top: 0;">${escapeHtml(t.greeting(data.recipientName))}</p>
      <p>${escapeHtml(t.confirmationIntro)}</p>

      ${switchHtml}

      <h2 style="color: #2e7d32; font-size: 18px; border-bottom: 2px solid #e8f5e9; padding-bottom: 8px;">${escapeHtml(t.boxDetailsTitle)}</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 12px; background: #f5f5f5; font-weight: bold; width: 40%;">${escapeHtml(t.boxLabel)}</td>
          <td style="padding: 8px 12px;">#${data.boxId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; background: #f5f5f5; font-weight: bold;">${escapeHtml(t.boxNameLabel)}</td>
          <td style="padding: 8px 12px;">${escapeHtml(boxName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; background: #f5f5f5; font-weight: bold;">${escapeHtml(t.greenhouseLabel)}</td>
          <td style="padding: 8px 12px;">${escapeHtml(greenhouse)}</td>
        </tr>
      </table>

      <h2 style="color: #2e7d32; font-size: 18px; border-bottom: 2px solid #e8f5e9; padding-bottom: 8px;">${escapeHtml(t.locationTitle)}</h2>
      <p>${escapeHtml(locationDesc)}</p>

      <h2 style="color: #2e7d32; font-size: 18px; border-bottom: 2px solid #e8f5e9; padding-bottom: 8px;">${escapeHtml(t.mapTitle)}</h2>
      <p style="font-size: 13px; color: #666;">${escapeHtml(mapDesc)}</p>
      ${mapHtml}

      <h2 style="color: #2e7d32; font-size: 18px; border-bottom: 2px solid #e8f5e9; padding-bottom: 8px; margin-top: 28px;">${escapeHtml(t.careTitle)}</h2>
      <ul style="padding-left: 20px; line-height: 1.6;">
        ${careListHtml}
      </ul>

      <h2 style="color: #2e7d32; font-size: 18px; border-bottom: 2px solid #e8f5e9; padding-bottom: 8px;">${escapeHtml(t.whatsappTitle)}</h2>
      <p>${escapeHtml(t.whatsappText)}</p>
      <p><a href="${WHATSAPP_GROUP_URL}" style="display: inline-block; background: #25d366; color: #fff; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-weight: bold;">${escapeHtml(t.whatsappLink)}</a></p>

      <h2 style="color: #2e7d32; font-size: 18px; border-bottom: 2px solid #e8f5e9; padding-bottom: 8px;">${escapeHtml(t.contactTitle)}</h2>
      <p>${escapeHtml(t.contactText)}</p>
      <ul style="padding-left: 20px; line-height: 1.8;">
        ${contactListHtml}
      </ul>

      <p style="margin-top: 28px;">${escapeHtml(t.closing)}</p>
      <p style="font-weight: bold;">${escapeHtml(t.teamSignature)}</p>
    </div>

    <div style="background: #f5f5f5; padding: 16px 32px; font-size: 12px; color: #888; text-align: center;">
      <p style="margin: 0;">Greenspace 2026 &ndash; UN17 Hub</p>
    </div>
  </div>
</body>
</html>`;

  return {
    subject: t.subject,
    bodyHtml,
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
  };
}
