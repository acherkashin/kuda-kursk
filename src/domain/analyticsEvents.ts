export type AnalyticsConsentStatus = "accepted" | "rejected";
export type PwaInstallAnalyticsPlatform = "android" | "ios" | "other";
export type PwaInstallAnalyticsSource = "floating_notice" | "about_dialog";

export type AnalyticsConsent = {
  status: AnalyticsConsentStatus;
  policyVersion: string;
  updatedAt: string;
};

export type AnalyticsEvent =
  | { name: "app_open"; params: { route: string; mapSlug?: string } }
  | { name: "search_used"; params: { queryLength: number; hasResults: boolean; resultCount: number } }
  | { name: "marker_selected"; params: { placeId: string | number; source: "map" | "list" } }
  | { name: "route_opened"; params: { placeId: string | number; provider: "yandex" | "2gis" | "google" } }
  | { name: "external_link_clicked"; params: { placeId: string | number; kind: string } }
  | { name: "community_map_opened"; params: { slug: string; placeCount: number; linkOnlyCount: number } }
  | { name: "submap_opened"; params: { fromPlaceId: string | number; toSlug: string } }
  | { name: "analytics_consent_changed"; params: { status: AnalyticsConsentStatus } }
  | { name: "pwa_install_prompt_clicked"; params: { platform: PwaInstallAnalyticsPlatform; source: PwaInstallAnalyticsSource } }
  | {
      name: "pwa_install_prompt_result";
      params: {
        outcome: "accepted" | "dismissed";
        platform: PwaInstallAnalyticsPlatform;
        source: PwaInstallAnalyticsSource;
      };
    }
  | { name: "pwa_install_dismissed"; params: { platform: PwaInstallAnalyticsPlatform; source: PwaInstallAnalyticsSource } }
  | { name: "pwa_app_installed"; params: { platform: PwaInstallAnalyticsPlatform } };

export const ANALYTICS_CONSENT_STORAGE_KEY = "kursk-map:analytics-consent:v1";
export const ANALYTICS_POLICY_VERSION = "2026-05-31";
