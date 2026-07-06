/// <reference types="node" />

import { spawnSync } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const updatePlaceCoverScript = resolve(".agents/skills/update-place-cover/scripts/update-place-cover.mjs");
const jpeg160x80 = Buffer.from(
  "/9j/4AAQSkZJRgABAgAAAQABAAD//gAQTGF2YzYyLjI4LjEwMQD/2wBDAAgEBAQEBAUFBQUFBQYGBgYGBgYGBgYGBgYGBgYHBwcICAgHBwcGBgcHCAgICAkJCQgICAgJCQoKCgwMCwsODg4RERT/xABNAAEBAAAAAAAAAAAAAAAAAAAABgEBAQEAAAAAAAAAAAAAAAAAAAYHEAEAAAAAAAAAAAAAAAAAAAAAEQEAAAAAAAAAAAAAAAAAAAAA/8AAEQgAUACgAwEiAAIRAAMRAP/aAAwDAQACEQMRAD8AiwEm38AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/9k=",
  "base64"
);
const temporaryDirectories: string[] = [];

function makePlace(id: number, name: string, image = "/place-images/old.webp", thumbnail = "/place-thumbnails/old.webp") {
  return {
    type: "Feature",
    id,
    geometry: { type: "Point", coordinates: [36.193015, 51.730846] },
    properties: {
      id,
      balloonContent: {
        image,
        thumbnail,
        images: [
          { src: image, thumbnail, order: 1, caption: "Старая обложка" },
          { src: "/place-images/other.webp", order: 2 }
        ],
        name,
        description: "Описание",
        address: "Курск"
      }
    }
  };
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function makeProject() {
  const projectRoot = await mkdtemp(join(tmpdir(), "update-place-cover-test-"));
  temporaryDirectories.push(projectRoot);
  await mkdir(join(projectRoot, "src", "domain"), { recursive: true });
  await mkdir(join(projectRoot, "public", "data"), { recursive: true });
  await mkdir(join(projectRoot, "public", "place-images"), { recursive: true });
  await mkdir(join(projectRoot, "public", "place-thumbnails"), { recursive: true });
  await writeFile(
    join(projectRoot, "src", "domain", "mapCatalog.ts"),
    `export const mapCatalog = [
      { slug: "main", title: "Куда в Курске", dataPath: "/data/main-map.json" },
      { slug: "other", title: "Другая карта", dataPath: "/data/other-map.json" }
    ];\n`
  );
  const mainDataPath = join(projectRoot, "public", "data", "main-map.json");
  const otherDataPath = join(projectRoot, "public", "data", "other-map.json");
  await writeJson(mainDataPath, { type: "FeatureCollection", features: [makePlace(1410, "Лавандовый берег")] });
  await writeJson(otherDataPath, { type: "FeatureCollection", features: [] });
  await writeFile(join(projectRoot, "public", "place-images", "old.webp"), "old image");
  await writeFile(join(projectRoot, "public", "place-thumbnails", "old.webp"), "old thumbnail");
  await writeFile(join(projectRoot, "public", "place-images", "other.webp"), "other image");
  const imagePath = join(projectRoot, "new-cover.jpg");
  await writeFile(imagePath, jpeg160x80);
  return { imagePath, mainDataPath, otherDataPath, projectRoot };
}

function runUpdate(
  projectRoot: string,
  imagePath: string,
  selector: { id?: string; mapTitle?: string; name?: string },
  dryRun = false
) {
  const args = [updatePlaceCoverScript, "--image", imagePath, "--project-root", projectRoot];

  if (selector.id) {
    args.push("--place-id", selector.id);
  }

  if (selector.name) {
    args.push("--place-name", selector.name);
  }

  if (selector.mapTitle) {
    args.push("--map-title", selector.mapTitle);
  }

  if (dryRun) {
    args.push("--dry-run");
  }

  return spawnSync(process.execPath, args, { cwd: projectRoot, encoding: "utf8" });
}

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })));
});

