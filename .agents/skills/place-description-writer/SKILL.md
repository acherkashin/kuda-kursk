---
name: place-description-writer
description: Generate safe, catchy Russian place descriptions from a draft or video transcript, ask for user approval, then update the matching map place description in public/data JSON files.
---

# Place Description Writer

Use this skill when the user gives a place name plus a draft description or video transcript and wants a sharper editorial description for the Kursk places map. The skill has two phases: write first, update data only after explicit approval.

## Inputs

- Place name: required.
- Draft: a rough note, existing description, review transcript, or pasted source material.
- Optional target: place `id` or JSON file if the name is ambiguous.

## Writing Workflow

1. Read the draft and separate facts from impressions.
2. Keep only facts present in the draft or already visible in the matching place data. Do not invent years, prices, names, dishes, schedules, awards, addresses, or historical claims.
3. Write one proposed description in Russian.
4. Ask the user to confirm the exact text before editing data.
5. After confirmation, update `properties.balloonContent.description` with the helper script.

## Editorial Style

Target: short city-guide copy with a confident, conversational voice.

- Length: usually 2-4 sentences, compact enough for a place card.
- Opening: name the kind of place and give a hook immediately.
- Middle: add concrete details from the draft: what to see, try, notice, order, ask about, or why the place matters.
- Visit feel: the description should briefly convey what it feels like to visit the place.
- Ending: optional local tip or gentle invitation, not generic marketing.
- Tone: alive, lightly witty when appropriate, but not mean.
- If the source is a video or transcript, copy the style from the video instead of writing like AI: preserve its angle, rhythm, and level of irony while keeping the public copy clean.
- Vocabulary: prefer specific nouns and verbs over adjectives. Replace "атмосферное", "уникальное", "обязательно к посещению" with observable details.

## Safety Rules

- Do not insult people, neighborhoods, staff, visitors, owners, competitors, social groups, religions, nationalities, or tastes.
- Do not describe a place as bad, shameful, sketchy, unsafe, dirty, scammy, overpriced, or embarrassing unless the user explicitly asks for a critical private note; map descriptions must stay constructive.
- Do not use sexualized, humiliating, body-shaming, classist, ableist, racist, xenophobic, homophobic, or ageist jokes.
- Be careful with memorials, religious places, war history, disasters, cemeteries, hospitals, schools, and vulnerable communities: write calmly, without punchlines.
- If the draft contains accusations, rumors, private data, medical/legal claims, or unverified scandal, omit them and say that the proposed public description avoids that material.
- Do not promise availability, prices, menus, opening hours, events, or services unless the draft makes them current and reliable.

## Format To Show The User

When proposing copy, keep the response focused:

```markdown
Предлагаю такое описание:

> ...

Если подходит, подтвердите, и я обновлю описание места на карте.
```

If there are multiple plausible interpretations, mention the main assumption in one short sentence before the quote.

## Updating Data

Only update data after the user clearly confirms the proposed text or provides a final replacement text.

Use:

```bash
node .agents/skills/place-description-writer/scripts/update-place-description.mjs --name "Название места" --description "Новое описание"
```

For ambiguous names, rerun with `--id` or `--file`:

```bash
node .agents/skills/place-description-writer/scripts/update-place-description.mjs --id 123 --file public/data/main-map.json --description "Новое описание"
```

Useful dry run:

```bash
node .agents/skills/place-description-writer/scripts/update-place-description.mjs --name "Название места" --dry-run
```

After updating, inspect the diff and run existing validation checks that fit the change, usually `pnpm typecheck` or `pnpm build` if JSON validity needs confirmation through the app build. Do not add new automated tests unless the user explicitly approves them.
