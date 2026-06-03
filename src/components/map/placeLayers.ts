import type { Map } from "maplibre-gl";

export const PLACE_SOURCE_ID = "places";
export const PLACE_CLUSTER_LAYER_ID = "place-clusters";
export const PLACE_CLUSTER_COUNT_LAYER_ID = "place-cluster-counts";
export const PLACE_CIRCLE_LAYER_ID = "place-marker-halos";
export const PLACE_LABEL_LAYER_ID = "place-marker-labels";
export const PLACE_ACTIVE_SYMBOL_LAYER_ID = "place-marker-active-images";
export const PLACE_SYMBOL_LAYER_ID = "place-marker-images";
export const DEFAULT_PLACE_MARKER_IMAGE_ID = "place-marker-default";

type BooleanFeatureStateExpression = ["boolean", ["feature-state", string], boolean];
type NumberFeatureStateExpression = ["number", ["feature-state", string], number];
type MarkerInteractionProgressExpression = ["case", BooleanFeatureStateExpression, 1, NumberFeatureStateExpression];

const ACTIVE_MARKER_STATE: BooleanFeatureStateExpression = ["boolean", ["feature-state", "selected"], false];
const HOVER_PROGRESS_STATE: NumberFeatureStateExpression = ["number", ["feature-state", "hoverProgress"], 0];
const MARKER_INTERACTION_PROGRESS: MarkerInteractionProgressExpression = ["case", ACTIVE_MARKER_STATE, 1, HOVER_PROGRESS_STATE];

export function addPlaceLayers(map: Map) {
  if (!map.getLayer(PLACE_CLUSTER_LAYER_ID)) {
    map.addLayer({
      id: PLACE_CLUSTER_LAYER_ID,
      type: "circle",
      source: PLACE_SOURCE_ID,
      filter: ["has", "point_count"],
      paint: {
        "circle-radius": ["step", ["get", "point_count"], 18, 10, 23, 50, 28],
        "circle-color": "#111111",
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
        "circle-radius": [
          "interpolate",
          ["linear"],
          MARKER_INTERACTION_PROGRESS,
          0,
          ["interpolate", ["linear"], ["zoom"], 10, 22, 15, 30],
          1,
          ["interpolate", ["linear"], ["zoom"], 10, 28, 15, 36]
        ],
        "circle-color": "#e8eefc",
        "circle-stroke-width": 0,
        "circle-stroke-color": "#0B39A4",
        "circle-opacity": ["*", 0.5, MARKER_INTERACTION_PROGRESS]
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
        "icon-size": 1,
        "icon-allow-overlap": true,
        "icon-ignore-placement": true
      }
    });
  }

  if (!map.getLayer(PLACE_ACTIVE_SYMBOL_LAYER_ID)) {
    map.addLayer({
      id: PLACE_ACTIVE_SYMBOL_LAYER_ID,
      type: "symbol",
      source: PLACE_SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      layout: {
        "icon-image": ["case", ["has", "activeMarkerImageId"], ["get", "activeMarkerImageId"], DEFAULT_PLACE_MARKER_IMAGE_ID],
        "icon-size": 1,
        "icon-allow-overlap": true,
        "icon-ignore-placement": true
      },
      paint: {
        "icon-opacity": MARKER_INTERACTION_PROGRESS
      }
    });
  }

  if (!map.getLayer(PLACE_LABEL_LAYER_ID)) {
    map.addLayer({
      id: PLACE_LABEL_LAYER_ID,
      type: "symbol",
      source: PLACE_SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Bold"],
        "text-size": 12,
        "text-offset": [0, 2.65],
        "text-anchor": "top",
        "text-justify": "center",
        "text-line-height": 1.14,
        "text-max-width": 10,
        "text-allow-overlap": true,
        "text-ignore-placement": true,
        "text-padding": 8
      },
      paint: {
        "text-color": "#0a0a0a",
        "text-halo-color": "#ffffff",
        "text-halo-width": 3,
        "text-halo-blur": 1,
        "text-opacity": MARKER_INTERACTION_PROGRESS
      }
    });
  }
}
