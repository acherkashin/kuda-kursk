# Задачи: Куда в Курске

**Ввод**: проектные документы из `specs/001-kursk-places-map/`

**Предварительные условия**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Тесты**: в этой функции уже есть созданные unit/e2e проверки, которые можно запускать как регрессионную проверку. Новое или изменённое тестовое покрытие добавляется только после отдельного явного запроса или разрешения пользователя.

**Организация**: задачи сгруппированы по пользовательским историям, чтобы каждую историю можно было реализовать и проверить независимо после общей основы.

## Формат: `[ID] [P?] [Story] Описание`

- **[P]**: задача может выполняться параллельно, если не зависит от незавершённых задач и меняет отдельные файлы
- **[Story]**: метка пользовательской истории (`US1`, `US2`, `US3`, `US4`) для задач фаз историй
- Каждая задача содержит конкретный путь к файлу или директории

## Phase 1: Setup (общая инфраструктура)

**Цель**: создать frontend-only React/Vite/TypeScript PWA проект с тестовой инфраструктурой и базовой структурой файлов.

- [X] T001 Создать `package.json` с `"packageManager": "pnpm@10.6.2"`, scripts `dev`, `build`, `preview`, `typecheck`, `test:unit`, `test:e2e` и зависимостями из `specs/001-kursk-places-map/plan.md`
- [X] T002 Сгенерировать `pnpm-lock.yaml` установкой зависимостей из `package.json`
- [X] T003 Настроить Vite, React, Tailwind v4 и vite-plugin-pwa в `vite.config.ts`
- [X] T004 [P] Создать строгие TypeScript настройки в `tsconfig.json`, `tsconfig.app.json` и `tsconfig.node.json`
- [X] T005 [P] Настроить Vitest для unit-тестов TypeScript в `vitest.config.ts`
- [X] T006 [P] Настроить Playwright browsers, webServer и проекты desktop/mobile в `playwright.config.ts`
- [X] T007 [P] Создать entrypoint React приложения в `index.html`, `src/main.tsx` и `src/app/App.tsx`
- [X] T008 [P] Создать базовые стили и design tokens для спокойного картографического интерфейса в `src/styles/index.css`
- [X] T009 [P] Создать директории исходного кода по плану в `src/app/`, `src/components/`, `src/data/`, `src/domain/`, `src/services/`, `tests/e2e/` и `tests/unit/`
- [X] T010 [P] Создать публичные директории данных, стилей карты и PWA ассетов в `public/data/`, `public/map-styles/` и `public/pwa/`

---

## Phase 2: Foundational (блокирующая основа)

**Цель**: подготовить контракты данных, загрузчики, роутинг и общие сервисы, без которых нельзя надёжно реализовывать истории.

**Критично**: работу над пользовательскими историями начинать только после завершения этой фазы.

- [X] T011 [P] Описать типы `PlaceFeature`, `BalloonContent`, `Photo` и `ExternalLink` в `src/domain/places.ts`
- [X] T012 [P] Описать типы и правила `CommunityMap` в `src/domain/communityMaps.ts`
- [X] T013 [P] Описать типы analytics consent и событий из контракта в `src/domain/analyticsEvents.ts`
- [X] T014 [P] Написать unit-тесты валидации GeoJSON-like мест и порядка координат `[longitude, latitude]` в `tests/unit/validateGeoJsonPlace.test.ts`
- [X] T015 Реализовать валидатор GeoJSON-like мест без Zod в `src/data/validateGeoJsonPlace.ts`
- [X] T016 [P] Написать unit-тесты построения ссылок Яндекс.Карт, 2ГИС и Google Maps в `tests/unit/routeLinks.test.ts`
- [X] T017 Реализовать построение route links для координат места в `src/domain/routeLinks.ts`
- [X] T018 [P] Создать стартовый набор публичных мест в `public/data/places.json`
- [X] T019 [P] Создать стартовый набор карт сообществ с public и link-only местами в `public/data/community-maps.json`
- [X] T020 Реализовать загрузку и валидацию мест из статического JSON в `src/data/loadPlaces.ts`
- [X] T021 Реализовать загрузку и валидацию карт сообществ из статического JSON в `src/data/loadCommunityMaps.ts`
- [X] T022 Создать declarative routes `/` и `/maps/:slug` в `src/app/router.tsx`
- [X] T023 Настроить общий layout приложения с полноэкранной картой как первым экраном в `src/app/App.tsx`
- [X] T024 [P] Создать заменяемый конфиг OpenFreeMap/MapLibre и центра Курска в `src/domain/mapConfig.ts`
- [X] T025 [P] Подготовить приглушённый style JSON карты с русскими подписями и нужным географическим контекстом в `public/map-styles/kursk-positron.json`
- [X] T026 [P] Создать no-op analytics adapter, который не создаёт `window.ym` без consent и env counter id, в `src/services/analytics/analyticsAdapter.ts`
- [X] T027 [P] Создать PWA registration helper с update prompt API в `src/services/pwa/registerServiceWorker.ts`

