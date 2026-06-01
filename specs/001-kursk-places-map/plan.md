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

**Testing**: Playwright для e2e/responsive/PWA/analytics сценариев; unit-тесты TypeScript для чистой логики поиска, координат и route links

**Target Platform**: PWA для современных мобильных и десктопных браузеров; production deployment как статический SPA

**Project Type**: frontend SPA/PWA без backend в первой версии

**Performance Goals**: карта остаётся отзывчивой при 500 местах; поиск воспринимается мгновенным для опубликованного набора; анимации панели места выполняются без заметных просадок; не делать тяжёлую загрузку аналитики до согласия

**Constraints**: бесплатная карта без API-ключей; OpenFreeMap public instance допускается без SLA и должен быть заменяем через конфиг; канонический порядок координат `[longitude, latitude]`; no Zod; Яндекс.Метрика только после явного согласия; не отправлять сырые поисковые запросы

**Scale/Scope**: v1 покрывает публичную карту, карты сообществ по ссылке, статический контент, поиск, карточки, маршруты, PWA и аналитику; будущие backend, аккаунты, сохранённые места, отметки посещений, заявки пользователей и Telegram mini app не реализуются

## Проверка конституции

*GATE: должно пройти до Phase 0 research. Повторно проверено после Phase 1 design.*

- **Simplicity and abstractions**: PASS. Первый релиз остаётся одним frontend-приложением со статическими данными; новые модули нужны для отделения карты, данных, поиска, маршрутов, PWA и аналитики.
- **Separation of concerns**: PASS. React-компоненты отвечают за композицию и состояние интерфейса; импорт/валидация данных, поиск, построение ссылок маршрутов и analytics adapter выносятся в focused modules.
- **Risk-based testing strategy**: PASS. Critical flows закрываются Playwright, чистая логика закрывается unit-тестами; visual/PWA/mobile проверки записаны в quickstart и будущие tasks.
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
- **Risk-based testing strategy**: PASS. Контракты и quickstart задают unit/e2e/PWA/analytics проверки для критичных требований.
- **Consistent UX**: PASS. План учитывает `DESIGN_SYSTEM.md`: карта остаётся главным холстом, UI плавает поверх карты, фотографии несут идентичность мест, активные состояния выражаются контрастом, а visual QA закрывает desktop/mobile состояния без наложений.
- **Performance**: PASS. Требования к 500 местам закрываются локальной нормализацией данных, MapLibre source/clustering и отказом от преждевременного fuzzy engine.
