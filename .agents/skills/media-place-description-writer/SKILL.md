---
name: media-place-description-writer
description: "Transcribe local audio or video files with Local Whisper, then produce a full Russian output package for Kursk map place copy: complete transcript, short video summary, and generated place description. Use when the user provides a media file path and wants a place description based on a review, reel, interview, or other spoken source material."
---

# Media Place Description Writer

Use this skill when the user gives a local audio/video path and wants to turn spoken source material into a public place description. The skill never updates map data by itself.

## Required Inputs

- Media file path: required.
- Place name or place type: required before generating the final place description.
- Optional context: reviewer/source, relationship to the place, useful background from the user.

If the transcript and user context do not make clear what the place is, ask the user for the place name and type before writing the place description.

## Workflow

1. Verify the media file exists.
2. Run the local transcription helper:

   ```bash
   node .agents/skills/media-place-description-writer/scripts/transcribe-media.mjs --file "/path/to/media.mp4" --language ru
   ```

   Include `--place-name` and `--context` when the user supplied them; they are echoed in the run metadata for traceability.

3. Read `references/place-description-prompt.md` before writing the video summary or place description.
4. Review the full transcript and identify only facts that are present in the transcript or explicit user context.
5. If the place is unclear, stop and ask for clarification.
6. Перед ответом отдельно проверь готовое описание места: в нём не должно быть упоминаний источника, обзорщика, автора, транскрипта, видео, формата обзора или неподтверждённых фактов.
7. Otherwise, respond in this exact order:

   ```markdown
   Полный транскрипт

   <full transcript, without shortening>

   Краткое описание видео

   <2-4 sentences>

   Описание места

   > <generated place description>
   ```

## Transcription Helper

The helper uses `ffmpeg` plus Local Whisper. It does not call OpenAI API.

Supported local engines are detected from `PATH`:

- `whisper` (OpenAI Whisper CLI)
- `faster-whisper`
- `whisper-cli` (whisper.cpp-compatible; requires `--model` or `WHISPER_MODEL`)

Useful commands:

```bash
node .agents/skills/media-place-description-writer/scripts/transcribe-media.mjs --help
node .agents/skills/media-place-description-writer/scripts/transcribe-media.mjs --check
node .agents/skills/media-place-description-writer/scripts/transcribe-media.mjs --file "/path/to/video.mp4" --place-name "Отель Bellagio" --context "Отзыв Дозаправки на отель"
```

If the helper reports that Local Whisper is missing, explain that `ffmpeg` is present only if the preflight says so, and the user needs to install/add a compatible Whisper CLI to `PATH`.

## Writing Rules

- Do not invent details: no dates, addresses, prices, schedules, names, awards, rooms, services, dishes, or amenities unless present in the transcript or user context.
- Keep the place description short enough for a map card: usually 2-4 sentences.
- Preserve uncertainty: if the transcript sounds subjective, write it as an impression from the review instead of a guaranteed fact.
- Копируй стиль из видео, а не пиши как будто ты ИИ: переноси угол зрения, ритм, степень иронии и живые формулировки, но не тащи в публичное описание речевой мусор, мат или маркеры источника.
- Публичное описание места должно читаться как самостоятельный текст для карты. Если в нём есть маркеры источника вроде «ролик», «видео», «обзор», «отзыв», «автор», «транскрипт», «в ролике», «по словам» или «хвалят», перепиши его перед ответом.
- Public copy must stay constructive and safe. Omit rumors, accusations, private data, medical/legal claims, and unsupported negative claims.
- If the user later asks to update map data, switch to `place-description-writer` and require explicit approval of the exact final text before editing JSON.
