import maplibregl, { type GeoJSONSource, type Marker } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { mapConfig } from "../../domain/mapConfig";
import type { PlaceFeature } from "../../domain/places";
import { getPlaceName } from "../../domain/places";
import { MapFallback } from "./MapFallback";
import { MapLogo } from "./MapLogo";
import { MarkerTooltip } from "./MarkerTooltip";
import { addPlaceLayers, PLACE_SOURCE_ID } from "./placeLayers";
import { createPlaceFeatureCollection } from "./placeSource";

type KurskMapProps = {
  places: PlaceFeature[];
  activePlaceId?: string | number | null;
  onPlaceSelect?: (place: PlaceFeature, source: "map") => void;
};

export function KurskMap({ places, activePlaceId, onPlaceSelect }: KurskMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRefs = useRef<Marker[]>([]);
  const [tooltipName, setTooltipName] = useState<string | null>(null);
  const [mapState, setMapState] = useState<"loading" | "ready" | "error">("loading");

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
      const source = createPlaceFeatureCollection(places);
      map.addSource(PLACE_SOURCE_ID, {
        type: "geojson",
        data: source,
        cluster: true,
        clusterRadius: 38
      });
      addPlaceLayers(map);
      setMapState("ready");
    });
    map.on("error", () => setMapState((state) => (state === "loading" ? "error" : state)));

    mapRef.current = map;

    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
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
      source?.setData(createPlaceFeatureCollection(places));
    };

    if (map.isStyleLoaded() && map.getSource(PLACE_SOURCE_ID)) {
      updateSource();
    } else {
      map.once("load", updateSource);
    }
  }, [places]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current = places.map((place) => {
      const markerButton = document.createElement("button");
      markerButton.type = "button";
      markerButton.className = "place-marker";
      markerButton.dataset.testid = "place-marker";
      markerButton.setAttribute("aria-label", getPlaceName(place));
      markerButton.setAttribute("title", getPlaceName(place));
      markerButton.dataset.active = String(String(activePlaceId) === String(place.id));
      markerButton.addEventListener("mouseenter", () => setTooltipName(getPlaceName(place)));
      markerButton.addEventListener("mouseleave", () => setTooltipName(null));
      markerButton.addEventListener("focus", () => setTooltipName(getPlaceName(place)));
      markerButton.addEventListener("blur", () => setTooltipName(null));
      markerButton.addEventListener("click", () => onPlaceSelect?.(place, "map"));

      return new maplibregl.Marker({ element: markerButton, anchor: "bottom" })
        .setLngLat(place.geometry.coordinates)
        .addTo(map);
    });

    return () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
    };
  }, [activePlaceId, onPlaceSelect, places]);

  return (
    <section className="map-shell" data-testid="map-shell" aria-label="Карта мест Курска">
      <div className="map-canvas" ref={containerRef} />
      {mapState !== "ready" ? <MapFallback state={mapState === "error" ? "error" : "loading"} /> : null}
      <MapLogo />
      <MarkerTooltip name={tooltipName} />
    </section>
  );
}
