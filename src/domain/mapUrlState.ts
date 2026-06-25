import { mapConfig } from "./mapConfig";

export const MAP_ZOOM_SEARCH_PARAM = "zoom";
export const MAP_ZOOM_PRECISION = 2;

export function parseMapZoom(value: string | null) {
  if (!value) {
    return null;
  }

  const zoom = Number(value);

  if (!Number.isFinite(zoom) || zoom < mapConfig.minZoom || zoom > mapConfig.maxZoom) {
    return null;
  }

  return zoom;
}

export function formatMapZoom(zoom: number) {
  return Number(zoom.toFixed(MAP_ZOOM_PRECISION)).toString();
}

export function areMapZoomsEqual(firstZoom: number, secondZoom: number) {
  return formatMapZoom(firstZoom) === formatMapZoom(secondZoom);
}
