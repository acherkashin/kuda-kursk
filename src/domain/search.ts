import type { PlaceFeature } from "./places";

export function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase("ru-RU")
    .normalize("NFKD")
    .replaceAll("ё", "е")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}

function searchFields(place: PlaceFeature): string[] {
  const content = place.properties.balloonContent;
  const linkLabels = [
    ...(place.properties.links?.map((link) => link.label) ?? []),
    ...(content.socials?.map((link) => link.label) ?? [])
  ];

  return [content.name, content.description, content.address, ...linkLabels];
}

export function searchPlaces(places: PlaceFeature[], query: string): PlaceFeature[] {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return places;
  }

  return places.filter((place) =>
    searchFields(place)
      .map(normalizeSearchText)
      .some((field) => field.includes(normalizedQuery))
  );
}
