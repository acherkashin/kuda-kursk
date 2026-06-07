import { findMapBySlug } from "./mapCatalog";
import type { ExternalLink, Photo, PlaceFeature } from "./places";

export type PlaceMapLinkView = {
  slug: string;
  title: string;
};

export type PlaceDetailsViewModel = {
  id: string | number;
  name: string;
  description: string;
  address: string;
  coordinates: string;
  photos: Photo[];
  tip?: string;
  links: ExternalLink[];
  /** Если задано — место ведёт на под-карту, и в карточке показывается переход. */
  mapLink?: PlaceMapLinkView;
  /** Можно ли строить маршрут до места. По умолчанию true. */
  routable: boolean;
};

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
    links,
    routable: place.properties.routable !== false
  };

  const mapLinkSlug = place.properties.mapLink?.slug;
  const linkedMap = mapLinkSlug ? findMapBySlug(mapLinkSlug) : undefined;

  if (linkedMap) {
    viewModel.mapLink = { slug: linkedMap.slug, title: linkedMap.title };
  }

  if (content.tip) {
    viewModel.tip = content.tip;
  }

  return viewModel;
}
