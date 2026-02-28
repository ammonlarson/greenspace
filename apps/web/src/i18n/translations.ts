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
};

export const translations: Record<Language, TranslationStrings> = { da, en };
