import type { PlaceFeature } from "../../domain/places";
import type { MarkerLayout } from "./markerLayout";

export type PlaceProperties = {
  id: string | number;
  name: string;
  thumbnail?: string;
  markerImage?: string;
  markerImageId?: string;
  activeMarkerImageId?: string;
  markerOffset?: [number, number];
  markerSortKey?: number;
  markerTextOffset?: [number, number];
};

export type PlaceFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string | number;
    geometry: PlaceFeature["geometry"];
    properties: PlaceProperties;
  }>;
};

export function createPlaceFeatureCollection(
  places: PlaceFeature[],
  markerLayoutById: Map<string, MarkerLayout> = new Map()
): PlaceFeatureCollection {
  return {
    type: "FeatureCollection",
    features: places.map((place) => {
      const properties: PlaceProperties = {
        id: place.id,
        name: place.properties.balloonContent.name
      };
      const markerImage = place.properties.balloonContent.thumbnail ?? place.properties.balloonContent.image;

      if (place.properties.balloonContent.thumbnail) {
        properties.thumbnail = place.properties.balloonContent.thumbnail;
      }

      if (markerImage) {
        const safeId = String(place.id).replace(/[^a-zA-Z0-9_-]+/g, "-");
        properties.markerImage = markerImage;
        properties.markerImageId = `place-marker-${safeId}`;
        properties.activeMarkerImageId = `place-marker-active-${safeId}`;
      }

      const markerLayout = markerLayoutById.get(String(place.id));

      if (markerLayout) {
        properties.markerOffset = markerLayout.markerOffset;
        properties.markerSortKey = markerLayout.sortKey;
        properties.markerTextOffset = markerLayout.labelOffset;
      }

      return {
        type: "Feature",
        id: place.id,
        geometry: place.geometry,
        properties
      };
    })
  };
}
