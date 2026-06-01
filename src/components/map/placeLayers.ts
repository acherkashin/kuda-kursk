import type { Map } from "maplibre-gl";

export const PLACE_SOURCE_ID = "places";
export const PLACE_CLUSTER_LAYER_ID = "place-clusters";
export const PLACE_CLUSTER_COUNT_LAYER_ID = "place-cluster-counts";
export const PLACE_CIRCLE_LAYER_ID = "place-marker-halos";
export const PLACE_LABEL_LAYER_ID = "place-labels";
export const PLACE_SYMBOL_LAYER_ID = "place-marker-images";
export const DEFAULT_PLACE_MARKER_IMAGE_ID = "place-marker-default";

export function addPlaceLayers(map: Map) {
  if (!map.getLayer(PLACE_CLUSTER_LAYER_ID)) {
    map.addLayer({
      id: PLACE_CLUSTER_LAYER_ID,
      type: "circle",
      source: PLACE_SOURCE_ID,
      filter: ["has", "point_count"],
      paint: {
        "circle-radius": ["step", ["get", "point_count"], 18, 10, 23, 50, 28],
        "circle-color": "#2f7d5b",
        "circle-stroke-width": 3,
        "circle-stroke-color": "#ffffff"
      }
    });
  }

  if (!map.getLayer(PLACE_CLUSTER_COUNT_LAYER_ID)) {
    map.addLayer({
      id: PLACE_CLUSTER_COUNT_LAYER_ID,
      type: "symbol",
      source: PLACE_SOURCE_ID,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-size": 12,
        "text-font": ["Noto Sans Regular"]
      },
      paint: {
        "text-color": "#ffffff"
      }
    });
  }

  if (!map.getLayer(PLACE_CIRCLE_LAYER_ID)) {
    map.addLayer({
      id: PLACE_CIRCLE_LAYER_ID,
      type: "circle",
      source: PLACE_SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 16, 15, 21],
        "circle-color": "#ffffff",
        "circle-stroke-width": 3,
        "circle-stroke-color": "#2f7d5b",
        "circle-opacity": 0.98
      }
    });
  }

  if (!map.getLayer(PLACE_SYMBOL_LAYER_ID)) {
    map.addLayer({
      id: PLACE_SYMBOL_LAYER_ID,
      type: "symbol",
      source: PLACE_SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      layout: {
        "icon-image": ["case", ["has", "markerImageId"], ["get", "markerImageId"], DEFAULT_PLACE_MARKER_IMAGE_ID],
        "icon-size": ["interpolate", ["linear"], ["zoom"], 10, 0.28, 15, 0.36],
        "icon-allow-overlap": true,
        "icon-ignore-placement": true
      }
    });
  }

  if (!map.getLayer(PLACE_LABEL_LAYER_ID)) {
    map.addLayer({
      id: PLACE_LABEL_LAYER_ID,
      type: "symbol",
      source: PLACE_SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      minzoom: 13,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Regular"],
        "text-size": 12,
        "text-offset": [0, 1.35],
        "text-anchor": "top"
      },
      paint: {
        "text-color": "#17211b",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1.4
      }
    });
  }
}
