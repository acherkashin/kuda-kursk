import type { PlaceFeature } from "./places";
import { getPlaceId, isPublicPlace } from "./places";

export type CommunityMap = {
  slug: string;
  title: string;
  description?: string;
  placeIds: Array<string | number>;
  linkOnlyPlaceIds?: Array<string | number>;
  theme?: {
    accentColor?: string;
    logoSrc?: string;
  };
};

export type ResolvedCommunityMap =
  | {
      status: "found";
      map: CommunityMap;
      places: PlaceFeature[];
      publicCount: number;
      linkOnlyCount: number;
    }
  | {
      status: "not-found";
      slug: string;
    };

export function resolveCommunityMap(
  slug: string | undefined,
  maps: CommunityMap[],
  places: PlaceFeature[]
): ResolvedCommunityMap {
  const normalizedSlug = slug?.trim();

  if (!normalizedSlug) {
    return { status: "not-found", slug: "" };
  }

  const map = maps.find((candidate) => candidate.slug === normalizedSlug);

  if (!map) {
    return { status: "not-found", slug: normalizedSlug };
  }

  const placeById = new Map(places.map((place) => [getPlaceId(place), place]));
  const publicIds = new Set(map.placeIds.map(String));
  const linkOnlyIds = new Set((map.linkOnlyPlaceIds ?? []).map(String));
  const resolvedPlaces = [...publicIds, ...linkOnlyIds]
    .map((id) => placeById.get(id))
    .filter((place): place is PlaceFeature => Boolean(place));

  return {
    status: "found",
    map,
    places: resolvedPlaces,
    publicCount: resolvedPlaces.filter(isPublicPlace).length,
    linkOnlyCount: resolvedPlaces.filter((place) => place.properties.visibility?.linkOnly === true).length
  };
}
