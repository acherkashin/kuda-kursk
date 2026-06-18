import maplibregl, { type GeoJSONSource, type MapLayerMouseEvent } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { mapConfig } from "../../domain/mapConfig";
import type { PlaceFeature } from "../../domain/places";
import { getPlaceName } from "../../domain/places";
import { MapFallback } from "./MapFallback";
import {
  addPlaceLayers,
  DEFAULT_PLACE_MARKER_IMAGE_ID,
  PLACE_CLUSTER_LAYER_ID,
  PLACE_SOURCE_ID,
  PLACE_SYMBOL_LAYER_ID
} from "./placeLayers";
import { createPlaceFeatureCollection } from "./placeSource";
import {
  addMarkerImagePlaceholders,
  addMarkerImages,
  createDefaultMarkerImage,
  MARKER_IMAGE_PIXEL_RATIO
} from "./markerImages";

const MARKER_HOVER_TRANSITION_MS = 310;

type KurskMapProps = {
  activePlace: PlaceFeature | null;
  places: PlaceFeature[];
  onPlaceSelect?: (place: PlaceFeature, source: "map") => void;
};

type FeatureId = string | number;
type HoverAnimation = {
  frameId: number;
  from: number;
  startedAt: number;
  to: number;
};

function easeMarkerHover(progress: number) {
  return 1 - (1 - progress) ** 3;
}

export function KurskMap({ activePlace, places, onPlaceSelect }: KurskMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const hoverAnimationsRef = useRef<Map<FeatureId, HoverAnimation>>(new Map());
  const hoverProgressByIdRef = useRef<Map<FeatureId, number>>(new Map());
  const placeByIdRef = useRef<Map<string, PlaceFeature>>(new Map());
  const previousActivePlaceIdRef = useRef<string | number | null>(null);
  const hoveredPlaceIdRef = useRef<string | number | null>(null);
  const [mapState, setMapState] = useState<"loading" | "ready" | "error">("loading");

  placeByIdRef.current = new Map(places.map((place) => [String(place.id), place]));

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

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapConfig.styleUrl,
      center: mapConfig.center,
      zoom: mapConfig.zoom,
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
        promoteId: "id",
        cluster: true,
        clusterRadius: 38
      });
      addMarkerImagePlaceholders(map, places);
      addPlaceLayers(map);
      setMapState("ready");
      void addMarkerImages(map, places).catch(() => undefined);
    });
    map.on("error", () => setMapState((state) => (state === "loading" ? "error" : state)));

    mapRef.current = map;
    if (import.meta.env.DEV) {
      (window as typeof window & { __kurskMap?: maplibregl.Map }).__kurskMap = map;
    }

    return () => {
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
      source.setData(createPlaceFeatureCollection(places));
      void addMarkerImages(map, places).catch(() => undefined);
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
        map.getCanvas().style.cursor = "pointer";
      }
    };
    const hideMarkerLabel = () => {
      if (hoveredPlaceIdRef.current !== null) {
        animateMarkerHoverProgress(map, hoveredPlaceIdRef.current, 0);
        hoveredPlaceIdRef.current = null;
      }

      map.getCanvas().style.cursor = "";
    };
    const showClusterPointer = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const expandCluster = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      const clusterId = feature?.properties?.cluster_id;
      const source = map.getSource(PLACE_SOURCE_ID) as GeoJSONSource | undefined;

      if (!feature || typeof clusterId !== "number" || !source) {
        return;
      }

      void source.getClusterExpansionZoom(clusterId).then((zoom) => {
        const center = (feature.geometry as unknown as { coordinates: [number, number] }).coordinates;

        map.easeTo({ center, zoom });
      });
    };

    map.on("click", PLACE_SYMBOL_LAYER_ID, selectPlace);
    map.on("mousemove", PLACE_SYMBOL_LAYER_ID, syncMarkerHover);
    map.on("mouseleave", PLACE_SYMBOL_LAYER_ID, hideMarkerLabel);
    map.on("click", PLACE_CLUSTER_LAYER_ID, expandCluster);
    map.on("mouseenter", PLACE_CLUSTER_LAYER_ID, showClusterPointer);
    map.on("mouseleave", PLACE_CLUSTER_LAYER_ID, hideMarkerLabel);

    return () => {
      map.off("click", PLACE_SYMBOL_LAYER_ID, selectPlace);
      map.off("mousemove", PLACE_SYMBOL_LAYER_ID, syncMarkerHover);
      map.off("mouseleave", PLACE_SYMBOL_LAYER_ID, hideMarkerLabel);
      map.off("click", PLACE_CLUSTER_LAYER_ID, expandCluster);
      map.off("mouseenter", PLACE_CLUSTER_LAYER_ID, showClusterPointer);
      map.off("mouseleave", PLACE_CLUSTER_LAYER_ID, hideMarkerLabel);
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