**Checkpoint**: после этой фазы проект запускается, читает статические данные, знает маршруты, типы, координаты и внешние route links.

---

## Phase 3: User Story 1 - Найти места на карте (Priority: P1)

**Цель**: пользователь открывает приложение и сразу видит полноэкранную карту Курска с заметными маркерами мест, логотипом и спокойной базовой картой.

**Независимая проверка**: открыть приложение на desktop и mobile, убедиться, что карта центрирована на Курске, маркеры видны без регистрации, hover показывает название, pan/zoom не ломает интерфейс.

### Тесты для User Story 1

- [X] T028 [P] [US1] Написать Playwright-тест первого экрана desktop/mobile с картой, логотипом и маркерами в `tests/e2e/map-first-screen.spec.ts`
- [X] T029 [P] [US1] Написать Playwright-тест hover названия маркера и pan/zoom устойчивости карты в `tests/e2e/map-interactions.spec.ts`

### Реализация для User Story 1

- [X] T030 [P] [US1] Реализовать MapLibre контейнер, lifecycle и cleanup карты в `src/components/map/KurskMap.tsx`
- [X] T031 [P] [US1] Реализовать подготовку GeoJSON source для публичных мест и clustering-ready данных в `src/components/map/placeSource.ts`
- [X] T032 [US1] Добавить слои маркеров мест с изображениями и заметным visual priority в `src/components/map/placeLayers.ts`
- [X] T033 [US1] Реализовать hover tooltip с названием места для устройств с hover в `src/components/map/MarkerTooltip.tsx`
- [X] T034 [P] [US1] Реализовать маленький ненавязчивый логотип поверх карты в `src/components/map/MapLogo.tsx`
- [X] T035 [P] [US1] Реализовать loading/error/offline fallback карты без перекрытия основного UI в `src/components/map/MapFallback.tsx`
- [X] T036 [US1] Интегрировать загрузку публичных мест, MapLibre карту и выбор активного места в `src/app/App.tsx`
- [X] T037 [US1] Добавить responsive CSS для полноэкранной карты и overlay без наложений в `src/styles/index.css`
- [X] T038 [US1] Добавить событие `app_open` через analytics adapter без загрузки Метрики до consent в `src/app/App.tsx`
- [X] T039 [US1] Прогнать и зафиксировать исправления e2e сценариев US1 в `tests/e2e/map-first-screen.spec.ts` и `tests/e2e/map-interactions.spec.ts`

**Checkpoint**: US1 работает самостоятельно как MVP: карта открывается, места видны, интерфейс можно панорамировать и масштабировать.

---

## Phase 4: User Story 2 - Посмотреть подробности места (Priority: P1)

**Цель**: пользователь выбирает маркер и видит аккуратную карточку/панель места с фотографиями, описанием, адресом, ссылками, советом и маршрутами.

**Независимая проверка**: выбрать место с полными данными и место без optional полей; убедиться, что панель показывает доступные блоки, скрывает отсутствующие и на mobile открывается удобной touch-панелью.

### Тесты для User Story 2

- [X] T040 [P] [US2] Написать Playwright-тест открытия карточки полного места и route actions в `tests/e2e/place-details.spec.ts`
- [X] T041 [P] [US2] Написать Playwright-тест скрытия optional блоков для неполного места в `tests/e2e/place-details-optional.spec.ts`
- [X] T042 [P] [US2] Написать Playwright-тест mobile drawer анимации и touch-friendly layout в `tests/e2e/place-details-mobile.spec.ts`

### Реализация для User Story 2

