/// <reference types="node" />

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

type PlaceAssetPlan = {
  contentHash: string;
  imageOutputPath: string;
  imagePublicPath: string;
  thumbnailOutputPath: string;
  thumbnailPublicPath: string;
};

type PlaceAssetResult = PlaceAssetPlan & {
  created: boolean;
};

type PlaceAssetOptions = {
  dryRun?: boolean;
  imagePath: string;
  placeId: string | number;
  placeName: string;
  projectRoot: string;
};

// @ts-expect-error The production helper is a JavaScript ESM module.
const { generatePlaceAssets, planPlaceAssets } = (await import("../../tools/generate-place-assets.mjs")) as {
  generatePlaceAssets(options: PlaceAssetOptions): Promise<PlaceAssetResult>;
  planPlaceAssets(options: PlaceAssetOptions): Promise<PlaceAssetPlan>;
};

const temporaryDirectories: string[] = [];
const jpeg160x80 = Buffer.from(
  "/9j/4AAQSkZJRgABAgAAAQABAAD//gAQTGF2YzYyLjI4LjEwMQD/2wBDAAgEBAQEBAUFBQUFBQYGBgYGBgYGBgYGBgYGBgYHBwcICAgHBwcGBgcHCAgICAkJCQgICAgJCQoKCgwMCwsODg4RERT/xABNAAEBAAAAAAAAAAAAAAAAAAAABgEBAQEAAAAAAAAAAAAAAAAAAAYHEAEAAAAAAAAAAAAAAAAAAAAAEQEAAAAAAAAAAAAAAAAAAAAA/8AAEQgAUACgAwEiAAIRAAMRAP/aAAwDAQACEQMRAD8AiwEm38AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/9k=",
  "base64"
);
const exifOrientation6 = Buffer.from([
  0xff, 0xe1, 0x00, 0x22,
  0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
  0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08,
  0x00, 0x01,
  0x01, 0x12, 0x00, 0x03, 0x00, 0x00, 0x00, 0x01, 0x00, 0x06, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00
]);
const hasImageTools = ["qlmanage", "sips", "cwebp"].every(
  (command) => spawnSync("which", [command], { encoding: "utf8" }).status === 0
);

async function makeProject(): Promise<{ imagePath: string; projectRoot: string; source: Buffer }> {
  const projectRoot = await mkdtemp(join(tmpdir(), "place-assets-test-"));
  temporaryDirectories.push(projectRoot);
  const source = Buffer.from("synthetic-image-source");
  const imagePath = join(projectRoot, "source.jpg");
  await writeFile(imagePath, source);
  return { imagePath, projectRoot, source };
}

async function makeOrientedProject(): Promise<{ imagePath: string; projectRoot: string }> {
  const projectRoot = await mkdtemp(join(tmpdir(), "place-assets-oriented-test-"));
  temporaryDirectories.push(projectRoot);
  const imagePath = join(projectRoot, "oriented.jpg");
  const orientedJpeg = Buffer.concat([jpeg160x80.subarray(0, 2), exifOrientation6, jpeg160x80.subarray(2)]);
  await writeFile(imagePath, orientedJpeg);
  return { imagePath, projectRoot };
}

async function makeLargeProject(): Promise<{ imagePath: string; projectRoot: string }> {
  const projectRoot = await mkdtemp(join(tmpdir(), "place-assets-large-test-"));
  temporaryDirectories.push(projectRoot);
  const smallImagePath = join(projectRoot, "small.jpg");
  const imagePath = join(projectRoot, "large.jpg");
  await writeFile(smallImagePath, jpeg160x80);
  const result = spawnSync("sips", ["-z", "1200", "2400", smallImagePath, "--out", imagePath], { encoding: "utf8" });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }

  return { imagePath, projectRoot };
}

function imageDimensions(imagePath: string): { height: number; width: number } {
  const result = spawnSync("sips", ["-g", "pixelWidth", "-g", "pixelHeight", imagePath], { encoding: "utf8" });

  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }

  const width = Number(result.stdout.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const height = Number(result.stdout.match(/pixelHeight:\s*(\d+)/)?.[1]);
  return { height, width };
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })));
});

