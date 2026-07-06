import type { PlaceFeature } from "./places";

export const PLACE_CATEGORY_SEARCH_PARAM = "category";

export const placeCategories = [
  {
    slug: "chalet",
    label: "🏡 Шале"
  }
] as const;

export type PlaceCategorySlug = (typeof placeCategories)[number]["slug"];

const placeCategorySlugs = new Set<string>(placeCategories.map((category) => category.slug));

export function isPlaceCategorySlug(value: string): value is PlaceCategorySlug {
  return placeCategorySlugs.has(value);
}

export function parsePlaceCategory(value: string | null): PlaceCategorySlug | null {
  const normalizedValue = value?.trim();

  return normalizedValue && isPlaceCategorySlug(normalizedValue) ? normalizedValue : null;
}

export function filterPlacesByCategory(places: PlaceFeature[], category: PlaceCategorySlug | null): PlaceFeature[] {
  if (!category) {
    return places;
  }

  return places.filter((place) => place.properties.categories?.includes(category));
}

export function getAvailablePlaceCategories(places: PlaceFeature[]) {
  return placeCategories.filter((category) =>
    places.some((place) => place.properties.categories?.includes(category.slug))
  );
}