- [X] T043 [P] [US2] Создать модель представления карточки места из `BalloonContent` в `src/domain/placeDetails.ts`
- [X] T044 [P] [US2] Реализовать фотокарусель для одной или нескольких фотографий в `src/components/place-details/PhotoCarousel.tsx`
- [X] T045 [P] [US2] Реализовать редакционный совет без пустых заглушек в `src/components/place-details/PlaceTip.tsx`
- [X] T046 [US2] Реализовать desktop side panel и mobile drawer с `prefers-reduced-motion` в `src/components/place-details/PlaceDetailsPanel.tsx`
- [X] T047 [P] [US2] Реализовать кнопки маршрутов Яндекс.Карты, 2ГИС и Google Maps с lucide icons в `src/components/place-details/RouteActions.tsx`
- [X] T048 [P] [US2] Реализовать список внешних ссылок и соцсетей без отправки произвольных URL в аналитику в `src/components/place-details/ExternalLinks.tsx`
- [X] T049 [US2] Подключить открытие/закрытие карточки к выбору маркера в `src/app/App.tsx`
- [X] T050 [US2] Отправлять `marker_selected`, `route_opened` и `external_link_clicked` через typed analytics adapter в `src/components/place-details/PlaceDetailsPanel.tsx`
- [X] T051 [US2] Добавить responsive стили панели, карусели и кнопок без наложений в `src/styles/index.css`
- [X] T052 [US2] Прогнать и зафиксировать исправления e2e сценариев US2 в `tests/e2e/place-details.spec.ts`, `tests/e2e/place-details-optional.spec.ts` и `tests/e2e/place-details-mobile.spec.ts`

**Checkpoint**: US2 работает независимо поверх карты: выбранное место можно оценить и открыть маршрут, optional поля не портят интерфейс.

---

## Phase 5: User Story 3 - Быстро найти подходящие места (Priority: P2)

**Цель**: пользователь ищет места текстом, пустое состояние понятно, сброс возвращает полный набор текущего представления.

**Независимая проверка**: найти места по названию, адресу, описанию и подписи ссылки; проверить пустое состояние и сброс поиска.

### Тесты для User Story 3

- [X] T053 [P] [US3] Написать unit-тесты нормализации запроса и поиска по значимым полям места в `tests/unit/search.test.ts`
- [X] T054 [P] [US3] Написать Playwright-тест поиска, пустого состояния и сброса в `tests/e2e/search-and-filters.spec.ts`

### Реализация для User Story 3

- [X] T055 [P] [US3] Реализовать нормализацию русского текста, индексацию полей и поиск без внешнего fuzzy engine в `src/domain/search.ts`
- [X] T056 [P] [US3] Реализовать search input с понятным reset action в `src/components/filters/SearchBox.tsx`
- [X] T057 [P] [US3] Реализовать компактную панель результатов и пустое состояние в `src/components/filters/ResultsSummary.tsx`
- [X] T058 [US3] Подключить search state к видимым маркерам и результатам в `src/app/App.tsx`
- [X] T059 [US3] Обновить MapLibre source при изменении видимого набора мест без пересоздания карты в `src/components/map/KurskMap.tsx`
- [X] T060 [US3] Отправлять `search_used` без сырого текста запроса в `src/components/filters/SearchBox.tsx`
- [X] T061 [US3] Добавить responsive стили toolbar, summary и empty state без перекрытия карты в `src/styles/index.css`
- [X] T062 [US3] Прогнать и зафиксировать исправления unit/e2e сценариев US3 в `tests/unit/search.test.ts` и `tests/e2e/search-and-filters.spec.ts`

**Checkpoint**: US3 работает самостоятельно: видимый набор мест управляется поиском, пустое состояние понятно, карта остаётся главным интерфейсом.

---

## Phase 6: User Story 4 - Открыть карту сообщества по ссылке (Priority: P3)

**Цель**: пользователь открывает `/maps/:slug` и видит отдельную карту сообщества с нужной идентичностью, public и link-only местами, а неизвестный slug получает полезный путь назад.

**Независимая проверка**: открыть известный community slug, проверить заголовок, контекст и набор мест; открыть неизвестный slug и вернуться на основную карту; выбрать место внутри community карты.

### Тесты для User Story 4

- [X] T063 [P] [US4] Написать unit-тесты выборки public и link-only мест для карты сообщества в `tests/unit/communityMaps.test.ts`
- [X] T064 [P] [US4] Написать Playwright-тест известной `/maps/:slug` route с отдельной идентичностью и набором мест в `tests/e2e/map-routes.spec.ts`
- [X] T065 [P] [US4] Написать Playwright-тест неизвестной `/maps/:slug` route и возврата на `/` в `tests/e2e/map-routes.spec.ts`

### Реализация для User Story 4

