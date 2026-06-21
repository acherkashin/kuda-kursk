import { filterVisiblePlaces, type PlaceFeature } from "../domain/places";
import { resolvePublicPath } from "../services/publicPath";
import { validateGeoJsonPlace } from "./validateGeoJsonPlace";

export async function loadPlaces(path = "/data/main-map.json"): Promise<PlaceFeature[]> {
  const response = await fetch(resolvePublicPath(path));

  if (!response.ok) {
    throw new Error(`Failed to load places: ${response.status}`);
  }

  const raw = (await response.json()) as unknown;

  if (
    typeof raw !== "object" ||
    raw === null ||
    Array.isArray(raw) ||
    (raw as { type?: unknown }).type !== "FeatureCollection" ||
    !Array.isArray((raw as { features?: unknown }).features)
  ) {
    throw new Error("Map data must contain a GeoJSON FeatureCollection");
  }

  return filterVisiblePlaces((raw as { features: unknown[] }).features.map(validateGeoJsonPlace));
}
