import { afterEach, describe, expect, it } from "vitest";
import { loadYandexMetrika } from "../../src/services/analytics/yandexMetrika";

declare global {
  interface Window {
    ym?: ((...args: unknown[]) => void) & { a?: unknown[][] };
  }
}

describe("loadYandexMetrika", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    delete window.ym;
  });

  it("initializes Yandex Metrika with the options object as the third argument", () => {
    expect(loadYandexMetrika("123456")).toBe(true);

    expect(document.querySelector('script[data-kursk-metrika="true"]')).not.toBeNull();
    expect(window.ym?.a?.[0]).toEqual([
      123456,
      "init",
      {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
        referrer: document.referrer,
        url: location.href
      }
    ]);
  });
});