- [X] T066 [P] [US4] Реализовать резолвинг карты сообщества, link-only мест и fallback состояния в `src/domain/communityMaps.ts`
- [X] T067 [P] [US4] Реализовать визуальную идентичность community карты без обещания приватности в `src/components/map/CommunityMapHeader.tsx`
- [X] T068 [P] [US4] Реализовать fallback неизвестной карты сообщества с действием возврата на `/` в `src/components/map/CommunityMapFallback.tsx`
- [X] T069 [US4] Подключить route `/maps/:slug` к загрузке community maps и набору видимых мест в `src/app/router.tsx`
- [X] T070 [US4] Интегрировать community context с картой, поиском и карточкой места в `src/app/App.tsx`
- [X] T071 [US4] Отправлять `community_map_opened` после consent с `slug`, `placeCount` и `linkOnlyCount` в `src/app/App.tsx`
- [X] T072 [US4] Добавить стили заголовка community карты и fallback без наложения на карту в `src/styles/index.css`
- [X] T073 [US4] Прогнать и зафиксировать исправления unit/e2e сценариев US4 в `tests/unit/mapCatalog.test.ts` и `tests/e2e/map-routes.spec.ts`

**Checkpoint**: US4 работает независимо: прямые ссылки карт сообществ открывают нужный набор мест или корректный fallback.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Цель**: закрыть PWA, consent analytics, производительность, доступность и финальную проверку quickstart.

- [X] T074 [P] Реализовать consent banner/settings с хранением `kursk-map:analytics-consent:v1` в `src/components/analytics-consent/AnalyticsConsent.tsx`
- [X] T075 Интегрировать загрузку script Яндекс.Метрики только после accepted consent и `VITE_YANDEX_METRIKA_ID` в `src/services/analytics/yandexMetrika.ts`
- [X] T076 [P] Написать Playwright-тест privacy analytics до/после consent и без сырого поискового запроса в `tests/e2e/analytics-consent.spec.ts`
- [X] T077 Настроить manifest, icons, service worker cache rules и update notification в `vite.config.ts` и `src/services/pwa/registerServiceWorker.ts`
- [X] T078 [P] Написать Playwright-тест manifest, service worker, offline app shell и update UX в `tests/e2e/pwa.spec.ts`
- [X] T079 Проверить и оптимизировать сценарий 500 мест, обновление MapLibre source и поиск в `src/domain/search.ts` и `src/components/map/KurskMap.tsx`
- [X] T080 [P] Проверить keyboard/focus/ARIA для search, details panel, consent и route actions в `src/components/filters/`, `src/components/place-details/` и `src/components/analytics-consent/`
- [X] T081 [P] Проверить отсутствие наложений UI на mobile/desktop и исправить responsive стили в `src/styles/index.css`
- [X] T082 Выполнить команды `pnpm typecheck`, `pnpm test:unit`, `pnpm test:e2e` и `pnpm build`, сверяя результат с `specs/001-kursk-places-map/quickstart.md`

---

## Phase 8: Design Alignment & Visual QA

**Цель**: привести реализованный интерфейс к дизайн-системе «Куда в Курске» без добавления нового тестового покрытия.

- [X] T083 Привести Tailwind design tokens, монохромную палитру, тени, радиусы, типографику Inter и focus states к `DESIGN_SYSTEM.md` в `src/styles/index.css`
- [X] T084 Привести карту, overlays, public/community headers, search/status карточки, fallback состояния и логотип к модели небольших плавающих карточек поверх карты в `src/app/App.tsx`, `src/components/map/PublicMapHeader.tsx`, `src/components/map/CommunityMapHeader.tsx`, `src/components/map/CommunityMapFallback.tsx`, `src/components/map/MapLogo.tsx`, `src/components/filters/SearchBox.tsx` и `src/components/filters/ResultsSummary.tsx`
- [X] T085 Привести базовый style JSON карты, маркеры, hover/selected состояния и слои карты к монохромной системе с фотографиями как главным цветовым носителем в `public/map-styles/kursk-positron.json`, `src/components/map/placeLayers.ts`, `src/components/map/MarkerTooltip.tsx` и `src/components/map/markerImages.ts`
- [X] T086 Привести детальную панель, фотокарусель, route actions, внешние ссылки и совет к floating-card layout, сдержанной глубине и touch-friendly mobile поведению в `src/components/place-details/`
- [X] T087 Настроить функциональные анимации: Motion для React-панелей и overlay-состояний, MapLibre `easeTo`/paint transitions для перецентровки карты и появления/исчезновения маркеров, с учётом `prefers-reduced-motion` и без декоративной зацикленной анимации в `src/components/map/KurskMap.tsx` и `src/components/place-details/PlaceDetailsPanel.tsx`
- [X] T088 Обновить редакционный контент seed-мест под короткий разговорный тон и локальные советы без изменения схемы данных в `public/data/places.json`
- [X] T089 Провести ручную visual QA-проверку desktop/mobile по `DESIGN_SYSTEM.md`: первый экран, поиск, выбранный маркер, детальная панель, пустое состояние, `/maps/:slug` route и неизвестный fallback; зафиксировать результат в `specs/001-kursk-places-map/tasks.md`, поскольку дизайн-выравнивание проверяется существующими e2e и ручной визуальной проверкой без добавления нового тестового покрытия
  - Visual QA 2026-06-01: desktop 1440x900 и mobile 390x844 проверены через Playwright screenshots для первого экрана, пустого поиска, выбранного места и `/maps/dozapravka`; пересечения floating UI устранены, mobile drawer помещается в viewport, `/maps/:slug` route показывает 19 мест.
