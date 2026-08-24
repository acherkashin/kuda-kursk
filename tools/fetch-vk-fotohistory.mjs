#!/usr/bin/env node

import { access, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { request } from "node:https";
import { basename, dirname, extname, join, resolve } from "node:path";
import process from "node:process";
import { tmpdir } from "node:os";

const DEFAULT_OWNER_ID = -35885835;
const DEFAULT_LIMIT = 100;
const MAX_PAGE_SIZE = 100;
const API_VERSION = "5.199";
const DEFAULT_OUTPUT = ".cache/vk-fotohistory-kursk/posts.json";

function usage() {
  return `Usage:
  VK_API_TOKEN=... node tools/fetch-vk-fotohistory.mjs [options]

Options:
  --limit <number>       Number of posts to fetch. Defaults to ${DEFAULT_LIMIT}.
  --offset <number>      Wall offset for the next batch. Defaults to 0.
  --owner-id <number>    VK community owner ID. Defaults to ${DEFAULT_OWNER_ID}.
  --output <path>        JSON snapshot path. Defaults to ${DEFAULT_OUTPUT}.
  --download-photos      Save source photos beside the snapshot in a temporary cache.
  --photos-dir <path>    Directory for source photos. Defaults to <output-dir>/photos.
  --overwrite            Replace an existing JSON snapshot.
  --help, -h             Show this message.

The access token is read only from VK_API_TOKEN and is never written to files or logs.`;
}

function requireValue(argv, index, option) {
  const value = argv[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`${option} requires a value`);
  }

  return value;
}

function parseNonNegativeInteger(value, option, { minimum = 0 } = {}) {
  if (!/^\d+$/.test(value)) {
    throw new Error(`${option} must be a whole number`);
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < minimum) {
    throw new Error(`${option} must be at least ${minimum}`);
  }

  return parsed;
}

function parseOwnerId(value) {
  if (!/^-?\d+$/.test(value)) {
    throw new Error("--owner-id must be a whole number");
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed === 0) {
    throw new Error("--owner-id must be a non-zero whole number");
  }

  return parsed;
}

function parseArgs(argv) {
  const args = {
    downloadPhotos: false,
    limit: DEFAULT_LIMIT,
    offset: 0,
    output: DEFAULT_OUTPUT,
    overwrite: false,
    ownerId: DEFAULT_OWNER_ID
  };

  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];

    if (option === "--help" || option === "-h") {
      args.help = true;
      continue;
    }

    if (option === "--download-photos") {
      args.downloadPhotos = true;
      continue;
    }

    if (option === "--overwrite") {
      args.overwrite = true;
      continue;
    }

    if (option === "--limit") {
      args.limit = parseNonNegativeInteger(requireValue(argv, index, option), option, { minimum: 1 });
      index += 1;
      continue;
    }

    if (option === "--offset") {
      args.offset = parseNonNegativeInteger(requireValue(argv, index, option), option);
      index += 1;
      continue;
    }

    if (option === "--owner-id") {
      args.ownerId = parseOwnerId(requireValue(argv, index, option));
      index += 1;
      continue;
    }

    if (option === "--output" || option === "--photos-dir") {
      const key = option === "--output" ? "output" : "photosDir";
      args[key] = requireValue(argv, index, option);
      index += 1;
      continue;
    }

    throw new Error(`Unknown option: ${option}`);
  }

  return args;
}

function removeToken(value, token) {
  if (!token) {
    return String(value);
  }

  return String(value).replaceAll(token, "[redacted]");
}

function parseEnvToken(source) {
  const line = source.split(/\r?\n/u).find((value) => /^\s*(?:export\s+)?VK_API_TOKEN\s*=/u.test(value));

  if (!line) {
    return "";
  }

  const value = line.replace(/^\s*(?:export\s+)?VK_API_TOKEN\s*=\s*/u, "").trim();

  if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
    return value.slice(1, -1).trim();
  }

  return value;
}

async function readAccessToken() {
  const environmentToken = process.env.VK_API_TOKEN?.trim();

  if (environmentToken) {
    return environmentToken;
  }

  try {
    return parseEnvToken(await readFile(resolve(".env"), "utf8"));
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return "";
    }

    throw error;
  }
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

