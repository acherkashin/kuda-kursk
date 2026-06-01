import type { PlaceFeature } from "../../domain/places";
import { createPlaceFeatureCollection } from "./placeSource";

export const MARKER_IMAGE_SIZE = 96;

type MarkerImageMap = {
  addImage: (id: string, image: ImageData, options?: { pixelRatio?: number }) => unknown;
  hasImage: (id: string) => boolean;
  updateImage: (id: string, image: ImageData) => unknown;
};

type MarkerImageOptions = {
  createMarkerImageData?: (image: HTMLImageElement) => ImageData;
  loadImage?: (src: string) => Promise<HTMLImageElement>;
};

export function createDefaultMarkerImage(): ImageData {
  const size = MARKER_IMAGE_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  if (!context) {
    return new ImageData(size, size);
  }

  context.fillStyle = "#ffffff";
  context.beginPath();
  context.arc(size / 2, size / 2, 40, 0, Math.PI * 2);
  context.fill();
  context.lineWidth = 10;
  context.strokeStyle = "#111111";
  context.stroke();
  context.fillStyle = "#111111";
  context.beginPath();
  context.arc(size / 2, size / 2, 18, 0, Math.PI * 2);
  context.fill();

  return context.getImageData(0, 0, size, size);
}

export function createMarkerImageData(image: HTMLImageElement): ImageData {
  const size = MARKER_IMAGE_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  if (!context) {
    return new ImageData(size, size);
  }

  const imageWidth = image.naturalWidth || image.width || size;
  const imageHeight = image.naturalHeight || image.height || size;
  const sourceSize = Math.min(imageWidth, imageHeight);
  const sourceX = Math.max(0, (imageWidth - sourceSize) / 2);
  const sourceY = Math.max(0, (imageHeight - sourceSize) / 2);

  context.fillStyle = "#ffffff";
  context.beginPath();
  context.arc(size / 2, size / 2, 40, 0, Math.PI * 2);
  context.fill();
  context.save();
  context.beginPath();
  context.arc(size / 2, size / 2, 32, 0, Math.PI * 2);
  context.clip();
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 16, 16, 64, 64);
  context.restore();
  context.lineWidth = 8;
  context.strokeStyle = "#111111";
  context.beginPath();
  context.arc(size / 2, size / 2, 36, 0, Math.PI * 2);
  context.stroke();

  return context.getImageData(0, 0, size, size);
}

export async function addMarkerImages(map: MarkerImageMap, places: PlaceFeature[], options: MarkerImageOptions = {}) {
  const collection = createPlaceFeatureCollection(places);
  const images = new Map<string, string>();
  const imageLoader = options.loadImage ?? loadImage;
  const imageDataFactory = options.createMarkerImageData ?? createMarkerImageData;

  collection.features.forEach((feature) => {
    const { markerImage, markerImageId } = feature.properties;

    if (markerImage && markerImageId) {
      images.set(markerImageId, markerImage);
    }
  });

  await Promise.all(
    [...images].map(async ([imageId, imageUrl]) => {
      const image = await imageLoader(imageUrl);
      const markerImage = imageDataFactory(image);

      if (map.hasImage(imageId)) {
        map.updateImage(imageId, markerImage);
      } else {
        map.addImage(imageId, markerImage, { pixelRatio: 2 });
      }
    })
  );
}

export function addMarkerImagePlaceholders(map: MarkerImageMap, places: PlaceFeature[]) {
  const collection = createPlaceFeatureCollection(places);

  collection.features.forEach((feature) => {
    const { markerImageId } = feature.properties;

    if (markerImageId && !map.hasImage(markerImageId)) {
      map.addImage(markerImageId, createDefaultMarkerImage(), { pixelRatio: 2 });
    }
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
