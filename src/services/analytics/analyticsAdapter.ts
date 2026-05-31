import type { AnalyticsEvent } from "../../domain/analyticsEvents";

type YandexMetrika = (counterId: number, method: "reachGoal" | "hit", target: string, params?: unknown) => void;

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

export type AnalyticsAdapter = {
  track: (event: AnalyticsEvent) => void;
  hit: (route: string) => void;
};

export function createAnalyticsAdapter(counterId?: string, enabled = false): AnalyticsAdapter {
  const numericCounterId = counterId ? Number(counterId) : NaN;
  const canSend = enabled && Number.isFinite(numericCounterId);

  return {
    track(event) {
      if (!canSend || typeof window === "undefined" || typeof window.ym !== "function") {
        return;
      }

      (window.ym as YandexMetrika)(numericCounterId, "reachGoal", event.name, event.params);
    },
    hit(route) {
      if (!canSend || typeof window === "undefined" || typeof window.ym !== "function") {
        return;
      }

      (window.ym as YandexMetrika)(numericCounterId, "hit", route);
    }
  };
}
