import { DownloadIcon, ShareIcon, XIcon } from "lucide-react";
import { useState } from "react";
import type { PwaInstallMode, PwaInstallPlatform } from "../../services/pwa/usePwaInstallPrompt";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";

type PwaInstallNoticeProps = {
  installMode: PwaInstallMode;
  platform: PwaInstallPlatform;
  onDismiss: () => void;
  onInstallClick: () => void;
};

function IosInstallSteps() {
  return (
    <p className="m-0 rounded-lg bg-[var(--color-surface-lower)] px-2.5 py-2 text-[12px] leading-snug text-[var(--color-text-secondary)]">
      Safari: «Поделиться» → «На экран “Домой”» → «Добавить».
    </p>
  );
}

export function PwaInstallNotice({ installMode, onDismiss, onInstallClick, platform }: PwaInstallNoticeProps) {
  const [isInstructionVisible, setIsInstructionVisible] = useState(false);
  const isIosManual = installMode === "manual-ios";
  const InstallIcon = platform === "ios" ? ShareIcon : DownloadIcon;
  const title = isIosManual ? "Добавьте карту на экран" : "Установите карту";
  const description = isIosManual
    ? "Откроется как отдельное приложение."
    : "Иконка появится на экране телефона.";

  const handleClick = () => {
    onInstallClick();

    if (isIosManual) {
      setIsInstructionVisible(true);
    }
  };

  if (installMode === "unavailable") {
    return null;
  }

  return (
    <section
      className="fixed right-[max(12px,env(safe-area-inset-right))] bottom-[max(12px,env(safe-area-inset-bottom))] left-[max(12px,env(safe-area-inset-left))] z-5 grid gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-2.5 shadow-[var(--shadow-rest)] min-[701px]:hidden"
      aria-label="Установка приложения"
      data-testid="pwa-install-notice"
    >
      <div className="flex items-start gap-2.5">
        <div className="min-w-0 flex-1">
          <h2 className="m-0 inline-flex items-center gap-1.5 text-[13px] font-semibold leading-snug text-[var(--color-text)]">
            <InstallIcon aria-hidden="true" size={15} />
            {title}
          </h2>
          <p className="mt-0.5 mb-0 text-[12px] leading-snug text-[var(--color-text-secondary)]">{description}</p>
        </div>
        <IconButton size="sm" type="button" aria-label="Скрыть подсказку установки" onClick={onDismiss}>
          <XIcon aria-hidden="true" size={17} />
        </IconButton>
      </div>

      {isInstructionVisible ? <IosInstallSteps /> : null}

      <Button type="button" variant="accent-soft" size="sm" shape="pill" fullWidth onClick={handleClick}>
        {isIosManual ? <ShareIcon aria-hidden="true" size={16} /> : <DownloadIcon aria-hidden="true" size={16} />}
        {isIosManual ? "Показать шаги" : "Установить"}
      </Button>
    </section>
  );
}
