#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const DEFAULT_SOURCE = ".cache/vk-fotohistory-kursk/posts.json";
const DEFAULT_OUTPUT = "reports/fotohistory-kursk-100.csv";

const duplicates = new Map([
  [104077, "Парк имени Дзержинского"],
  [104052, "Парк имени Дзержинского"],
  [104039, "Парк имени Дзержинского"],
  [103988, "Парк имени Дзержинского"],
  [103609, "Парк имени Дзержинского"],
  [103513, "Красная площадь"],
  [103123, "Красная площадь"],
  [103110, "Красная площадь"],
  [103217, "Красный мост"],
  [103208, "Красный мост"],
  [102677, "Перекрёсток Ленина и Садовой"],
  [102660, "Красная площадь"],
  [102643, "Красная площадь"],
  [102522, "Красная площадь"],
  [102475, "Московская площадь"],
  [102383, "Кировский мост"],
  [102252, "Перекрёсток Дзержинского, Верхней Луговой и Добролюбова"],
  [102137, "Полугора"],
  [102126, "Московская площадь"],
  [102110, "Московская площадь"],
  [101821, "Водный стадион на Боевой даче"]
]);

function parseArgs(argv) {
  const args = { output: DEFAULT_OUTPUT, sources: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    const value = argv[index + 1];

    if (option === "--source" || option === "--output") {
      if (!value || value.startsWith("--")) {
        throw new Error(`${option} requires a value`);
      }

      if (option === "--source") {
        args.sources.push(value);
      } else {
        args.output = value;
      }
      index += 1;
      continue;
    }

    if (option === "--help" || option === "-h") {
      args.help = true;
      continue;
    }

    throw new Error(`Unknown option: ${option}`);
  }

  return args;
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function describeExcluded(post) {
  if (!post.text.trim()) {
    return "В публикации нет текста, по которому можно надёжно установить объект и адрес.";
  }

  return "Локация слишком общая, относится к маршруту/реке/событию или не получила надёжного адреса при проверке.";
}

function rowForPost(post, includedPlaces) {
  const included = includedPlaces.get(post.id);

  if (included) {
    const [placeName, address, latitude, longitude] = included;
    return [post.post_url, post.date, placeName, address, latitude, longitude, "included", "Адрес и координаты подтверждены по тексту публикации и геокодированию.", "high", post.photos.length];
  }

  const duplicateOf = duplicates.get(post.id);

  if (duplicateOf) {
    return [post.post_url, post.date, duplicateOf, "", "", "", "duplicate", `Тот же объект уже представлен на под-карте отдельным опорным постом: ${duplicateOf}.`, "high", post.photos.length];
  }

  return [post.post_url, post.date, "", "", "", "", "excluded", describeExcluded(post), "low", post.photos.length];
}

function createIncludedPlaces(data) {
  return new Map(
    data.features.flatMap((feature) => {
      const postId = Number(String(feature.id).replace(/^fotohistory-/, ""));
      const content = feature.properties?.balloonContent;

      if (!Number.isSafeInteger(postId) || !content?.name || !content?.address || !Array.isArray(feature.geometry?.coordinates)) {
        return [];
      }

      const [longitude, latitude] = feature.geometry.coordinates;
      return [[postId, [content.name, content.address, String(latitude), String(longitude)]]];
    })
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log("Usage: node tools/generate-fotohistory-report.mjs [--source snapshot.json]... [--output report.csv]");
    return;
  }

  const outputPath = resolve(args.output);
  const sourcePaths = (args.sources.length > 0 ? args.sources : [DEFAULT_SOURCE]).map((source) => resolve(source));
  const snapshots = await Promise.all(sourcePaths.map(async (sourcePath) => JSON.parse(await readFile(sourcePath, "utf8"))));
  const posts = snapshots.flatMap((snapshot) => snapshot.posts);
  const includedPlaces = createIncludedPlaces(JSON.parse(await readFile(resolve("public/data/fotohistory-kursk-objects.json"), "utf8")));

  if (posts.length === 0 || snapshots.some((snapshot) => !Array.isArray(snapshot.posts))) {
    throw new Error("Source snapshot does not contain posts");
  }

  const header = ["post_url", "published_at", "place_name", "address", "latitude", "longitude", "decision", "reason", "confidence", "photo_count"];
  const csv = [header, ...posts.map((post) => rowForPost(post, includedPlaces))].map((row) => row.map(csvCell).join(";")).join("\n");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `\uFEFF${csv}\n`, "utf8");
  console.log(`Saved ${posts.length} report rows to ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
