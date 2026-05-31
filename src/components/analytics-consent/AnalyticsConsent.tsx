import { BarChart3Icon, CheckIcon, XIcon } from "lucide-react";
import type { AnalyticsConsent as AnalyticsConsentRecord, AnalyticsConsentStatus } from "../../domain/analyticsEvents";
import { ANALYTICS_CONSENT_STORAGE_KEY, ANALYTICS_POLICY_VERSION } from "../../domain/analyticsEvents";

type AnalyticsConsentProps = {
  consent: AnalyticsConsentRecord | null;
  onChange: (consent: AnalyticsConsentRecord) => void;
};

function createConsent(status: AnalyticsConsentStatus): AnalyticsConsentRecord {
  return {
    status,
    policyVersion: ANALYTICS_POLICY_VERSION,
    updatedAt: new Date().toISOString()
  };
}

export function readStoredAnalyticsConsent(): AnalyticsConsentRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AnalyticsConsentRecord;
    return parsed.status === "accepted" || parsed.status === "rejected" ? parsed : null;
  } catch {
    return null;
  }
}

export function storeAnalyticsConsent(consent: AnalyticsConsentRecord) {
  window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, JSON.stringify(consent));
}

export function AnalyticsConsent({ consent, onChange }: AnalyticsConsentProps) {
  if (consent) {
    return (
      <button
        className="analytics-settings"
        type="button"
        aria-label="Настройки аналитики"
        onClick={() => onChange(createConsent(consent.status === "accepted" ? "rejected" : "accepted"))}
      >
        <BarChart3Icon aria-hidden="true" size={18} />
      </button>
    );
  }

  const updateConsent = (status: AnalyticsConsentStatus) => {
    const nextConsent = createConsent(status);
    storeAnalyticsConsent(nextConsent);
    onChange(nextConsent);
  };

  return (
    <section className="analytics-consent" data-testid="analytics-consent" aria-label="Согласие на аналитику">
      <p>Аналитика включается только по согласию и помогает понять, какие места и фильтры полезны.</p>
      <div className="analytics-consent__actions">
        <button type="button" onClick={() => updateConsent("accepted")}>
          <CheckIcon aria-hidden="true" size={16} />
          <span>Принять аналитику</span>
        </button>
        <button type="button" onClick={() => updateConsent("rejected")}>
          <XIcon aria-hidden="true" size={16} />
          <span>Отклонить</span>
        </button>
      </div>
    </section>
  );
}
