const envAnalyticsConsentUiEnabled = import.meta.env.VITE_ANALYTICS_CONSENT_UI_ENABLED;

export const DEFAULT_ANALYTICS_CONSENT_UI_ENABLED = false;
export const ANALYTICS_OPTOUT_SEARCH_PARAM = "analytics";
export const ANALYTICS_OPTOUT_SEARCH_VALUE = "off";

const ANALYTICS_OPTOUT_SESSION_STORAGE_KEY = "kursk-map:analytics-optout:session:v1";

let analyticsSessionOptOutActive = false;

export const ANALYTICS_CONSENT_UI_ENABLED =
  envAnalyticsConsentUiEnabled === undefined
    ? DEFAULT_ANALYTICS_CONSENT_UI_ENABLED
    : envAnalyticsConsentUiEnabled === "true";

export function initializeAnalyticsSessionOptOut() {
  if (typeof window === "undefined") {
    return;
  }

  const currentUrl = new URL(window.location.href);
  const isRequested = currentUrl.searchParams
    .getAll(ANALYTICS_OPTOUT_SEARCH_PARAM)
    .includes(ANALYTICS_OPTOUT_SEARCH_VALUE);
  let isStored = false;

  try {
    isStored = window.sessionStorage.getItem(ANALYTICS_OPTOUT_SESSION_STORAGE_KEY) === "true";

    if (isRequested) {
      window.sessionStorage.setItem(ANALYTICS_OPTOUT_SESSION_STORAGE_KEY, "true");
    }
  } catch {
    // The URL still disables analytics for the current page when sessionStorage is unavailable.
  }

  analyticsSessionOptOutActive = isRequested || isStored;

  if (isRequested) {
    currentUrl.searchParams.delete(ANALYTICS_OPTOUT_SEARCH_PARAM);
    window.history.replaceState(
      window.history.state,
      "",
      `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`
    );
  }
}

export function isAnalyticsSessionOptOutActive() {
  return analyticsSessionOptOutActive;
}
