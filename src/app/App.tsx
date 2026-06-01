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
import { registerServiceWorker, type ServiceWorkerUpdatePrompt } from "../services/pwa/registerServiceWorker";
import { useLocation, useParams } from "react-router";

export function App() {
  const [places, setPlaces] = useState<PlaceFeature[]>([]);
  const [communityMaps, setCommunityMaps] = useState<CommunityMap[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [activePlace, setActivePlace] = useState<PlaceFeature | null>(null);
  const [query, setQuery] = useState("");
  const [analyticsConsent, setAnalyticsConsent] = useState<AnalyticsConsentRecord | null>(() => readStoredAnalyticsConsent());
  const [pwaUpdatePrompt, setPwaUpdatePrompt] = useState<ServiceWorkerUpdatePrompt | null>(null);
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
    setActivePlace(null);
    resetSearch();
  }, [location.pathname, resetSearch]);

  useEffect(() => {
    registerServiceWorker({
      onNeedRefresh: setPwaUpdatePrompt
    });
  }, []);

  useEffect(() => {
    if (analyticsAccepted) {
      loadYandexMetrika(import.meta.env.VITE_YANDEX_METRIKA_ID);
    }
  }, [analyticsAccepted]);

  useEffect(() => {
    analytics.hit(location.pathname);
    analytics.track({
      name: "app_open",
      params: slug ? { route: location.pathname, communitySlug: slug } : { route: location.pathname }
    });
  }, [analytics, location.pathname, slug]);

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
    <main className="relative min-h-dvh w-full overflow-hidden bg-[var(--color-page)]">
      {loadState === "error" ? (
        <div
          className="absolute right-[max(16px,env(safe-area-inset-right))] bottom-[max(16px,env(safe-area-inset-bottom))] z-2 max-w-[min(320px,calc(100vw-32px))] rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-muted)] shadow-[var(--shadow-panel)]"
          role="alert"
        >
          Не удалось загрузить места
        </div>
      ) : null}
      <KurskMap places={visiblePlaces} onPlaceSelect={handlePlaceSelect} />
      {resolvedCommunity?.status === "found" ? (
        <CommunityMapHeader
          map={resolvedCommunity.map}
          placeCount={resolvedCommunity.places.length}
          linkOnlyCount={resolvedCommunity.linkOnlyCount}
        />
      ) : null}
      {resolvedCommunity?.status === "not-found" ? <CommunityMapFallback slug={resolvedCommunity.slug} /> : null}
      {resolvedCommunity?.status !== "not-found" ? (
        <section
          className="fixed top-[72px] left-[max(16px,env(safe-area-inset-left))] z-3 grid w-[min(420px,calc(100vw-32px))] gap-2.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-2.5 shadow-[var(--shadow-panel)] max-[700px]:top-16 max-[700px]:right-2 max-[700px]:left-2 max-[700px]:max-h-[28dvh] max-[700px]:w-auto max-[700px]:overflow-auto"
          aria-label="Поиск"
        >
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
      {pwaUpdatePrompt?.needRefresh ? (
        <section
          className="fixed right-[max(16px,env(safe-area-inset-right))] bottom-[max(16px,env(safe-area-inset-bottom))] z-5 grid w-[min(360px,calc(100vw-32px))] gap-2.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-panel)] max-[700px]:right-2 max-[700px]:bottom-2 max-[700px]:left-2 max-[700px]:w-auto"
          data-testid="pwa-update"
          aria-label="Доступно обновление приложения"
        >
          <p className="m-0 text-[13px] leading-snug text-[var(--color-muted)]">Доступна новая версия карты.</p>
          <button
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-accent)] px-2.5 py-1.5 text-[13px] font-bold text-white"
            type="button"
            onClick={() => void pwaUpdatePrompt.updateServiceWorker()}
          >
            Обновить
          </button>
        </section>
      ) : null}
    </main>
  );
}
