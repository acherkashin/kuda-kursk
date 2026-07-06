import type { BalloonContent, Coordinates, PlaceFeature } from "../domain/places";
import { isPlaceCategorySlug, type PlaceCategorySlug } from "../domain/placeCategories";

type JsonObject = Record<string, unknown>;

const KURSK_LONGITUDE_RANGE = [35, 38] as const;
const KURSK_LATITUDE_RANGE = [50, 53] as const;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringOrNumber(value: unknown): value is string | number {
  return typeof value === "string" || typeof value === "number";
}

function requireString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Place balloonContent.${fieldName} is required`);
  }

  return value;
}

function validateCoordinates(value: unknown): Coordinates {
  if (!Array.isArray(value) || value.length !== 2) {
    throw new Error("Place geometry.coordinates must be [longitude, latitude]");
  }

  const [longitude, latitude] = value;

  if (typeof longitude !== "number" || typeof latitude !== "number") {
    throw new Error("Place geometry.coordinates must contain numbers");
  }

  const looksCanonical =
    longitude >= KURSK_LONGITUDE_RANGE[0] &&
    longitude <= KURSK_LONGITUDE_RANGE[1] &&
    latitude >= KURSK_LATITUDE_RANGE[0] &&
    latitude <= KURSK_LATITUDE_RANGE[1];
  const looksSwapped =
    longitude >= KURSK_LATITUDE_RANGE[0] &&
    longitude <= KURSK_LATITUDE_RANGE[1] &&
    latitude >= KURSK_LONGITUDE_RANGE[0] &&
    latitude <= KURSK_LONGITUDE_RANGE[1];

  if (!looksCanonical || looksSwapped) {
    throw new Error("Place geometry.coordinates must be canonical [longitude, latitude] for Kursk");
  }

  return [longitude, latitude];
}

function validateBalloonContent(value: unknown): BalloonContent {
  if (!isObject(value)) {
    throw new Error("Place properties.balloonContent is required");
  }

  return {
    ...value,
    name: requireString(value.name, "name"),
    description: requireString(value.description, "description"),
    address: requireString(value.address, "address")
  };
}

function validateCategories(value: unknown): PlaceCategorySlug[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value) || value.some((category) => typeof category !== "string" || !isPlaceCategorySlug(category))) {
    throw new Error("Place properties.categories must contain known category slugs");
  }

  if (new Set(value).size !== value.length) {
    throw new Error("Place properties.categories must not contain duplicate category slugs");
  }

  return [...value];
}

export function validateGeoJsonPlace(value: unknown): PlaceFeature {
  if (!isObject(value)) {
    throw new Error("Place must be an object");
  }

  if (value.type !== "Feature") {
    throw new Error('Place type must be "Feature"');
  }

  if (!isStringOrNumber(value.id)) {
    throw new Error("Place id must be a string or number");
  }

  if (!isObject(value.geometry) || value.geometry.type !== "Point") {
    throw new Error('Place geometry.type must be "Point"');
  }

  if (!isObject(value.properties)) {
    throw new Error("Place properties are required");
  }

  if (!isStringOrNumber(value.properties.id) || String(value.properties.id) !== String(value.id)) {
    throw new Error("Place properties.id must match id");
  }

  const categories = validateCategories(value.properties.categories);
  const place: PlaceFeature = {
    type: "Feature",
    id: value.id,
    geometry: {
      type: "Point",
      coordinates: validateCoordinates(value.geometry.coordinates)
    },
    properties: {
      ...value.properties,
      id: value.properties.id,
      balloonContent: validateBalloonContent(value.properties.balloonContent),
      ...(categories !== undefined ? { categories } : {})
    }
  };

  return place;
}
