import type { PlaceFeature } from "../../domain/places";

export type PlaceProperties = {
  id: string | number;
  name: string;
  thumbnail?: string;
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

export function createPlaceFeatureCollection(places: PlaceFeature[]): PlaceFeatureCollection {
  return {
    type: "FeatureCollection",
    features: places.map((place) => {
      const properties: PlaceProperties = {
        id: place.id,
        name: place.properties.balloonContent.name
      };

      if (place.properties.balloonContent.thumbnail) {
        properties.thumbnail = place.properties.balloonContent.thumbnail;
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