function requestUrl(url, { headers = {}, redirects = 0 } = {}) {
  if (redirects > 3) {
    return Promise.reject(new Error("Too many redirects while requesting VK"));
  }

  return new Promise((resolveRequest, rejectRequest) => {
    const requestUrlValue = url instanceof URL ? url : new URL(url);
    const clientRequest = request(
      requestUrlValue,
      {
        headers,
        method: "GET",
        timeout: 20_000
      },
      (response) => {
        const chunks = [];

        response.on("data", (chunk) => chunks.push(chunk));
        response.once("error", rejectRequest);
        response.once("end", () => {
          const status = response.statusCode ?? 0;
          const location = response.headers.location;

          if (status >= 300 && status < 400 && location) {
            void requestUrl(new URL(location, requestUrlValue), { headers, redirects: redirects + 1 })
              .then(resolveRequest)
              .catch(rejectRequest);
            return;
          }

          resolveRequest({
            body: Buffer.concat(chunks),
            headers: response.headers,
            status
          });
        });
      }
    );

    clientRequest.once("error", rejectRequest);
    clientRequest.once("timeout", () => clientRequest.destroy(new Error("VK request timed out")));
    clientRequest.end();
  });
}

function choosePhotoSize(sizes) {
  if (!Array.isArray(sizes)) {
    return null;
  }

  const candidates = sizes.filter(
    (size) =>
      size &&
      typeof size === "object" &&
      typeof size.url === "string" &&
      size.url.length > 0 &&
      Number.isFinite(size.width) &&
      Number.isFinite(size.height)
  );

  if (candidates.length === 0) {
    return null;
  }

  return candidates.reduce((largest, size) =>
    size.width * size.height > largest.width * largest.height ? size : largest
  );
}

function normalizePhotos(attachments) {
  if (!Array.isArray(attachments)) {
    return [];
  }

  return attachments.flatMap((attachment, index) => {
    if (attachment?.type !== "photo") {
      return [];
    }

    const size = choosePhotoSize(attachment.photo?.sizes);

    if (!size) {
      return [];
    }

    return [
      {
        attachment_index: index,
        height: size.height,
        photo_id: attachment.photo.id ?? null,
        url: size.url,
        width: size.width
      }
    ];
  });
}

function normalizePost(post, fallbackOwnerId) {
  if (!post || typeof post !== "object" || !Number.isSafeInteger(post.id) || !Number.isSafeInteger(post.date)) {
    throw new Error("VK API returned a post without a valid id or date");
  }

  const ownerId = Number.isSafeInteger(post.owner_id) ? post.owner_id : fallbackOwnerId;
  const date = new Date(post.date * 1000);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`VK API returned an invalid date for post ${post.id}`);
  }

  return {
    date: date.toISOString(),
    id: post.id,
    metadata: {
      comments: post.comments?.count ?? 0,
      is_pinned: post.is_pinned === 1,
      likes: post.likes?.count ?? 0,
      post_type: typeof post.post_type === "string" ? post.post_type : "post",
      reposts: post.reposts?.count ?? 0,
      views: post.views?.count ?? null
    },
    owner_id: ownerId,
    photos: normalizePhotos(post.attachments),
    post_url: `https://vk.ru/wall${ownerId}_${post.id}`,
    text: typeof post.text === "string" ? post.text : ""
  };
}

async function fetchWallPage({ ownerId, offset, count, token }) {
  const url = new URL("https://api.vk.ru/method/wall.get");
  url.searchParams.set("owner_id", String(ownerId));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("count", String(count));
  url.searchParams.set("v", API_VERSION);

  try {
    const response = await requestUrl(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`VK API responded with HTTP ${response.status}`);
    }

    let payload;

    try {
      payload = JSON.parse(response.body.toString("utf8"));
    } catch {
      throw new Error("VK API returned invalid JSON");
    }

    if (payload?.error) {
      const message = typeof payload.error.error_msg === "string" ? payload.error.error_msg : "Unknown VK API error";
      throw new Error(`VK API error ${payload.error.error_code ?? "unknown"}: ${message}`);
    }

    if (!payload?.response || !Number.isSafeInteger(payload.response.count) || !Array.isArray(payload.response.items)) {
      throw new Error("VK API response has an unexpected wall.get format");
    }

    return payload.response;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("VK API")) {
      throw error;
    }

    throw new Error("Network error while requesting VK API");
  }
}

function photoExtension(photo, contentType) {
  const contentTypeExtension = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
  }[contentType?.split(";", 1)[0].toLowerCase()];

  if (contentTypeExtension) {
    return contentTypeExtension;
  }

  const urlExtension = extname(new URL(photo.url).pathname).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp"].includes(urlExtension) ? urlExtension : ".jpg";
}

