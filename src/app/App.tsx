import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnalyticsConsent,
  readStoredAnalyticsConsent,
  storeAnalyticsConsent
} from "../components/analytics-consent/AnalyticsConsent";
import { AboutProjectDialog } from "../components/about-project/AboutProjectDialog";
import { ResultsSummary } from "../components/filters/ResultsSummary";
import { KurskMap, type MapFitBoundsRequest } from "../components/map/KurskMap";
import { MapTopControls } from "../components/map/MapTopControls";
import { PublicMapFallback } from "../components/map/PublicMapFallback";
import { PlaceDetailsPanel } from "../components/place-details/PlaceDetailsPanel";
import { PwaInstallNotice } from "../components/pwa/PwaInstallNotice";
import { ANALYTICS_CONSENT_UI_ENABLED, isAnalyticsSessionOptOutActive } from "../config/analytics";
import { loadPlaces } from "../data/loadPlaces";
import type { AnalyticsConsent as AnalyticsConsentRecord } from "../domain/analyticsEvents";
import type { PwaInstallAnalyticsSource } from "../domain/analyticsEvents";
import { findMapBySlug } from "../domain/mapCatalog";
import { formatMapZoom, MAP_ZOOM_SEARCH_PARAM, parseMapZoom } from "../domain/mapUrlState";
import {
  filterPlacesByCategory,
  getAvailablePlaceCategories,
  parsePlaceCategory,
  PLACE_CATEGORY_SEARCH_PARAM
} from "../domain/placeCategories";
import { getPlaceId, type PlaceFeature } from "../domain/places";
import type { RouteProvider } from "../domain/routeLinks";
import { searchPlaces } from "../domain/search";
import { createAnalyticsAdapter } from "../services/analytics/analyticsAdapter";
import { loadYandexMetrika } from "../services/analytics/yandexMetrika";
import { registerServiceWorker } from "../services/pwa/registerServiceWorker";
import { usePwaInstallPrompt } from "../services/pwa/usePwaInstallPrompt";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";

