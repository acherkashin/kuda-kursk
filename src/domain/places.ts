export type Coordinates = [longitude: number, latitude: number];

export type Photo = {
  src: string;
  thumbnail?: string;
  caption?: string;
  order?: number;
};

export type ExternalLink = {
  id?: string;
  label: string;
  url: string;
  kind?: "site" | "vk" | "telegram" | "instagram" | "phone" | "other" | string;
};

export type BalloonContent = {
  image?: string;
  thumbnail?: string;
  images?: Photo[];
  name: string;
  description: string;
  address: string;
  coordinates: string;
  tip?: string;
  socials?: ExternalLink[];
  externalUrl?: string;
  [key: string]: unknown;
};

export type PlaceVisibility = {
  public?: boolean;
  communitySlugs?: string[];
  linkOnly?: boolean;
};

export type PlaceFeature = {
  type: "Feature";
  id: string | number;
  geometry: {
    type: "Point";
    coordinates: Coordinates;
  };
  properties: {
    id: string | number;
    balloonContent: BalloonContent;
    links?: ExternalLink[];
    visibility?: PlaceVisibility;
    [key: string]: unknown;
  };
};

export function getPlaceId(place: PlaceFeature): string {
  return String(place.id);
}

export function getPlaceName(place: PlaceFeature): string {
  return place.properties.balloonContent.name;
}

export function isPublicPlace(place: PlaceFeature): boolean {
  return place.properties.visibility?.public !== false && place.properties.visibility?.linkOnly !== true;
}
