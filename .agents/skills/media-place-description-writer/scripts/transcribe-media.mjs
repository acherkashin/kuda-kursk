#!/usr/bin/env node

import { constants } from "node:fs";
import { access, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { basename, delimiter, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import process from "node:process";

const DEFAULT_LANGUAGE = "ru";
const DEFAULT_MODEL = "base";
const ENGINE_CANDIDATES = ["whisper", "faster-whisper", "whisper-cli"];

function usage() {
  return `Usage:
  node .agents/skills/media-place-description-writer/scripts/transcribe-media.mjs --file /path/to/media.mp4 [--language ru] [--model base]
  node .agents/skills/media-place-description-writer/scripts/transcribe-media.mjs --file /path/to/media.mp4 --place-name "Отель Bellagio" --context "Отзыв Дозаправки на отель"
  node .agents/skills/media-place-description-writer/scripts/transcribe-media.mjs --check

Options:
  --file <path>        Audio or video file to transcribe.
  --language <code>    Whisper language code. Defaults to ru.
  --model <value>      Whisper model name, or whisper.cpp model path for whisper-cli.
  --place-name <text>  Optional place name, echoed as metadata.
  --context <text>     Optional user context, echoed as metadata.
  --engine <name>      Force whisper, faster-whisper, or whisper-cli.
  --check              Check ffmpeg and Local Whisper availability without transcribing.
  --help, -h           Show this help.`;
}

function parseArgs(argv) {
  const args = {
    language: DEFAULT_LANGUAGE
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }

    if (arg === "--check") {
      args.check = true;
      continue;
    }

    if (["--file", "--language", "--model", "--place-name", "--context", "--engine"].includes(arg)) {
      if (!next || next.startsWith("--")) {
        throw new Error(`${arg} requires a value`);
      }
      args[arg.slice(2)] = next;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function isExecutable(filePath) {
  try {
    await access(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function findExecutable(command) {
  if (command.includes("/")) {
    const fullPath = resolve(command);
    return (await isExecutable(fullPath)) ? fullPath : null;
  }

  const pathEntries = (process.env.PATH ?? "").split(delimiter).filter(Boolean);
  for (const entry of pathEntries) {
    const candidate = join(entry, command);
    if (await isExecutable(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function detectEngine(forcedEngine) {
  const candidates = forcedEngine ? [forcedEngine] : [process.env.LOCAL_WHISPER_BIN, ...ENGINE_CANDIDATES].filter(Boolean);

  for (const name of candidates) {
    const executable = await findExecutable(name);
    if (!executable) {
      continue;
    }

    const engine = basename(name);
    if (engine === "whisper" || engine === "faster-whisper" || engine === "whisper-cli") {
      return { engine, executable };
    }

    return { engine: "whisper", executable };
  }

  return null;
}

function runCommand(command, args, options = {}) {
  return new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", rejectCommand);
    child.on("close", (code) => {
      resolveCommand({ code, stdout, stderr });
    });
  });
}

async function assertFileExists(filePath) {
  const fileStat = await stat(filePath).catch(() => null);
  if (!fileStat || !fileStat.isFile()) {
    throw new Error(`Media file not found: ${filePath}`);
  }
}

async function extractAudio(ffmpegPath, inputFile, outputFile) {
  const args = [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    inputFile,
    "-vn",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-c:a",
    "pcm_s16le",
    outputFile
  ];

  const result = await runCommand(ffmpegPath, args);
  if (result.code !== 0) {
    throw new Error(`ffmpeg could not extract audio:\n${result.stderr.trim() || result.stdout.trim()}`);
  }
}

async function transcribeWithWhisper(engineInfo, audioFile, tempDir, options) {
  const model = options.model ?? DEFAULT_MODEL;
  const outputPath = join(tempDir, "transcript");
  const outputDir = tempDir;
  let expectedFile = join(tempDir, "audio.txt");
  let commandArgs;

  if (engineInfo.engine === "whisper-cli") {
    const modelPath = options.model ?? process.env.WHISPER_MODEL;
    if (!modelPath) {
      throw new Error("whisper-cli requires --model <path-to-ggml-model> or WHISPER_MODEL.");
    }

    commandArgs = ["-f", audioFile, "-l", options.language, "-otxt", "-of", outputPath, "-m", modelPath];
    expectedFile = `${outputPath}.txt`;
  } else {
    commandArgs = [
      audioFile,
      "--language",
      options.language,
      "--model",
      model,
      "--output_format",
      "txt",
      "--output_dir",
      outputDir
    ];
  }

  const result = await runCommand(engineInfo.executable, commandArgs);
  if (result.code !== 0) {
    throw new Error(`${engineInfo.engine} transcription failed:\n${result.stderr.trim() || result.stdout.trim()}`);
  }

  const transcript = await readFile(expectedFile, "utf8").catch(() => "");
  const trimmedTranscript = transcript.trim();
  if (trimmedTranscript.length > 0) {
    return trimmedTranscript;
  }

  const fallback = result.stdout.trim();
  if (fallback.length > 0) {
    return fallback;
  }

  throw new Error(`${engineInfo.engine} finished, but no transcript text was produced.`);
}

async function preflight(args) {
  const ffmpeg = await findExecutable("ffmpeg");
  const engineInfo = await detectEngine(args.engine);

  return { ffmpeg, engineInfo };
}

function printPreflight(result) {
  console.log(`ffmpeg: ${result.ffmpeg ? result.ffmpeg : "missing"}`);
  console.log(`Local Whisper: ${result.engineInfo ? `${result.engineInfo.engine} (${result.engineInfo.executable})` : "missing"}`);
}

function missingWhisperMessage() {
  return [
    "Local Whisper CLI was not found.",
    "Install one compatible command and make it available in PATH:",
    "- whisper",
    "- faster-whisper",
    "- whisper-cli (requires --model or WHISPER_MODEL)",
    "You can also set LOCAL_WHISPER_BIN to a compatible executable."
  ].join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage());
    return;
  }

  const check = await preflight(args);

  if (args.check) {
    printPreflight(check);
    if (!check.ffmpeg || !check.engineInfo) {
      process.exitCode = 1;
    }
    return;
  }

  if (!args.file) {
    throw new Error(`Provide --file.\n${usage()}`);
  }

  if (!check.ffmpeg) {
    throw new Error("ffmpeg was not found in PATH. Install ffmpeg before transcribing media files.");
  }

  if (!check.engineInfo) {
    throw new Error(missingWhisperMessage());
  }

  const inputFile = resolve(args.file);
  await assertFileExists(inputFile);

  const tempDir = await mkdtemp(join(tmpdir(), "media-place-description-"));
  try {
    const audioFile = join(tempDir, "audio.wav");
    await extractAudio(check.ffmpeg, inputFile, audioFile);
    const transcript = await transcribeWithWhisper(check.engineInfo, audioFile, tempDir, {
      language: args.language,
      model: args.model
    });

    if (args["place-name"]) {
      console.error(`Place: ${args["place-name"]}`);
    }
    if (args.context) {
      console.error(`Context: ${args.context}`);
    }
    console.log(transcript);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
