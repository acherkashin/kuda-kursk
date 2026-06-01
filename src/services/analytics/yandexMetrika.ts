declare global {
  interface Window {
    ymQueue?: unknown[][];
  }
}

export function loadYandexMetrika(counterId: string | undefined): boolean {
  if (!counterId || typeof window === "undefined") {
    return false;
  }

  const numericCounterId = Number(counterId);

  if (!Number.isFinite(numericCounterId) || document.querySelector('script[data-kursk-metrika="true"]')) {
    return false;
  }

  window.ym =
    window.ym ??
    function ym(...args: unknown[]) {
      window.ymQueue = window.ymQueue ?? [];
      window.ymQueue.push(args);
    };

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://mc.yandex.ru/metrika/tag.js";
  script.dataset.kurskMetrika = "true";
  document.head.append(script);
  window.ym(numericCounterId, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true
  });

  return true;
}
