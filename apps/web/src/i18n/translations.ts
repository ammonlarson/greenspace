import type { Language } from "@greenspace/shared";

type TranslationStrings = Record<string, string>;

const da: TranslationStrings = {
  "common.appName": "Greenspace 2026",
  "common.language": "Sprog",
  "common.submit": "Indsend",
  "common.cancel": "Annuller",
  "common.confirm": "Bekræft",
  "common.close": "Luk",
  "common.loading": "Indlæser...",
  "common.error": "Der opstod en fejl",

  "status.preOpenTitle": "Tilmelding åbner snart",
  "status.preOpenDescription":
    "Tilmelding til plantekasser på taget af UN17 åbner på det angivne tidspunkt. Når tilmeldingen åbner, kan du vælge en plantekasse i et af de to drivhuse. Hver lejlighed kan kun have én aktiv plantekasse.",
  "status.openingDatetime": "Tilmelding åbner",
  "status.eligibility":
    "Beboere på Else Alfelts Vej 122–202 kan tilmelde sig. Én plantekasse pr. lejlighed.",
  "status.contactInfo": "Kontakt",

  "greenhouse.title": "Drivhuse",
  "greenhouse.totalBoxes": "Plantekasser i alt",
  "greenhouse.available": "Ledige",
  "greenhouse.occupied": "Optaget",
  "greenhouse.reserved": "Reserveret",

  "map.viewMap": "Se kort",
  "map.back": "Tilbage til drivhuse",
  "map.legend": "Forklaring",
  "map.state.available": "Ledig",
  "map.state.occupied": "Optaget",
  "map.state.reserved": "Reserveret",

  "waitlist.title": "Venteliste",
  "waitlist.description":
    "Alle plantekasser er i øjeblikket optaget. Du kan skrive dig op på ventelisten, og vi kontakter dig, når en plantekasse bliver ledig.",
  "waitlist.joinButton": "Skriv dig op på ventelisten",
  "waitlist.positionLabel": "Din plads på ventelisten",
  "waitlist.alreadyOnWaitlist":
    "Din lejlighed er allerede på ventelisten. Din plads i køen er bevaret.",
  "waitlist.success": "Du er nu på ventelisten!",

  "audit.title": "Hændelseslog",
  "audit.timestamp": "Tidsstempel",
  "audit.action": "Handling",
  "audit.actor": "Aktør",
  "audit.entity": "Enhed",
  "audit.details": "Detaljer",
  "audit.noEvents": "Ingen hændelser fundet",
  "audit.loadMore": "Indlæs flere",
  "audit.filterByAction": "Filtrer efter handling",
  "audit.filterByActor": "Filtrer efter aktørtype",
  "audit.allActions": "Alle handlinger",
  "audit.allActors": "Alle aktørtyper",

  "registration.formTitle": "Tilmeld plantekasse",
  "registration.nameLabel": "Navn",
  "registration.emailLabel": "E-mail",
  "registration.streetLabel": "Gade",
  "registration.houseNumberLabel": "Husnummer",
  "registration.floorLabel": "Etage",
  "registration.doorLabel": "Dør",
  "registration.boxLabel": "Plantekasse",
  "registration.switchWarning":
    "Din lejlighed har allerede en aktiv tilmelding. Hvis du fortsætter, skifter du til den nye kasse, og din nuværende kasse frigives.",
  "registration.switchConfirm": "Bekræft skifte",
  "registration.success": "Du er nu tilmeldt!",
  "registration.unregisterInfo":
    "Du kan ikke selv afmelde dig. Kontakt arrangørerne via e-mail, hvis du ikke længere ønsker din plantekasse.",

  "validation.emailRequired": "E-mail er påkrævet",
  "validation.emailInvalid": "Ugyldig e-mailadresse",
  "validation.nameRequired": "Navn er påkrævet",
  "validation.streetInvalid": "Gaden skal være Else Alfelts Vej",
  "validation.houseNumberInvalid": "Husnummer skal være mellem 122 og 202",
  "validation.floorDoorRequired": "Etage og dør er påkrævet for denne adresse",
  "validation.boxIdInvalid": "Ugyldig plantekasse",

  "consent.title": "Databeskyttelse og samtykke",
  "consent.dataCollected":
    "Vi indsamler dit navn, din e-mailadresse, din lejlighedsadresse samt tilmeldings- og ventelisteoplysninger.",
  "consent.purpose":
    "Dine oplysninger bruges udelukkende til administration af plantekassesæsonen 2026 og kommunikation om ændringer i din tilmelding.",
  "consent.retention":
    "Driftsdata og revisionshistorik opbevares med henblik på administrativ sporbarhed.",
  "consent.contact":
    "Har du spørgsmål om dine data, kan du kontakte arrangørerne.",
  "consent.acknowledgment":
    "Jeg har læst og accepterer ovenstående vilkår for dataindsamling og brug.",

  "policy.oneApartmentRule":
    "Hver lejlighed kan kun have én aktiv plantekasse. Hvis din lejlighed allerede har en tilmelding, vil en ny tilmelding erstatte den eksisterende.",
  "policy.noSelfUnregister":
    "Du kan ikke selv afmelde dig via systemet. Kontakt arrangørerne via e-mail, hvis du ikke længere ønsker din plantekasse.",

  "email.confirmationSubject":
    "Bekræftelse af din plantekasse-registrering – Greenspace 2026",
  "email.switchNote":
    "Din tidligere plantekasse er blevet frigivet, og din registrering er flyttet til den nye kasse.",
  "email.careGuidelines":
    "Vand regelmæssigt, brug økologisk jord, hold din kasse ren, respektér naboernes planter, og høst kun fra din egen kasse.",

  "admin.link": "Admin",
  "admin.login": "Log ind",
  "admin.email": "E-mail",
  "admin.password": "Adgangskode",
  "admin.loginFailed": "Login mislykkedes",
  "admin.backToPublic": "Tilbage til offentlig side",
  "admin.openingTimeTitle": "Åbningstidspunkt for tilmelding",
  "admin.openingTimeDescription": "Angiv hvornår tilmeldingen åbner",
  "admin.currentValue": "Nuværende",
  "admin.lastUpdated": "Sidst opdateret",
  "admin.newOpeningTime": "Nyt åbningstidspunkt",
  "admin.save": "Gem",
  "admin.settingsSaved": "Indstilling gemt",
};