describe("place asset planning", () => {
  it("builds deterministic WebP paths from the place identity and source content", async () => {
    const { imagePath, projectRoot, source } = await makeProject();
    const expectedHash = createHash("sha256")
      .update("place-assets-v1\0")
      .update(source)
      .digest("hex")
      .slice(0, 10);

    const plan = await planPlaceAssets({ imagePath, placeId: 1410, placeName: "Лавандовый берег", projectRoot });

    expect(plan.contentHash).toBe(expectedHash);
    expect(plan.imagePublicPath).toBe(`/place-images/1410-image-lavandovyy-bereg-${expectedHash}.webp`);
    expect(plan.thumbnailPublicPath).toBe(`/place-thumbnails/1410-thumbnail-lavandovyy-bereg-${expectedHash}.webp`);
    expect(plan.imageOutputPath).toBe(join(projectRoot, "public", plan.imagePublicPath));
    expect(plan.thumbnailOutputPath).toBe(join(projectRoot, "public", plan.thumbnailPublicPath));
  });

  it("keeps dry-run free of filesystem writes", async () => {
    const { imagePath, projectRoot } = await makeProject();

    const result = await generatePlaceAssets({
      dryRun: true,
      imagePath,
      placeId: 1410,
      placeName: "Лавандовый берег",
      projectRoot
    });

    expect(result.created).toBe(false);
    await expect(readFile(result.imageOutputPath)).rejects.toMatchObject({ code: "ENOENT" });
    await expect(readFile(result.thumbnailOutputPath)).rejects.toMatchObject({ code: "ENOENT" });
  });
});

describe.skipIf(process.platform !== "darwin" || !hasImageTools)("place asset generation", () => {
  it("limits the cover long edge to 1600px without changing its aspect ratio", async () => {
    const { imagePath, projectRoot } = await makeLargeProject();

    const result = await generatePlaceAssets({ imagePath, placeId: 1410, placeName: "Лавандовый берег", projectRoot });

    expect(imageDimensions(result.imageOutputPath)).toEqual({ height: 800, width: 1600 });
    expect(imageDimensions(result.thumbnailOutputPath)).toEqual({ height: 480, width: 480 });
  });

  it("normalizes EXIF orientation and creates a square WebP thumbnail", async () => {
    const { imagePath, projectRoot } = await makeOrientedProject();

    const result = await generatePlaceAssets({ imagePath, placeId: 1410, placeName: "Лавандовый берег", projectRoot });
    const image = await readFile(result.imageOutputPath);
    const thumbnail = await readFile(result.thumbnailOutputPath);

    expect(result.created).toBe(true);
    expect(image.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(image.subarray(8, 12).toString("ascii")).toBe("WEBP");
    expect(thumbnail.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(thumbnail.subarray(8, 12).toString("ascii")).toBe("WEBP");
    expect(imageDimensions(result.imageOutputPath)).toEqual({ height: 160, width: 80 });
    expect(imageDimensions(result.thumbnailOutputPath)).toEqual({ height: 480, width: 480 });
  });

  it("reuses a complete output pair for the same source", async () => {
    const { imagePath, projectRoot } = await makeOrientedProject();
    const first = await generatePlaceAssets({ imagePath, placeId: 1410, placeName: "Лавандовый берег", projectRoot });

    const second = await generatePlaceAssets({ imagePath, placeId: 1410, placeName: "Лавандовый берег", projectRoot });

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.imageOutputPath).toBe(first.imageOutputPath);
    expect(second.thumbnailOutputPath).toBe(first.thumbnailOutputPath);
  });

  it("rejects an incomplete existing output pair", async () => {
    const { imagePath, projectRoot } = await makeOrientedProject();
    const plan = await planPlaceAssets({ imagePath, placeId: 1410, placeName: "Лавандовый берег", projectRoot });
    await mkdir(join(projectRoot, "public", "place-images"), { recursive: true });
    await writeFile(plan.imageOutputPath, "partial");

    await expect(
      generatePlaceAssets({ imagePath, placeId: 1410, placeName: "Лавандовый берег", projectRoot })
    ).rejects.toThrow("output pair is incomplete");
  });
});
