import type { PlaceFeature } from "../../domain/places";
import { resolvePublicPath } from "../../services/publicPath";
import { createPlaceFeatureCollection } from "./placeSource";

export const MARKER_IMAGE_SIZE = 120;
export const MARKER_IMAGE_PIXEL_RATIO = 2;

type MarkerImageMap = {
  addImage: (id: string, image: ImageData, options?: { pixelRatio?: number }) => unknown;
  hasImage: (id: string) => boolean;
  updateImage: (id: string, image: ImageData) => unknown;
};

type MarkerImageOptions = {
  createActiveMarkerImageData?: (image: HTMLImageElement) => ImageData;
  createMarkerImageData?: (image: HTMLImageElement) => ImageData;
  loadImage?: (src: string) => Promise<HTMLImageElement>;
};

export function createDefaultMarkerImage(): ImageData {
  return createDefaultMarkerImageWithFrame("#ffffff");
}

export function createActiveDefaultMarkerImage(): ImageData {
  return createDefaultMarkerImageWithFrame("#C4571A", "rgba(196, 87, 26, 0.28)");
}

function createDefaultMarkerImageWithFrame(strokeColor: string, glowColor?: string): ImageData {
  const size = MARKER_IMAGE_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  if (!context) {
    return new ImageData(size, size);
  }

  drawMarkerFrame(context, glowColor ? { glowColor, strokeColor } : { strokeColor });
  drawRoundedRect(context, 44, 44, 32, 32, 8);
  context.fillStyle = "#cfcfcf";
  context.fill();

  return context.getImageData(0, 0, size, size);
}

export function createMarkerImageData(image: HTMLImageElement): ImageData {
  return createMarkerImageDataWithFrame(image, { strokeColor: "#ffffff" });
}

export function createActiveMarkerImageData(image: HTMLImageElement): ImageData {
  return createMarkerImageDataWithFrame(image, { glowColor: "rgba(196, 87, 26, 0.28)", strokeColor: "#C4571A" });
}

function createMarkerImageDataWithFrame(
  image: HTMLImageElement,
  options: { glowColor?: string; strokeColor: string }
): ImageData {
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

  drawMarkerFrame(context, options);
  context.save();
  drawRoundedRect(context, 8, 8, 104, 104, 17);
  context.clip();
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 8, 8, 104, 104);
  context.restore();
  drawMarkerStroke(context, options.strokeColor);

  return context.getImageData(0, 0, size, size);
}

function drawMarkerFrame(context: CanvasRenderingContext2D, options: { glowColor?: string; strokeColor: string }) {
  if (options.glowColor) {
    context.save();
    context.shadowBlur = 14;
    context.shadowColor = options.glowColor;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    drawRoundedRect(context, 3, 3, 114, 114, 22);
    context.fillStyle = options.glowColor;
    context.fill();
    context.restore();
  }

  drawRoundedRect(context, 3, 3, 114, 114, 22);
  context.fillStyle = "#ffffff";
  context.fill();
  drawMarkerStroke(context, options.strokeColor);
}

function drawMarkerStroke(context: CanvasRenderingContext2D, strokeColor: string) {
  context.lineWidth = 5;
  context.strokeStyle = strokeColor;
  drawRoundedRect(context, 5.5, 5.5, 109, 109, 20);
  context.stroke();
}

function drawRoundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const right = x + width;
  const bottom = y + height;

  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(right - radius, y);
  context.quadraticCurveTo(right, y, right, y + radius);
  context.lineTo(right, bottom - radius);
  context.quadraticCurveTo(right, bottom, right - radius, bottom);
  context.lineTo(x + radius, bottom);
  context.quadraticCurveTo(x, bottom, x, bottom - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

export async function addMarkerImages(map: MarkerImageMap, places: PlaceFeature[], options: MarkerImageOptions = {}) {
  const collection = createPlaceFeatureCollection(places);
  const images = new Map<string, { activeImageIds: string[]; imageIds: string[] }>();
  const imageLoader = options.loadImage ?? loadImage;
  const imageDataFactory = options.createMarkerImageData ?? createMarkerImageData;
  const activeImageDataFactory = options.createActiveMarkerImageData ?? createActiveMarkerImageData;

  collection.features.forEach((feature) => {
    const { activeMarkerImageId, markerImage, markerImageId } = feature.properties;

    if (markerImage) {
      const imageIds = images.get(markerImage) ?? { activeImageIds: [], imageIds: [] };

      if (markerImageId) {
        imageIds.imageIds.push(markerImageId);
      }

      if (activeMarkerImageId) {
        imageIds.activeImageIds.push(activeMarkerImageId);
      }

      images.set(markerImage, imageIds);
    }
  });

  await Promise.all(
    [...images].map(async ([imageUrl, imageIds]) => {
      const image = await imageLoader(resolvePublicPath(imageUrl));

      const markerImage = imageDataFactory(image);
      const activeMarkerImage = activeImageDataFactory(image);

      imageIds.imageIds.forEach((imageId) => upsertMarkerImage(map, imageId, markerImage));
      imageIds.activeImageIds.forEach((imageId) => upsertMarkerImage(map, imageId, activeMarkerImage));
    })
  );
}

function upsertMarkerImage(map: MarkerImageMap, imageId: string, markerImage: ImageData) {
  if (map.hasImage(imageId)) {
    map.updateImage(imageId, markerImage);
  } else {
    map.addImage(imageId, markerImage, { pixelRatio: MARKER_IMAGE_PIXEL_RATIO });
  }
}

export function addMarkerImagePlaceholders(map: MarkerImageMap, places: PlaceFeature[]) {
  const collection = createPlaceFeatureCollection(places);

  collection.features.forEach((feature) => {
    const { activeMarkerImageId, markerImageId } = feature.properties;

    if (markerImageId && !map.hasImage(markerImageId)) {
      map.addImage(markerImageId, createDefaultMarkerImage(), { pixelRatio: MARKER_IMAGE_PIXEL_RATIO });
    }

    if (activeMarkerImageId && !map.hasImage(activeMarkerImageId)) {
      map.addImage(activeMarkerImageId, createActiveDefaultMarkerImage(), { pixelRatio: MARKER_IMAGE_PIXEL_RATIO });
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
