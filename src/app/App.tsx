import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnalyticsConsent,
  readStoredAnalyticsConsent,
  storeAnalyticsConsent
} from "../components/analytics-consent/AnalyticsConsent";
import { FilterControls } from "../components/filters/FilterControls";
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
import { filterPlaces } from "../domain/filterPlaces";
import type { PlaceFeature } from "../domain/places";
import { isPublicPlace } from "../domain/places";
import type { RouteProvider } from "../domain/routeLinks";
import { searchPlaces } from "../domain/search";
import { categories, collections } from "../domain/taxonomy";
import { createAnalyticsAdapter } from "../services/analytics/analyticsAdapter";
import { loadYandexMetrika } from "../services/analytics/yandexMetrika";
import { useLocation, useParams } from "react-router";

export function App() {
  const [places, setPlaces] = useState<PlaceFeature[]>([]);
  const [communityMaps, setCommunityMaps] = useState<CommunityMap[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [activePlace, setActivePlace] = useState<PlaceFeature | null>(null);
  const [query, setQuery] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
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
  const filteredPlaces = useMemo(
    () => filterPlaces(basePlaces, { categoryIds: selectedCategoryIds, collectionIds: selectedCollectionIds }),
    [basePlaces, selectedCategoryIds, selectedCollectionIds]
  );
  const visiblePlaces = useMemo(() => searchPlaces(filteredPlaces, query), [filteredPlaces, query]);
  const hasActiveFilters = query.trim().length > 0 || selectedCategoryIds.length > 0 || selectedCollectionIds.length > 0;

  const resetSearchAndFilters = useCallback(() => {
    setQuery("");
    setSelectedCategoryIds([]);
    setSelectedCollectionIds([]);
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
    resetSearchAndFilters();
  }, [location.pathname, resetSearchAndFilters]);

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
      const resultCount = searchPlaces(filteredPlaces, value).length;
      analytics.track({
        name: "search_used",
        params: { queryLength: value.trim().length, hasResults: resultCount > 0, resultCount }
      });
    },
    [analytics, filteredPlaces]
  );

  const handleCategoryChange = useCallback(
    (ids: string[]) => {
      setSelectedCategoryIds(ids);
      const resultCount = searchPlaces(filterPlaces(basePlaces, { categoryIds: ids, collectionIds: selectedCollectionIds }), query).length;
      analytics.track({
        name: "filters_changed",
        params: { categoryIds: ids, collectionIds: selectedCollectionIds, resultCount }
      });
    },
    [analytics, basePlaces, query, selectedCollectionIds]
  );

  const handleCollectionChange = useCallback(
    (ids: string[]) => {
      setSelectedCollectionIds(ids);
      const resultCount = searchPlaces(filterPlaces(basePlaces, { categoryIds: selectedCategoryIds, collectionIds: ids }), query).length;
      analytics.track({
        name: "filters_changed",
        params: { categoryIds: selectedCategoryIds, collectionIds: ids, resultCount }
      });
    },
    [analytics, basePlaces, query, selectedCategoryIds]
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
        <section className="filter-toolbar" aria-label="Поиск и фильтры">
          <SearchBox value={query} onChange={handleQueryChange} onReset={() => handleQueryChange("")} />
          <FilterControls
            categories={categories}
            collections={collections}
            selectedCategoryIds={selectedCategoryIds}
            selectedCollectionIds={selectedCollectionIds}
            onCategoryChange={handleCategoryChange}
            onCollectionChange={handleCollectionChange}
          />
          <ResultsSummary
            count={visiblePlaces.length}
            total={basePlaces.length}
            hasActiveFilters={hasActiveFilters}
            onReset={resetSearchAndFilters}
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