export function App() {
  const [places, setPlaces] = useState<PlaceFeature[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [activePlace, setActivePlace] = useState<PlaceFeature | null>(null);
  const [fitBoundsRequest, setFitBoundsRequest] = useState<MapFitBoundsRequest | null>(null);
  const [query, setQuery] = useState("");
  const fitBoundsRequestIdRef = useRef(0);
  const handledAutomaticFitKeyRef = useRef<string | null>(null);
  const [analyticsConsent, setAnalyticsConsent] = useState<AnalyticsConsentRecord | null>(() => readStoredAnalyticsConsent());
  const analyticsEnabled =
    !isAnalyticsSessionOptOutActive() &&
    (ANALYTICS_CONSENT_UI_ENABLED ? analyticsConsent?.status === "accepted" : true);
  const analytics = useMemo(
    () => createAnalyticsAdapter(import.meta.env.VITE_YANDEX_METRIKA_ID, analyticsEnabled),
    [analyticsEnabled]
  );
  const handlePwaAppInstalled = useCallback(
    (platform: "android" | "ios" | "other") => {
      analytics.track({ name: "pwa_app_installed", params: { platform } });
    },
    [analytics]
  );
  const pwaInstall = usePwaInstallPrompt({ onAppInstalled: handlePwaAppInstalled });
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamsRef = useRef(new URLSearchParams(location.search));
  const isAboutOpen = searchParams.has("about");
  const currentMap = useMemo(() => findMapBySlug(slug), [slug]);
  const basePlaces = places;
  const availableCategories = useMemo(() => getAvailablePlaceCategories(basePlaces), [basePlaces]);
  const parsedCategory = parsePlaceCategory(searchParams.get(PLACE_CATEGORY_SEARCH_PARAM));
  const activeCategory =
    parsedCategory && availableCategories.some((category) => category.slug === parsedCategory)
      ? parsedCategory
      : null;
  const categoryPlaces = useMemo(
    () => filterPlacesByCategory(basePlaces, activeCategory),
    [activeCategory, basePlaces]
  );
  const placeById = useMemo(() => new Map(basePlaces.map((place) => [getPlaceId(place), place])), [basePlaces]);
  const selectedPlaceId = searchParams.get("place")?.trim() ?? "";
  const mapZoom = parseMapZoom(searchParams.get(MAP_ZOOM_SEARCH_PARAM)) ?? undefined;
  const visiblePlaces = useMemo(() => searchPlaces(categoryPlaces, query), [categoryPlaces, query]);
  const hasActiveSearch = query.trim().length > 0;
  const isFiltered = hasActiveSearch || activeCategory !== null;
  const hasActivePlace = activePlace !== null;
  const hasAnalyticsNotice =
    !hasActivePlace && !isAboutOpen && ANALYTICS_CONSENT_UI_ENABLED && !analyticsConsent;
  const showPwaInstallNotice =
    currentMap !== undefined &&
    currentMap !== null &&
    !hasActivePlace &&
    !isAboutOpen &&
    !hasAnalyticsNotice &&
    pwaInstall.shouldShowFloatingNotice;
  const hasFloatingNotice = hasAnalyticsNotice || showPwaInstallNotice;

  useEffect(() => {
    searchParamsRef.current = new URLSearchParams(location.search);
  }, [location.search]);

  const updateSearchParams = useCallback(
    (update: (nextSearchParams: URLSearchParams) => void, options?: { replace?: boolean }) => {
      const nextSearchParams = new URLSearchParams(searchParamsRef.current);

      update(nextSearchParams);
      searchParamsRef.current = nextSearchParams;
      setSearchParams(nextSearchParams, options);
    },
    [setSearchParams]
  );

  const resetSearch = useCallback(() => {
    setQuery("");
  }, []);

  const requestPlacesFit = useCallback((placesToFit: PlaceFeature[]) => {
    fitBoundsRequestIdRef.current += 1;
    setFitBoundsRequest({ id: fitBoundsRequestIdRef.current, places: placesToFit });
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
  }, [currentMap?.slug, resetSearch]);

  useEffect(() => {
    if (loadState !== "ready" || !currentMap || !activeCategory) {
      return;
    }

    const automaticFitKey = `${currentMap.slug}:${activeCategory}`;

    if (handledAutomaticFitKeyRef.current === automaticFitKey) {
      return;
    }

    handledAutomaticFitKeyRef.current = automaticFitKey;

    if (mapZoom === undefined && !selectedPlaceId) {
      requestPlacesFit(categoryPlaces);
    }
  }, [activeCategory, categoryPlaces, currentMap, loadState, mapZoom, requestPlacesFit, selectedPlaceId]);

  useEffect(() => {
    if (loadState !== "ready" || !currentMap) {
      return;
    }

    if (searchParams.has(PLACE_CATEGORY_SEARCH_PARAM) && !activeCategory) {
      updateSearchParams((nextSearchParams) => {
        nextSearchParams.delete(PLACE_CATEGORY_SEARCH_PARAM);
      }, { replace: true });
    }
  }, [activeCategory, currentMap, loadState, searchParams, updateSearchParams]);

  useEffect(() => {
    if (loadState !== "ready" || !currentMap) {
      return;
    }

    if (!searchParams.has("place")) {
      setActivePlace(null);
      return;
    }

    const selectedPlace = placeById.get(selectedPlaceId);

    if (selectedPlace && (!activeCategory || selectedPlace.properties.categories?.includes(activeCategory))) {
      setActivePlace(selectedPlace);
      return;
    }

    setActivePlace(null);
    updateSearchParams((nextSearchParams) => {
      nextSearchParams.delete("place");
    }, { replace: true });
  }, [activeCategory, currentMap, loadState, placeById, searchParams, selectedPlaceId, updateSearchParams]);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (analyticsEnabled) {
      loadYandexMetrika(import.meta.env.VITE_YANDEX_METRIKA_ID);
    }
  }, [analyticsEnabled]);

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
      updateSearchParams((nextSearchParams) => {
        nextSearchParams.set("place", getPlaceId(place));
      });
      setActivePlace(place);
      analytics.track({ name: "marker_selected", params: { placeId: place.id, source } });
    },
    [analytics, updateSearchParams]
  );

  const handleMapZoomChange = useCallback(
    (zoom: number) => {
      const nextZoom = formatMapZoom(zoom);

      if (searchParamsRef.current.get(MAP_ZOOM_SEARCH_PARAM) === nextZoom) {
        return;
      }

      updateSearchParams((nextSearchParams) => {
        nextSearchParams.set(MAP_ZOOM_SEARCH_PARAM, nextZoom);
      }, { replace: true });
    },
    [updateSearchParams]
  );

  const handleFitPlaces = useCallback(
    (placeCount: number) => {
      if (!currentMap) {
        return;
      }

      analytics.track({
        name: "map_fit_places_clicked",
        params: { mapSlug: currentMap.slug, placeCount, isFiltered }
      });
    },
    [analytics, currentMap, isFiltered]
  );

  const handlePlaceDetailsClose = useCallback(() => {
    updateSearchParams((nextSearchParams) => {
      nextSearchParams.delete("place");
    });
    setActivePlace(null);
  }, [updateSearchParams]);

  const handleCategorySelect = useCallback(
    (slug: string) => {
      const selectedCategory = parsePlaceCategory(slug);

      if (!selectedCategory) {
        return;
      }

      const nextCategory = activeCategory === selectedCategory ? null : selectedCategory;

      if (nextCategory) {
        handledAutomaticFitKeyRef.current = currentMap ? `${currentMap.slug}:${nextCategory}` : null;
        requestPlacesFit(filterPlacesByCategory(basePlaces, nextCategory));
      }

      if (activePlace && nextCategory && !activePlace.properties.categories?.includes(nextCategory)) {
        setActivePlace(null);
      }

      updateSearchParams((nextSearchParams) => {
        if (nextCategory) {
          nextSearchParams.set(PLACE_CATEGORY_SEARCH_PARAM, nextCategory);
        } else {
          nextSearchParams.delete(PLACE_CATEGORY_SEARCH_PARAM);
        }

        if (activePlace && nextCategory && !activePlace.properties.categories?.includes(nextCategory)) {
          nextSearchParams.delete("place");
        }
      });
    },
    [activeCategory, activePlace, basePlaces, currentMap, requestPlacesFit, updateSearchParams]
  );

  const handleAboutOpen = useCallback(() => {
    updateSearchParams((nextSearchParams) => {
      nextSearchParams.set("about", "1");
    });
  }, [updateSearchParams]);

  const handleAboutClose = useCallback(() => {
    updateSearchParams((nextSearchParams) => {
      nextSearchParams.delete("about");
    }, { replace: true });
  }, [updateSearchParams]);

  const handleOpenMap = useCallback(
    (targetSlug: string) => {
      if (activePlace) {
        analytics.track({ name: "submap_opened", params: { fromPlaceId: activePlace.id, toSlug: targetSlug } });
      }
      navigate(`/maps/${targetSlug}`);
    },
    [activePlace, analytics, navigate]
  );

  const handleBackToMain = useCallback(() => {
    navigate("/maps/main");
  }, [navigate]);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      const resultCount = searchPlaces(categoryPlaces, value).length;
      analytics.track({
        name: "search_used",
        params: { queryLength: value.trim().length, hasResults: resultCount > 0, resultCount }
      });
    },
    [analytics, categoryPlaces]
  );

  const handlePwaInstallClick = useCallback(
    (source: PwaInstallAnalyticsSource) => {
      if (pwaInstall.installMode === "unavailable") {
        return;
      }

      analytics.track({
        name: "pwa_install_prompt_clicked",
        params: { platform: pwaInstall.platform, source }
      });

      if (pwaInstall.installMode === "manual-ios") {
        return;
      }

      void pwaInstall.promptInstall().then((outcome) => {
        if (!outcome) {
          return;
        }

        analytics.track({
          name: "pwa_install_prompt_result",
          params: { outcome, platform: pwaInstall.platform, source }
        });
      });
    },
    [analytics, pwaInstall]
  );

  const handlePwaInstallDismiss = useCallback(() => {
    pwaInstall.dismissFloatingNotice();
    analytics.track({
      name: "pwa_install_dismissed",
      params: { platform: pwaInstall.platform, source: "floating_notice" }
    });
  }, [analytics, pwaInstall]);

  return (
    <main
      className="relative h-dvh min-h-dvh w-full overflow-hidden bg-[var(--color-page)]"
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
          fitBoundsRequest={fitBoundsRequest}
          places={visiblePlaces}
          zoom={mapZoom}
          onFitPlaces={handleFitPlaces}
          onZoomChange={handleMapZoomChange}
          onPlaceSelect={handlePlaceSelect}
        />
      ) : null}
      {currentMap ? (
        <>
          <MapTopControls
            activeCategory={activeCategory}
            categories={availableCategories}
            title={currentMap.title}
            subtitle={currentMap.description}
            logo={currentMap.logo}
            isAboutOpen={isAboutOpen}
            query={query}
            onAboutOpen={handleAboutOpen}
            onQueryChange={handleQueryChange}
            onQueryReset={() => handleQueryChange("")}
            onBackToMain={currentMap.slug !== "main" ? handleBackToMain : undefined}
            onCategorySelect={handleCategorySelect}
          />
          {loadState === "ready" ? (
            <div className="map-results-ui fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-[max(16px,env(safe-area-inset-left))] z-3 max-w-[min(420px,calc(100vw-32px))] max-[700px]:bottom-[max(12px,env(safe-area-inset-bottom))] max-[700px]:left-[max(12px,env(safe-area-inset-left))]">
              <ResultsSummary
                count={visiblePlaces.length}
                total={basePlaces.length}
                isFiltered={isFiltered}
              />
            </div>
          ) : null}
          {showPwaInstallNotice ? (
            <PwaInstallNotice
              installMode={pwaInstall.installMode}
              platform={pwaInstall.platform}
              onDismiss={handlePwaInstallDismiss}
              onInstallClick={() => handlePwaInstallClick("floating_notice")}
            />
          ) : null}
        </>
      ) : null}
      <PlaceDetailsPanel
        place={activePlace}
        onClose={handlePlaceDetailsClose}
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
        onOpenMap={handleOpenMap}
      />
      <AboutProjectDialog
        analyticsConsent={analyticsConsent}
        isOpen={isAboutOpen}
        onAnalyticsConsentChange={handleConsentChange}
        onPwaInstallClick={() => handlePwaInstallClick("about_dialog")}
        pwaInstall={{
          installMode: pwaInstall.installMode,
          isStandalone: pwaInstall.isStandalone,
          platform: pwaInstall.platform
        }}
        showAnalyticsSettings={ANALYTICS_CONSENT_UI_ENABLED}
        onClose={handleAboutClose}
      />
      {ANALYTICS_CONSENT_UI_ENABLED ? (
        <AnalyticsConsent consent={analyticsConsent} isSuppressed={hasActivePlace || isAboutOpen} onChange={handleConsentChange} />
      ) : null}
    </main>
  );
}
