#!/usr/bin/env node

import { readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import process from "node:process";
import { generatePlaceAssets, planPlaceAssets } from "../../../../tools/generate-place-assets.mjs";

const PROJECT_ROOT = process.cwd();
const MAP_CATALOG_PATH = "src/domain/mapCatalog.ts";
const DATA_DIR = "public/data";
const DEFAULT_MAP_TITLE = "Куда в Курске";
const KURSK_LONGITUDE_RANGE = [35, 38];
const KURSK_LATITUDE_RANGE = [50, 53];

function usage() {
  return `Usage:
  node .agents/skills/add-map-place/scripts/add-map-place.mjs --image /path/photo.heic --name "Place" --address "Address" --description "Description" --latitude 51.730846 --longitude 36.193015 [--map-title "Куда в Курске"] [--dry-run]

Required:
  --image          Local image path
  --name           Place name
  --address        Place address
  --description    Place card description
  --latitude       Latitude, for example 51.730846
  --longitude      Longitude, for example 36.193015

Optional:
  --map-title      Map title or slug from src/domain/mapCatalog.ts. Defaults to "Куда в Курске"
  --dry-run        Print the planned change without writing files
  --help, -h       Show this help`;
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    mapTitle: DEFAULT_MAP_TITLE
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }

    if (["--map-title", "--image", "--name", "--address", "--description", "--latitude", "--longitude"].includes(arg)) {
      if (!next || next.startsWith("--")) {
        throw new Error(`${arg} requires a value`);
      }

      const key = arg
        .slice(2)
        .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      args[key] = next;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function requireText(value, fieldName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Provide a non-empty ${fieldName}`);
  }

  return value.trim();
}

function parseCoordinate(value, fieldName) {
  const coordinate = Number(value);

  if (!Number.isFinite(coordinate)) {
    throw new Error(`${fieldName} must be a finite number`);
  }

  return coordinate;
}

function assertKurskCoordinates(latitude, longitude) {
  const latitudeLooksValid = latitude >= KURSK_LATITUDE_RANGE[0] && latitude <= KURSK_LATITUDE_RANGE[1];
  const longitudeLooksValid = longitude >= KURSK_LONGITUDE_RANGE[0] && longitude <= KURSK_LONGITUDE_RANGE[1];
  const looksSwapped =
    latitude >= KURSK_LONGITUDE_RANGE[0] &&
    latitude <= KURSK_LONGITUDE_RANGE[1] &&
    longitude >= KURSK_LATITUDE_RANGE[0] &&
    longitude <= KURSK_LATITUDE_RANGE[1];

  if (!latitudeLooksValid || !longitudeLooksValid || looksSwapped) {
    throw new Error("Coordinates must be latitude 50..53 and longitude 35..38 for Kursk/Kursk region");
  }
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
  const text = await readFile(filePath, "utf8");
  return JSON.parse(text);
}

async function readMapCatalog() {
  const text = await readFile(resolve(PROJECT_ROOT, MAP_CATALOG_PATH), "utf8");
  const maps = [];

  for (const match of text.matchAll(/\{([\s\S]*?)\}/g)) {
    const block = match[1];
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    const title = block.match(/title:\s*"([^"]+)"/)?.[1];
    const dataPath = block.match(/dataPath:\s*"([^"]+)"/)?.[1];

    if (slug && title && dataPath) {
      maps.push({ slug, title, dataPath });
    }
  }

  if (maps.length === 0) {
    throw new Error(`No maps found in ${MAP_CATALOG_PATH}`);
  }

  return maps;
}

function resolveMap(maps, mapTitle) {
  const requested = normalize(mapTitle || DEFAULT_MAP_TITLE);
  const mainAliases = new Set(["main", "главная карта", "основная карта", normalize(DEFAULT_MAP_TITLE)]);
  const target = mainAliases.has(requested) ? "main" : requested;
  const matches = maps.filter((map) => normalize(map.slug) === target || normalize(map.title) === target);

  if (matches.length === 1) {
    return matches[0];
  }

  if (matches.length > 1) {
    throw new Error(`Map title is ambiguous: ${mapTitle}`);
  }

  const available = maps.map((map) => `${map.title} (${map.slug})`).join(", ");
  throw new Error(`Unknown map "${mapTitle}". Available maps: ${available}`);
}

function dataPathFromPublicPath(publicPath) {
  const trimmed = publicPath.replace(/^\//, "");
  return resolve(PROJECT_ROOT, "public", trimmed.replace(/^data\//, "data/"));
}

async function listDataFiles() {
  const dataDir = resolve(PROJECT_ROOT, DATA_DIR);
  const entries = await readdir(dataDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => resolve(dataDir, entry.name))
    .sort();
}

function assertFeatureCollection(json, filePath) {
  if (!json || json.type !== "FeatureCollection" || !Array.isArray(json.features)) {
    throw new Error(`${relative(PROJECT_ROOT, filePath)} must contain a GeoJSON FeatureCollection`);
  }
}

async function nextNumericId() {
  let maxId = 0;

  for (const filePath of await listDataFiles()) {
    const json = await readJson(filePath);
    assertFeatureCollection(json, filePath);

    for (const feature of json.features) {
      const id = Number(feature?.id);

      if (Number.isInteger(id) && id > maxId) {
        maxId = id;
      }
    }
  }

  return maxId + 1;
}

function assertNoDuplicateName(json, name) {
  const target = normalize(name);
  const duplicate = json.features.find((feature) => normalize(feature?.properties?.balloonContent?.name ?? "") === target);

  if (duplicate) {
    throw new Error(`Place "${name}" already exists in this map with id ${duplicate.id}`);
  }
}

async function prepareImagePaths(imagePath, id, name) {
  return planPlaceAssets({
    imagePath,
    placeId: id,
    placeName: name,
    projectRoot: PROJECT_ROOT
  });
}

function createFeature({ id, name, address, description, latitude, longitude, imagePublicPath, thumbnailPublicPath }) {
  const formattedLatitude = latitude.toFixed(6);
  const formattedLongitude = longitude.toFixed(6);

  return {
    type: "Feature",
    id,
    geometry: {
      type: "Point",
      coordinates: [Number(formattedLongitude), Number(formattedLatitude)]
    },
    properties: {
      id,
      balloonContent: {
        image: imagePublicPath,
        thumbnail: thumbnailPublicPath,
        name,
        description,
        address
      }
    }
  };
}

function printSummary({ dryRun, map, dataFilePath, feature, imagePaths }) {
  const prefix = dryRun ? "Dry run: would add place" : "Added place";
  const [longitude, latitude] = feature.geometry.coordinates;
  const formattedCoordinates = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

  console.log(`${prefix}:`);
  console.log(`- Map: ${map.title} (${map.slug})`);
  console.log(`- Data file: ${relative(PROJECT_ROOT, dataFilePath)}`);
  console.log(`- ID: ${feature.id}`);
  console.log(`- Name: ${feature.properties.balloonContent.name}`);
  console.log(`- Address: ${feature.properties.balloonContent.address}`);
  console.log(`- Coordinates: ${formattedCoordinates}`);
  console.log(`- Image: ${imagePaths.imagePublicPath}`);
  console.log(`- Thumbnail: ${imagePaths.thumbnailPublicPath}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    return;
  }

  const image = requireText(args.image, "--image");
  const name = requireText(args.name, "--name");
  const address = requireText(args.address, "--address");
  const description = requireText(args.description, "--description");
  const latitude = parseCoordinate(args.latitude, "--latitude");
  const longitude = parseCoordinate(args.longitude, "--longitude");

  assertKurskCoordinates(latitude, longitude);

  const maps = await readMapCatalog();
  const map = resolveMap(maps, args.mapTitle);
  const dataFilePath = dataPathFromPublicPath(map.dataPath);
  const data = await readJson(dataFilePath);
  assertFeatureCollection(data, dataFilePath);
  assertNoDuplicateName(data, name);

  const id = await nextNumericId();
  const imagePaths = await prepareImagePaths(image, id, name);
  const feature = createFeature({
    id,
    name,
    address,
    description,
    latitude,
    longitude,
    imagePublicPath: imagePaths.imagePublicPath,
    thumbnailPublicPath: imagePaths.thumbnailPublicPath
  });

  if (args.dryRun) {
    printSummary({ dryRun: true, map, dataFilePath, feature, imagePaths });
    return;
  }

  const generatedAssets = await generatePlaceAssets({
    imagePath: image,
    placeId: id,
    placeName: name,
    projectRoot: PROJECT_ROOT
  });

  try {
    data.features.push(feature);
    await writeFile(dataFilePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  } catch (error) {
    if (generatedAssets.created) {
      await Promise.all([
        unlink(generatedAssets.imageOutputPath).catch(() => undefined),
        unlink(generatedAssets.thumbnailOutputPath).catch(() => undefined)
      ]);
    }

    throw error;
  }

  printSummary({ dryRun: false, map, dataFilePath, feature, imagePaths });
}

main().catch((error) => {
  console.error(error.message);
  console.error(usage());
  process.exitCode = 1;
});
