import type { PlaceFeature } from "./places";

export const PLACE_CATEGORY_SEARCH_PARAM = "category";
export const PLACE_CATEGORY_GROUP_SEARCH_PARAM = "categoryGroup";

export const placeCategoryGroups = ["history-era", "history-theme"] as const;
const categoryGroupSearchValues = {
  era: "history-era",
  theme: "history-theme"
} as const;

export type PlaceCategoryGroup = (typeof placeCategoryGroups)[number];

export const placeCategories = [
  { slug: "chalet", label: "🏡 Шале", group: undefined },
  { slug: "history-era-before-1917", label: "До 1917", group: "history-era" },
  { slug: "history-era-1940s-1950s", label: "1940–50-е", group: "history-era" },
  { slug: "history-era-1960s", label: "1960-е", group: "history-era" },
  { slug: "history-era-1970s", label: "1970-е", group: "history-era" },
  { slug: "history-era-1980s-1990s", label: "1980–90-е", group: "history-era" },
  { slug: "history-era-2000s-now", label: "2000-е — сегодня", group: "history-era" },
  { slug: "history-era-undated", label: "Без даты", group: "history-era" },
  { slug: "history-theme-streets", label: "Улицы и перекрёстки", group: "history-theme" },
  { slug: "history-theme-architecture", label: "Здания и архитектура", group: "history-theme" },
  { slug: "history-theme-leisure", label: "Парки и отдых", group: "history-theme" },
  { slug: "history-theme-water", label: "Вода и мосты", group: "history-theme" },
  { slug: "history-theme-infrastructure", label: "Транспорт и инфраструктура", group: "history-theme" },
  { slug: "history-theme-city-change", label: "Город меняется", group: "history-theme" },
  { slug: "history-theme-comparison", label: "Сравнение эпох", group: "history-theme" }
] as const;

export type PlaceCategorySlug = (typeof placeCategories)[number]["slug"];

const placeCategorySlugs = new Set<string>(placeCategories.map((category) => category.slug));

export function isPlaceCategorySlug(value: string): value is PlaceCategorySlug {
  return placeCategorySlugs.has(value);
}

export function isPlaceCategoryGroup(value: string): value is PlaceCategoryGroup {
  return (placeCategoryGroups as readonly string[]).includes(value);
}

export function parsePlaceCategory(value: string | null): PlaceCategorySlug | null {
  const normalizedValue = value?.trim();

  return normalizedValue && isPlaceCategorySlug(normalizedValue) ? normalizedValue : null;
}

export function parsePlaceCategoryGroup(value: string | null): PlaceCategoryGroup | null {
  const normalizedValue = value?.trim();

  return normalizedValue && normalizedValue in categoryGroupSearchValues
    ? categoryGroupSearchValues[normalizedValue as keyof typeof categoryGroupSearchValues]
    : null;
}

export function formatPlaceCategoryGroup(group: PlaceCategoryGroup): "era" | "theme" {
  return group === "history-era" ? "era" : "theme";
}

export function getPlaceCategoryGroup(categorySlug: PlaceCategorySlug): PlaceCategoryGroup | undefined {
  return placeCategories.find((category) => category.slug === categorySlug)?.group;
}

export function getPlaceCategoryLabel(categorySlug: PlaceCategorySlug): string {
  return placeCategories.find((category) => category.slug === categorySlug)?.label ?? categorySlug;
}

export function filterPlacesByCategory(places: PlaceFeature[], category: PlaceCategorySlug | null): PlaceFeature[] {
  if (!category) {
    return places;
  }

  return places.filter((place) => place.properties.categories?.includes(category));
}

export function getAvailablePlaceCategories(places: PlaceFeature[], group?: PlaceCategoryGroup) {
  return placeCategories.filter(
    (category) =>
      (group === undefined || category.group === group) &&
      places.some((place) => place.properties.categories?.includes(category.slug))
  );
}