- [X] T090 Выполнить `pnpm typecheck`, `pnpm test:unit`, существующие `pnpm test:e2e` и `pnpm build`, сверяя отсутствие регрессий с `specs/001-kursk-places-map/quickstart.md`

---

## Phase 9: User Story 5 - Переход с основной карты на под-карты (Priority: P3)

**Цель**: связать основную карту с под-картами через места-входы, добавить отметку-портал и возврат на главную. Проверка — typecheck, build, существующие unit-тесты и ручная проверка через preview без нового тестового покрытия (FR-031, FR-032, FR-033, US5).

- [X] T091 [US5] Добавить в модель места поля `mapLink: { slug }` и `routable` в `src/domain/places.ts`; surface их во view-model (резолв названия через `findMapBySlug`) в `src/domain/placeDetails.ts`; добавить событие `submap_opened` в `src/domain/analyticsEvents.ts`
- [X] T092 [US5] В `src/components/place-details/PlaceDetailsPanel.tsx` добавить primary-действие «Открыть карту «<название>»» (проп `onOpenMap`) и скрытие route actions при `routable: false`
- [X] T093 [US5] Места-входы в под-карты используют обычные фотомаркеры (по решению пользователя отдельный «портальный» маркер не используется; ранее добавленный код портального маркера удалён из `placeLayers.ts`, `markerImages.ts`, `placeSource.ts`, `KurskMap.tsx`)
- [X] T094 [US5] Подключить навигацию в `src/app/App.tsx` (`useNavigate`, `submap_opened`) и действие «На главную карту» при `slug !== "main"` в `src/components/map/MapTopControls.tsx`
- [X] T095 [US5] Добавить в `public/data/main-map.json` отметку-портал «Дозаправка» (`routable: false`, соцсети VK/Instagram) и места «Комета», «Твоя полка» (МегаГРИНН, `mapLink: zapishu-zarisuyu`) с цепляющими описаниями и реальными локальными фото в `public/place-images/` и `public/place-thumbnails/`
- [X] T096 [US5] Добавить Storybook stories новых состояний карточки (`SubmapPortal`, `PlaceWithSubmapLink`) в `src/components/place-details/PlaceDetailsPanel.stories.tsx`; обновить счётчик `main` в `tests/unit/mapDataIntegrity.test.ts` (39→42)
- [X] T097 [US5] Выполнить `npm run typecheck`, `npm run build`, существующие `npm run test:unit` (без регрессий, кроме пре-существующих jsdom-падений `markerImages`) и ручную проверку сценариев через preview
- [X] T098 [US5] Дать каждой карте собственную идентичность: добавить поля `logo` и `description` в `mapCatalog` (`src/domain/mapCatalog.ts`), прокинуть их через `MapTopControls`/`App.tsx`; в `MapLogo` сделать логотип props-driven и встроить компактную иконку-стрелку «На главную карту» как ведущий элемент бренд-блока (вместо отдельной плавающей кнопки). Логотип «Дозаправка» — фото места-входа, «Запишу, зарисую» — `public/brand/zapishu-zarisuyu-logo.webp`. Проверка: typecheck + ручная проверка через preview (desktop/mobile, все карты, возврат)

---

## Phase 10: Соцсети мест

**Цель**: найти официальные VK, Telegram и Instagram для мест на всех картах каталога и хранить отображаемые внешние ссылки в `properties.links`.

