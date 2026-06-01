import { BarChart3Icon, CheckIcon, XIcon } from "lucide-react";
import type { AnalyticsConsent as AnalyticsConsentRecord, AnalyticsConsentStatus } from "../../domain/analyticsEvents";
import { ANALYTICS_CONSENT_STORAGE_KEY, ANALYTICS_POLICY_VERSION } from "../../domain/analyticsEvents";

type AnalyticsConsentProps = {
  consent: AnalyticsConsentRecord | null;
  isSuppressed?: boolean;
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

export function AnalyticsConsent({ consent, isSuppressed = false, onChange }: AnalyticsConsentProps) {
  if (isSuppressed) {
    return null;
  }

  if (consent) {
    return (
      <button
        className="fixed right-[max(16px,env(safe-area-inset-right))] bottom-[max(16px,env(safe-area-inset-bottom))] z-5 inline-flex h-10 min-h-9 w-10 items-center justify-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-0 text-[13px] font-bold text-[var(--color-text)] shadow-[var(--shadow-rest)] max-[700px]:right-3 max-[700px]:bottom-[104px]"
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
    <section
      className="fixed top-[max(16px,env(safe-area-inset-top))] right-[max(16px,env(safe-area-inset-right))] z-5 grid w-[min(360px,calc(100vw-32px))] gap-2.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-panel)] max-[700px]:top-[184px] max-[700px]:right-2 max-[700px]:left-2 max-[700px]:w-auto"
      data-testid="analytics-consent"
      aria-label="Согласие на аналитику"
    >
      <p className="m-0 text-[13px] leading-snug text-[var(--color-muted)]">
        Аналитика включается только по согласию и помогает понять, какие места и фильтры полезны.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-accent)] px-2.5 py-1.5 text-[13px] font-bold text-white"
          type="button"
          onClick={() => updateConsent("accepted")}
        >
          <CheckIcon aria-hidden="true" size={16} />
          <span>Принять аналитику</span>
        </button>
        <button
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[var(--color-line)] bg-white px-2.5 py-1.5 text-[13px] font-bold text-[var(--color-text)]"
          type="button"
          onClick={() => updateConsent("rejected")}
        >
          <XIcon aria-hidden="true" size={16} />
          <span>Отклонить</span>
        </button>
      </div>
    </section>
  );
}
