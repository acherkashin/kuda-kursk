#!/usr/bin/env node

import { readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, relative, resolve } from "node:path";
import process from "node:process";
import { generatePlaceAssets, planPlaceAssets } from "../../../../tools/generate-place-assets.mjs";

const DEFAULT_MAP_TITLE = "Куда в Курске";
const MAP_CATALOG_PATH = "src/domain/mapCatalog.ts";
const DATA_DIR = "public/data";

function usage() {
  return `Usage:
  node .agents/skills/update-place-cover/scripts/update-place-cover.mjs --image /path/photo.heic (--place-id 1410 | --place-name "Place") [--map-title "Куда в Курске"] [--project-root /path/project] [--dry-run]

Required:
  --image          Local source image
  --place-id       Existing place ID (mutually exclusive with --place-name)
  --place-name     Existing place name (mutually exclusive with --place-id)

Optional:
  --map-title      Restrict matching to a map title or slug
  --project-root   Project root. Defaults to the current directory
  --dry-run        Print the planned data and asset changes without writing
  --help, -h       Show this help`;
}

function parseArgs(argv) {
  const args = { dryRun: false, projectRoot: process.cwd() };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const next = argv[index + 1];

    if (argument === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (argument === "--help" || argument === "-h") {
      args.help = true;
      continue;
    }

    if (["--image", "--place-id", "--place-name", "--map-title", "--project-root"].includes(argument)) {
      if (!next || next.startsWith("--")) {
        throw new Error(`${argument} requires a value`);
      }

      const key = argument.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      args[key] = next;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  return args;
}

function requireText(value, fieldName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Provide a non-empty ${fieldName}`);
  }

  return value.trim();
}

function normalize(value) {
  return String(value)
    .toLocaleLowerCase("ru-RU")
    .replaceAll("ё", "е")
    .replace(/[«»"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function assertFeatureCollection(data, filePath, projectRoot) {
  if (!data || data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
    throw new Error(`${relative(projectRoot, filePath)} must contain a GeoJSON FeatureCollection`);
  }
}

async function listDataFiles(projectRoot) {
  const dataDirectory = resolve(projectRoot, DATA_DIR);
  const entries = await readdir(dataDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => resolve(dataDirectory, entry.name))
    .sort();
}

async function readMapCatalog(projectRoot) {
  const text = await readFile(resolve(projectRoot, MAP_CATALOG_PATH), "utf8");
  const maps = [];

  for (const match of text.matchAll(/\{([\s\S]*?)\}/g)) {
    const block = match[1];
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    const title = block.match(/title:\s*"([^"]+)"/)?.[1];
    const dataPath = block.match(/dataPath:\s*"([^"]+)"/)?.[1];

    if (slug && title && dataPath) {
      maps.push({ dataPath, slug, title });
    }
  }

  return maps;
}

function dataFileFromPublicPath(projectRoot, publicPath) {
  return resolve(projectRoot, "public", publicPath.replace(/^\//, ""));
}

async function resolveRestrictedDataPath(projectRoot, mapTitle) {
  const maps = await readMapCatalog(projectRoot);
  const requested = normalize(mapTitle || DEFAULT_MAP_TITLE);
  const mainAliases = new Set(["main", "главная карта", "основная карта", normalize(DEFAULT_MAP_TITLE)]);
  const target = mainAliases.has(requested) ? "main" : requested;
  const matches = maps.filter((map) => normalize(map.slug) === target || normalize(map.title) === target);

  if (matches.length !== 1) {
    throw new Error(matches.length > 1 ? `Map title is ambiguous: ${mapTitle}` : `Unknown map: ${mapTitle}`);
  }

  return dataFileFromPublicPath(projectRoot, matches[0].dataPath);
}

function findCoverPhotoIndex(images) {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  return images
    .map((photo, index) => ({ index, order: typeof photo?.order === "number" ? photo.order : 0 }))
    .sort((left, right) => left.order - right.order || left.index - right.index)[0].index;
}

function containsString(value, target) {
  if (value === target) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsString(item, target));
  }

  if (value && typeof value === "object") {
    return Object.values(value).some((item) => containsString(item, target));
  }

  return false;
}

function localAssetFile(projectRoot, publicPath) {
  if (typeof publicPath !== "string") {
    return null;
  }

  const allowedPrefix = publicPath.startsWith("/place-images/") || publicPath.startsWith("/place-thumbnails/");

  if (!allowedPrefix || publicPath.includes("..")) {
    return null;
  }

  return resolve(projectRoot, "public", publicPath.slice(1));
}

async function writeJsonAtomically(filePath, data) {
  const temporaryPath = resolve(dirname(filePath), `.${basename(filePath)}.${process.pid}.tmp`);

  try {
    await writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    await rename(temporaryPath, filePath);
  } finally {
    await unlink(temporaryPath).catch(() => undefined);
  }
}

function printSummary({ carouselIndex, dataFilePath, dryRun, newAssets, oldImage, oldThumbnail, place, projectRoot, removable }) {
  console.log(dryRun ? "Dry run: would update place cover:" : "Updated place cover:");
  console.log(`- Place: ${place.properties.balloonContent.name} (${place.id})`);
  console.log(`- Data file: ${relative(projectRoot, dataFilePath)}`);
  console.log(`- Image: ${oldImage ?? "none"} -> ${newAssets.imagePublicPath}`);
  console.log(`- Thumbnail: ${oldThumbnail ?? "none"} -> ${newAssets.thumbnailPublicPath}`);
  console.log(`- Carousel photo: ${carouselIndex === null ? "none" : carouselIndex + 1}`);

  for (const publicPath of removable) {
    console.log(`- ${dryRun ? "Would remove" : "Removed"}: ${publicPath}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    return;
  }

  const imagePath = requireText(args.image, "--image");
  const hasId = typeof args.placeId === "string" && args.placeId.trim().length > 0;
  const hasName = typeof args.placeName === "string" && args.placeName.trim().length > 0;

  if (hasId === hasName) {
    throw new Error("Provide exactly one of --place-id or --place-name");
  }

  const projectRoot = resolve(args.projectRoot);
  const allDataPaths = await listDataFiles(projectRoot);
  const records = await Promise.all(
    allDataPaths.map(async (filePath) => {
      const data = await readJson(filePath);
      assertFeatureCollection(data, filePath, projectRoot);
      return { data, filePath };
    })
  );
  const restrictedPath = args.mapTitle ? await resolveRestrictedDataPath(projectRoot, args.mapTitle) : null;
  const eligibleRecords = restrictedPath ? records.filter((record) => record.filePath === restrictedPath) : records;
  const matches = [];

  for (const record of eligibleRecords) {
    for (const place of record.data.features) {
      const matchesId = hasId && String(place?.id) === args.placeId.trim();
      const matchesName = hasName && normalize(place?.properties?.balloonContent?.name ?? "") === normalize(args.placeName);

      if (matchesId || matchesName) {
        matches.push({ place, record });
      }
    }
  }

  if (matches.length === 0) {
    throw new Error("Place was not found");
  }

  if (matches.length > 1) {
    throw new Error("Place match is ambiguous; provide --map-title or --place-id");
  }

  const { place, record } = matches[0];
  const content = place?.properties?.balloonContent;

  if (!content || typeof content.name !== "string") {
    throw new Error("Matched place has invalid balloonContent");
  }

  const oldImage = typeof content.image === "string" ? content.image : null;
  const oldThumbnail = typeof content.thumbnail === "string" ? content.thumbnail : null;
  const carouselIndex = findCoverPhotoIndex(content.images);
  const newAssets = await planPlaceAssets({
    imagePath,
    placeId: place.id,
    placeName: content.name,
    projectRoot
  });

  content.image = newAssets.imagePublicPath;
  content.thumbnail = newAssets.thumbnailPublicPath;

  if (carouselIndex !== null) {
    content.images[carouselIndex] = {
      ...content.images[carouselIndex],
      src: newAssets.imagePublicPath,
      thumbnail: newAssets.thumbnailPublicPath
    };
  }

  const oldPublicPaths = [...new Set([oldImage, oldThumbnail].filter(Boolean))];
  const removable = oldPublicPaths.filter(
    (publicPath) => publicPath !== newAssets.imagePublicPath && publicPath !== newAssets.thumbnailPublicPath &&
      localAssetFile(projectRoot, publicPath) && !records.some((candidate) => containsString(candidate.data, publicPath))
  );

  if (args.dryRun) {
    printSummary({
      carouselIndex,
      dataFilePath: record.filePath,
      dryRun: true,
      newAssets,
      oldImage,
      oldThumbnail,
      place,
      projectRoot,
      removable
    });
    return;
  }

  const generatedAssets = await generatePlaceAssets({
    imagePath,
    placeId: place.id,
    placeName: content.name,
    projectRoot
  });

  try {
    await writeJsonAtomically(record.filePath, record.data);
  } catch (error) {
    if (generatedAssets.created) {
      await Promise.all([
        unlink(generatedAssets.imageOutputPath).catch(() => undefined),
        unlink(generatedAssets.thumbnailOutputPath).catch(() => undefined)
      ]);
    }

    throw error;
  }

  const removed = [];

  for (const publicPath of removable) {
    const filePath = localAssetFile(projectRoot, publicPath);

    if (filePath) {
      await unlink(filePath).then(() => {
        removed.push(publicPath);
      }).catch((error) => {
        console.warn(`Warning: could not remove ${publicPath}: ${error.message}`);
      });
    }
  }

  printSummary({
    carouselIndex,
    dataFilePath: record.filePath,
    dryRun: false,
    newAssets,
    oldImage,
    oldThumbnail,
    place,
    projectRoot,
    removable: removed
  });
}

main().catch((error) => {
  console.error(error.message);
  console.error(usage());
  process.exitCode = 1;
});
