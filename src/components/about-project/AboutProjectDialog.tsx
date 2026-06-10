import { useEffect } from "react";
import { BarChart3Icon, CheckIcon, ExternalLinkIcon, MessageCircleIcon, SendIcon, XIcon } from "lucide-react";
import type { AnalyticsConsent as AnalyticsConsentRecord, AnalyticsConsentStatus } from "../../domain/analyticsEvents";
import { ANALYTICS_POLICY_VERSION } from "../../domain/analyticsEvents";
import { projectInfo } from "../../domain/projectInfo";
import { resolvePublicPath } from "../../services/publicPath";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";

type AboutProjectDialogProps = {
  analyticsConsent: AnalyticsConsentRecord | null;
  isOpen: boolean;
  onAnalyticsConsentChange: (consent: AnalyticsConsentRecord) => void;
  onClose: () => void;
};

function createAnalyticsConsent(status: AnalyticsConsentStatus): AnalyticsConsentRecord {
  return {
    status,
    policyVersion: ANALYTICS_POLICY_VERSION,
    updatedAt: new Date().toISOString()
  };
}

type ProjectLinkProps = {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
};

function ProjectLink({ href, icon: Icon, children }: ProjectLinkProps) {
  return (
    <a
      className="inline-flex min-h-11 items-center justify-between gap-3 rounded-xl border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-[14px] font-semibold text-[var(--color-text)] no-underline transition-[border-color,box-shadow,transform] duration-150 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-rest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-[0.99]"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <span className="inline-flex min-w-0 items-center gap-2">
        <Icon aria-hidden="true" size={17} />
        {children}
      </span>
      <ExternalLinkIcon aria-hidden="true" size={16} />
    </a>
  );
}

function getAnalyticsLabel(consent: AnalyticsConsentRecord | null) {
  if (consent?.status === "accepted") {
    return "включена";
  }

  if (consent?.status === "rejected") {
    return "отключена";
  }

  return "не выбрана";
}

export function AboutProjectDialog({ analyticsConsent, isOpen, onAnalyticsConsentChange, onClose }: AboutProjectDialogProps) {
  const isAnalyticsAccepted = analyticsConsent?.status === "accepted";
  const analyticsLabel = getAnalyticsLabel(analyticsConsent);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const nextAnalyticsStatus: AnalyticsConsentStatus = isAnalyticsAccepted ? "rejected" : "accepted";

  return (
    <div
      className="fixed inset-0 z-[60] grid items-end bg-[rgba(26,20,16,0.22)] px-0 pt-[max(72px,env(safe-area-inset-top))] backdrop-blur-[2px] min-[701px]:place-items-center min-[701px]:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="max-h-[calc(100dvh-max(72px,env(safe-area-inset-top)))] w-full overflow-y-auto rounded-t-3xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 pb-[calc(max(20px,env(safe-area-inset-bottom))+4px)] pt-3 shadow-[var(--shadow-panel)] min-[701px]:max-h-[min(720px,calc(100dvh-40px))] min-[701px]:w-[min(540px,calc(100vw-40px))] min-[701px]:rounded-2xl min-[701px]:p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-project-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-[var(--color-line-strong)] min-[701px]:hidden" aria-hidden="true" />
        <div className="flex items-start gap-3">
          <img
            className="h-12 w-12 flex-none rounded-xl object-cover"
            src={resolvePublicPath(projectInfo.logo)}
            alt="Логотип «Куда в Курске»"
            width="48"
            height="48"
          />
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">О проекте</p>
            <h2 id="about-project-title" className="m-0 text-[22px] font-bold leading-tight text-[var(--color-text)]">
              {projectInfo.title}
            </h2>
          </div>
          <IconButton type="button" aria-label="Закрыть диалог" onClick={onClose}>
            <XIcon aria-hidden="true" size={18} />
          </IconButton>
        </div>

        <p className="mt-5 mb-0 text-[14px] leading-[1.65] text-[var(--color-text-secondary)]">{projectInfo.description}</p>

        <div className="mt-5 grid gap-2">
          <ProjectLink href={projectInfo.telegramUrl} icon={SendIcon}>Telegram</ProjectLink>
          <ProjectLink href={projectInfo.feedbackUrl} icon={MessageCircleIcon}>Обратная связь</ProjectLink>
        </div>

        <section className="mt-5 border-t border-[var(--color-line)] pt-4" aria-label="Настройки аналитики">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[var(--color-surface-lower)] text-[var(--color-text)]">
              <BarChart3Icon aria-hidden="true" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="m-0 text-[15px] font-bold text-[var(--color-text)]">Аналитика</h3>
              <p className="mt-1 mb-0 text-[13px] leading-snug text-[var(--color-muted)]">
                Сейчас: {analyticsLabel}. Мы используем только обезличенные события, чтобы понимать, какие сценарии стоит улучшать.
              </p>
            </div>
          </div>
          <Button
            className="mt-3"
            type="button"
            variant={isAnalyticsAccepted ? "secondary" : "primary"}
            shape="pill"
            fullWidth
            onClick={() => onAnalyticsConsentChange(createAnalyticsConsent(nextAnalyticsStatus))}
          >
            {isAnalyticsAccepted ? <XIcon aria-hidden="true" size={16} /> : <CheckIcon aria-hidden="true" size={16} />}
            {isAnalyticsAccepted ? "Отключить аналитику" : "Включить аналитику"}
          </Button>
        </section>
      </section>
    </div>
  );
}
