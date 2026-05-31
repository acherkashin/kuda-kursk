import type { PlaceFeature } from "../domain/places";
import { validateGeoJsonPlace } from "./validateGeoJsonPlace";

export async function loadPlaces(path = "/data/places.json"): Promise<PlaceFeature[]> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load places: ${response.status}`);
  }

  const raw = (await response.json()) as unknown;

  if (!Array.isArray(raw)) {
    throw new Error("places.json must contain an array");
  }

  return raw.map(validateGeoJsonPlace);
}
