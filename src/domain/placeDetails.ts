import type { ExternalLink, Photo, PlaceFeature } from "./places";

export type PlaceDetailsViewModel = {
  id: string | number;
  name: string;
  description: string;
  address: string;
  coordinates: string;
  photos: Photo[];
  tip?: string;
  detailsLink?: ExternalLink;
  links: ExternalLink[];
};

const DETAILS_LINK_BASE_URL = "https://gokursk.ru";

function normalizeDetailsUrl(value?: string): string | undefined {
  const url = value?.trim();

  if (!url) {
    return undefined;
  }

  return new URL(url, DETAILS_LINK_BASE_URL).toString();
}

export function buildPlaceDetails(place: PlaceFeature): PlaceDetailsViewModel {
  const content = place.properties.balloonContent;
  const photos = [...(content.images ?? [])].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

  if (photos.length === 0 && (content.image || content.thumbnail)) {
    const fallbackPhoto: Photo = {
      src: content.image ?? content.thumbnail ?? "",
      order: 0
    };

    if (content.thumbnail) {
      fallbackPhoto.thumbnail = content.thumbnail;
    }

    photos.push(fallbackPhoto);
  }

  const links = [...(place.properties.links ?? [])];
  const detailsUrl = normalizeDetailsUrl(content.externalUrl) ?? normalizeDetailsUrl(content.url);

  if (content.socials) {
    links.push(...content.socials);
  }

  const viewModel: PlaceDetailsViewModel = {
    id: place.id,
    name: content.name,
    description: content.description,
    address: content.address,
    coordinates: content.coordinates,
    photos,
    links
  };

  if (detailsUrl) {
    viewModel.detailsLink = { id: "details", label: "Узнать подробнее", url: detailsUrl, kind: "site" };
  }

  if (content.tip) {
    viewModel.tip = content.tip;
  }

  return viewModel;
}