- [X] T099 Выполнить интернет-аудит соцсетей для 82 записей из `public/data/main-map.json`, `public/data/dozapravka-objects.json` и `public/data/zapishu-zarisuyu-objects.json`; добавить только подтверждённые официальные VK/Telegram/Instagram, перенести прежние `balloonContent.socials` в `properties.links`, сохранить существующие `site` и `details` ссылки. Итог: обработано 82 записи, добавлено/сохранено 41 VK, 12 Telegram и 26 Instagram ссылок; устаревших `balloonContent.socials` осталось 0.
  - Не добавлены без уверенного подтверждения: соцсети архитектурных и исторических объектов карты «Запишу, зарисую» без самостоятельных официальных аккаунтов; редакционные Telegram-посты оставлены как `kind: "details"`; похожие или неподтверждённые аккаунты для «ССК Выстрел», «Комета», «Chef Alex Pizza» и ряда мест без явного совпадения названия/адреса/бренда не добавлялись.
  - По ручной проверке пользователя не используются адреса `https://vk.com/kuxmesterck_atilan`, `https://t.me/verst5`, `https://vk.ru/yahonty`, `https://t.me/yahontysales`, `https://www.instagram.com/yahonty.hotels/`; для «Мясное место» удалены ранее добавленные VK/Telegram.
  - По ручным правкам пользователя добавлены или уточнены соцсети для «Яхонты Красниково», «DonVillage», «КурскАрбуз», «Безымянный паб», «Ландизайн», «Дикий Кабан», «Шале у леса», «Пышки и не только», «Кухмистерская Atilan», «Молодёжный театр 3Д», «Песчаный», «Раздолье Русское», «Шик&Шале», `Forest House`, `Souffle BAR`, «Водяная мельница», «Глэмпинг НовоШемякино», «Горнолыжный склон»; Instagram «Серебряно» уже совпадал с указанным адресом.

- [X] T101 Добавить официальные ссылки в `properties.links` для мест «Ёлки-иголки», «Завтрак тебе», «Комета», «Кинотеатр Щепкина», «Костёл», «Улиточная ферма «Улиткампания»», «Усадьба Афанасия Фета», «Шале «River House»», «Лавандовый берег», «Рис и Тесто», «Рюмочная «Однушка»», «Тишина», «Шале у реки» и `Wakanda` в `public/data/main-map.json`, `public/data/dozapravka-objects.json` и `public/data/zapishu-zarisuyu-objects.json`. Проверка: JSON parse, `pnpm typecheck`, `pnpm build`; новое тестовое покрытие не добавлялось.

- [X] T102 Перед merge в `main` устранить регрессии существующих проверок: нормализовать `site` ссылку «Шале у реки» до корня сайта, вернуть для «Томато» исходный URL меню по ручному уточнению и убрать из integrity-теста запрет на path у `site` ссылок; сохранить тестовую подмену фабрики маркерных изображений для активного состояния в `src/components/map/markerImages.ts`. Проверка: `pnpm test:unit`, `pnpm build`.

- [X] T103 По ручному уточнению обновить описание «Кухмистерская Atilan» только на карте «Дозаправка», добавить две ссылки на Instagram-обзоры как текстовые `site` CTA и показывать `label` для обычных внешних ссылок в детальной карточке. Проверка: JSON parse, `pnpm typecheck`; новое тестовое покрытие не добавлялось.

## Phase 11: Точность данных мест

**Цель**: поддерживать координаты мест в актуальном состоянии по ручным уточнениям пользователя без изменения схемы данных.

- [X] T100 Уточнить координаты в `public/data/dozapravka-objects.json` для «Завтрак тебе», `NB cake`, «Безымянный паб» и «Рюмочная «Однушка»`; сохранить канонический порядок GeoJSON `[longitude, latitude]` и строку карточки `latitude, longitude`. Проверка: JSON parse + `npm run typecheck`.

## Phase 12: Публикация на GitHub Pages

**Цель**: настроить production deployment статического Vite/PWA приложения на GitHub Pages project pages `https://acherkashin.github.io/kuda-kursk/` без custom domain.

- [X] T102 Настроить `base: "/kuda-kursk/"` в `vite.config.ts`, сделать manifest, service worker fallback и runtime cache данных совместимыми с project pages; добавить helper `src/services/publicPath.ts` и применить его к локальным public-путям данных, карты, изображений, логотипов и `/sw.js`.
- [X] T103 Добавить workflow `.github/workflows/deploy-pages.yml` для деплоя `dist` через GitHub Actions (`pnpm install --frozen-lockfile`, `pnpm build`, `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`) при push в ветку `main`.
- [X] T104 Обновить контракт PWA и план фичи под base-aware GitHub Pages deployment; выпускать `dist/404.html` как копию `dist/index.html` для прямых SPA-ссылок на GitHub Pages. Проверка: `pnpm typecheck`, `pnpm build`, локальная проверка production preview путей `/kuda-kursk/`, `/kuda-kursk/maps/main`, `/kuda-kursk/maps/dozapravka` и неизвестного slug; новое тестовое покрытие не добавлялось.

---

## Phase 13: Редакторский навык описаний мест

