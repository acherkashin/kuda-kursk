import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnalyticsConsent,
  readStoredAnalyticsConsent,
  storeAnalyticsConsent
} from "../components/analytics-consent/AnalyticsConsent";
import { ResultsSummary } from "../components/filters/ResultsSummary";
import { SearchBox } from "../components/filters/SearchBox";
import { KurskMap } from "../components/map/KurskMap";
import { PublicMapFallback } from "../components/map/PublicMapFallback";
import { PlaceDetailsPanel } from "../components/place-details/PlaceDetailsPanel";
import { loadPlaces } from "../data/loadPlaces";
import type { AnalyticsConsent as AnalyticsConsentRecord } from "../domain/analyticsEvents";
import { findMapBySlug } from "../domain/mapCatalog";
import type { PlaceFeature } from "../domain/places";
import type { RouteProvider } from "../domain/routeLinks";
import { searchPlaces } from "../domain/search";
import { createAnalyticsAdapter } from "../services/analytics/analyticsAdapter";
import { loadYandexMetrika } from "../services/analytics/yandexMetrika";
import { registerServiceWorker, type ServiceWorkerUpdatePrompt } from "../services/pwa/registerServiceWorker";
import { useLocation, useParams } from "react-router";

export function App() {
  const [places, setPlaces] = useState<PlaceFeature[]>([]);
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
  const currentMap = useMemo(() => findMapBySlug(slug), [slug]);
  const basePlaces = places;
  const visiblePlaces = useMemo(() => searchPlaces(basePlaces, query), [basePlaces, query]);
  const hasActiveSearch = query.trim().length > 0;
  const hasActivePlace = activePlace !== null;
  const hasFloatingNotice = !hasActivePlace && (!analyticsConsent || pwaUpdatePrompt?.needRefresh);

  const resetSearch = useCallback(() => {
    setQuery("");
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!currentMap) {
      setPlaces([]);
      setActivePlace(null);
      setLoadState("ready");
      return () => {
        cancelled = true;
      };
    }

    setLoadState("loading");
    setPlaces([]);
    setActivePlace(null);
    void loadPlaces(currentMap.dataPath)
      .then((loadedPlaces) => {
        if (!cancelled) {
          setPlaces(loadedPlaces);
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
  }, [currentMap]);

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
    analytics.track({ name: "app_open", params: { route: location.pathname, mapSlug: slug ?? "" } });
  }, [analytics, location.pathname, slug]);

  useEffect(() => {
    if (loadState === "ready" && currentMap && currentMap.slug !== "main") {
      analytics.track({
        name: "community_map_opened",
        params: { slug: currentMap.slug, placeCount: places.length, linkOnlyCount: 0 }
      });
    }
  }, [analytics, currentMap, loadState, places.length]);

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
    <main
      className="relative min-h-dvh w-full overflow-hidden bg-[var(--color-page)]"
      data-details-open={hasActivePlace ? "true" : "false"}
      data-notice-open={hasFloatingNotice ? "true" : "false"}
    >
      {!currentMap ? <PublicMapFallback slug={slug ?? ""} /> : null}
      {loadState === "error" ? (
        <div
          className="absolute right-[max(16px,env(safe-area-inset-right))] bottom-[max(16px,env(safe-area-inset-bottom))] z-2 max-w-[min(320px,calc(100vw-32px))] rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-muted)] shadow-[var(--shadow-panel)]"
          role="alert"
        >
          Не удалось загрузить места
        </div>
      ) : null}
      {currentMap ? (
        <KurskMap
          activePlace={activePlace}
          mapTitle={currentMap.title}
          places={visiblePlaces}
          onPlaceSelect={handlePlaceSelect}
        />
      ) : null}
      {currentMap ? (
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
      <AnalyticsConsent consent={analyticsConsent} isSuppressed={hasActivePlace} onChange={handleConsentChange} />
      {pwaUpdatePrompt?.needRefresh && !hasActivePlace ? (
        <section
          className="fixed top-[max(16px,env(safe-area-inset-top))] right-[max(16px,env(safe-area-inset-right))] z-5 grid w-[min(360px,calc(100vw-32px))] gap-2.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-panel)] max-[700px]:top-[184px] max-[700px]:right-2 max-[700px]:left-2 max-[700px]:w-auto"
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