describe.skipIf(process.platform !== "darwin")("update-place-cover helper", () => {
  it("shows the planned replacement without writing during dry-run", async () => {
    const { imagePath, mainDataPath, projectRoot } = await makeProject();
    const initialData = await readFile(mainDataPath, "utf8");

    const result = runUpdate(projectRoot, imagePath, { id: "1410" }, true);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Dry run: would update place cover");
    expect(result.stdout).toContain("Лавандовый берег (1410)");
    expect(result.stdout).toMatch(/\/place-images\/1410-image-lavandovyy-bereg-[a-f0-9]{10}\.webp/);
    expect(result.stdout).toContain("Carousel photo: 1");
    expect(result.stdout).toContain("Would remove: /place-images/old.webp");
    expect(await readFile(mainDataPath, "utf8")).toBe(initialData);
  });

  it("updates image, thumbnail and the cover slide while preserving photo metadata", async () => {
    const { imagePath, mainDataPath, projectRoot } = await makeProject();

    const result = runUpdate(projectRoot, imagePath, { id: "1410" });
    const data = JSON.parse(await readFile(mainDataPath, "utf8"));
    const content = data.features[0].properties.balloonContent;

    expect(result.status).toBe(0);
    expect(content.image).toMatch(/^\/place-images\/1410-image-lavandovyy-bereg-[a-f0-9]{10}\.webp$/);
    expect(content.thumbnail).toMatch(/^\/place-thumbnails\/1410-thumbnail-lavandovyy-bereg-[a-f0-9]{10}\.webp$/);
    expect(content.images[0]).toEqual({
      src: content.image,
      thumbnail: content.thumbnail,
      order: 1,
      caption: "Старая обложка"
    });
    expect(content.images[1]).toEqual({ src: "/place-images/other.webp", order: 2 });
    expect(await exists(join(projectRoot, "public", "place-images", "old.webp"))).toBe(false);
    expect(await exists(join(projectRoot, "public", "place-thumbnails", "old.webp"))).toBe(false);
    expect(await exists(join(projectRoot, "public", content.image))).toBe(true);
    expect(await exists(join(projectRoot, "public", content.thumbnail))).toBe(true);
  });

  it("finds a place by its exact normalized name within the requested map", async () => {
    const { imagePath, mainDataPath, projectRoot } = await makeProject();

    const result = runUpdate(projectRoot, imagePath, { mapTitle: "main", name: "лавандовый берег" });
    const data = JSON.parse(await readFile(mainDataPath, "utf8"));

    expect(result.status).toBe(0);
    expect(data.features[0].properties.balloonContent.image).toMatch(
      /^\/place-images\/1410-image-lavandovyy-bereg-[a-f0-9]{10}\.webp$/
    );
  });

  it("keeps an old asset that is still referenced by another map", async () => {
    const { imagePath, otherDataPath, projectRoot } = await makeProject();
    await writeJson(otherDataPath, {
      type: "FeatureCollection",
      features: [makePlace(77, "Общее фото", "/place-images/old.webp", "/place-thumbnails/shared.webp")]
    });

    const result = runUpdate(projectRoot, imagePath, { id: "1410" });

    expect(result.status).toBe(0);
    expect(await exists(join(projectRoot, "public", "place-images", "old.webp"))).toBe(true);
    expect(await exists(join(projectRoot, "public", "place-thumbnails", "old.webp"))).toBe(false);
  });

  it("does not report an old asset as removed when deleting it fails", async () => {
    const { imagePath, projectRoot } = await makeProject();
    await unlink(join(projectRoot, "public", "place-images", "old.webp"));

    const result = runUpdate(projectRoot, imagePath, { id: "1410" });

    expect(result.status).toBe(0);
    expect(result.stderr).toContain("Warning: could not remove /place-images/old.webp");
    expect(result.stdout).not.toContain("Removed: /place-images/old.webp");
    expect(result.stdout).toContain("Removed: /place-thumbnails/old.webp");
  });

  it("updates the first displayed slide even when the legacy image points to a later photo", async () => {
    const { imagePath, mainDataPath, projectRoot } = await makeProject();
    const data = JSON.parse(await readFile(mainDataPath, "utf8"));
    data.features[0].properties.balloonContent.images = [
      { src: "/place-images/other.webp", order: 1, caption: "Фактическая обложка" },
      { src: "/place-images/old.webp", order: 2, caption: "Поздний старый кадр" }
    ];
    await writeJson(mainDataPath, data);

    const result = runUpdate(projectRoot, imagePath, { id: "1410" });
    const updated = JSON.parse(await readFile(mainDataPath, "utf8"));
    const content = updated.features[0].properties.balloonContent;

    expect(result.status).toBe(0);
    expect(content.images[0]).toEqual({
      src: content.image,
      thumbnail: content.thumbnail,
      order: 1,
      caption: "Фактическая обложка"
    });
    expect(content.images[1]).toEqual({ src: "/place-images/old.webp", order: 2, caption: "Поздний старый кадр" });
    expect(await exists(join(projectRoot, "public", "place-images", "old.webp"))).toBe(true);
  });

  it("rejects an ambiguous place name without changing either map", async () => {
    const { imagePath, mainDataPath, otherDataPath, projectRoot } = await makeProject();
    await writeJson(otherDataPath, { type: "FeatureCollection", features: [makePlace(77, "Лавандовый берег")] });
    const initialMain = await readFile(mainDataPath, "utf8");
    const initialOther = await readFile(otherDataPath, "utf8");

    const result = runUpdate(projectRoot, imagePath, { name: "Лавандовый берег" });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("Place match is ambiguous");
    expect(await readFile(mainDataPath, "utf8")).toBe(initialMain);
    expect(await readFile(otherDataPath, "utf8")).toBe(initialOther);
  });
});
