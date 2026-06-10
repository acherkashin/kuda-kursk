import { CheckIcon, XIcon } from "lucide-react";
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
    return null;
  }

  const updateConsent = (status: AnalyticsConsentStatus) => {
    const nextConsent = createConsent(status);
    storeAnalyticsConsent(nextConsent);
    onChange(nextConsent);
  };

  return (
    <section
      className="fixed right-[calc(max(16px,env(safe-area-inset-right))+56px)] bottom-[max(16px,env(safe-area-inset-bottom))] z-5 grid w-[min(380px,calc(100vw-96px))] gap-2.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-panel)] max-[700px]:right-[max(12px,env(safe-area-inset-right))] max-[700px]:bottom-[max(12px,env(safe-area-inset-bottom))] max-[700px]:left-[max(12px,env(safe-area-inset-left))] max-[700px]:w-auto max-[700px]:gap-2 max-[700px]:rounded-2xl max-[700px]:p-3"
      data-testid="analytics-consent"
      aria-label="Согласие на аналитику"
    >
      <p className="m-0 text-[13px] leading-snug text-[var(--color-text-secondary)]">
        Мы используем cookies и обезличенную аналитику, чтобы улучшать приложение.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-3 py-1.5 text-[13px] font-semibold tracking-[-0.01em] text-white transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-raised)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          type="button"
          onClick={() => updateConsent("accepted")}
        >
          <CheckIcon aria-hidden="true" size={16} />
          <span>Принять аналитику</span>
        </button>
        <button
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-3 py-1.5 text-[13px] font-semibold tracking-[-0.01em] text-[var(--color-text)] transition-colors duration-150 hover:border-[var(--color-line-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
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
