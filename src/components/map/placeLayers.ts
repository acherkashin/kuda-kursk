import type { Map } from "maplibre-gl";

export const PLACE_SOURCE_ID = "places";
export const PLACE_CIRCLE_LAYER_ID = "place-circles";
export const PLACE_LABEL_LAYER_ID = "place-labels";

export function addPlaceLayers(map: Map) {
  if (!map.getLayer(PLACE_CIRCLE_LAYER_ID)) {
    map.addLayer({
      id: PLACE_CIRCLE_LAYER_ID,
      type: "circle",
      source: PLACE_SOURCE_ID,
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 7, 15, 12],
        "circle-color": "#2f7d5b",
        "circle-stroke-width": 3,
        "circle-stroke-color": "#ffffff"
      }
    });
  }

  if (!map.getLayer(PLACE_LABEL_LAYER_ID)) {
    map.addLayer({
      id: PLACE_LABEL_LAYER_ID,
      type: "symbol",
      source: PLACE_SOURCE_ID,
      minzoom: 13,
      layout: {
        "text-field": ["get", "name"],
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
