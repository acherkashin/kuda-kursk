import type { CommunityMap } from "../domain/communityMaps";

function isCommunityMap(value: unknown): value is CommunityMap {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.slug === "string" &&
    typeof candidate.title === "string" &&
    Array.isArray(candidate.placeIds) &&
    candidate.placeIds.every((id) => typeof id === "string" || typeof id === "number") &&
    (candidate.linkOnlyPlaceIds === undefined ||
      (Array.isArray(candidate.linkOnlyPlaceIds) &&
        candidate.linkOnlyPlaceIds.every((id) => typeof id === "string" || typeof id === "number")))
  );
}

export async function loadCommunityMaps(path = "/data/community-maps.json"): Promise<CommunityMap[]> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load community maps: ${response.status}`);
  }

  const raw = (await response.json()) as unknown;

  if (!Array.isArray(raw) || !raw.every(isCommunityMap)) {
    throw new Error("community-maps.json must contain valid community maps");
  }

  return raw;
}
