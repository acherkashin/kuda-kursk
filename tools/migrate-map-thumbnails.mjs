#!/usr/bin/env node

import { mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { basename, dirname, resolve } from "node:path";
import process from "node:process";

const PROJECT_ROOT = process.cwd();
const DATA_DIRECTORY = resolve(PROJECT_ROOT, "public/data");

function usage() {
  return `Usage:
  node tools/migrate-map-thumbnails.mjs [--project-root /path/project] [--dry-run]

Copies every existing marker thumbnail byte-for-byte to /place-map-thumbnails/, removes legacy
thumbnail fields, and updates every public/data GeoJSON file. New places continue to use the
asset generator for their own mapThumbnail.`;
}

function parseArgs(argv) {
  const args = { dryRun: false, projectRoot: PROJECT_ROOT };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const next = argv[index + 1];

    if (argument === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (argument === "--project-root") {
      if (!next || next.startsWith("--")) {
        throw new Error("--project-root requires a value");
      }

      args.projectRoot = resolve(next);
      index += 1;
      continue;
    }

    if (argument === "--help" || argument === "-h") {
      args.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  return args;
}

function requireLegacyThumbnail(value, placeId) {
  if (typeof value !== "string" || !value.startsWith("/place-thumbnails/") || value.includes("..")) {
    throw new Error(`Place ${placeId} must have a legacy thumbnail from /place-thumbnails/`);
  }

  return value;
}

function mapThumbnailPathFromLegacy(legacyThumbnail) {
  return legacyThumbnail.replace("/place-thumbnails/", "/place-map-thumbnails/");
}

function readGitBlob(projectRoot, repositoryPath) {
  try {
    return execFileSync("git", ["show", `HEAD:${repositoryPath}`], { cwd: projectRoot, encoding: "buffer" });
  } catch {
    return null;
  }
}

async function readLegacyAsset(projectRoot, legacyThumbnail) {
  const legacyAssetPath = resolve(projectRoot, "public", legacyThumbnail.slice(1));

  try {
    return await readFile(legacyAssetPath);
  } catch {
    const asset = readGitBlob(projectRoot, `public/${legacyThumbnail.slice(1)}`);

    if (asset) {
      return asset;
    }

    throw new Error(`Legacy thumbnail is unavailable: ${legacyThumbnail}`);
  }
}

async function readLegacyThumbnailsById(projectRoot, filePath) {
  const repositoryPath = filePath.slice(projectRoot.length + 1);
  const currentData = JSON.parse(await readFile(filePath, "utf8"));
  const source = readGitBlob(projectRoot, repositoryPath);

  if (!source) {
    return new Map(
      currentData.features.map((place) => [String(place.id), place?.properties?.balloonContent?.thumbnail])
    );
  }

  const historicalData = JSON.parse(source.toString("utf8"));

  return new Map(
    historicalData.features.map((place) => [String(place.id), place?.properties?.balloonContent?.thumbnail])
  );
}

async function copyLegacyThumbnail(projectRoot, legacyThumbnail, dryRun) {
  const mapThumbnail = mapThumbnailPathFromLegacy(legacyThumbnail);

  if (dryRun) {
    return mapThumbnail;
  }

  const destinationPath = resolve(projectRoot, "public", mapThumbnail.slice(1));
  await mkdir(dirname(destinationPath), { recursive: true });
  await writeFile(destinationPath, await readLegacyAsset(projectRoot, legacyThumbnail));
  return mapThumbnail;
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

function removeLegacyPhotoThumbnails(images) {
  if (!Array.isArray(images)) {
    return images;
  }

  return images.map((photo) => {
    if (!photo || typeof photo !== "object" || Array.isArray(photo)) {
      return photo;
    }

    const { thumbnail: _thumbnail, ...photoWithoutThumbnail } = photo;
    return photoWithoutThumbnail;
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    return;
  }

  const dataDirectory = resolve(args.projectRoot, "public/data");
  const files = (await readdir(dataDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => resolve(dataDirectory, entry.name))
    .sort();
  let placeCount = 0;
  let copiedCount = 0;

  for (const filePath of files) {
    const data = JSON.parse(await readFile(filePath, "utf8"));
    const legacyThumbnailsById = await readLegacyThumbnailsById(args.projectRoot, filePath);

    if (data?.type !== "FeatureCollection" || !Array.isArray(data.features)) {
      throw new Error(`${filePath} must contain a FeatureCollection`);
    }

    for (const place of data.features) {
      const content = place?.properties?.balloonContent;

      if (!content || typeof content.name !== "string") {
        throw new Error(`Place ${place?.id ?? "unknown"} has invalid balloonContent`);
      }

      const legacyThumbnail = requireLegacyThumbnail(legacyThumbnailsById.get(String(place.id)), place.id);

      content.mapThumbnail = await copyLegacyThumbnail(args.projectRoot, legacyThumbnail, args.dryRun);
      delete content.thumbnail;
      content.images = removeLegacyPhotoThumbnails(content.images);
      placeCount += 1;
      copiedCount += 1;
    }

    if (!args.dryRun) {
      await writeJsonAtomically(filePath, data);
    }
  }

  console.log(
    `${args.dryRun ? "Would migrate" : "Migrated"} ${placeCount} places; ${copiedCount} historical map thumbnails copied without recropping.`
  );
}

main().catch((error) => {
  console.error(error.message);
  console.error(usage());
  process.exitCode = 1;
});
