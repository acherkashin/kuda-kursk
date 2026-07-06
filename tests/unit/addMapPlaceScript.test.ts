/// <reference types="node" />

import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const addMapPlaceScript = resolve(".agents/skills/add-map-place/scripts/add-map-place.mjs");
const jpeg160x80 = Buffer.from(
  "/9j/4AAQSkZJRgABAgAAAQABAAD//gAQTGF2YzYyLjI4LjEwMQD/2wBDAAgEBAQEBAUFBQUFBQYGBgYGBgYGBgYGBgYGBgYHBwcICAgHBwcGBgcHCAgICAkJCQgICAgJCQoKCgwMCwsODg4RERT/xABNAAEBAAAAAAAAAAAAAAAAAAAABgEBAQEAAAAAAAAAAAAAAAAAAAYHEAEAAAAAAAAAAAAAAAAAAAAAEQEAAAAAAAAAAAAAAAAAAAAA/8AAEQgAUACgAwEiAAIRAAMRAP/aAAwDAQACEQMRAD8AiwEm38AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/9k=",
  "base64"
);
const temporaryDirectories: string[] = [];

async function makeProject(source: Buffer = jpeg160x80) {
  const projectRoot = await mkdtemp(join(tmpdir(), "add-map-place-test-"));
  temporaryDirectories.push(projectRoot);
  await mkdir(join(projectRoot, "src", "domain"), { recursive: true });
  await mkdir(join(projectRoot, "public", "data"), { recursive: true });
  await writeFile(
    join(projectRoot, "src", "domain", "mapCatalog.ts"),
    'export const mapCatalog = [{ slug: "main", title: "Куда в Курске", dataPath: "/data/main-map.json" }];\n'
  );
  const dataPath = join(projectRoot, "public", "data", "main-map.json");
  await writeFile(dataPath, `${JSON.stringify({ type: "FeatureCollection", features: [] }, null, 2)}\n`);
  const imagePath = join(projectRoot, "source.jpg");
  await writeFile(imagePath, source);
  return { dataPath, imagePath, projectRoot };
}

function runAddMapPlace(projectRoot: string, imagePath: string, dryRun = false) {
  const args = [
    addMapPlaceScript,
    "--image",
    imagePath,
    "--name",
    "Тестовое место",
    "--address",
    "Курск, улица Ленина, 1",
    "--description",
    "Описание тестового места.",
    "--latitude",
    "51.730846",
    "--longitude",
    "36.193015"
  ];

  if (dryRun) {
    args.push("--dry-run");
  }

  return spawnSync(process.execPath, args, { cwd: projectRoot, encoding: "utf8" });
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })));
});

describe.skipIf(process.platform !== "darwin")("add-map-place image integration", () => {
  it("plans hash-named WebP assets without writing during dry-run", async () => {
    const { dataPath, imagePath, projectRoot } = await makeProject();
    const initialData = await readFile(dataPath, "utf8");

    const result = runAddMapPlace(projectRoot, imagePath, true);

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/\/place-images\/1-image-testovoe-mesto-[a-f0-9]{10}\.webp/);
    expect(result.stdout).toMatch(/\/place-thumbnails\/1-thumbnail-testovoe-mesto-[a-f0-9]{10}\.webp/);
    expect(await readFile(dataPath, "utf8")).toBe(initialData);
    await expect(readdir(join(projectRoot, "public", "place-images"))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("writes generated WebP paths and does not copy the source format", async () => {
    const { dataPath, imagePath, projectRoot } = await makeProject();

    const result = runAddMapPlace(projectRoot, imagePath);
    const data = JSON.parse(await readFile(dataPath, "utf8"));
    const content = data.features[0].properties.balloonContent;

    expect(result.status).toBe(0);
    expect(content.image).toMatch(/^\/place-images\/1-image-testovoe-mesto-[a-f0-9]{10}\.webp$/);
    expect(content.thumbnail).toMatch(/^\/place-thumbnails\/1-thumbnail-testovoe-mesto-[a-f0-9]{10}\.webp$/);
    expect((await readFile(join(projectRoot, "public", content.image))).subarray(8, 12).toString("ascii")).toBe("WEBP");
    expect((await readFile(join(projectRoot, "public", content.thumbnail))).subarray(8, 12).toString("ascii")).toBe("WEBP");
    expect((await readdir(join(projectRoot, "public", "place-images"))).some((name) => name.endsWith(".jpg"))).toBe(false);
  });

  it("keeps map data unchanged when image generation fails", async () => {
    const { dataPath, imagePath, projectRoot } = await makeProject(Buffer.from("not-an-image"));
    const initialData = await readFile(dataPath, "utf8");

    const result = runAddMapPlace(projectRoot, imagePath);

    expect(result.status).not.toBe(0);
    expect(result.stdout).not.toContain("Added place");
    expect(await readFile(dataPath, "utf8")).toBe(initialData);
  });
});
