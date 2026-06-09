#!/usr/bin/env node

import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve, relative, join } from "node:path";
import process from "node:process";

const PROJECT_ROOT = process.cwd();
const DATA_DIR = "public/data";

function parseArgs(argv) {
  const args = {
    dryRun: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    if (["--name", "--id", "--file", "--description", "--description-file"].includes(arg)) {
      if (!next || next.startsWith("--")) {
        throw new Error(`${arg} requires a value`);
      }
      args[arg.slice(2)] = next;
      index += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function usage() {
  return `Usage:
  node .agents/skills/place-description-writer/scripts/update-place-description.mjs --name "Place name" --description "New description"
  node .agents/skills/place-description-writer/scripts/update-place-description.mjs --id 123 --file public/data/main-map.json --description-file /tmp/description.txt
  node .agents/skills/place-description-writer/scripts/update-place-description.mjs --name "Place name" --dry-run`;
}

function normalize(value) {
  return String(value)
    .toLocaleLowerCase("ru-RU")
    .replaceAll("ё", "е")
    .replace(/[«»"']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function assertFeatureCollection(raw, filePath) {
  if (!raw || raw.type !== "FeatureCollection" || !Array.isArray(raw.features)) {
    throw new Error(`${filePath} must contain a GeoJSON FeatureCollection with features[]`);
  }
}

function placeName(feature) {
  return feature?.properties?.balloonContent?.name;
}

function placeDescription(feature) {
  return feature?.properties?.balloonContent?.description;
}

function candidateLine(candidate) {
  const file = relative(PROJECT_ROOT, candidate.filePath);
  return `- ${candidate.name} (id: ${candidate.id}, file: ${file})`;
}

async function loadDescription(args) {
  if (args.description && args["description-file"]) {
    throw new Error("Use either --description or --description-file, not both");
  }

  if (args.description) {
    return args.description.trim();
  }

  if (args["description-file"]) {
    return (await readFile(resolve(PROJECT_ROOT, args["description-file"]), "utf8")).trim();
  }

  return "";
}

async function readDataFiles(args) {
  const files = args.file ? [args.file] : await listDefaultDataFiles();

  return Promise.all(
    files.map(async (file) => {
      const filePath = resolve(PROJECT_ROOT, file);
      const text = await readFile(filePath, "utf8");
      const json = JSON.parse(text);
      assertFeatureCollection(json, file);
      return { filePath, json };
    })
  );
}

async function listDefaultDataFiles() {
  const dataDir = resolve(PROJECT_ROOT, DATA_DIR);
  const entries = await readdir(dataDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => join(DATA_DIR, entry.name))
    .sort();
}

function findCandidates(dataFiles, args) {
  const all = [];

  for (const dataFile of dataFiles) {
    dataFile.json.features.forEach((feature, index) => {
      const name = placeName(feature);
      if (!name) {
        return;
      }

      all.push({
        dataFile,
        feature,
        index,
        filePath: dataFile.filePath,
        id: feature.id ?? feature.properties?.id,
        name
      });
    });
  }

  if (args.id) {
    return all.filter((candidate) => String(candidate.id) === String(args.id));
  }

  if (!args.name) {
    throw new Error("Provide --name or --id");
  }

  const target = normalize(args.name);
  const exact = all.filter((candidate) => normalize(candidate.name) === target);

  if (exact.length > 0) {
    return exact;
  }

  return all.filter((candidate) => {
    const normalizedName = normalize(candidate.name);
    return normalizedName.includes(target) || target.includes(normalizedName);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    return;
  }

  if (args.name && args.id) {
    throw new Error("Use either --name or --id, not both");
  }

  const description = await loadDescription(args);

  if (!args.dryRun && description.length === 0) {
    throw new Error("Provide a non-empty --description or --description-file");
  }

  const dataFiles = await readDataFiles(args);
  const candidates = findCandidates(dataFiles, args);

  if (candidates.length === 0) {
    throw new Error("No matching places found");
  }

  if (candidates.length > 1) {
    console.error("Multiple matching places found. Specify --id or --file:");
    console.error(candidates.map(candidateLine).join("\n"));
    process.exitCode = 2;
    return;
  }

  const [candidate] = candidates;

  if (args.dryRun) {
    console.log("Matched place:");
    console.log(candidateLine(candidate));
    console.log(`Current description: ${placeDescription(candidate.feature) ?? ""}`);
    if (description) {
      console.log(`New description: ${description}`);
    }
    return;
  }

  candidate.feature.properties.balloonContent.description = description;
  await writeFile(candidate.filePath, `${JSON.stringify(candidate.dataFile.json, null, 2)}\n`, "utf8");

  console.log(`Updated ${candidate.name} (id: ${candidate.id}) in ${relative(PROJECT_ROOT, candidate.filePath)}`);
}

main().catch((error) => {
  console.error(error.message);
  console.error(usage());
  process.exitCode = 1;
});
