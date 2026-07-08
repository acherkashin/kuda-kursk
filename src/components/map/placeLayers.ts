import type { Map } from "maplibre-gl";

export const PLACE_SOURCE_ID = "places";
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
const MARKER_SORT_KEY = ["to-number", ["get", "markerSortKey"], 0] as unknown as number;

export function addPlaceLayers(map: Map) {
  if (!map.getLayer(PLACE_SYMBOL_LAYER_ID)) {
    map.addLayer({
      id: PLACE_SYMBOL_LAYER_ID,
      type: "symbol",
      source: PLACE_SOURCE_ID,
      layout: {
        "icon-image": ["case", ["has", "markerImageId"], ["get", "markerImageId"], DEFAULT_PLACE_MARKER_IMAGE_ID],
        "icon-size": 1,
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "symbol-sort-key": MARKER_SORT_KEY
      }
    });
  }

  if (!map.getLayer(PLACE_ACTIVE_SYMBOL_LAYER_ID)) {
    map.addLayer({
      id: PLACE_ACTIVE_SYMBOL_LAYER_ID,
      type: "symbol",
      source: PLACE_SOURCE_ID,
      layout: {
        "icon-image": ["case", ["has", "activeMarkerImageId"], ["get", "activeMarkerImageId"], DEFAULT_PLACE_MARKER_IMAGE_ID],
        "icon-size": 1,
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
        "symbol-sort-key": MARKER_SORT_KEY
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
        "text-padding": 8,
        "symbol-sort-key": MARKER_SORT_KEY
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
