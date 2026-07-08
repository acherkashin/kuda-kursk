---
name: add-map-place
description: "Add a new place to the Kursk map data from a local image path, name, address, and description. Use when the user asks to add, create, import, or publish a place on the Kursk map, optionally naming the target map; if any required input is missing, ask whether to find the missing data on the internet before searching."
---

# Add Map Place

## Overview

Добавляй новое место в JSON-данные карты Курска через проверяемый workflow: собрать обязательные поля, при необходимости получить разрешение на интернет-поиск, найти координаты по адресу, показать пользователю итог и только потом записать данные helper-скриптом.

## Required Inputs

- `imagePath`: локальный путь к JPEG, PNG, WebP или HEIC.
- `name`: название места.
- `address`: адрес.
- `description`: описание для карточки места.
- `mapTitle`: optional название карты; по умолчанию используй главную карту `Куда в Курске`.

Если пользователь передал неструктурированный текст, извлеки из него эти поля сам. Не спрашивай про поле, если оно уже однозначно есть в сообщении.

## Working Branch

Не создавай отдельную ветку или worktree для добавления места. Все изменения по этому skill делай в текущей ветке и текущем рабочем дереве, соблюдая уже существующие незакоммиченные изменения пользователя.

## Workflow

1. Прочитай `.specify/memory/constitution.md`.
2. Прочитай `references/place-data-rules.md`.
3. Проверь, какие обязательные поля отсутствуют: `imagePath`, `name`, `address`, `description`.
4. Если чего-то не хватает, спроси одним сообщением:

   ```markdown
   Не хватает: <список полей>. Найти это самостоятельно в интернете?
   ```

5. Если пользователь не разрешил поиск и данные всё ещё неполные, остановись и перечисли, что нужно прислать.
6. Если пользователь разрешил поиск, используй интернет только для недостающих полей. Для найденных фактов сохраняй источники в своём рабочем контексте и кратко покажи их пользователю перед записью.
7. Если картинка найдена в интернете, не используй её молча: покажи URL/источник и дождись явного подтверждения или попроси локальный файл. Helper-скрипт принимает только локальный путь.
8. Проверь, что `imagePath` существует локально.
9. Найди координаты по адресу. Если адрес был дан пользователем, отдельное разрешение на поиск координат не нужно. Если адрес тоже был найден в интернете, используй те же источники и покажи их перед записью.
10. Подготовь итог и покажи пользователю перед записью:

    ```markdown
    Готовлю добавление места:
    - Карта: <mapTitle>
    - Название: <name>
    - Адрес: <address>
    - Описание: <description>
    - Координаты: <latitude>, <longitude>
    - Картинка: <imagePath>
    ```

11. Выполни dry-run helper-скрипта и проверь рассчитанные hash-имена WebP-обложки и миниатюры.
12. Если dry-run корректен и пользователь уже подтвердил итог, выполни helper-скрипт без `--dry-run`; он вызовет общий `tools/generate-place-assets.mjs`, нормализует ориентацию и не будет копировать исходник.
13. После записи проверь diff и запусти существующую проверку, обычно `pnpm typecheck` или `pnpm build`. Не добавляй новые автоматические тесты без отдельного разрешения пользователя.

## Helper Script

Dry-run:

```bash
node .agents/skills/add-map-place/scripts/add-map-place.mjs \
  --image "/absolute/path/photo.webp" \
  --name "Название места" \
  --address "Курск, улица Ленина, 1" \
  --description "Короткое описание для карточки." \
  --latitude 51.730846 \
  --longitude 36.193015 \
  --dry-run
```

Запись в главную карту:

```bash
node .agents/skills/add-map-place/scripts/add-map-place.mjs \
  --image "/absolute/path/photo.webp" \
  --name "Название места" \
  --address "Курск, улица Ленина, 1" \
  --description "Короткое описание для карточки." \
  --latitude 51.730846 \
  --longitude 36.193015
```

Запись в указанную карту:

```bash
node .agents/skills/add-map-place/scripts/add-map-place.mjs \
  --map-title "Дозаправка" \
  --image "/absolute/path/photo.webp" \
  --name "Название места" \
  --address "Курск, улица Ленина, 1" \
  --description "Короткое описание для карточки." \
  --latitude 51.730846 \
  --longitude 36.193015
```

## Data Rules

- `geometry.coordinates` всегда записывай как `[longitude, latitude]`.
- `balloonContent.coordinates` не записывай: строка координат для UI вычисляется из `geometry.coordinates`.
- `balloonContent.image` и `thumbnail` всегда должны ссылаться на созданные helper-ом WebP-файлы; не сохраняй исходный JPEG, PNG или HEIC в `public/`.
- Не добавляй пустые optional поля.
- Не меняй существующие места, если задача только добавить новое место.
- Не трогай чужие незакоммиченные изменения в рабочем дереве.

## Useful Commands

```bash
node .agents/skills/add-map-place/scripts/add-map-place.mjs --help
python3 /Users/cherkalexander/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/add-map-place
```

If the helper reports an unknown map title, read `src/domain/mapCatalog.ts` and use one of the configured `title` values, or omit `--map-title` for the main map.
