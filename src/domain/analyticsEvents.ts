export type AnalyticsConsentStatus = "accepted" | "rejected";

export type AnalyticsConsent = {
  status: AnalyticsConsentStatus;
  policyVersion: string;
  updatedAt: string;
};

export type AnalyticsEvent =
  | { name: "app_open"; params: { route: string; communitySlug?: string } }
  | { name: "search_used"; params: { queryLength: number; hasResults: boolean; resultCount: number } }
  | { name: "filters_changed"; params: { categoryIds: string[]; collectionIds: string[]; resultCount: number } }
  | { name: "marker_selected"; params: { placeId: string | number; source: "map" | "list" } }
  | { name: "route_opened"; params: { placeId: string | number; provider: "yandex" | "2gis" | "google" } }
  | { name: "external_link_clicked"; params: { placeId: string | number; kind: string } }
  | { name: "community_map_opened"; params: { slug: string; placeCount: number; linkOnlyCount: number } }
  | { name: "analytics_consent_changed"; params: { status: AnalyticsConsentStatus } };

export const ANALYTICS_CONSENT_STORAGE_KEY = "kursk-map:analytics-consent:v1";
export const ANALYTICS_POLICY_VERSION = "2026-05-31";
