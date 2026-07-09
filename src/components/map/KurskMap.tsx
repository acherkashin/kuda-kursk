import maplibregl, { type GeoJSONSource, type MapLayerMouseEvent } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { mapConfig } from "../../domain/mapConfig";
import { areMapZoomsEqual } from "../../domain/mapUrlState";
import type { PlaceFeature } from "../../domain/places";
import { getPlaceName } from "../../domain/places";
import { MapFallback } from "./MapFallback";
import {
  addPlaceLayers,
  DEFAULT_PLACE_MARKER_IMAGE_ID,
  PLACE_SOURCE_ID,
  PLACE_SYMBOL_LAYER_ID
} from "./placeLayers";
import { createPlaceFeatureCollection } from "./placeSource";
import { calculatePlaceBounds } from "./placeBounds";
import {
  addMarkerImagePlaceholders,
  addMarkerImages,
  createDefaultMarkerImage,
  MARKER_IMAGE_PIXEL_RATIO
} from "./markerImages";
import { createMarkerLayout, type MarkerLayout, updateMarkerLayoutSortKeys } from "./markerLayout";

const MARKER_HOVER_TRANSITION_MS = 310;
const MAP_VIEWPORT_SYNC_EVENT_DATA = { source: "app-viewport-sync" } as const;

type KurskMapProps = {
  activePlace: PlaceFeature | null;
  fitBoundsRequest: MapFitBoundsRequest | null;
  places: PlaceFeature[];
  onPlaceSelect?: (place: PlaceFeature, source: "map") => void;
  onZoomChange?: (zoom: number) => void;
  zoom: number | undefined;
};

export type MapFitBoundsRequest = {
  id: number;
  places: PlaceFeature[];
};

type FeatureId = string | number;
type HoverAnimation = {
  frameId: number;
  from: number;
  startedAt: number;
  to: number;
};

function createMarkerLayoutFingerprint(
  targetMap: maplibregl.Map,
  nextPlaces: PlaceFeature[],
  activePlace: PlaceFeature | null
) {
  const canvas = targetMap.getCanvas();
  const placeSignature = nextPlaces
    .map((place) => `${place.id}:${place.geometry.coordinates[0]},${place.geometry.coordinates[1]}`)
    .join("|");

  return [
    targetMap.getZoom(),
    canvas.clientWidth,
    canvas.clientHeight,
    activePlace?.id ?? "",
    placeSignature
  ].join(";");
}

function easeMarkerHover(progress: number) {
  return 1 - (1 - progress) ** 3;
}

function addMapViewportSizeSynchronizer(targetMap: maplibregl.Map, container: HTMLElement) {
  let frameId: number | null = null;
  const visualViewport = window.visualViewport;

  const syncMapSize = () => {
    frameId = null;

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width <= 0 || height <= 0) {
      return;
    }

    const canvas = targetMap.getCanvas();

    if (canvas.clientWidth !== width || canvas.clientHeight !== height) {
      targetMap.resize(MAP_VIEWPORT_SYNC_EVENT_DATA);
    }
  };

  const scheduleMapSizeSync = () => {
    if (frameId !== null) {
      return;
    }

    frameId = window.requestAnimationFrame(syncMapSize);
  };

  window.addEventListener("resize", scheduleMapSizeSync);
  window.addEventListener("orientationchange", scheduleMapSizeSync);
  window.addEventListener("focus", scheduleMapSizeSync);
  window.addEventListener("pageshow", scheduleMapSizeSync);
  document.addEventListener("visibilitychange", scheduleMapSizeSync);
  visualViewport?.addEventListener("resize", scheduleMapSizeSync);
  visualViewport?.addEventListener("scroll", scheduleMapSizeSync);
  scheduleMapSizeSync();

  return () => {
    window.removeEventListener("resize", scheduleMapSizeSync);
    window.removeEventListener("orientationchange", scheduleMapSizeSync);
    window.removeEventListener("focus", scheduleMapSizeSync);
    window.removeEventListener("pageshow", scheduleMapSizeSync);
    document.removeEventListener("visibilitychange", scheduleMapSizeSync);
    visualViewport?.removeEventListener("resize", scheduleMapSizeSync);
    visualViewport?.removeEventListener("scroll", scheduleMapSizeSync);

    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
    }
  };
}

