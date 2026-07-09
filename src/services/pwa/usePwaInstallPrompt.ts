import { useCallback, useEffect, useMemo, useState } from "react";

export type PwaInstallPlatform = "android" | "ios" | "other";
export type PwaInstallMode = "native-prompt" | "manual-ios" | "unavailable";
export type PwaInstallPromptOutcome = "accepted" | "dismissed";

export const PWA_INSTALL_DISMISS_STORAGE_KEY = "kursk-map:pwa-install-dismissed:v1";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: PwaInstallPromptOutcome; platform: string }>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

type UsePwaInstallPromptOptions = {
  onAppInstalled?: (platform: PwaInstallPlatform) => void;
};

function readDismissedState() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(PWA_INSTALL_DISMISS_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function storeDismissedState(isDismissed: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (isDismissed) {
      window.localStorage.setItem(PWA_INSTALL_DISMISS_STORAGE_KEY, "true");
      return;
    }

    window.localStorage.removeItem(PWA_INSTALL_DISMISS_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private modes or restrictive browser settings.
  }
}

function getPlatform(): PwaInstallPlatform {
  if (typeof navigator === "undefined") {
    return "other";
  }

  const userAgent = navigator.userAgent;
  const isTouchMac = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  if (/Android/i.test(userAgent)) {
    return "android";
  }

  if (/iPad|iPhone|iPod/i.test(userAgent) || isTouchMac) {
    return "ios";
  }

  return "other";
}

function getIsStandalone() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as NavigatorWithStandalone).standalone === true
  );
}

function getIsMobileViewport() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(max-width: 700px)").matches;
}

export function usePwaInstallPrompt({ onAppInstalled }: UsePwaInstallPromptOptions = {}) {
  const [platform, setPlatform] = useState<PwaInstallPlatform>(getPlatform);
  const [isStandalone, setIsStandalone] = useState(getIsStandalone);
  const [isMobileViewport, setIsMobileViewport] = useState(getIsMobileViewport);
  const [isDismissed, setIsDismissed] = useState(readDismissedState);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setPlatform(getPlatform());
  }, []);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 700px)");
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    const handleViewportChange = () => {
      setIsMobileViewport(mobileQuery.matches);
      setIsStandalone(getIsStandalone());
    };

    handleViewportChange();
    mobileQuery.addEventListener("change", handleViewportChange);
    standaloneQuery.addEventListener("change", handleViewportChange);

    return () => {
      mobileQuery.removeEventListener("change", handleViewportChange);
      standaloneQuery.removeEventListener("change", handleViewportChange);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const handleAppInstalled = () => {
      setInstallPromptEvent(null);
      setIsStandalone(true);
      setIsDismissed(true);
      storeDismissedState(true);
      onAppInstalled?.(platform);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [onAppInstalled, platform]);

  const installMode: PwaInstallMode = useMemo(() => {
    if (isStandalone) {
      return "unavailable";
    }

    if (installPromptEvent) {
      return "native-prompt";
    }

    if (platform === "ios") {
      return "manual-ios";
    }

    return "unavailable";
  }, [installPromptEvent, isStandalone, platform]);

  const dismissFloatingNotice = useCallback(() => {
    setIsDismissed(true);
    storeDismissedState(true);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPromptEvent) {
      return null;
    }

    await installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;

    setInstallPromptEvent(null);
    setIsDismissed(true);
    storeDismissedState(true);

    return choice.outcome;
  }, [installPromptEvent]);

  return {
    platform,
    installMode,
    isStandalone,
    isMobileViewport,
    canPrompt: installPromptEvent !== null,
    shouldShowFloatingNotice:
      isMobileViewport && !isDismissed && !isStandalone && (installPromptEvent !== null || installMode === "manual-ios"),
    dismissFloatingNotice,
    promptInstall,
  };
}