const en: TranslationStrings = {
  "common.appName": "Greenspace 2026",
  "common.language": "Language",
  "common.submit": "Submit",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.close": "Close",
  "common.loading": "Loading...",
  "common.error": "An error occurred",

  "status.preOpenTitle": "Registration opens soon",
  "status.preOpenDescription":
    "Registration for rooftop planter boxes at UN17 opens at the time shown below. Once registration opens, you can choose a planter box in one of the two greenhouses. Each apartment may only have one active planter box.",
  "status.openingDatetime": "Registration opens",
  "status.eligibility":
    "Residents of Else Alfelts Vej 122–202 are eligible. One planter box per apartment.",
  "status.contactInfo": "Contact",

  "greenhouse.title": "Greenhouses",
  "greenhouse.totalBoxes": "Total boxes",
  "greenhouse.available": "Available",
  "greenhouse.occupied": "Occupied",
  "greenhouse.reserved": "Reserved",

  "map.viewMap": "View map",
  "map.back": "Back to greenhouses",
  "map.legend": "Legend",
  "map.state.available": "Available",
  "map.state.occupied": "Occupied",
  "map.state.reserved": "Reserved",

  "waitlist.title": "Waitlist",
  "waitlist.description":
    "All planter boxes are currently taken. You can join the waitlist and we will contact you when a box becomes available.",
  "waitlist.joinButton": "Join the waitlist",
  "waitlist.positionLabel": "Your position on the waitlist",
  "waitlist.alreadyOnWaitlist":
    "Your apartment is already on the waitlist. Your position in the queue has been preserved.",
  "waitlist.success": "You are now on the waitlist!",

  "audit.title": "Audit Log",
  "audit.timestamp": "Timestamp",
  "audit.action": "Action",
  "audit.actor": "Actor",
  "audit.entity": "Entity",
  "audit.details": "Details",
  "audit.noEvents": "No events found",
  "audit.loadMore": "Load more",
  "audit.filterByAction": "Filter by action",
  "audit.filterByActor": "Filter by actor type",
  "audit.allActions": "All actions",
  "audit.allActors": "All actor types",

  "registration.formTitle": "Register for a planter box",
  "registration.nameLabel": "Name",
  "registration.emailLabel": "Email",
  "registration.streetLabel": "Street",
  "registration.houseNumberLabel": "House number",
  "registration.floorLabel": "Floor",
  "registration.doorLabel": "Door",
  "registration.boxLabel": "Planter box",
  "registration.switchWarning":
    "Your apartment already has an active registration. If you continue, you will switch to the new box and your current box will be released.",
  "registration.switchConfirm": "Confirm switch",
  "registration.success": "You are now registered!",
  "registration.unregisterInfo":
    "You cannot unregister yourself. Contact the organizers by email if you no longer want your planter box.",

  "validation.emailRequired": "Email is required",
  "validation.emailInvalid": "Invalid email address",
  "validation.nameRequired": "Name is required",
  "validation.streetInvalid": "Street must be Else Alfelts Vej",
  "validation.houseNumberInvalid": "House number must be between 122 and 202",
  "validation.floorDoorRequired": "Floor and door are required for this address",
  "validation.boxIdInvalid": "Invalid planter box",

  "consent.title": "Data protection and consent",
  "consent.dataCollected":
    "We collect your name, email address, apartment address, and registration and waitlist records.",
  "consent.purpose":
    "Your information is used solely for administration of the 2026 planter box season and communication regarding changes to your registration.",
  "consent.retention":
    "Operational data and audit history are retained for administrative traceability.",
  "consent.contact":
    "If you have questions about your data, please contact the organizers.",
  "consent.acknowledgment":
    "I have read and accept the above terms for data collection and use.",

  "policy.oneApartmentRule":
    "Each apartment may only have one active planter box. If your apartment already has a registration, a new registration will replace the existing one.",
  "policy.noSelfUnregister":
    "You cannot unregister yourself through the system. Contact the organizers by email if you no longer want your planter box.",

  "email.confirmationSubject":
    "Confirmation of your planter box registration – Greenspace 2026",
  "email.switchNote":
    "Your previous planter box has been released and your registration has been moved to the new box.",
  "email.careGuidelines":
    "Water regularly, use organic soil, keep your box tidy, respect neighbors' plants, and only harvest from your own box.",

  "admin.link": "Admin",
  "admin.login": "Log in",
  "admin.email": "Email",
  "admin.password": "Password",
  "admin.loginFailed": "Login failed",
  "admin.backToPublic": "Back to public site",
  "admin.openingTimeTitle": "Registration opening time",
  "admin.openingTimeDescription": "Set when registration opens",
  "admin.currentValue": "Current",
  "admin.lastUpdated": "Last updated",
  "admin.newOpeningTime": "New opening time",
  "admin.save": "Save",
  "admin.settingsSaved": "Setting saved",
};

export const translations: Record<Language, TranslationStrings> = { da, en };
