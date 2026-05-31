import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnalyticsConsent,
  readStoredAnalyticsConsent,
  storeAnalyticsConsent
} from "../components/analytics-consent/AnalyticsConsent";
import { ResultsSummary } from "../components/filters/ResultsSummary";
import { SearchBox } from "../components/filters/SearchBox";
import { CommunityMapFallback } from "../components/map/CommunityMapFallback";
import { CommunityMapHeader } from "../components/map/CommunityMapHeader";
import { KurskMap } from "../components/map/KurskMap";
import { PlaceDetailsPanel } from "../components/place-details/PlaceDetailsPanel";
import { loadCommunityMaps } from "../data/loadCommunityMaps";
import { loadPlaces } from "../data/loadPlaces";
import type { AnalyticsConsent as AnalyticsConsentRecord } from "../domain/analyticsEvents";
import type { CommunityMap } from "../domain/communityMaps";
import { resolveCommunityMap } from "../domain/communityMaps";
import type { PlaceFeature } from "../domain/places";
import { isPublicPlace } from "../domain/places";
import type { RouteProvider } from "../domain/routeLinks";
import { searchPlaces } from "../domain/search";
import { createAnalyticsAdapter } from "../services/analytics/analyticsAdapter";
import { loadYandexMetrika } from "../services/analytics/yandexMetrika";
import { useLocation, useParams } from "react-router";

export function App() {
  const [places, setPlaces] = useState<PlaceFeature[]>([]);
  const [communityMaps, setCommunityMaps] = useState<CommunityMap[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [activePlace, setActivePlace] = useState<PlaceFeature | null>(null);
  const [query, setQuery] = useState("");
  const [analyticsConsent, setAnalyticsConsent] = useState<AnalyticsConsentRecord | null>(() => readStoredAnalyticsConsent());
  const analyticsAccepted = analyticsConsent?.status === "accepted";
  const analytics = useMemo(
    () => createAnalyticsAdapter(import.meta.env.VITE_YANDEX_METRIKA_ID, analyticsAccepted),
    [analyticsAccepted]
  );
  const { slug } = useParams();
  const location = useLocation();
  const resolvedCommunity = useMemo(
    () => (slug ? resolveCommunityMap(slug, communityMaps, places) : null),
    [communityMaps, places, slug]
  );
  const basePlaces = useMemo(() => {
    if (resolvedCommunity?.status === "found") {
      return resolvedCommunity.places;
    }

    return places.filter(isPublicPlace);
  }, [places, resolvedCommunity]);
  const visiblePlaces = useMemo(() => searchPlaces(basePlaces, query), [basePlaces, query]);
  const hasActiveSearch = query.trim().length > 0;

  const resetSearch = useCallback(() => {
    setQuery("");
  }, []);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([loadPlaces(), loadCommunityMaps()])
      .then(([loadedPlaces, loadedCommunityMaps]) => {
        if (!cancelled) {
          setPlaces(loadedPlaces);
          setCommunityMaps(loadedCommunityMaps);
          setLoadState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadState("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    analytics.track({
      name: "app_open",
      params: slug ? { route: location.pathname, communitySlug: slug } : { route: location.pathname }
    });
  }, [analytics, location.pathname, slug]);

  useEffect(() => {
    setActivePlace(null);
    resetSearch();
  }, [location.pathname, resetSearch]);

  useEffect(() => {
    if (resolvedCommunity?.status === "found") {
      analytics.track({
        name: "community_map_opened",
        params: {
          slug: resolvedCommunity.map.slug,
          placeCount: resolvedCommunity.places.length,
          linkOnlyCount: resolvedCommunity.linkOnlyCount
        }
      });
    }
  }, [analytics, resolvedCommunity]);

  useEffect(() => {
    if (analyticsAccepted) {
      loadYandexMetrika(import.meta.env.VITE_YANDEX_METRIKA_ID);
    }
  }, [analyticsAccepted]);

  const handleConsentChange = useCallback(
    (consent: AnalyticsConsentRecord) => {
      storeAnalyticsConsent(consent);
      setAnalyticsConsent(consent);
      analytics.track({ name: "analytics_consent_changed", params: { status: consent.status } });
    },
    [analytics]
  );

  const handlePlaceSelect = useCallback(
    (place: PlaceFeature, source: "map") => {
      setActivePlace(place);
      analytics.track({ name: "marker_selected", params: { placeId: place.id, source } });
    },
    [analytics]
  );

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      const resultCount = searchPlaces(basePlaces, value).length;
      analytics.track({
        name: "search_used",
        params: { queryLength: value.trim().length, hasResults: resultCount > 0, resultCount }
      });
    },
    [analytics, basePlaces]
  );

  return (
    <main className="app-shell">
      {loadState === "error" ? (
        <div className="app-error" role="alert">
          Не удалось загрузить места
        </div>
      ) : null}
      <KurskMap places={visiblePlaces} activePlaceId={activePlace?.id ?? null} onPlaceSelect={handlePlaceSelect} />
      {resolvedCommunity?.status === "found" ? (
        <CommunityMapHeader
          map={resolvedCommunity.map}
          placeCount={resolvedCommunity.places.length}
          linkOnlyCount={resolvedCommunity.linkOnlyCount}
        />
      ) : null}
      {resolvedCommunity?.status === "not-found" ? <CommunityMapFallback slug={resolvedCommunity.slug} /> : null}
      {resolvedCommunity?.status !== "not-found" ? (
        <section className="filter-toolbar" aria-label="Поиск">
          <SearchBox value={query} onChange={handleQueryChange} onReset={() => handleQueryChange("")} />
          <ResultsSummary
            count={visiblePlaces.length}
            total={basePlaces.length}
            hasActiveSearch={hasActiveSearch}
            onReset={resetSearch}
          />
        </section>
      ) : null}
      <PlaceDetailsPanel
        place={activePlace}
        onClose={() => setActivePlace(null)}
        onRouteOpen={(provider: RouteProvider) => {
          if (activePlace) {
            analytics.track({ name: "route_opened", params: { placeId: activePlace.id, provider } });
          }
        }}
        onExternalLinkOpen={(kind) => {
          if (activePlace) {
            analytics.track({ name: "external_link_clicked", params: { placeId: activePlace.id, kind } });
          }
        }}
      />
      <AnalyticsConsent consent={analyticsConsent} onChange={handleConsentChange} />
    </main>
  );
}