async function downloadPhotos(posts, targetDirectory) {
  if (await pathExists(targetDirectory)) {
    throw new Error(`Photo directory already exists: ${targetDirectory}`);
  }

  const stagingDirectory = await mkdtemp(join(tmpdir(), "vk-fotohistory-"));

  try {
    for (const post of posts) {
      for (let index = 0; index < post.photos.length; index += 1) {
        const photo = post.photos[index];
        try {
          const response = await requestUrl(photo.url);

          if (response.status < 200 || response.status >= 300) {
            throw new Error(`HTTP ${response.status}`);
          }

          if (response.body.length === 0) {
            throw new Error("empty response");
          }

          const extension = photoExtension(photo, response.headers["content-type"]);
          const filename = `${post.id}-${String(index + 1).padStart(2, "0")}${extension}`;
          await writeFile(join(stagingDirectory, filename), response.body);
          photo.local_path = join(targetDirectory, filename);
        } catch {
          throw new Error(`Could not download photo ${index + 1} from post ${post.id}`);
        }
      }
    }

    await mkdir(dirname(targetDirectory), { recursive: true });
    await rename(stagingDirectory, targetDirectory);
  } catch (error) {
    await rm(stagingDirectory, { force: true, recursive: true });
    throw error;
  }
}

async function writeSnapshot(snapshot, outputPath, overwrite) {
  const resolvedOutputPath = resolve(outputPath);
  const outputDirectory = dirname(resolvedOutputPath);
  await mkdir(outputDirectory, { recursive: true });

  if (!overwrite && (await pathExists(resolvedOutputPath))) {
    throw new Error(`Snapshot already exists: ${resolvedOutputPath}. Pass --overwrite to replace it.`);
  }

  const stagingPath = join(outputDirectory, `.${basename(resolvedOutputPath)}.${process.pid}.tmp`);

  try {
    await writeFile(stagingPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    await rename(stagingPath, resolvedOutputPath);
  } catch (error) {
    throw error;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    return;
  }

  const token = await readAccessToken();

  if (!token) {
    throw new Error("VK_API_TOKEN is required. Set it in the environment or in the local .env file before running this script.");
  }

  const outputPath = resolve(args.output);
  const photosDirectory = resolve(args.photosDir ?? join(dirname(outputPath), "photos"));

  if (!args.overwrite && (await pathExists(outputPath))) {
    throw new Error(`Snapshot already exists: ${outputPath}. Pass --overwrite to replace it.`);
  }

  if (args.downloadPhotos && (await pathExists(photosDirectory))) {
    throw new Error(`Photo directory already exists: ${photosDirectory}`);
  }

  const posts = [];
  let totalCount = null;
  let wallOffset = args.offset;

  while (posts.length < args.limit) {
    const pageSize = Math.min(MAX_PAGE_SIZE, args.limit - posts.length);
    const response = await fetchWallPage({
      count: pageSize,
      offset: wallOffset,
      ownerId: args.ownerId,
      token
    });

    if (totalCount === null) {
      totalCount = response.count;
    }

    const expectedPageSize = Math.min(pageSize, Math.max(0, totalCount - wallOffset));
    const pinnedPosts = response.items.filter((post) => post.is_pinned === 1);
    const pagePosts = response.items.filter((post) => post.is_pinned !== 1);

    if (expectedPageSize === 0 || pagePosts.length === 0 || pagePosts.length > expectedPageSize || pinnedPosts.length > 1) {
      throw new Error(
        `VK API returned an empty or inconsistent batch (expected up to ${expectedPageSize} posts, received ${pagePosts.length} regular and ${pinnedPosts.length} pinned); no snapshot was saved`
      );
    }

    const normalized = pagePosts.map((post) => normalizePost(post, args.ownerId));
    const knownIds = new Set(posts.map((post) => post.id));

    if (normalized.some((post) => knownIds.has(post.id))) {
      throw new Error("VK API returned duplicate posts; no snapshot was saved");
    }

    posts.push(...normalized);
    wallOffset += expectedPageSize;
  }

  if (args.downloadPhotos) {
    await downloadPhotos(posts, photosDirectory);
  }

  await writeSnapshot(
    {
      community: {
        owner_id: args.ownerId,
        source_url: `https://vk.ru/club${Math.abs(args.ownerId)}`
      },
      fetched_at: new Date().toISOString(),
      offset: args.offset,
      posts,
      requested_count: args.limit,
      total_count: totalCount
    },
    outputPath,
    args.overwrite
  );

  console.log(`Saved ${posts.length} posts to ${outputPath}`);
  if (args.downloadPhotos) {
    console.log(`Saved source photos to ${photosDirectory}`);
  }
}

main().catch((error) => {
  void readAccessToken()
    .catch(() => "")
    .then((token) => {
      console.error(removeToken(error instanceof Error ? error.message : "Unknown error", token));
      console.error(usage());
      process.exitCode = 1;
    });
});
