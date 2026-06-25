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
      ((window.ym as { a?: unknown[][] }).a ??= []).push(args);

      if (import.meta.env.DEV) {
        ((window as { ymQueue?: unknown[][] }).ymQueue ??= []).push(args);
      }
    };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://mc.yandex.ru/metrika/tag.js?id=${numericCounterId}`;
  script.dataset.kurskMetrika = "true";
  document.head.append(script);
  window.ym(numericCounterId, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
    referrer: document.referrer,
    url: location.href
  });

  return true;
}
