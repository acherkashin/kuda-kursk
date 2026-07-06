#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { access, copyFile, mkdir, mkdtemp, readFile, readdir, rename, rm, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const PROCESSOR_VERSION = "place-assets-v1";
const COVER_MAX_EDGE = 1600;
const THUMBNAIL_SIZE = 480;
const WEBP_QUALITY = 82;
const REQUIRED_TOOLS = ["qlmanage", "sips", "cwebp"];

function usage() {
  return `Usage:
  node tools/generate-place-assets.mjs --image /path/photo.heic --id 1410 --name "Place name" [--project-root /path/project] [--dry-run]

Required:
  --image          Local source image
  --id             Place ID used in output filenames
  --name           Place name used in output filenames

Optional:
  --project-root   Project root containing public/. Defaults to the current directory
  --dry-run        Print planned WebP paths without writing files
  --help, -h       Show this help`;
}

function transliterate(value) {
  const letters = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya"
  };

  return [...value].map((character) => letters[character.toLocaleLowerCase("ru-RU")] ?? character).join("");
}

function slugify(value) {
  const slug = transliterate(String(value))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return slug || "place";
}

function requireText(value, fieldName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Provide a non-empty ${fieldName}`);
  }

  return value.trim();
}

function requirePlaceId(value) {
  const normalized = String(value ?? "").trim();

  if (!/^[a-zA-Z0-9_-]+$/.test(normalized)) {
    throw new Error("Provide a safe placeId");
  }

  return normalized;
}

function parseArgs(argv) {
  const args = { dryRun: false };

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

    if (["--image", "--id", "--name", "--project-root"].includes(argument)) {
      if (!next || next.startsWith("--")) {
        throw new Error(`${argument} requires a value`);
      }

      const key = {
        "--id": "placeId",
        "--image": "imagePath",
        "--name": "placeName",
        "--project-root": "projectRoot"
      }[argument];
      args[key] = next;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  return args;
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });

  if (result.status !== 0) {
    const message = (result.stderr || result.stdout || result.error?.message || `${command} failed`).trim();
    throw new Error(`${command} failed: ${message}`);
  }

  return result.stdout;
}

function assertImageTools() {
  if (process.platform !== "darwin") {
    throw new Error("Place asset generation is supported only on macOS");
  }

  for (const command of REQUIRED_TOOLS) {
    const result = spawnSync("which", [command], { encoding: "utf8" });

    if (result.status !== 0) {
      throw new Error(`Required image tool is unavailable: ${command}`);
    }
  }
}

async function pathExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function readDimensions(imagePath) {
  const output = run("sips", ["-g", "pixelWidth", "-g", "pixelHeight", imagePath]);
  const width = Number(output.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const height = Number(output.match(/pixelHeight:\s*(\d+)/)?.[1]);

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new Error(`Could not read image dimensions: ${imagePath}`);
  }

  return { height, width };
}

async function renderOrientedPreview(sourcePath, workingDirectory) {
  const sourceDimensions = readDimensions(sourcePath);
  const previewSize = Math.min(COVER_MAX_EDGE, Math.max(sourceDimensions.width, sourceDimensions.height));
  run("qlmanage", ["-t", "-s", String(previewSize), "-o", workingDirectory, sourcePath]);
  const entries = await readdir(workingDirectory);
  const previewName = entries.find((entry) => entry.endsWith(".png"));

  if (!previewName) {
    throw new Error(`Quick Look did not create a preview for ${sourcePath}`);
  }

  return join(workingDirectory, previewName);
}

async function publishPair(imageTemporaryPath, imageOutputPath, thumbnailTemporaryPath, thumbnailOutputPath) {
  let imagePublished = false;

  try {
    await rename(imageTemporaryPath, imageOutputPath);
    imagePublished = true;
    await rename(thumbnailTemporaryPath, thumbnailOutputPath);
  } catch (error) {
    if (imagePublished) {
      await unlink(imageOutputPath).catch(() => undefined);
    }

    throw error;
  }
}

export async function planPlaceAssets({ imagePath, placeId, placeName, projectRoot = process.cwd() }) {
  const sourcePath = resolve(projectRoot, requireText(imagePath, "imagePath"));
  const source = await readFile(sourcePath);
  const id = requirePlaceId(placeId);
  const slug = slugify(requireText(placeName, "placeName"));
  const contentHash = createHash("sha256")
    .update(`${PROCESSOR_VERSION}\0`)
    .update(source)
    .digest("hex")
    .slice(0, 10);
  const imageFileName = `${id}-image-${slug}-${contentHash}.webp`;
  const thumbnailFileName = `${id}-thumbnail-${slug}-${contentHash}.webp`;
  const imagePublicPath = `/place-images/${imageFileName}`;
  const thumbnailPublicPath = `/place-thumbnails/${thumbnailFileName}`;

  return {
    contentHash,
    imageOutputPath: resolve(projectRoot, "public", imagePublicPath.slice(1)),
    imagePublicPath,
    sourcePath,
    thumbnailOutputPath: resolve(projectRoot, "public", thumbnailPublicPath.slice(1)),
    thumbnailPublicPath
  };
}

export async function generatePlaceAssets(options) {
  const plan = await planPlaceAssets(options);

  if (options.dryRun) {
    return { ...plan, created: false };
  }

  assertImageTools();
  const imageExists = await pathExists(plan.imageOutputPath);
  const thumbnailExists = await pathExists(plan.thumbnailOutputPath);

  if (imageExists && thumbnailExists) {
    return { ...plan, created: false };
  }

  if (imageExists !== thumbnailExists) {
    throw new Error("Place asset output pair is incomplete; remove the conflicting file before retrying");
  }

  await mkdir(dirname(plan.imageOutputPath), { recursive: true });
  await mkdir(dirname(plan.thumbnailOutputPath), { recursive: true });

  const workingDirectory = await mkdtemp(join(tmpdir(), "place-assets-"));
  const uniqueSuffix = `${process.pid}-${randomUUID()}`;
  const imageTemporaryPath = `${plan.imageOutputPath}.${uniqueSuffix}.tmp`;
  const thumbnailTemporaryPath = `${plan.thumbnailOutputPath}.${uniqueSuffix}.tmp`;

  try {
    const previewPath = await renderOrientedPreview(plan.sourcePath, workingDirectory);
    const thumbnailPngPath = join(workingDirectory, "thumbnail.png");
    await copyFile(previewPath, thumbnailPngPath);

    const previewDimensions = readDimensions(previewPath);
    const thumbnailCropSize = Math.min(previewDimensions.width, previewDimensions.height);
    run("sips", ["-c", String(thumbnailCropSize), String(thumbnailCropSize), thumbnailPngPath]);
    run("sips", ["-z", String(THUMBNAIL_SIZE), String(THUMBNAIL_SIZE), thumbnailPngPath]);

    run("cwebp", ["-quiet", "-q", String(WEBP_QUALITY), "-metadata", "none", previewPath, "-o", imageTemporaryPath]);
    run("cwebp", ["-quiet", "-q", String(WEBP_QUALITY), "-metadata", "none", thumbnailPngPath, "-o", thumbnailTemporaryPath]);

    const outputDimensions = readDimensions(imageTemporaryPath);
    const thumbnailDimensions = readDimensions(thumbnailTemporaryPath);

    if (Math.max(outputDimensions.width, outputDimensions.height) > COVER_MAX_EDGE) {
      throw new Error("Generated cover exceeds the 1600px limit");
    }

    if (thumbnailDimensions.width !== THUMBNAIL_SIZE || thumbnailDimensions.height !== THUMBNAIL_SIZE) {
      throw new Error("Generated thumbnail is not 480x480");
    }

    await publishPair(imageTemporaryPath, plan.imageOutputPath, thumbnailTemporaryPath, plan.thumbnailOutputPath);
    return { ...plan, created: true };
  } finally {
    await rm(workingDirectory, { force: true, recursive: true });
    await unlink(imageTemporaryPath).catch(() => undefined);
    await unlink(thumbnailTemporaryPath).catch(() => undefined);
  }
}

function printSummary(result, dryRun) {
  const prefix = dryRun ? "Dry run: would generate place assets" : result.created ? "Generated place assets" : "Reused place assets";
  console.log(`${prefix}:`);
  console.log(`- Image: ${result.imagePublicPath}`);
  console.log(`- Thumbnail: ${result.thumbnailPublicPath}`);
  console.log(`- Content hash: ${result.contentHash}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    return;
  }

  assertImageTools();
  const result = await generatePlaceAssets(args);
  printSummary(result, args.dryRun);
}

const isDirectExecution = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (isDirectExecution) {
  main().catch((error) => {
    console.error(error.message);
    console.error(usage());
    process.exitCode = 1;
  });
}
