import type { ExternalLink, Photo, PlaceFeature } from "./places";

export type PlaceDetailsViewModel = {
  id: string | number;
  name: string;
  description: string;
  address: string;
  coordinates: string;
  photos: Photo[];
  badges: NonNullable<PlaceFeature["properties"]["badges"]>;
  tip?: string;
  links: ExternalLink[];
};

export function buildPlaceDetails(place: PlaceFeature): PlaceDetailsViewModel {
  const content = place.properties.balloonContent;
  const photos = [...(content.images ?? [])].sort((left, right) => (left.order ?? 0) - (right.order ?? 0));

  if (photos.length === 0 && (content.image || content.thumbnail)) {
    const fallbackPhoto: Photo = {
      src: content.image ?? content.thumbnail ?? "",
      caption: content.name,
      order: 0
    };

    if (content.thumbnail) {
      fallbackPhoto.thumbnail = content.thumbnail;
    }

    photos.push(fallbackPhoto);
  }

  const links = [...(place.properties.links ?? [])];

  if (content.externalUrl) {
    links.unshift({ id: "external", label: "Сайт", url: content.externalUrl, kind: "site" });
  }

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
    badges: place.properties.badges ?? [],
    links
  };

  if (content.tip) {
    viewModel.tip = content.tip;
  }

  return viewModel;
}
