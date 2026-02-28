import type { Language } from "./enums.js";

/**
 * i18n key contracts for Danish and English.
 * Keys are organized by domain area.
 * Actual translated strings live in the web app; this contract
 * ensures both apps reference the same set of keys.
 */
export const I18N_KEYS = {
  common: {
    appName: "common.appName",
    language: "common.language",
    submit: "common.submit",
    cancel: "common.cancel",
    confirm: "common.confirm",
    close: "common.close",
    loading: "common.loading",
    error: "common.error",
  },
  status: {
    preOpenTitle: "status.preOpenTitle",
    preOpenDescription: "status.preOpenDescription",
    openingDatetime: "status.openingDatetime",
    eligibility: "status.eligibility",
    contactInfo: "status.contactInfo",
  },
  greenhouse: {
    title: "greenhouse.title",
    totalBoxes: "greenhouse.totalBoxes",
    available: "greenhouse.available",
    occupied: "greenhouse.occupied",
    reserved: "greenhouse.reserved",
  },
  registration: {
    formTitle: "registration.formTitle",
    nameLabel: "registration.nameLabel",
    emailLabel: "registration.emailLabel",
    streetLabel: "registration.streetLabel",
    houseNumberLabel: "registration.houseNumberLabel",
    floorLabel: "registration.floorLabel",
    doorLabel: "registration.doorLabel",
    boxLabel: "registration.boxLabel",
    switchWarning: "registration.switchWarning",
    switchConfirm: "registration.switchConfirm",
    success: "registration.success",
    unregisterInfo: "registration.unregisterInfo",
  },
  waitlist: {
    title: "waitlist.title",
    joinButton: "waitlist.joinButton",
    positionLabel: "waitlist.positionLabel",
    alreadyOnWaitlist: "waitlist.alreadyOnWaitlist",
    success: "waitlist.success",
  },
  validation: {
    emailRequired: "validation.emailRequired",
    emailInvalid: "validation.emailInvalid",
    nameRequired: "validation.nameRequired",
    streetInvalid: "validation.streetInvalid",
    houseNumberInvalid: "validation.houseNumberInvalid",
    floorDoorRequired: "validation.floorDoorRequired",
    boxIdInvalid: "validation.boxIdInvalid",
  },
  consent: {
    title: "consent.title",
    dataCollected: "consent.dataCollected",
    purpose: "consent.purpose",
    retention: "consent.retention",
    contact: "consent.contact",
  },
  email: {
    confirmationSubject: "email.confirmationSubject",
    switchNote: "email.switchNote",
    careGuidelines: "email.careGuidelines",
  },
} as const;

export type I18nKey = string;

/**
 * Default display labels for languages.
 * Used in the language selector UI.
 */
export const LANGUAGE_LABELS: Record<Language, string> = {
  da: "Dansk",
  en: "English",
};