export function KurskMap({ activePlace, fitBoundsRequest, places, onPlaceSelect, onZoomChange, zoom }: KurskMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const hoverAnimationsRef = useRef<Map<FeatureId, HoverAnimation>>(new Map());
  const hoverProgressByIdRef = useRef<Map<FeatureId, number>>(new Map());
  const markerLayoutByIdRef = useRef<Map<string, MarkerLayout>>(new Map());
  const markerLayoutFingerprintRef = useRef<string | null>(null);
  const placeByIdRef = useRef<Map<string, PlaceFeature>>(new Map());
  const placesRef = useRef<PlaceFeature[]>(places);
  const previousActivePlaceIdRef = useRef<string | number | null>(null);
  const hoveredPlaceIdRef = useRef<string | number | null>(null);
  const handledFitBoundsRequestIdRef = useRef<number | null>(null);
  const scheduleMarkerLayoutUpdateRef = useRef<(() => void) | null>(null);
  const [mapState, setMapState] = useState<"loading" | "ready" | "error">("loading");

  placeByIdRef.current = new Map(places.map((place) => [String(place.id), place]));
  placesRef.current = places;

  const stopHoverAnimation = (id: FeatureId) => {
    const animation = hoverAnimationsRef.current.get(id);

    if (animation) {
      window.cancelAnimationFrame(animation.frameId);
      hoverAnimationsRef.current.delete(id);
    }
  };

  const setMarkerHoverProgress = (map: maplibregl.Map, id: FeatureId, progress: number) => {
    const nextProgress = Math.max(0, Math.min(1, progress));

    if (nextProgress === 0) {
      hoverProgressByIdRef.current.delete(id);
    } else {
      hoverProgressByIdRef.current.set(id, nextProgress);
    }

    map.setFeatureState({ id, source: PLACE_SOURCE_ID }, { hoverProgress: nextProgress });
  };

  const animateMarkerHoverProgress = (map: maplibregl.Map, id: FeatureId, to: number) => {
    stopHoverAnimation(id);

    const from = hoverProgressByIdRef.current.get(id) ?? 0;

    if (from === to) {
      setMarkerHoverProgress(map, id, to);
      return;
    }

    const animation: HoverAnimation = {
      frameId: 0,
      from,
      startedAt: window.performance.now(),
      to
    };

    const tick = (now: number) => {
      const elapsed = now - animation.startedAt;
      const progress = Math.min(1, elapsed / MARKER_HOVER_TRANSITION_MS);
      const easedProgress = easeMarkerHover(progress);
      const nextProgress = animation.from + (animation.to - animation.from) * easedProgress;

      setMarkerHoverProgress(map, id, nextProgress);

      if (progress < 1) {
        animation.frameId = window.requestAnimationFrame(tick);
        hoverAnimationsRef.current.set(id, animation);
      } else {
        setMarkerHoverProgress(map, id, animation.to);
        hoverAnimationsRef.current.delete(id);
      }
    };

    animation.frameId = window.requestAnimationFrame(tick);
    hoverAnimationsRef.current.set(id, animation);
  };

  const stopAllHoverAnimations = () => {
    hoverAnimationsRef.current.forEach((animation) => window.cancelAnimationFrame(animation.frameId));
    hoverAnimationsRef.current.clear();
  };

  const createMapMarkerPoints = (targetMap: maplibregl.Map, nextPlaces: PlaceFeature[]) => {
    const activePlaceId = activePlace ? String(activePlace.id) : null;
    const hoveredPlaceId = hoveredPlaceIdRef.current !== null ? String(hoveredPlaceIdRef.current) : null;

    return nextPlaces.map((place) => {
      const placeId = String(place.id);

      return {
        id: place.id,
        isActive: activePlaceId === placeId,
        isHovered: hoveredPlaceId === placeId,
        point: targetMap.project(place.geometry.coordinates)
      };
    });
  };

  const createMapMarkerLayout = (targetMap: maplibregl.Map, nextPlaces: PlaceFeature[]) => {
    const isMobile = window.matchMedia("(max-width: 700px)").matches;
    const markerLayout = createMarkerLayout(
      createMapMarkerPoints(targetMap, nextPlaces),
      {
        maxOffset: isMobile ? 136 : 204,
        previousLayout: markerLayoutByIdRef.current
      }
    );

    markerLayoutByIdRef.current = markerLayout;

    return markerLayout;
  };

  const restoreMarkerFeatureStates = (targetMap: maplibregl.Map) => {
    if (activePlace) {
      targetMap.setFeatureState({ id: activePlace.id, source: PLACE_SOURCE_ID }, { selected: true });
    }

    hoverProgressByIdRef.current.forEach((progress, id) => {
      targetMap.setFeatureState({ id, source: PLACE_SOURCE_ID }, { hoverProgress: progress });
    });
  };

  const setPlaceSourceDataWithMarkerLayout = (
    targetMap: maplibregl.Map,
    nextPlaces: PlaceFeature[],
    markerLayout: Map<string, MarkerLayout>
  ) => {
    const source = targetMap.getSource(PLACE_SOURCE_ID) as GeoJSONSource | undefined;

    if (!source) {
      return;
    }

    const shiftedPlaces = nextPlaces.map((place) => {
      const markerOffset = markerLayout.get(String(place.id))?.markerOffset;

      if (!markerOffset || (markerOffset[0] === 0 && markerOffset[1] === 0)) {
        return place;
      }

      const point = targetMap.project(place.geometry.coordinates);
      const coordinates = targetMap.unproject([point.x + markerOffset[0], point.y + markerOffset[1]]).toArray() as [number, number];

      return {
        ...place,
        geometry: {
          ...place.geometry,
          coordinates
        }
      };
    });

    source.setData(createPlaceFeatureCollection(shiftedPlaces, markerLayout));

    restoreMarkerFeatureStates(targetMap);
  };

  const setPlaceSourceData = (targetMap: maplibregl.Map, nextPlaces: PlaceFeature[]) => {
    const markerLayoutFingerprint = createMarkerLayoutFingerprint(targetMap, nextPlaces, activePlace);
    const markerLayout =
      markerLayoutFingerprint === markerLayoutFingerprintRef.current
        ? markerLayoutByIdRef.current
        : createMapMarkerLayout(targetMap, nextPlaces);

    markerLayoutFingerprintRef.current = markerLayoutFingerprint;
    setPlaceSourceDataWithMarkerLayout(targetMap, nextPlaces, markerLayout);
  };

  const setPlaceSourceSortData = (targetMap: maplibregl.Map, nextPlaces: PlaceFeature[]) => {
    const markerLayout = updateMarkerLayoutSortKeys(
      markerLayoutByIdRef.current,
      createMapMarkerPoints(targetMap, nextPlaces)
    );

    markerLayoutByIdRef.current = markerLayout;
    setPlaceSourceDataWithMarkerLayout(targetMap, nextPlaces, markerLayout);
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const container = containerRef.current;
    const map = new maplibregl.Map({
      container,
      style: mapConfig.styleUrl,
      center: mapConfig.center,
      zoom: zoom ?? mapConfig.zoom,
      minZoom: mapConfig.minZoom,
      maxZoom: mapConfig.maxZoom,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    map.on("load", () => {
      if (!map.hasImage(DEFAULT_PLACE_MARKER_IMAGE_ID)) {
        map.addImage(DEFAULT_PLACE_MARKER_IMAGE_ID, createDefaultMarkerImage(), { pixelRatio: MARKER_IMAGE_PIXEL_RATIO });
      }
      const source = createPlaceFeatureCollection(places);
      map.addSource(PLACE_SOURCE_ID, {
        type: "geojson",
        data: source,
        promoteId: "id"
      });
      addMarkerImagePlaceholders(map, places);
      setPlaceSourceData(map, places);
      addPlaceLayers(map);
      setMapState("ready");
    });
    map.on("error", () => setMapState((state) => (state === "loading" ? "error" : state)));

    mapRef.current = map;
    const stopMapViewportSizeSync = addMapViewportSizeSynchronizer(map, container);

    if (import.meta.env.DEV) {
      (window as typeof window & { __kurskMap?: maplibregl.Map }).__kurskMap = map;
    }

    return () => {
      stopMapViewportSizeSync();
      stopAllHoverAnimations();
      if (import.meta.env.DEV) {
        delete (window as typeof window & { __kurskMap?: maplibregl.Map }).__kurskMap;
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || mapState !== "ready" || zoom === undefined || areMapZoomsEqual(map.getZoom(), zoom)) {
      return;
    }

    map.jumpTo({ zoom });
  }, [mapState, zoom]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || mapState !== "ready" || !onZoomChange) {
      return;
    }

    const syncZoom = () => {
      onZoomChange(map.getZoom());
    };

    map.on("zoomend", syncZoom);

    return () => {
      map.off("zoomend", syncZoom);
    };
  }, [mapState, onZoomChange]);

  useEffect(() => {
    const map = mapRef.current;

    if (
      !map ||
      mapState !== "ready" ||
      !fitBoundsRequest ||
      handledFitBoundsRequestIdRef.current === fitBoundsRequest.id
    ) {
      return;
    }

    const bounds = calculatePlaceBounds(fitBoundsRequest.places);
    handledFitBoundsRequestIdRef.current = fitBoundsRequest.id;

    if (!bounds) {
      return;
    }

    const isMobile = window.matchMedia("(max-width: 700px)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const padding = isMobile
      ? { top: 116, right: 24, bottom: 96, left: 24 }
      : { top: 124, right: activePlace ? 466 : 56, bottom: 72, left: 56 };

    map.fitBounds(bounds, {
      duration: prefersReducedMotion ? 0 : 420,
      maxZoom: 14,
      padding
    });
  }, [activePlace, fitBoundsRequest, mapState]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const resetMarkerInteractionState = (targetMap: maplibregl.Map) => {
      stopAllHoverAnimations();
      targetMap.removeFeatureState({ source: PLACE_SOURCE_ID });
      hoverProgressByIdRef.current.clear();
      hoveredPlaceIdRef.current = null;
      previousActivePlaceIdRef.current = null;
    };

    const updateSource = () => {
      const source = map.getSource(PLACE_SOURCE_ID) as GeoJSONSource | undefined;

      if (!source) {
        return;
      }

      resetMarkerInteractionState(map);
      addMarkerImagePlaceholders(map, places);
      setPlaceSourceData(map, places);
    };

    if (map.getSource(PLACE_SOURCE_ID)) {
      updateSource();
    } else {
      map.once("load", updateSource);
    }

    return () => {
      map.off("load", updateSource);
    };
  }, [places]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || mapState !== "ready") {
      return;
    }

    let frameId: number | null = null;
    const scheduleMarkerLayoutUpdate = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        setPlaceSourceData(map, places);
      });
    };

    scheduleMarkerLayoutUpdateRef.current = scheduleMarkerLayoutUpdate;
    scheduleMarkerLayoutUpdate();
    map.on("zoom", scheduleMarkerLayoutUpdate);
    map.on("resize", scheduleMarkerLayoutUpdate);

    return () => {
      if (scheduleMarkerLayoutUpdateRef.current === scheduleMarkerLayoutUpdate) {
        scheduleMarkerLayoutUpdateRef.current = null;
      }

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      map.off("zoom", scheduleMarkerLayoutUpdate);
      map.off("resize", scheduleMarkerLayoutUpdate);
    };
  }, [activePlace, mapState, places]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || mapState !== "ready" || !map.getSource(PLACE_SOURCE_ID)) {
      return;
    }

    const previousActivePlaceId = previousActivePlaceIdRef.current;

    if (previousActivePlaceId !== null && previousActivePlaceId !== activePlace?.id) {
      map.setFeatureState({ id: previousActivePlaceId, source: PLACE_SOURCE_ID }, { selected: false });
    }

    if (activePlace) {
      map.setFeatureState({ id: activePlace.id, source: PLACE_SOURCE_ID }, { selected: true });
    }

    previousActivePlaceIdRef.current = activePlace?.id ?? null;
  }, [activePlace, mapState]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || mapState !== "ready" || !activePlace) {
      return;
    }

    const isMobile = window.matchMedia("(max-width: 700px)").matches;
    const [longitude, latitude] = activePlace.geometry.coordinates;

    map.easeTo({
      center: [longitude, latitude],
      duration: 420,
      offset: isMobile ? [0, -220] : [-210, 0]
    });
  }, [activePlace, mapState]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || mapState !== "ready") {
      return;
    }

    void addMarkerImages(map, places).catch(() => undefined);
  }, [mapState, places]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || mapState !== "ready") {
      return;
    }

    const selectPlace = (event: MapLayerMouseEvent) => {
      const id = event.features?.[0]?.properties?.id;
      const place = placeByIdRef.current.get(String(id));

      if (place) {
        onPlaceSelect?.(place, "map");
      }
    };
    const syncMarkerHover = (event: MapLayerMouseEvent) => {
      const id = event.features?.[0]?.properties?.id;
      const place = placeByIdRef.current.get(String(id));

      if (place) {
        if (hoveredPlaceIdRef.current === place.id) {
          map.getCanvas().style.cursor = "pointer";
          return;
        }

        if (hoveredPlaceIdRef.current !== null && hoveredPlaceIdRef.current !== place.id) {
          animateMarkerHoverProgress(map, hoveredPlaceIdRef.current, 0);
        }

        animateMarkerHoverProgress(map, place.id, 1);
        hoveredPlaceIdRef.current = place.id;
        setPlaceSourceSortData(map, placesRef.current);
        map.getCanvas().style.cursor = "pointer";
      }
    };
    const hideMarkerLabel = () => {
      if (hoveredPlaceIdRef.current !== null) {
        animateMarkerHoverProgress(map, hoveredPlaceIdRef.current, 0);
        hoveredPlaceIdRef.current = null;
        setPlaceSourceSortData(map, placesRef.current);
      }

      map.getCanvas().style.cursor = "";
    };
    map.on("click", PLACE_SYMBOL_LAYER_ID, selectPlace);
    map.on("mousemove", PLACE_SYMBOL_LAYER_ID, syncMarkerHover);
    map.on("mouseleave", PLACE_SYMBOL_LAYER_ID, hideMarkerLabel);

    return () => {
      map.off("click", PLACE_SYMBOL_LAYER_ID, selectPlace);
      map.off("mousemove", PLACE_SYMBOL_LAYER_ID, syncMarkerHover);
      map.off("mouseleave", PLACE_SYMBOL_LAYER_ID, hideMarkerLabel);
    };
  }, [mapState, onPlaceSelect]);

  return (
    <section
      className="fixed inset-0 bg-[var(--color-page)]"
      data-testid="map-shell"
      data-place-count={places.length}
      aria-label="Карта мест Курска"
    >
      <div className="!absolute !inset-0 !h-full !w-full" ref={containerRef} />
      <div aria-label="Места на карте">
        {places.map((place) => (
          <button
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-20 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:tracking-[-0.01em]"
            data-testid="map-place-control"
            key={place.id}
            type="button"
            onClick={() => onPlaceSelect?.(place, "map")}
          >
            {getPlaceName(place)}
          </button>
        ))}
      </div>
      {mapState !== "ready" ? <MapFallback state={mapState === "error" ? "error" : "loading"} /> : null}
    </section>
  );
}
