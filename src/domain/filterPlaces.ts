import type { PlaceFeature } from "./places";

export type PlaceFilters = {
  categoryIds: string[];
  collectionIds: string[];
};

function intersects(selected: string[], actual: string[] | undefined): boolean {
  if (selected.length === 0) {
    return true;
  }

  if (!actual || actual.length === 0) {
    return false;
  }

  return selected.some((id) => actual.includes(id));
}

export function filterPlaces(places: PlaceFeature[], filters: PlaceFilters): PlaceFeature[] {
  return places.filter(
    (place) =>
      intersects(filters.categoryIds, place.properties.categories) &&
      intersects(filters.collectionIds, place.properties.collections)
  );
}
