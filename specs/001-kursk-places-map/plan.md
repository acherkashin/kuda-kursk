# План реализации: Куда в Курске

**Ветка**: `001-kursk-places-map` | **Дата**: 2026-05-31 | **Спецификация**: `specs/001-kursk-places-map/spec.md`

**Ввод**: спецификация функции из `specs/001-kursk-places-map/spec.md`

**Примечание**: документ заполнен в рамках workflow `/speckit-plan`; Phase 2 tasks будут созданы отдельно через `/speckit-tasks`.

## Краткое описание

Первая версия приложения будет фронтенд-only PWA на React/Vite/TypeScript: полноэкранная карта Курска с заметными маркерами мест, карточкой подробностей, текстовым поиском, прямыми ссылками карт сообществ и opt-in аналитикой Яндекс.Метрики. Карта строится на `maplibre-gl` и OpenFreeMap без API-ключей; данные мест и карт сообществ поставляются как статический GeoJSON-like JSON; бизнес-логика импорта, поиска, маршрутов и аналитики выносится из React-компонентов в отдельные модули.

Визуальный слой первой версии обязан следовать `DESIGN_SYSTEM.md`: карта остаётся главным холстом, UI размещается поверх неё как небольшие плавающие карточки, палитра монохромная, цветовую выразительность несут фотографии мест, а анимации используются только для объяснения смены состояния.

## Технический контекст

**Language/Version**: TypeScript 5.x, React 19.x, Vite 8.x, modern ECMAScript modules

**Package Manager**: `pnpm` 10.6.2; будущий `package.json` должен фиксировать `"packageManager": "pnpm@10.6.2"`, ожидаемый lock-файл - `pnpm-lock.yaml`

**Primary Dependencies**: `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `typescript`, `maplibre-gl`, `tailwindcss`, `@tailwindcss/vite`, `motion`, `lucide-react`, `react-router`, `vite-plugin-pwa`, `workbox-window`

**Design System**: `DESIGN_SYSTEM.md` - обязательный источник визуальных решений для Tailwind tokens, монохромной палитры, типографики Inter, глубины, floating-card layout, functional Motion-анимаций и тона контента

**Storage**: статические JSON-файлы и локальные ассеты в первом релизе; backend, аккаунты и CMS не входят в v1

**Testing**: существующие Playwright и unit-проверки можно запускать для регрессии; новое или изменённое тестовое покрытие добавляется только после отдельного явного запроса или разрешения пользователя

**Target Platform**: PWA для современных мобильных и десктопных браузеров; production deployment как статический SPA на GitHub Pages project pages (`https://acherkashin.github.io/kuda-kursk/`)

**Project Type**: frontend SPA/PWA без backend в первой версии

**Performance Goals**: карта остаётся отзывчивой при 500 местах; поиск воспринимается мгновенным для опубликованного набора; анимации панели места выполняются без заметных просадок; не делать тяжёлую загрузку аналитики до согласия

**Constraints**: бесплатная карта без API-ключей; OpenFreeMap public instance допускается без SLA и должен быть заменяем через конфиг; канонический порядок координат `[longitude, latitude]`; no Zod; Яндекс.Метрика только после явного согласия; не отправлять сырые поисковые запросы

**Scale/Scope**: v1 покрывает публичную карту, карты сообществ по ссылке, статический контент, поиск, карточки, маршруты, PWA и аналитику; будущие backend, аккаунты, сохранённые места, отметки посещений, заявки пользователей и Telegram mini app не реализуются

**Deployment**: проект публикуется через GitHub Actions workflow в GitHub Pages от push в ветку `main`. Vite `base` равен `/kuda-kursk/`; локальные public assets, JSON-данные, MapLibre style, PWA manifest и service worker должны строить URL с учётом `import.meta.env.BASE_URL`, чтобы SPA работала на project pages без custom domain.

## Проверка конституции

*GATE: должно пройти до Phase 0 research. Повторно проверено после Phase 1 design.*

- **Simplicity and abstractions**: PASS. Первый релиз остаётся одним frontend-приложением со статическими данными; новые модули нужны для отделения карты, данных, поиска, маршрутов, PWA и аналитики.
- **Separation of concerns**: PASS. React-компоненты отвечают за композицию и состояние интерфейса; импорт/валидация данных, поиск, построение ссылок маршрутов и analytics adapter выносятся в focused modules.
- **User-approved testing**: PASS. В текущей фиче уже есть созданные unit/e2e проверки, которые можно запускать как регрессионные; новое покрытие не добавляется без отдельного разрешения, visual/PWA/mobile проверки могут фиксироваться вручную.
- **Consistent UX**: PASS. Полноэкранная карта остаётся главным экраном; optional content скрывается без пустых заглушек; mobile drawer и consent UI проектируются как доступные элементы.
- **Performance**: PASS. Используется MapLibre GeoJSON source/clustering, локальная нормализация поискового индекса и opt-in lazy loading Метрики; Fuse/search engine не добавляется до подтверждённой необходимости.