**Цель**: добавить локальный skill, который помогает готовить цепкие, безопасные и нетоксичные описания мест по черновику или транскрипту, а после подтверждения пользователя обновляет описание в данных карты.

- [X] T105 Создать локальный skill `place-description-writer` в `.agents/skills/place-description-writer/SKILL.md` с правилами редакционного тона, безопасной формулировки, запретом неподтверждённых фактов и обязательным подтверждением перед правкой данных.
- [X] T106 Добавить helper-скрипт `.agents/skills/place-description-writer/scripts/update-place-description.mjs`, который ищет место по всем `public/data/*.json`, защищается от неоднозначных совпадений и обновляет только `properties.balloonContent.description`.

## Phase 14: Редакторское обновление «Дозаправки»

**Цель**: синхронизировать текст места-портала и идентичность под-карты «Дозаправка», сохранив читаемость бренд-блока на desktop/mobile.

- [X] T107 Обновить описание места-портала «Дозаправка» (`id: 9001`) в `public/data/main-map.json` на полный пользовательский текст, описание карты `dozapravka` в `src/domain/mapCatalog.ts` — на сокращённую версию, а в `src/components/map/MapLogo.tsx` разрешить перенос подзаголовка без однострочного обрезания. Проверка: JSON parse, `pnpm typecheck`, `pnpm build`, ручная visual QA `/maps/dozapravka` на desktop/mobile и карточки места-портала на основной карте; новое тестовое покрытие не добавлялось.
- [X] T108 По ручному visual QA расширить desktop-бренд-блок под-карты и выровнять его высоту с поиском в `src/components/map/MapLogo.tsx`. Проверка: `pnpm typecheck`, ручная visual QA `/maps/dozapravka` на desktop.
- [X] T109 По ручному решению убрать из unit-теста `mapCatalog` проверки конкретных названий и описаний карт; оставить проверку поведения поиска по нормализованному `slug`, чтобы редакционный текст не блокировал релиз. Проверка: `pnpm test:unit`, `pnpm build`.
- [X] T110 По ручному уточнению обновить координаты места-портала «Дозаправка» (`id: 9001`) в `public/data/main-map.json` на `51.741522, 36.202537`, сохранив порядок GeoJSON `[longitude, latitude]`. Проверка: JSON parse, `pnpm typecheck`; новое тестовое покрытие не добавлялось.

---

## Зависимости и порядок выполнения

### Зависимости фаз

- **Setup (Phase 1)**: без зависимостей, можно начинать сразу.
- **Foundational (Phase 2)**: зависит от завершения Setup и блокирует все пользовательские истории.
- **User Stories (Phase 3+)**: зависят от Foundational; после этого могут выполняться параллельно разными исполнителями.
- **Polish (Phase 7)**: зависит от завершения выбранного набора пользовательских историй; analytics/PWA проверки лучше закрывать перед релизом.
- **Design Alignment & Visual QA (Phase 8)**: зависит от завершения Phase 7 и выполняется перед релизной готовностью, чтобы уже собранный интерфейс привести к `DESIGN_SYSTEM.md` без изменения продуктового объёма.

### Зависимости пользовательских историй

- **US1 (P1)**: стартует после Foundational; не зависит от других историй.
- **US2 (P1)**: стартует после Foundational; использует выбор места из US1, но панель и route actions проверяются независимо на mock/seed данных.
- **US3 (P2)**: стартует после Foundational; может разрабатываться параллельно с US1/US2, если интеграция в `src/app/App.tsx` координируется отдельно.
- **US4 (P3)**: стартует после Foundational; переиспользует карту и карточку, но резолвинг данных community карты проверяется отдельно.

### Внутри каждой истории

- Новые или изменённые тесты истории добавляются только после отдельного явного запроса или разрешения пользователя.
- Типы и чистая доменная логика выполняются до UI.
- UI компоненты выполняются до интеграции в `src/app/App.tsx`.
- История считается готовой после согласованных проверок: существующих unit/e2e команд, ручного сценария, visual QA или другого явно выбранного способа проверки.

---

## Параллельные примеры

### User Story 1

```bash
Task: "T028 [P] [US1] Написать Playwright-тест первого экрана desktop/mobile с картой, логотипом и маркерами в tests/e2e/map-first-screen.spec.ts"
Task: "T029 [P] [US1] Написать Playwright-тест hover названия маркера и pan/zoom устойчивости карты в tests/e2e/map-interactions.spec.ts"
Task: "T030 [P] [US1] Реализовать MapLibre контейнер, lifecycle и cleanup карты в src/components/map/KurskMap.tsx"
Task: "T031 [P] [US1] Реализовать подготовку GeoJSON source для публичных мест и clustering-ready данных в src/components/map/placeSource.ts"
Task: "T034 [P] [US1] Реализовать маленький ненавязчивый логотип поверх карты в src/components/map/MapLogo.tsx"
```

