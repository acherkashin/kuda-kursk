import type { Coordinates, PlaceFeature } from "../../domain/places";

export type PlaceBounds = [southwest: Coordinates, northeast: Coordinates];

export function calculatePlaceBounds(places: PlaceFeature[]): PlaceBounds | null {
  const firstPlace = places[0];

  if (!firstPlace) {
    return null;
  }

  let [minimumLongitude, minimumLatitude] = firstPlace.geometry.coordinates;
  let [maximumLongitude, maximumLatitude] = firstPlace.geometry.coordinates;

  for (const place of places.slice(1)) {
    const [longitude, latitude] = place.geometry.coordinates;
    minimumLongitude = Math.min(minimumLongitude, longitude);
    minimumLatitude = Math.min(minimumLatitude, latitude);
    maximumLongitude = Math.max(maximumLongitude, longitude);
    maximumLatitude = Math.max(maximumLatitude, latitude);
  }

  return [
    [minimumLongitude, minimumLatitude],
    [maximumLongitude, maximumLatitude]
  ];
}