## Структура проекта

### Документация функции

```text
specs/001-kursk-places-map/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── analytics-events.md
│   ├── data-format.md
│   ├── pwa-behavior.md
│   └── routes.md
└── tasks.md
```

### Исходный код

```text
public/
├── data/
│   ├── places.json
│   └── community-maps.json
├── map-styles/
│   └── kursk-positron.json
└── pwa/
    ├── icon-192.png
    └── icon-512.png

src/
├── app/
│   ├── App.tsx
│   └── router.tsx
├── components/
│   ├── analytics-consent/
│   ├── filters/
│   ├── map/
│   └── place-details/
├── data/
│   ├── loadCommunityMaps.ts
│   ├── loadPlaces.ts
│   └── validateGeoJsonPlace.ts
├── domain/
│   ├── analyticsEvents.ts
│   ├── communityMaps.ts
│   ├── places.ts
│   ├── routeLinks.ts
│   └── search.ts
├── services/
│   ├── analytics/
│   └── pwa/
├── styles/
│   └── index.css
└── main.tsx

tests/
├── e2e/
└── unit/
```

**Решение по структуре**: один frontend-проект в корне репозитория. Данные и доменная логика отделяются от UI; карта, карточка места, поиск, consent и PWA/analytics имеют собственные модули.

## Отслеживание сложности

Нарушений конституции нет.

## Phase 0: Research

См. `specs/001-kursk-places-map/research.md`.

## Phase 1: Design and Contracts

См. `specs/001-kursk-places-map/data-model.md`, `specs/001-kursk-places-map/quickstart.md` и `specs/001-kursk-places-map/contracts/`.

## Повторная проверка конституции после дизайна

- **Simplicity and abstractions**: PASS. Выбранный стек не добавляет backend или CMS в v1; дополнительные библиотеки покрывают конкретные риски: карта, PWA, анимации и иконки.
- **Separation of concerns**: PASS. Контракты фиксируют границы данных, роутинга, PWA и аналитики; будущие задачи должны сохранять эти границы.
- **User-approved testing**: PASS. Контракты и quickstart описывают существующие проверки качества; новые или изменённые тесты требуют отдельного разрешения пользователя.
- **Consistent UX**: PASS. План учитывает `DESIGN_SYSTEM.md`: карта остаётся главным холстом, UI плавает поверх карты, фотографии несут идентичность мест, активные состояния выражаются контрастом, а visual QA закрывает desktop/mobile состояния без наложений.
- **Performance**: PASS. Требования к 500 местам закрываются локальной нормализацией данных, MapLibre source/clustering и отказом от преждевременного fuzzy engine.

## Дополнение: переход с основной карты на под-карты (US5, FR-031–FR-033)

Подход переиспользует существующую маршрутизацию `/maps/:slug` и каталог карт, добавляя минимальные поля в модель места без новых подсистем:

- `properties.mapLink: { slug }` — место является входом в под-карту; в карточке появляется primary-действие «Открыть карту «<название>»» (внутренняя навигация react-router). На карте места-входы показываются как обычные фотомаркеры (отдельный «портальный» вид маркера не используется).
- `properties.routable` — при `false` действия построения маршрута скрываются (представительная отметка-портал).
- Каждая карта несёт собственную идентичность в каталоге (`mapCatalog`): поля `logo`, `title`, `description`. При переходе на под-карту бренд-блок (`MapLogo`) показывает логотип, название и описание этой карты; описание может переноситься на несколько строк и не должно обрезаться. Под-карты переиспользуют существующие ассеты (фото места-входа как логотип «Дозаправка», отдельный webp-логотип «Запишу, зарисую»).
- Возврат с под-карты — компактная иконка-стрелка «На главную карту», встроенная как ведущий элемент в бренд-блок `MapLogo` (показывается при `slug !== "main"`); отдельная плавающая кнопка не используется.
- Связь места с под-картой реализована через отдельные места-входы. Будущее направление — общая идентичность места между несколькими картами и индикатор «есть на других картах» (см. раздел «Допущения» в `spec.md`, поле `visibility.communitySlugs`).

Проверка: `npm run typecheck`, `npm run build`, существующие unit-тесты и ручная проверка сценариев через preview. Новое тестовое покрытие не добавлялось; обновлён только счётчик мест в существующем `tests/unit/mapDataIntegrity.test.ts` (изменение данных, не нового покрытия).
