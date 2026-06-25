const envAnalyticsConsentUiEnabled = import.meta.env.VITE_ANALYTICS_CONSENT_UI_ENABLED;

export const DEFAULT_ANALYTICS_CONSENT_UI_ENABLED = false;

export const ANALYTICS_CONSENT_UI_ENABLED =
  envAnalyticsConsentUiEnabled === undefined
    ? DEFAULT_ANALYTICS_CONSENT_UI_ENABLED
    : envAnalyticsConsentUiEnabled === "true";
