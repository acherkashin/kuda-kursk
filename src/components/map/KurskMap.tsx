import maplibregl, { type GeoJSONSource, type MapLayerMouseEvent } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { mapConfig } from "../../domain/mapConfig";
import type { PlaceFeature } from "../../domain/places";
import { getPlaceName } from "../../domain/places";
import { MapFallback } from "./MapFallback";
import { MapLogo } from "./MapLogo";
import { MarkerTooltip } from "./MarkerTooltip";
import {
  addPlaceLayers,
  DEFAULT_PLACE_MARKER_IMAGE_ID,
  PLACE_CLUSTER_LAYER_ID,
  PLACE_SOURCE_ID,
  PLACE_SYMBOL_LAYER_ID
} from "./placeLayers";
import { createPlaceFeatureCollection } from "./placeSource";

type KurskMapProps = {
  places: PlaceFeature[];
  onPlaceSelect?: (place: PlaceFeature, source: "map") => void;
};

export function KurskMap({ places, onPlaceSelect }: KurskMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const placeByIdRef = useRef<Map<string, PlaceFeature>>(new Map());
  const [tooltipName, setTooltipName] = useState<string | null>(null);
  const [mapState, setMapState] = useState<"loading" | "ready" | "error">("loading");

  placeByIdRef.current = new Map(places.map((place) => [String(place.id), place]));

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
        map.addImage(DEFAULT_PLACE_MARKER_IMAGE_ID, createDefaultMarkerImage(), { pixelRatio: 2 });
      }
      const source = createPlaceFeatureCollection(places);
      map.addSource(PLACE_SOURCE_ID, {
        type: "geojson",
        data: source,
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

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const updateSource = () => {
      const source = map.getSource(PLACE_SOURCE_ID) as GeoJSONSource | undefined;
      addMarkerImagePlaceholders(map, places);
      source?.setData(createPlaceFeatureCollection(places));
      void addMarkerImages(map, places).catch(() => undefined);
    };

    if (map.isStyleLoaded() && map.getSource(PLACE_SOURCE_ID)) {
      updateSource();
    } else {
      map.once("load", updateSource);
    }
  }, [places]);

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
    const showTooltip = (event: MapLayerMouseEvent) => {
      const id = event.features?.[0]?.properties?.id;
      const place = placeByIdRef.current.get(String(id));

      if (place) {
        map.getCanvas().style.cursor = "pointer";
        setTooltipName(getPlaceName(place));
      }
    };
    const hideTooltip = () => {
      map.getCanvas().style.cursor = "";
      setTooltipName(null);
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
    map.on("mouseenter", PLACE_SYMBOL_LAYER_ID, showTooltip);
    map.on("mouseleave", PLACE_SYMBOL_LAYER_ID, hideTooltip);
    map.on("click", PLACE_CLUSTER_LAYER_ID, expandCluster);
    map.on("mouseenter", PLACE_CLUSTER_LAYER_ID, showClusterPointer);
    map.on("mouseleave", PLACE_CLUSTER_LAYER_ID, hideTooltip);

    return () => {
      map.off("click", PLACE_SYMBOL_LAYER_ID, selectPlace);
      map.off("mouseenter", PLACE_SYMBOL_LAYER_ID, showTooltip);
      map.off("mouseleave", PLACE_SYMBOL_LAYER_ID, hideTooltip);
      map.off("click", PLACE_CLUSTER_LAYER_ID, expandCluster);
      map.off("mouseenter", PLACE_CLUSTER_LAYER_ID, showClusterPointer);
      map.off("mouseleave", PLACE_CLUSTER_LAYER_ID, hideTooltip);
    };
  }, [mapState, onPlaceSelect]);

  return (
    <section
      className="fixed inset-0 bg-[#dfe8dd]"
      data-testid="map-shell"
      data-place-count={places.length}
      aria-label="Карта мест Курска"
    >
      <div className="!absolute !inset-0 !h-full !w-full" ref={containerRef} />
      <div aria-label="Места на карте">
        {places.map((place) => (
          <button
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-20 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-bold"
            data-testid="map-place-control"
            key={place.id}
            type="button"
            onBlur={() => setTooltipName(null)}
            onClick={() => onPlaceSelect?.(place, "map")}
            onFocus={() => setTooltipName(getPlaceName(place))}
          >
            {getPlaceName(place)}
          </button>
        ))}
      </div>
      {mapState !== "ready" ? <MapFallback state={mapState === "error" ? "error" : "loading"} /> : null}
      <MapLogo />
      <MarkerTooltip name={tooltipName} />
    </section>
  );
}

function createDefaultMarkerImage(): ImageData {
  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  if (!context) {
    return new ImageData(size, size);
  }

  context.fillStyle = "#ffffff";
  context.beginPath();
  context.arc(size / 2, size / 2, 40, 0, Math.PI * 2);
  context.fill();
  context.lineWidth = 10;
  context.strokeStyle = "#2f7d5b";
  context.stroke();
  context.fillStyle = "#2f7d5b";
  context.beginPath();
  context.arc(size / 2, size / 2, 18, 0, Math.PI * 2);
  context.fill();

  return context.getImageData(0, 0, size, size);
}

async function addMarkerImages(map: maplibregl.Map, places: PlaceFeature[]) {
  const collection = createPlaceFeatureCollection(places);
  const images = new Map<string, string>();

  collection.features.forEach((feature) => {
    const { markerImage, markerImageId } = feature.properties;

    if (markerImage && markerImageId && !map.hasImage(markerImageId)) {
      images.set(markerImageId, markerImage);
    }
  });

  await Promise.all(
    [...images].map(async ([imageId, imageUrl]) => {
      const image = await loadImage(imageUrl);

      if (map.hasImage(imageId)) {
        map.updateImage(imageId, image);
      } else {
        map.addImage(imageId, image, { pixelRatio: 2 });
      }
    })
  );
}

function addMarkerImagePlaceholders(map: maplibregl.Map, places: PlaceFeature[]) {
  const collection = createPlaceFeatureCollection(places);

  collection.features.forEach((feature) => {
    const { markerImageId } = feature.properties;

    if (markerImageId && !map.hasImage(markerImageId)) {
      map.addImage(markerImageId, createDefaultMarkerImage(), { pixelRatio: 2 });
    }
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