### User Story 2

```bash
Task: "T040 [P] [US2] Написать Playwright-тест открытия карточки полного места и route actions в tests/e2e/place-details.spec.ts"
Task: "T041 [P] [US2] Написать Playwright-тест скрытия optional блоков для неполного места в tests/e2e/place-details-optional.spec.ts"
Task: "T044 [P] [US2] Реализовать фотокарусель для одной или нескольких фотографий в src/components/place-details/PhotoCarousel.tsx"
Task: "T047 [P] [US2] Реализовать кнопки маршрутов Яндекс.Карты, 2ГИС и Google Maps с lucide icons в src/components/place-details/RouteActions.tsx"
Task: "T048 [P] [US2] Реализовать список внешних ссылок и соцсетей без отправки произвольных URL в аналитику в src/components/place-details/ExternalLinks.tsx"
```

### User Story 3

```bash
Task: "T053 [P] [US3] Написать unit-тесты нормализации запроса и поиска по значимым полям места в tests/unit/search.test.ts"
Task: "T054 [P] [US3] Написать Playwright-тест поиска, пустого состояния и сброса в tests/e2e/search-and-filters.spec.ts"
Task: "T055 [P] [US3] Реализовать нормализацию русского текста, индексацию полей и поиск без внешнего fuzzy engine в src/domain/search.ts"
Task: "T056 [P] [US3] Реализовать search input с понятным reset action в src/components/filters/SearchBox.tsx"
Task: "T057 [P] [US3] Реализовать компактную панель результатов и пустое состояние в src/components/filters/ResultsSummary.tsx"
```

### User Story 4

```bash
Task: "T063 [P] [US4] Написать unit-тесты выборки public и link-only мест для карты сообщества в tests/unit/communityMaps.test.ts"
Task: "T064 [P] [US4] Написать Playwright-тест известной /maps/:slug route с отдельной идентичностью и набором мест в tests/e2e/map-routes.spec.ts"
Task: "T066 [P] [US4] Реализовать резолвинг карты сообщества, link-only мест и fallback состояния в src/domain/communityMaps.ts"
Task: "T067 [P] [US4] Реализовать визуальную идентичность community карты без обещания приватности в src/components/map/CommunityMapHeader.tsx"
Task: "T068 [P] [US4] Реализовать fallback неизвестной карты сообщества с действием возврата на / в src/components/map/CommunityMapFallback.tsx"
```

---

## Стратегия реализации

### MVP First (только User Story 1)

1. Завершить Phase 1: Setup.
2. Завершить Phase 2: Foundational.
3. Завершить Phase 3: User Story 1.
4. Остановиться и проверить US1 независимо по desktop/mobile сценарию.
5. Использовать US1 как технический MVP, затем сразу добавить US2 для продуктовой ценности выбора места.

### Инкрементальная поставка

1. Setup + Foundational → проект запускается и умеет читать валидные данные.
2. US1 → карта и маркеры как технический MVP.
3. US2 → карточка места и маршруты как практичный городской гид.
4. US3 → поиск для масштабирования до большого набора мест.
5. US4 → карты сообществ по прямым ссылкам.
6. Polish → PWA, consent analytics, производительность, доступность и технический финальный build.
7. Design Alignment & Visual QA → привести готовый интерфейс к `DESIGN_SYSTEM.md`, проверить desktop/mobile состояния и затем выполнить финальные проверки.

### Параллельная работа

1. Команда вместе закрывает Setup и Foundational.
2. После Foundational можно разделить работу: один исполнитель US1/MapLibre, второй US2/place-details, третий US3/search, четвёртый US4 `/maps/:slug` routes.
3. Интеграционные изменения в `src/app/App.tsx` выполнять последовательно или с короткой синхронизацией, потому что несколько историй меняют этот файл.

---

## Примечания

- Все Markdown-файлы проекта вне `.specify/` и `.agents/skills/` ведутся на русском языке.
- [P] задачи размечены только там, где файлы различаются и нет прямой зависимости от незавершённой задачи.
- Link-only места в community карте не являются приватными и не должны описываться как закрытый доступ.
- Сырые поисковые запросы, персональные данные и произвольные URL не передаются в аналитику.
- Координаты импортированных мест всегда трактуются как `[longitude, latitude]`.
