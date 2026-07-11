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
- [X] T024 [P] Создать заменяемый конфиг MapLibre и центра Курска в `src/domain/mapConfig.ts`
- [X] T025 [P] Подготовить приглушённый style JSON карты с CARTO Positron raster-подложкой и нужным географическим контекстом в `public/map-styles/kursk-positron.json`
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
- [X] T031 [P] [US1] Реализовать подготовку GeoJSON source для публичных мест и runtime layout properties маркеров в `src/components/map/placeSource.ts`
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
- [X] T044 [P] [US2] Реализовать первоначальный просмотр одной или нескольких фотографий в компоненте карточки места; дальнейшая замена на единый фотоблок зафиксирована в T186.
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
- [X] T086 Привести детальную панель, просмотр фотографий, route actions, внешние ссылки и совет к floating-card layout, сдержанной глубине и touch-friendly mobile поведению в `src/components/place-details/`
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
- [X] T095 [US5] Добавить в `public/data/main-map.json` отметку-портал «Дозаправка» (`routable: false`, соцсети VK/Instagram) и места «Комета», «Твоя полка» (МегаГРИНН, `mapLink: illustrator-liza-silakova`) с цепляющими описаниями и реальными локальными фото в `public/place-images/` и `public/place-thumbnails/`
- [X] T096 [US5] Добавить Storybook stories новых состояний карточки (`SubmapPortal`, `PlaceWithSubmapLink`) в `src/components/place-details/PlaceDetailsPanel.stories.tsx`; обновить счётчик `main` в `tests/unit/mapDataIntegrity.test.ts` (39→42)
- [X] T097 [US5] Выполнить `npm run typecheck`, `npm run build`, существующие `npm run test:unit` (без регрессий, кроме пре-существующих jsdom-падений `markerImages`) и ручную проверку сценариев через preview
- [X] T098 [US5] Дать каждой карте собственную идентичность: добавить поля `logo` и `description` в `mapCatalog` (`src/domain/mapCatalog.ts`), прокинуть их через `MapTopControls`/`App.tsx`; в `MapLogo` сделать логотип props-driven и встроить компактную иконку-стрелку «На главную карту» как ведущий элемент бренд-блока (вместо отдельной плавающей кнопки). Логотип «Дозаправка» — фото места-входа, «Иллюстратор Лиза Силакова» — `public/brand/illustrator-liza-silakova-logo.webp`. Проверка: typecheck + ручная проверка через preview (desktop/mobile, все карты, возврат)

---

## Phase 10: Соцсети мест

**Цель**: найти официальные VK, Telegram и Instagram для мест на всех картах каталога и хранить отображаемые внешние ссылки в `properties.links`.

- [X] T099 Выполнить интернет-аудит соцсетей для 82 записей из `public/data/main-map.json`, `public/data/dozapravka-objects.json` и `public/data/illustrator-liza-silakova-objects.json`; добавить только подтверждённые официальные VK/Telegram/Instagram, перенести прежние `balloonContent.socials` в `properties.links`, сохранить существующие `site` и `details` ссылки. Итог: обработано 82 записи, добавлено/сохранено 41 VK, 12 Telegram и 26 Instagram ссылок; устаревших `balloonContent.socials` осталось 0.
  - Не добавлены без уверенного подтверждения: соцсети архитектурных и исторических объектов карты «Иллюстратор Лиза Силакова» без самостоятельных официальных аккаунтов; редакционные Telegram-посты оставлены как `kind: "details"`; похожие или неподтверждённые аккаунты для «ССК Выстрел», «Комета», «Chef Alex Pizza» и ряда мест без явного совпадения названия/адреса/бренда не добавлялись.
  - По ручной проверке пользователя не используются адреса `https://vk.com/kuxmesterck_atilan`, `https://t.me/verst5`, `https://vk.ru/yahonty`, `https://t.me/yahontysales`, `https://www.instagram.com/yahonty.hotels/`; для «Мясное место» удалены ранее добавленные VK/Telegram.
  - По ручным правкам пользователя добавлены или уточнены соцсети для «Яхонты Красниково», «DonVillage», «КурскАрбуз», «Безымянный паб», «Ландизайн», «Дикий Кабан», «Шале у леса», «Пышки и не только», «Кухмистерская Atilan», «Молодёжный театр 3Д», «Песчаный», «Раздолье Русское», «Шик&Шале», `Forest House`, `Souffle BAR`, «Водяная мельница», «Глэмпинг НовоШемякино», «Горнолыжный склон»; Instagram «Серебряно» уже совпадал с указанным адресом.

- [X] T101 Добавить официальные ссылки в `properties.links` для мест «Ёлки-иголки», «Завтрак тебе», «Комета», «Кинотеатр Щепкина», «Костёл», «Улиточная ферма «Улиткампания»», «Усадьба Афанасия Фета», «Шале «River House»», «Лавандовый берег», «Рис и Тесто», «Рюмочная «Однушка»», «Тишина», «Шале у реки» и `Wakanda` в `public/data/main-map.json`, `public/data/dozapravka-objects.json` и `public/data/illustrator-liza-silakova-objects.json`. Проверка: JSON parse, `pnpm typecheck`, `pnpm build`; новое тестовое покрытие не добавлялось.

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
- [X] T127 По утверждённому пользователем тексту обновить описание места «Высота» (`id: 2018`) в `public/data/dozapravka-objects.json` на карте «Дозаправка». Проверка: JSON parse, `pnpm typecheck`; новое тестовое покрытие не добавлялось.

---

## Phase 15: Диалог «О проекте» и управление аналитикой

**Цель**: добавить понятный вход в информацию о проекте, ссылки на канал и обратную связь, а управление аналитикой перенести из непонятной нижней кнопки в этот диалог.

- [X] T110 Создать доменный источник публичной информации о проекте в `src/domain/projectInfo.ts`: логотип, описание, placeholder-ссылки Telegram и формы обратной связи.
- [X] T111 Реализовать `AboutProjectDialog` в `src/components/about-project/AboutProjectDialog.tsx` с desktop modal и mobile bottom sheet, ссылками, закрытием по backdrop/Escape и секцией analytics consent.
- [X] T112 Убрать отображение отдельной плавающей кнопки настроек аналитики после выбора consent в `src/components/analytics-consent/AnalyticsConsent.tsx`; первичную плашку до выбора сохранить.
- [X] T113 Добавить кнопку «О проекте» в верхний бренд-блок через `src/components/map/MapTopControls.tsx` и `src/components/map/MapLogo.tsx`, сохранив мобильный поиск и возврат с под-карт.
- [X] T114 Подключить состояние диалога и смену analytics consent в `src/app/App.tsx`; подавлять первичную consent-плашку, когда открыт диалог.
- [X] T115 Добавить Storybook stories состояний диалога в `src/components/about-project/AboutProjectDialog.stories.tsx` без нового автотестового покрытия.
- [X] T116 Выполнить `pnpm typecheck`, `pnpm build` и ручную visual QA desktop/mobile; новое автоматизированное тестовое покрытие не добавлять без отдельного разрешения пользователя.
  - Visual QA 2026-06-10: desktop 1440x900 и mobile 390x844 проверены через Playwright на Vite dev server с заблокированными service workers. Диалог открывается по кнопке «О проекте», показывает логотип, описание, Telegram, обратную связь и секцию аналитики; consent-плашка не перекрывает диалог; горизонтального overflow нет. Дополнительно выполнен `pnpm build-storybook`.
- [X] T122 Сделать первичный отказ от аналитики двухшаговым в `src/components/analytics-consent/AnalyticsConsent.tsx`: первый клик «Отклонить» показывает объяснение важности обезличенной аналитики для молодого сервиса, а `rejected` сохраняется только после второго явного отказа. Оба состояния плашки используют один layout, один стиль текста и горизонтальный ряд; «Принять аналитику» остаётся оранжевой accent-кнопкой, на первом экране находится справа, а после первого отказа переезжает на прежнее место «Отклонить». Новое автоматизированное тестовое покрытие не добавлялось. Проверка: `pnpm typecheck`, `pnpm build`, ручная visual QA desktop/mobile.
- [X] T125 Обновить microcopy второго шага отказа от аналитики в `src/components/analytics-consent/AnalyticsConsent.tsx`, чтобы текст прямо говорил, что включённая аналитика мотивирует команду и помогает выбирать сценарии развития. Новое автоматизированное тестовое покрытие не добавлялось. Проверка: `pnpm typecheck`, ручная проверка consent-плашки.
- [X] T126 Исправить мобильный auto-zoom при фокусе поиска в `src/components/filters/SearchBox.tsx`: у самого `input` задан явный `16px` размер текста, чтобы iOS Safari не приближал страницу, при этом `viewport` не ограничивает пользовательский pinch-zoom. Новое автоматизированное тестовое покрытие не добавлялось. Проверка: `pnpm typecheck`, `pnpm build`, ручная mobile visual QA поиска.
  - Mobile QA 2026-06-15: Playwright mobile viewport 390x844 на Vite dev server `http://127.0.0.1:5175/kuda-kursk/`; после открытия и фокуса поиска `visualViewport.scale = 1`, `visualViewport.width = 390`, горизонтального overflow нет, active element — `searchbox`, computed font-size поля — `16px`; скриншот состояния проверен визуально.

- [X] T110 По ручному уточнению обновить координаты места-портала «Дозаправка» (`id: 9001`) в `public/data/main-map.json` на `51.741522, 36.202537`, сохранив порядок GeoJSON `[longitude, latitude]`. Проверка: JSON parse, `pnpm typecheck`; новое тестовое покрытие не добавлялось.
- [X] T111 Исправить production service worker: убрать ссылку на замкнутую переменную `githubPagesBase` из Workbox `runtimeCaching.urlPattern`, чтобы `sw.js` не падал с `ReferenceError` на GitHub Pages. Проверка: `pnpm build`, инспекция `dist/sw.js`; новое тестовое покрытие не добавлялось.
- [X] T112 Исправить race MapLibre source при повторных SPA-переходах между основной картой и под-картами: обновлять существующий `places` source сразу, снимать устаревшие `load` handlers, очищать MapLibre feature-state и сбрасывать marker interaction state при замене набора мест. По явному разрешению пользователя добавлена сокращённая e2e-регрессия повторных переходов `main ↔ dozapravka`; также актуализированы e2e-ожидания количества мест основной карты до 42, base-aware route URL через общий helper в route/place-details проверках и текущие reset/логотип/link-контракты в изменённых e2e. Проверка: RED `pnpm exec playwright test tests/e2e/map-routes.spec.ts --project=desktop --grep "повторные переходы"` падал с `Expected: 19, Received: 0`; после исправления прошли `pnpm typecheck`, `pnpm exec playwright test tests/e2e/map-routes.spec.ts tests/e2e/map-first-screen.spec.ts tests/e2e/search.spec.ts --project=desktop` и `pnpm build`.

## Phase 15: Стабильная загрузка фотографий карточки

**Цель**: убрать заметный layout shift в панели подробностей места на медленном интернете без изменения данных мест.

- [X] T113 Зафиксировать высоту hero-фото карточки места в `src/components/place-details/PlaceDetailsPanel.tsx`: `300px` на desktop и `40dvh` на mobile, оставить `fetchPriority="high"` и заранее резервировать hero-зону. JSON мест, тип `Photo`, генерация размеров изображений и новое тестовое покрытие не добавлялись. Проверка: `pnpm typecheck`, `pnpm build`, ручная visual QA desktop/mobile при throttling сети для места с фото, места без фото и места с высоким/портретным фото. Режим масштабирования изображения позже пересмотрен в T120, чтобы кадр был виден целиком.

## Phase 16: Поддерживаемость e2e-проверок

**Цель**: убрать дубли test helpers из e2e specs и зафиксировать единый base-aware стиль навигации.

- [X] T114 Вынести e2e helpers для base-aware путей, MapLibre browser internals и mock geolocation/window.open в `tests/e2e/support/`; заменить прямые `page.goto("/")`, manifest request без base path и локальные `page.evaluate` helpers в route/map/place-details specs на support helpers. Unit-тесты и новое тестовое покрытие не добавлялись. Проверка: `pnpm typecheck`, focused Playwright smoke по затронутым e2e specs.

## Phase 17: Обратная связь в карточке места

**Цель**: дать пользователю тихий способ сообщить о проблеме с местом из карточки, используя общую форму обратной связи проекта.

- [X] T117 Добавить в `src/components/place-details/PlaceDetailsPanel.tsx` нижнее muted-действие обратной связи с маленькой иконкой и ссылкой `projectInfo.feedbackUrl`.
- [X] T118 Не добавлять новую ссылку в данные мест и не добавлять новое analytics event; использовать уже существующий источник `src/domain/projectInfo.ts`.
- [X] T119 Выполнить `pnpm typecheck`, `pnpm build`, `pnpm build-storybook` и ручную visual QA desktop/mobile; новое автоматизированное тестовое покрытие не добавлять без отдельного разрешения пользователя.
  - Visual QA 2026-06-10: desktop 1440x900 и mobile 390x844 проверены через Playwright на Vite dev server с заблокированными service workers. Карточка места прокручена к нижней части; действие «Нашли ошибку?» ведёт на `projectInfo.feedbackUrl`, не создаёт horizontal overflow и визуально не конкурирует с маршрутом, соцсетями и закрытием карточки.
- [X] T120 Исправить регрессию hero-фото в правой панели для широких кадров вроде места «Дозаправка» (`id: 9001`): временно заменить отображение основного фото на `object-contain` внутри зарезервированной hero-зоны `300px`/`40dvh`, чтобы кадр был виден целиком без возвращения layout shift. Проверка: `pnpm typecheck`, `pnpm build`, ручная visual QA `/kuda-kursk/maps/main?place=9001` на desktop/mobile и контроль высокого/портретного фото; новое тестовое покрытие не добавлялось. Позже пересмотрено в T121 из-за пустых полей вокруг многих фотографий.
- [X] T121 Вернуть динамическую высоту загруженного hero-фото в `PlaceDetailsPanel`: резервировать `300px`/`40dvh` только до `onLoad`, а после загрузки показывать изображение как `w-full h-auto` с ограничением максимальной высоты, чтобы не было пустых полей по бокам и сверху/снизу. Проверка: `pnpm typecheck`, `pnpm build`, ручная visual QA `/kuda-kursk/maps/main?place=1247`, `/kuda-kursk/maps/main?place=1465` и `/kuda-kursk/maps/main?place=9001` на desktop/mobile; новое тестовое покрытие не добавлялось.
- [X] T123 Заменить placeholder формы на Яндекс Форму `https://forms.yandex.ru/u/6a2f8b0ceb61469c8e25393e` и добавить `src/domain/feedbackLinks.ts` для предзаполненных ссылок: `source` и `page_url` для общего фидбека, `source`, `place_id`, `place_name` и `page_url` для карточки места; адрес и координаты не передаются, потому что этих скрытых полей нет в форме. Проверка: `pnpm typecheck`, `pnpm build`, ручная проверка структуры URL; новое тестовое покрытие не добавлялось.
- [X] T124 Добавить предзаполнение темы «Ошибка в месте» для ссылки «Нашли ошибку?» через параметр `topic=9008980755561960`, где `topic` — идентификатор вопроса Яндекс Формы, а `9008980755561960` — идентификатор варианта ответа. Проверка: `pnpm typecheck`, `pnpm build`, ручная проверка структуры URL; новое тестовое покрытие не добавлялось.
- [X] T176 Заменить placeholder Telegram-канала проекта в `src/domain/projectInfo.ts` на реальный канал `https://t.me/kudakursk`, чтобы кнопка Telegram в диалоге «О проекте» вела на публичный канал. Проверка: `pnpm typecheck`, `pnpm build`; новое тестовое покрытие не добавлялось.
- [X] T177 Временно скрыть места «ССК «Выстрел»» (`id: 2002`) и «Банный комплекс Riviera Wellness Resort» (`id: 2007`) через `visibility.public: false` в `public/data/main-map.json`; заменить `isPublicPlace` на единый `isVisiblePlace`/`filterVisiblePlaces` в `src/domain/places.ts` и применять фильтр в `src/data/loadPlaces.ts`, чтобы скрытые места любой карты не участвовали в UI и поиске. Проверка: `jq empty public/data/main-map.json`, `pnpm test:unit -- tests/unit/places.test.ts tests/unit/loadPlaces.test.ts tests/unit/mapDataIntegrity.test.ts tests/unit/search.test.ts`, `pnpm typecheck`, `pnpm build`; новое unit-покрытие добавлено по явному запросу пользователя.
- [X] T178 Дополнительно временно скрыть места «Картинг» (`id: 2001`) и `Iguana Lounge` (`id: 2005`) через тот же `visibility.public: false` в `public/data/main-map.json`, без удаления записей и без дублирования логики фильтрации. Проверка: `jq empty public/data/main-map.json`, `pnpm test:unit -- tests/unit/mapDataIntegrity.test.ts`.

## Phase 18: Custom domain GitHub Pages

**Цель**: перевести production deployment с project pages path на custom domain `https://kudakursk.ru/` без отдельной ветки.

- [X] T125 Настроить GitHub Pages custom domain репозитория `acherkashin/kuda-kursk` на `kudakursk.ru` через GitHub API, заменить production `base`, PWA `start_url`/`scope`, service worker fallback и runtime cache данных на корневой `/`, а e2e base helper — на дефолтный `/`. DNS-зона Selectel авторитативно отдаёт четыре GitHub Pages A-записи для apex-домена и CNAME `www` на `acherkashin.github.io`, но публичные резолверы ещё ожидают распространения делегирования; HTTPS enforcement в GitHub Pages оставлен выключенным до готовности DNS и сертификата. Проверка: `pnpm typecheck`, `pnpm build`, focused Playwright smoke `tests/e2e/pwa.spec.ts` и `tests/e2e/map-routes.spec.ts` на desktop с временным dev server `http://127.0.0.1:5174`; новое тестовое покрытие не добавлялось.

## Phase 19: Карта «Елена Колтышева»

**Цель**: добавить отдельную под-карту с подборкой Елены Колтышевой, локальными фотографиями из `/Users/cherkalexander/Downloads/Карта` и проверенными координатами без новой ветки.

- [X] T127 Создать `public/data/elena-koltysheva-objects.json` на 15 мест с GeoJSON-координатами `[longitude, latitude]`, короткими описаниями, локальными ссылками на фото/миниатюры и без ссылок на `gokursk.ru`. Для байдарок использовать место сбора у филармонии (`ул. Перекальского, 1`), для квадроциклов — координаты пользователя `51.694811, 35.960125`, для сапов — Боеву дачу.
- [X] T128 Подготовить web-safe ассеты: сконвертировать исходные JPG/WEBP/HEIC из Downloads в `public/place-images/elena-koltysheva/` и `public/place-thumbnails/elena-koltysheva/`, сохранив по одному основному изображению и миниатюре на место.
- [X] T129 Добавить карту в `src/domain/mapCatalog.ts` со slug `elena-koltysheva`, названием «Елена Колтышева», описанием подборки, логотипом из миниатюры «Белого квадрата» и `dataPath` новой карты.
- [X] T130 По разрешению пользователя обновить существующий `tests/unit/mapDataIntegrity.test.ts`: убрать хрупкое ожидание точных счётчиков карт и оставить проверку валидности всех карт из `mapCatalog` и существования локальных ассетов; новое автоматизированное покрытие не добавлять.
- [X] T131 Выполнить `pnpm typecheck`, `pnpm build`, `pnpm test:unit` и ручную проверку `/maps/elena-koltysheva` на desktop/mobile. Проверка пройдена: 15 мест и маркеров видны, поиск находит «Байдарки» и «Сапы», карточки открываются, фото грузятся, кнопки маршрутов доступны, console errors и failed requests не обнаружены.
- [X] T132 Добавить проверенные официальные `vk`, `instagram`, `telegram` и `site` ссылки для 15 мест карты Елены Колтышевой в `public/data/elena-koltysheva-objects.json`; удалить справочные `details`/`orgs.biz` ссылки и оставить «Сапы на Боевой даче» без ссылок, потому что официальный ресурс не подтверждён. Проверка: JSON parse, `pnpm typecheck`, `pnpm build`; новое тестовое покрытие не добавлялось.

---

## Phase 20: Размер верхних плашек

**Цель**: закрепить одинаковую высоту бренд-плашки и поиска на desktop/mobile без отдельной ветки и без нового автоматизированного покрытия.

- [X] T133 Исправить верхний overlay в `src/components/map/MapLogo.tsx`, `src/components/map/MapTopControls.tsx`, `src/components/filters/SearchBox.tsx` и `src/styles/index.css`: бренд-плашка и поиск сохраняют высоту desktop-поиска `48px`, подпись карты показывается в одну строку с обрезкой при нехватке ширины, desktop-бренд-блок расширен для длинных названий карт, а при открытой detail-панели overlay ограничен свободной областью карты. Проверка: `pnpm typecheck`, `pnpm build`, ручная visual QA через dev server `http://127.0.0.1:5174/` на desktop 1440x900 (`/maps/elena-koltysheva`, `/maps/dozapravka`, `/maps/main`, `/maps/main?place=9001`) и mobile 390x844 (`/maps/elena-koltysheva` brand/search); высота бренд-плашки и поиска — `48px`, horizontal overflow нет, top overlay не пересекается с detail-панелью.
- [X] T134 Уточнить desktop-ширину бренд-плашки в `src/components/map/MapTopControls.tsx` и `src/components/map/MapLogo.tsx`: вернуть компактную базу `340px`, разрешить рост до `470px` только по контенту, оставить поиск стабильной desktop-ширины и сохранить сжатие overlay при открытой detail-панели. Проверка: `pnpm typecheck`, `pnpm build`, ручная visual QA через dev server на desktop 1440x900 (`/maps/main`, `/maps/dozapravka`, `/maps/elena-koltysheva`), desktop 1440x900 и 1024x768 (`/maps/main?place=9001`) и mobile 390x844 (`/maps/elena-koltysheva` brand/search); main не получает широкую бренд-плашку без нужды, длинные подписи доращивают плашку до max и затем обрезаются, высота бренд-плашки и поиска — `48px`, horizontal overflow нет.
- [X] T135 Исправить обрезание поиска на промежуточных desktop/tablet-ширинах в `src/components/map/MapTopControls.tsx`: верхний desktop-row занимает доступную ширину overlay, а поиск сжимается внутри строки вместо фиксированного выхода за viewport. Проверка: `pnpm typecheck`, `pnpm build`, ручная visual QA через dev server на `/maps/main` при ширинах 700, 702, 768, 806, 840 и 900px, а также `/maps/dozapravka` при 768px; search box и reset-action помещаются, horizontal overflow нет. Новое автоматизированное покрытие не добавлялось.

---

## Phase 21: Портал карты Елены Колтышевой

**Цель**: добавить на основную карту представительную точку-портал к карте Елены Колтышевой и использовать новое портретное фото как идентичность портала и под-карты без нового автоматизированного покрытия.

- [X] T136 Добавить web-safe ассеты портала из `/Users/cherkalexander/Downloads/Telegram Desktop/photo_2026-06-17_08-57-38.jpg`: `public/place-images/elena-koltysheva/portal.webp` и квадратную миниатюру `public/place-thumbnails/elena-koltysheva/portal.webp`.
- [X] T137 Добавить в `public/data/main-map.json` портал `id: 9004` с `mapLink.slug: "elena-koltysheva"`, `routable: false`, координатами `[36.192, 51.73]` у Первомайского парка и новым фото; в `src/domain/mapCatalog.ts` заменить логотип карты `elena-koltysheva` на миниатюру портала.
- [X] T138 По разрешению пользователя убрать из существующих e2e хрупкую привязку основной карты к точному числу мест `42`, сохранив проверку загрузки карты, наличия маркеров и точные счётчики под-карт. Проверка: JSON parse, `pnpm typecheck`, `pnpm build`, `pnpm exec playwright test tests/e2e/map-first-screen.spec.ts tests/e2e/map-routes.spec.ts tests/e2e/search.spec.ts --project=desktop`, ручная visual QA `/maps/main`, `/maps/main?place=9004`, `/maps/elena-koltysheva` на desktop/mobile.

---

## Phase 22: Миграция карты Лизы Силаковой

**Цель**: заменить публичную идентичность карты «Запишу, зарисую» на «Иллюстратор Лиза Силакова» и перевести маршрут, данные и ассеты на slug `illustrator-liza-silakova`.

- [X] T139 Переименовать карту в `src/domain/mapCatalog.ts`, `public/data/main-map.json`, Storybook-моках и существующих unit/e2e проверках: новый маршрут `/maps/illustrator-liza-silakova`, новый title «Иллюстратор Лиза Силакова», новые файлы `public/data/illustrator-liza-silakova-objects.json` и `public/brand/illustrator-liza-silakova-logo.webp`; старый `/maps/zapishu-zarisuyu` проверять как неизвестную карту без редиректа. Проверка: JSON parse, `pnpm typecheck`, `pnpm build`, `pnpm test:unit`, релевантные e2e `tests/e2e/map-routes.spec.ts` и `tests/e2e/place-details.spec.ts`, ручная visual QA desktop/mobile нового маршрута и fallback старого маршрута; новое тестовое покрытие не добавлялось.

---

## Phase 23: Контент карты Елены Колтышевой

**Цель**: обновить текст портала Елены на основной карте, описания мест и ссылки на обзоры без изменения интерфейса, схемы данных и нового автоматизированного покрытия.

- [X] T140 Обновить `public/data/main-map.json`: оставить название портала `id: 9004` «Елена Колтышева», заменить описание на приветственный текст от Лены и добавить Instagram `lpolskaya`.
- [X] T141 Обновить `public/data/elena-koltysheva-objects.json`: сохранить «Белый квадрат» без изменений, заменить описания 14 остальных мест, добавить официальную Instagram-ссылку «Алиби» и кнопки `Мой обзор` с `kind: "details"` для «Алиби», Ace Padel Club, планетария и Warpoint; текущие сайты Shevkunov и Фета оставить без изменений. Проверка: `jq empty public/data/main-map.json public/data/elena-koltysheva-objects.json`, `pnpm typecheck`, `pnpm build`; новое тестовое покрытие не добавлялось.
- [X] T142 Исправить hover/selected состояние маркеров на карте `elena-koltysheva`: MapLibre source `places` теперь использует `promoteId: "id"`, поэтому feature-state применяется к строковым id под-карт так же, как к числовым id основной карты. Проверка: `pnpm typecheck`, `pnpm build`, ручная Playwright-диагностика hover на `/maps/main` и `/maps/elena-koltysheva`; новое тестовое покрытие не добавлялось.
- [X] T143 Уточнить место `elena-koltysheva-014` в `public/data/elena-koltysheva-objects.json`: переименовать в `картинг-клуб «Вертикаль»`, заменить адрес на `ул. 1-я Щигровская, 52А` и обновить координаты на `51.748820, 36.255864` с GeoJSON-порядком `[36.255864, 51.748820]`. Проверка: `jq empty public/data/elena-koltysheva-objects.json`, `pnpm typecheck`; новое тестовое покрытие не добавлялось.
- [X] T144 Укоротить публичные id мест карты Елены Колтышевой в `public/data/elena-koltysheva-objects.json`: заменить `elena-koltysheva-001`...`elena-koltysheva-015` на числовые `1`...`15`, синхронно обновив верхний `id` и `properties.id`; slug карты, ассеты, схему данных и UI не менять. Старые deep links с длинным id очищаются существующей логикой URL state как невалидные для текущего набора мест. Проверка: `jq empty public/data/elena-koltysheva-objects.json`, точечная `jq`-проверка диапазона `1..15` и совпадения `id`/`properties.id`, `pnpm typecheck`, `pnpm build`, ручная проверка `/maps/elena-koltysheva?place=1` и `/maps/elena-koltysheva?place=14`; новое тестовое покрытие не добавлялось.

---

## Phase 24: Оптимизация загрузки данных и изображений

**Цель**: убрать предварительную загрузку JSON и медиа всех карт через PWA precache, сохранив фотомаркеры для выбранной карты и ленивую загрузку полных фотографий карточки.

- [X] T145 Сузить PWA precache в `vite.config.ts` до app shell и PWA-иконок: убрать `data/*.json`, `map-styles/*.json`, брендовые изображения и общий glob для `json/webp/png/svg`; оставить runtime cache `/data/`, чтобы кэшировался только фактически запрошенный JSON выбранной карты. В `src/components/map/KurskMap.tsx` удалить дублирующие вызовы `addMarkerImages`, оставив загрузку миниатюр после готовности MapLibre source и изменения текущего набора `places`. Проверка: `pnpm typecheck`, `pnpm build`, инспекция `dist/sw.js` на отсутствие `data/`, `place-images/`, `place-thumbnails/` и `brand/` в precache; новое тестовое покрытие не добавлялось.
- [X] T146 Заменить старый vector source в `public/map-styles/kursk-positron.json` на no-key CARTO Positron raster tiles: убрать внешний TileJSON, `glyphs` и vector layers базовой карты, сохранить MapLibre и GeoJSON-маркеры поверх raster-подложки. Использовать CARTO `@2x` raster tiles при `tileSize: 256`, чтобы retina/mobile экраны получали 512px тайлы без размытия; обесцветить именно raster tiles через MapLibre paint (`raster-saturation: -1`, лёгкая яркость и мягкий contrast), чтобы не применять CSS-фильтр ко всему canvas и не гасить маркеры/фотографии. Обновить `specs/001-kursk-places-map/plan.md`, `specs/001-kursk-places-map/research.md`, `specs/001-kursk-places-map/quickstart.md` и `specs/001-kursk-places-map/contracts/pwa-behavior.md` под новый источник подложки. Проверка: `pnpm typecheck`, `pnpm build`, поиск по старому endpoint и названию прежнего провайдера в `public`, `src` и `specs/001-kursk-places-map`, ручная проверка через локальный сервер; новое тестовое покрытие не добавлялось.

---

## Phase 25: Обзоры карты «Дозаправка»

**Цель**: добавить редакционные Instagram-обзоры в карточки мест «Дозаправки» без изменения схемы данных, интерфейса и нового автоматизированного покрытия.

- [X] T147 Добавить в `public/data/dozapravka-objects.json` 19 ссылок на Instagram-обзоры как текстовые `details` CTA: обновить две существующие ссылки Atilan с `/reel/` на переданные `/p/` URL и единый `kind: "details"`, добавить обзоры для Bellagio, «Мясное место», «Томато», Forno Mio, «Чикен Хауз», Souffle BAR, «Безымянный паб», «Макали Хинкали», «Высота», «Гогия», NB cake, Wakanda, «Чайхана» и «Однушка», а также скопировать из `main-map` места «Дикий Кабан» и «Кофейня «Пышки и не только»» с сохранением официальных ссылок и добавить им обзоры. Проверка: `jq empty public/data/dozapravka-objects.json`, точечная проверка всех 19 URL, `pnpm typecheck`, `pnpm build`; новое тестовое покрытие не добавлялось.
- [X] T148 По ручному уточнению переименовать CTA обзорных ссылок карты «Дозаправка» с «Мой обзор» на «Айда смотреть обзор», сохранив нумерацию для мест с двумя обзорами. Проверка: `jq empty public/data/dozapravka-objects.json`, точечная проверка отсутствия старого label и наличия 19 новых обзорных CTA; новое тестовое покрытие не добавлялось.
- [X] T149 По ручному уточнению обновить описание «Дикий Кабан» в `public/data/main-map.json` и `public/data/dozapravka-objects.json`, добавив ощущение визита и гастрономического приключения без изменения схемы данных. Проверка: `jq empty public/data/main-map.json public/data/dozapravka-objects.json`; новое тестовое покрытие не добавлялось.
- [X] T150 По ручному уточнению обновить описание «Мясное место» в `public/data/dozapravka-objects.json`: убрать сценарий дегустации всего меню и сфокусировать текст на рёбрах, стейках и понятном мясном ужине. Проверка: `jq empty public/data/dozapravka-objects.json`; новое тестовое покрытие не добавлялось.
- [X] T151 По ручному уточнению заменить фото места «Завтрак тебе» на карте «Дозаправка»: скачать переданный Instagram CDN JPEG в `public/place-images/2024-image-b3be7a6fd6.jpg`, подготовить квадратную миниатюру `public/place-thumbnails/2024-thumbnail-b3be7a6fd6.jpg` и обновить `image`/`thumbnail` в `public/data/dozapravka-objects.json`. Проверка: `file` для обоих ассетов, visual preview миниатюры, `jq empty public/data/dozapravka-objects.json`; новое тестовое покрытие не добавлялось.
- [X] T152 По ручному уточнению обновить описание «Макали Хинкали» в `public/data/dozapravka-objects.json`: сделать текст короче, живее и интригующе, без рекомендации идти компанией. Проверка: `jq empty public/data/dozapravka-objects.json`, `pnpm typecheck`; новое тестовое покрытие не добавлялось.
- [X] T153 По ручному уточнению обновить описание Forno Mio в `public/data/dozapravka-objects.json`: объединить впечатления из двух обзоров в более интригующий текст без упоминания ребрендинга и без оборотов «не ..., а ...». Проверка: `jq empty public/data/dozapravka-objects.json`; новое тестовое покрытие не добавлялось.
- [X] T154 По ручному уточнению заменить фото семи мест карты «Дозаправка»: скачать переданные Instagram CDN JPEG для «Кухмистерская Atilan», «Томато», «Мясное место», Forno Mio, «Чикен Хауз», Souffle BAR и «Безымянный паб», подготовить квадратные миниатюры 480×480 в `public/place-thumbnails/` и обновить `image`/`thumbnail` в `public/data/dozapravka-objects.json`. Проверка: `file` для новых ассетов, visual preview миниатюр, `jq empty public/data/dozapravka-objects.json`, `pnpm typecheck`, `pnpm build`; новое тестовое покрытие не добавлялось.
- [X] T155 По ручному уточнению заменить фото 11 мест карты «Дозаправка»: скачать переданные Instagram CDN JPEG для «Макали Хинкали», «Дикий Кабан», «Высота», «Гогия», «Кофейня «Пышки и не только»», NB cake, `Bellagio`, Wakanda, «Чайхана», «Рюмочная «Однушка»» и «Гуарана», подготовить квадратные миниатюры 480×480 в `public/place-thumbnails/` и обновить `image`/`thumbnail` в `public/data/dozapravka-objects.json`. Проверка: `file` для новых ассетов, размеры миниатюр через `sips`, `jq empty public/data/dozapravka-objects.json`, `pnpm typecheck`, `pnpm build`; новое тестовое покрытие не добавлялось.
- [X] T156 По утверждённому пользователем тексту обновить описание места «Завтрак тебе» (`id: 2024`) в `public/data/dozapravka-objects.json` на карте «Дозаправка». Проверка: `jq empty public/data/dozapravka-objects.json`; новое тестовое покрытие не добавлялось.
- [X] T157 По ручному уточнению заменить фото места «Рис и Тесто» на карте «Дозаправка»: скачать переданный Instagram CDN JPEG в `public/place-images/2015-image-dozapravka-621638562.jpg`, подготовить квадратную миниатюру 480×480 `public/place-thumbnails/2015-thumbnail-dozapravka-621638562.jpg` и обновить `image`/`thumbnail` в `public/data/dozapravka-objects.json`. Проверка: `file` для новых ассетов, размер миниатюры через `sips`, `jq empty public/data/dozapravka-objects.json`, `pnpm typecheck`, `pnpm build`; новое тестовое покрытие не добавлялось.
- [X] T158 По утверждённому пользователем тексту обновить описание места «Томато» (`id: 2011`) в `public/data/dozapravka-objects.json` на карте «Дозаправка» в более живом стиле проекта. Проверка: `jq empty public/data/dozapravka-objects.json`; новое тестовое покрытие не добавлялось.
- [X] T159 По утверждённому пользователем тексту обновить описание места «Рис и Тесто» (`id: 2015`) в `public/data/dozapravka-objects.json` на карте «Дозаправка». Проверка: `jq empty public/data/dozapravka-objects.json`; новое тестовое покрытие не добавлялось.
- [X] T160 По утверждённому пользователем тексту обновить описание места `Souffle BAR` (`id: 2014`) в `public/data/dozapravka-objects.json` на карте «Дозаправка». Проверка: `jq empty public/data/dozapravka-objects.json`; новое тестовое покрытие не добавлялось.
- [X] T161 По утверждённому пользователем тексту обновить описание места «Рюмочная «Однушка»» (`id: 1489`) в `public/data/dozapravka-objects.json` на карте «Дозаправка». Проверка: `jq empty public/data/dozapravka-objects.json`; новое тестовое покрытие не добавлялось.
- [X] T162 По утверждённому пользователем тексту обновить описание места «Безымянный паб» (`id: 2016`) в `public/data/dozapravka-objects.json` на карте «Дозаправка». Проверка: `jq empty public/data/dozapravka-objects.json`; новое тестовое покрытие не добавлялось.
- [X] T163 По ручному уточнению обновить адреса и координаты мест «Томато», «Гогия», Forno Mio, «Пышки и не только», «Чикен Хауз», «Высота», «Чайхана» и «Макали Хинкали», удалить `Chef Alex Pizza` (`id: 2023`) с карты «Дозаправка» и синхронизировать существующее e2e-ожидание количества мест до 20. Проверка: `jq empty public/data/dozapravka-objects.json`, `jq '.features | length' public/data/dozapravka-objects.json`, `pnpm typecheck`, `pnpm build`; новое тестовое покрытие не добавлялось.
- [X] T164 По ручному уточнению обновить адрес и координаты места «Гуарана» (`id: 2025`) в `public/data/dozapravka-objects.json` на карте «Дозаправка». Проверка: `jq empty public/data/dozapravka-objects.json`, `pnpm typecheck`; новое тестовое покрытие не добавлялось.
- [X] T165 По утверждённому пользователем тексту обновить описание места «Кофейня «Пышки и не только»» (`id: 1465`) в `public/data/main-map.json` и `public/data/dozapravka-objects.json`. Проверка: `jq empty public/data/main-map.json public/data/dozapravka-objects.json`; новое тестовое покрытие не добавлялось.
- [X] T166 По ручному уточнению обновить адрес и координаты места «Рис и Тесто» (`id: 2015`) в `public/data/dozapravka-objects.json` на карте «Дозаправка». Проверка: `jq empty public/data/dozapravka-objects.json`, `pnpm typecheck`; новое тестовое покрытие не добавлялось.
- [X] T167 По утверждённому пользователем тексту обновить описание места «Гогия» (`id: 2019`) в `public/data/dozapravka-objects.json` на карте «Дозаправка». Проверка: `jq empty public/data/dozapravka-objects.json`; новое тестовое покрытие не добавлялось.
- [X] T168 По утверждённому пользователем тексту обновить описание места «Макали Хинкали» (`id: 2017`) в `public/data/dozapravka-objects.json` на карте «Дозаправка»: убрать эффект перечисления блюд и сфокусировать текст на живом впечатлении от места. Проверка: `jq empty public/data/dozapravka-objects.json`; новое тестовое покрытие не добавлялось.
- [X] T169 По утверждённому пользователем тексту обновить описание места «Чайхана» (`id: 2022`) в `public/data/dozapravka-objects.json` на карте «Дозаправка» в ироничном стиле ролика. Проверка: `jq empty public/data/dozapravka-objects.json`; новое тестовое покрытие не добавлялось.
- [X] T170 По утверждённому пользователем тексту обновить описание места «Гуарана» (`id: 2025`) в `public/data/dozapravka-objects.json` на карте «Дозаправка» в коротком ироничном стиле ролика. Проверка: `jq empty public/data/dozapravka-objects.json`; новое тестовое покрытие не добавлялось.
- [X] T171 По ручному уточнению добавить место `OCHI` (`id: 2026`) на карту «Дозаправка» по адресу `ул. Карла Маркса, 6, ТРЦ Central Park, 4 этаж` с координатами `51.749275, 36.191562`; скачать переданный Instagram CDN JPEG в `public/place-images/2026-image-dozapravka-970506788.jpg`, подготовить квадратную миниатюру 480×480 `public/place-thumbnails/2026-thumbnail-dozapravka-970506788.jpg` и обновить существующее e2e-ожидание количества мест «Дозаправки» до 21. Проверка: `jq empty public/data/dozapravka-objects.json`, размеры миниатюры через `sips`, `pnpm typecheck`, `pnpm build`; новое тестовое покрытие не добавлялось.
- [X] T172 По утверждённому пользователем тексту обновить описание места `OCHI` (`id: 2026`) в `public/data/dozapravka-objects.json` на карте «Дозаправка» в коротком ироничном стиле ролика. Проверка: `jq empty public/data/dozapravka-objects.json`; новое тестовое покрытие не добавлялось.
- [X] T173 Очистить 36 старых ассетов, которые раньше использовались картой «Дозаправка», но больше не referenced из текущих данных/кода; вернуть на основной карте короткие исходные описания мест «Дикий Кабан» (`id: 2004`) и «Кофейня «Пышки и не только»» (`id: 1465`), не меняя данные самой «Дозаправки». Проверка: `jq empty public/data/main-map.json public/data/dozapravka-objects.json`, повторная проверка бывших дозаправочных ассетов на отсутствие ссылок, сравнение совпадающих мест основной карты и «Дозаправки»; новое тестовое покрытие не добавлялось.

---

## Phase 26: Компактный ряд местоположения в карточке места

**Цель**: объединить адрес, координаты и построение маршрута в один ряд панели места и скрыть адрес у портальных мест без физической локации.

- [X] T174 [US2] Обновить `src/components/place-details/PlaceDetailsPanel.tsx`, `src/components/place-details/RouteActions.tsx`, связанные UI-примитивы при необходимости и `src/components/place-details/PlaceDetailsPanel.stories.tsx`: обычное место показывает один компактный логический ряд с полным адресом, доступом к копированию или вспомогательному показу координат и действиями маршрута; координаты не выводятся отдельным блоком; кнопку копирования можно сделать меньше вторичных CTA, а варианты маршрута можно сгруппировать в выпадающее меню; портальные места без физического адреса не показывают адрес и маршрут, сохраняя primary-действие перехода на под-карту. При недоступном или отклонённом Clipboard API координаты показываются тихим fallback-текстом под адресом внутри того же логического ряда. Проверка на `main`: `pnpm typecheck`, `pnpm test:unit`, `pnpm build`, `pnpm build-storybook`, ручной Playwright DOM QA на `http://127.0.0.1:5177/maps/main?place=320` и `http://127.0.0.1:5177/maps/main?place=9001`; обычное место имеет один ряд местоположения, полный текст адреса, не показывает отдельный блок «Координаты» и раскрывает 3 ссылки маршрута, портальное место не показывает адрес/маршрут и сохраняет кнопку перехода на под-карту. Полный `pnpm test:e2e` не запускался, потому что порт `5173` уже занят внешним Vite-процессом, а конфиг Playwright требует собственный server без reuse. Новое автоматизированное тестовое покрытие не добавлялось.
- [X] T175 [US2] Уточнить компактный ряд после ручной проверки `place=1247`: действие маршрута в `RouteActions` compact сделать icon-only через `IconButton`, убрать текст «Маршрут» и chevron, оставить выпадающее меню провайдеров, а в `PlaceDetailsPanel` уменьшить ширину правых действий, чтобы адрес получал основное место. Проверка: `pnpm typecheck`, `pnpm build`, `pnpm test:unit`, ручной Playwright DOM QA на `http://localhost:5173/maps/main?place=1247` при viewport `375×812` показал ширину адресной колонки `243px`, ширину действий `84px`, пустой текст route-кнопки и dropdown `Яндекс.Карты`, `2ГИС`, `Google Maps`; копирование координат меняет состояние на «Координаты скопированы». Ручная проверка `http://localhost:5173/maps/main?place=9001` подтвердила отсутствие адресного ряда и маршрута у портала при сохранённой кнопке под-карты. Новое автоматизированное тестовое покрытие не добавлялось.
- [X] T177 [US2] Убрать двойной визуальный разделитель у обычного места без совета, под-карты и внешних ссылок/соцсетей: добавить общий helper для отображаемых external links, переключать адресный ряд с `border-y` на `border-t`, если ниже него до футера нет содержимого, и добавить Storybook story `WithoutExternalLinks`. Проверка: `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`, `pnpm test:unit`; ручной Playwright DOM QA на `http://localhost:5173/maps/illustrator-liza-silakova?place=13` подтвердил `externalCount: 0`, класс адресного ряда `border-t`, `rowBorderBottom: 0px solid`, `footerBorderTop: 1px solid`; на `http://localhost:5173/maps/illustrator-liza-silakova?place=1` подтвердил `externalCount: 1`, класс адресного ряда `border-y`, `rowBorderBottom: 1px solid`; в viewport `375×812` оба сценария сохранили компактный ряд с `rowWidth: 335`, `addressWidth: 243`, `actionsWidth: 84`. Новое автоматизированное тестовое покрытие не добавлялось.

---

## Phase 27: Новое место на основной карте

**Цель**: добавить на основную публичную карту «Пляжный комплекс Городской» с локальным фото и пользовательским описанием без изменения схемы данных.

- [X] T179 Добавить место «Пляжный комплекс Городской» (`id: 9005`) в `public/data/main-map.json` с координатами `[36.209583, 51.753512]`, адресом `Курск, улица Перекальского`, пользовательским описанием без автомобильного emoji по ревью, `visibility.public: true` и локальными webp-ассетами из `/photo_2026-06-25_08-14-20.jpg` в `public/place-images/` и `public/place-thumbnails/`. Проверка: `jq empty public/data/main-map.json`, `pnpm test:unit -- tests/unit/mapDataIntegrity.test.ts`, `pnpm typecheck`, `pnpm build`; новое автоматизированное тестовое покрытие не добавлялось.

---

## Phase 28: Абзацы в описании места

**Цель**: сохранить авторское деление длинных описаний на абзацы в карточке места без изменения JSON-схемы и данных.

- [X] T180 Обновить `src/components/place-details/PlaceDetailsPanel.tsx`: безопасно делить `balloonContent.description` по пустым строкам после нормализации переносов `\r\n`/`\n`, выводить непустые части отдельными `<p>` с текущим стилем описания и небольшим вертикальным расстоянием; `dangerouslySetInnerHTML` не использовать. Добавить Storybook story `MultilineDescription` в `src/components/place-details/PlaceDetailsPanel.stories.tsx` на примере «Пляжного комплекса Городской». Проверка: `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`, ручная browser QA `/maps/main?place=9005` на desktop/mobile и контроль обычного однострочного описания; новое автоматизированное тестовое покрытие не добавлялось.

---

## Phase 29: Единый источник координат места

**Цель**: убрать дублирование координат в `balloonContent` и использовать `geometry.coordinates` как единственный источник истины для карты, маршрутов, показа и копирования координат.

- [X] T181 Удалить `properties.balloonContent.coordinates` из контракта данных, статических JSON-файлов, Storybook fixtures и unit fixtures; обновить тип `BalloonContent`, валидатор `validateGeoJsonPlace` и `buildPlaceDetails`, чтобы строка координат для карточки вычислялась из `geometry.coordinates` в порядке `latitude, longitude`. Обновить `spec.md`, `plan.md`, `data-model.md` и `contracts/data-format.md`. Проверка: `pnpm typecheck`, `pnpm test:unit -- tests/unit/mapDataIntegrity.test.ts`, `pnpm test:unit`, `pnpm build`, ручная smoke-проверка карточки обычного места; новое автоматизированное тестовое покрытие не добавлялось.

---

## Phase 30: Редакторское обновление основной карты

**Цель**: точечно обновлять описания мест основной карты по утверждённым пользовательским текстам без изменения под-карт.

- [X] T182 По утверждённому пользовательскому тексту обновить описание места «Молодёжный театр «3Д»» (`id: 1172`) только в `public/data/main-map.json`, не меняя одноимённое место в `public/data/elena-koltysheva-objects.json`. Проверка: JSON parse, `pnpm typecheck`; новое тестовое покрытие не добавлялось.

## Phase 31: Актуализация ссылок мест

**Цель**: точечно удалять устаревшие или нежелательные внешние ссылки у мест без изменения остальных данных.

- [X] T183 По ручному уточнению удалить Telegram-ссылку `https://t.me/theatre_3d` у места «Молодёжный театр «3Д»» в `public/data/main-map.json` и `public/data/elena-koltysheva-objects.json`, сохранив сайт, ВКонтакте и Instagram. Проверка: JSON parse, `pnpm typecheck`; новое тестовое покрытие не добавлялось.

---

## Phase 32: Сохранение масштаба карты в URL

**Цель**: синхронизировать масштаб MapLibre с query-param `zoom`, чтобы прямые ссылки восстанавливали приближение карты, а изменение масштаба обновляло URL без засорения истории браузера.

- [X] T184 Добавить `src/domain/mapUrlState.ts` для парсинга и сериализации `zoom`, подключить `zoom` в `src/app/App.tsx` и `src/components/map/KurskMap.tsx`: валидный `zoom` применяется при открытии карты, изменения масштаба после `zoomend` сохраняются в URL через replace-навигацию, `place`, `about` и другие query-параметры сохраняются, а отсутствующий или невалидный `zoom` использует `mapConfig.zoom`. Обновить `spec.md`, `plan.md` и `contracts/routes.md`. Проверка: `pnpm typecheck`, `pnpm build`; новое автоматизированное тестовое покрытие не добавлялось.

---

## Phase 33: Временный режим аналитики без consent UI

**Цель**: временно скрыть пользовательский UI управления аналитикой, сохранив быстрый технический возврат старого opt-in режима.

- [X] T185 Добавить центральный флаг `ANALYTICS_CONSENT_UI_ENABLED` в `src/config/analytics.ts` с дефолтом `false` и env override `VITE_ANALYTICS_CONSENT_UI_ENABLED`; подключить его в `src/app/App.tsx`, чтобы в дефолтном режиме Метрика загружалась при открытии сайта, `AnalyticsConsent` не рендерился, а отсутствие consent не влияло на нижние уведомления. В `src/components/about-project/AboutProjectDialog.tsx` добавить `showAnalyticsSettings` и полностью скрывать секцию аналитики без пустого разделителя, когда флаг выключен. В `playwright.config.ts` выставить `VITE_ANALYTICS_CONSENT_UI_ENABLED=true`, чтобы существующий e2e consent-сценарий продолжал проверять opt-in режим без изменения теста; dev-заглушка Метрики зеркалирует вызовы в `window.ymQueue`, чтобы существующая e2e-проверка видела очередь без изменения production-поведения. Обновить `spec.md` и `plan.md`; новое автоматизированное тестовое покрытие не добавлялось. Проверка: `pnpm typecheck`, `pnpm build`, `pnpm exec playwright test tests/e2e/analytics-consent.spec.ts --project=desktop`; ручной smoke дефолтного режима на Vite dev server с `VITE_YANDEX_METRIKA_ID=123456` подтвердил `consentCount: 0`, `analyticsSettingsCount: 0`, `metrikaScriptCount: 1`, наличие `ym`, события `hit`/`app_open` при открытии `/maps/main` и отсутствие сырого текста поискового запроса в analytics queue.

---

## Phase 34: Единый фотоблок карточки места

**Цель**: дать всем фотографиям места один крупный и предсказуемый сценарий просмотра без отдельной ленты миниатюр или полноэкранного режима.

- [X] T186 [US2] Добавить `PlacePhotoGallery` со стабильной областью, `object-contain`, циклическими кнопками, счётчиком, клавиатурой, touch-свайпом, reduced motion, состоянием ошибки и сбросом по `placeId`; подключить его в `PlaceDetailsPanel`, удалить нижнюю ленту и неиспользуемый `PhotoCarousel`, добавить Storybook story `MultiplePhotos`, расширить `IconButton` размером `lg` и разрешённые пользователем unit-тесты без новых/изменённых e2e. Синхронизировать `spec.md`, `plan.md` и `tasks.md`. Проверка: `pnpm test:unit` — 39/39, `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`; visual QA `/maps/main?place=9006` подтвердила один активный full-size кадр, кнопки/счётчик, листание мышью и клавиатурой, отсутствие нижних миниатюр на desktop, `375×812` и phone landscape, а отдельная проверка с `prefers-reduced-motion: reduce` подтвердила переключение без анимации; Storybook `WithoutPhoto` и реальное место с одной фотографией проверены отдельно. Из 16 запущенных неизменённых place-details e2e прошли 9, ещё 7 выявили существующее рассогласование вне scope галереи: route actions сейчас имеют роль `menuitem`, тогда как тесты ищут `link`, а optional-тест ищет скрытое место «Картинг»; e2e не изменялись по ограничению пользователя.

---

## Phase 35: Мягкая подложка фотокарусели

**Цель**: убрать броские чёрные поля вокруг фотографий с нестандартным соотношением сторон, сохранив показ исходного кадра целиком.

- [X] T187 [US2] Добавить в `PlacePhotoGallery` декоративный CSS-фон активной фотографии через `background-size: cover`, размытие, приглушение насыщенности и тёплую вуаль; сохранить единственный основной `<img>` с `object-contain`, тёпло-коричневый fallback, существующие overlay-элементы и поведение навигации. Добавить Storybook story `PhotoLoadError` для ручной проверки fallback и синхронизировать `spec.md`, `plan.md` и `tasks.md`. Проверка: `pnpm typecheck`, `pnpm build`, `pnpm build-storybook`; ручная visual QA `/maps/dozapravka?place=1465` на desktop и `375×812` подтвердила показ вертикального кадра целиком с мягким размытым продолжением, `/maps/main?place=320` подтвердила спокойную подложку горизонтального кадра, а Storybook story `PhotoLoadError` — тёпло-коричневый fallback и сообщение об ошибке. Новое автоматизированное тестовое покрытие не добавлялось по правилу проекта.

---

## Phase 36: Индексируемые маршруты и базовое SEO

**Цель**: сохранить публичные `/maps/<slug>` на GitHub Pages, устранить ошибочный конечный HTTP-статус известных маршрутов и опубликовать базовые сигналы для Google и Яндекса.

- [X] T188 Создать build-time генератор `tools/generateSeoArtifacts.ts`, подключить его в `vite.config.ts` и расширить SEO-блок `index.html`: для каждого slug из `mapCatalog` выпускать `dist/maps/<slug>/index.html` с уникальными `title`, `description`, canonical, Open Graph и Twitter metadata; генерировать `dist/robots.txt` и `dist/sitemap.xml`; сохранить `404.html` для неизвестных маршрутов. Синхронизировать `spec.md`, `plan.md` и `tasks.md`. Проверка: `pnpm typecheck`, `pnpm build`, инспекция generated artifacts и локальный HTTP-smoke известных/неизвестного маршрутов и служебных файлов. Новое автоматизированное тестовое покрытие не добавлялось по правилу проекта.

---

## Phase 37: Бесшумное обновление PWA

**Цель**: устанавливать обновления app shell без prompt и перезагрузки активной страницы, сохраняя свежесть online-данных и offline fallback.

- [X] T189 Отключить встроенный `registerSW.js`, оставить единственную автоматическую регистрацию Workbox из приложения, включить `skipWaiting` без `clientsClaim`, удалить update prompt из `App` и перевести `/data/` с `StaleWhileRevalidate` на `NetworkFirst`. Обновить разрешённый существующий unit-тест и синхронизировать `spec.md`, `plan.md`, `tasks.md`, `contracts/pwa-behavior.md` и `quickstart.md`. Проверка: `pnpm exec vitest run tests/unit/registerServiceWorker.test.ts`, `pnpm test:unit`, `pnpm typecheck`, `pnpm build`, инспекция production-артефактов и ручной двухверсионный PWA-smoke; новое дополнительное автоматизированное покрытие не добавлялось.

---

## Phase 38: Обзор ювелирного мастер-класса

**Цель**: добавить переданный редакционный Instagram-обзор в карточку существующего места на карте Елены Колтышевой без изменения данных самого места, схемы и интерфейса.

- [X] T190 Добавить ссылку `Мой обзор` с `kind: "details"` и переданным Instagram Reel в `links` места «Ювелирная мастерская Shevkunov» (`id: 5`) в `public/data/elena-koltysheva-objects.json`, сохранив остальные данные места без изменений. Проверка: `jq empty public/data/elena-koltysheva-objects.json`, точечная проверка URL, `pnpm typecheck`, `pnpm build`; новое автоматизированное тестовое покрытие не добавлялось.

---

## Phase 39: Обновление «Лавандового берега»

**Цель**: обновить редакционное описание и обложку существующего места без изменения схемы данных и интерфейса.

- [X] T191 По утверждённому пользовательскому тексту обновить описание места «Лавандовый берег» (`id: 1410`) в `public/data/main-map.json`, заменить основное изображение и квадратную миниатюру на WebP-ассеты из переданного PNG, удалить старые неиспользуемые файлы. Проверка: `jq empty public/data/main-map.json`, форматы и размеры изображений через `file` и `sips`, visual QA `/maps/main?place=1410` на desktop/mobile, `pnpm typecheck`, `pnpm build`; новое автоматизированное тестовое покрытие не добавлялось.

---

## Phase 40: Фотокарусель «Лавандового берега»

**Цель**: дополнить карточку существующего места четырьмя фотографиями, сохранив текущую обложку первым слайдом и миниатюрой маркера.

- [X] T192 Конвертировать `IMG_3333.HEIC`, `IMG_5768.HEIC`, `IMG_5750.HEIC` и `IMG_5771.HEIC` в WebP с нормализованной ориентацией и длинной стороной до 1600 px, добавить ассеты `1410-image-lavender-coast-2.webp`–`1410-image-lavender-coast-5.webp` и массив `balloonContent.images` для места «Лавандовый берег» (`id: 1410`) в `public/data/main-map.json`. Проверка: `jq empty public/data/main-map.json`, форматы и размеры изображений через `file` и `sips`, visual QA `/maps/main?place=1410` на desktop/mobile, `pnpm typecheck`, `pnpm build`; новое автоматизированное тестовое покрытие не добавлялось.

---

## Phase 41: Категория мест «Шале»

**Цель**: добавить масштабируемую однострочную ленту категорий с URL-состоянием и первой выборкой загородного размещения.

- [X] T193 Добавить каталог категорий и `properties.categories`, назначить `chalet` 13 утверждённым местам, реализовать chip `🏡 Шале`, одиночное URL-состояние `category=chalet`, пересечение с поиском, очистку несовместимого `place`, Storybook-состояния и адаптивную горизонтальную прокрутку без пересечения с detail-панелью. По явному разрешению пользователя добавлены unit-тесты доменного и data-контракта и e2e-сценарий desktop/mobile. Проверка: 45 unit-тестов, 4 Playwright-сценария `tests/e2e/search.spec.ts` на desktop/mobile, `typecheck`, production build, Storybook build и ручная visual QA `1440×900`/`390×844`; горизонтальная Storybook-лента прокручена от начала до конца, horizontal overflow страницы отсутствует.

---

## Phase 42: Автомасштабирование категории «Шале»

**Цель**: после выбора категории показывать все 13 мест в доступной области карты без фиксированного масштаба и без повторных движений от поиска или снятия фильтра.

- [X] T194 Добавить чистый расчёт bounds, одноразовый `fitBoundsRequest`, адаптивный padding, приоритеты камеры для ручного выбора и deep link, поддержку `prefers-reduced-motion` и обновление `zoom` через существующий `zoomend`-контракт. По явному разрешению пользователя добавлены unit-тесты bounds и расширен e2e-сценарий категории. Проверка: 48 unit-тестов, 4 Playwright-сценария `tests/e2e/search.spec.ts` на desktop/mobile, `typecheck`, production build, Storybook build и visual QA `1440×900` с открытой detail-панелью, `390×844` и reduced motion; все координаты MapLibre source входят в `map.getBounds()`, ошибок браузерной консоли и horizontal overflow нет.

---

## Phase 43: Генерация обложек мест

**Цель**: унифицировать подготовку WebP-обложек и миниатюр для новых и существующих мест без ручной конвертации и риска потерять ориентацию исходника.

- [X] T195 Добавить macOS CLI `tools/generate-place-assets.mjs` с hash-именами, нормализацией HEIC/EXIF-ориентации, обложкой до 1600 px и квадратной миниатюрой 480×480; перевести `add-map-place` на общий API и создать project-local skill `update-place-cover` с dry-run, синхронизацией первого слайда и удалением только неиспользуемых старых ассетов. По явному разрешению пользователя добавить unit/integration-тесты генератора и обоих helper-скриптов. Проверка: целевые и полные unit-тесты, `quick_validate.py` для обоих skills, реальный dry-run существующего места, `pnpm typecheck`, `pnpm build`; UI, Storybook и e2e не изменялись.

---

## Phase 44: Корректное состояние результатов при загрузке

**Цель**: не выдавать начальный пустой массив мест за готовый пустой результат на медленном соединении.

- [X] T196 Рендерить плашку `ResultsSummary` в `src/app/App.tsx` только после успешной загрузки данных, сохранив отдельное сообщение об ошибке и готовые состояния счётчика и пустого поиска. Синхронизировать `spec.md`, `plan.md` и `tasks.md`; автоматические тесты не менять по решению пользователя. Проверка: `pnpm typecheck`, `pnpm build`, 4 существующих Playwright-сценария `tests/e2e/search.spec.ts` на desktop/mobile; ручная visual QA `1440×900` и `390×844` с задержкой JSON подтвердила отсутствие плашки во время загрузки, появление `41 место на карте` после ответа и сохранение настоящего пустого поиска, а ответ `500` оставил только сообщение `Не удалось загрузить места`.

---

## Phase 45: Фотокарусель Молодёжного театра «3Д»

**Цель**: заменить обложку и дополнить карточку места тремя переданными фотографиями спектаклей.

- [X] T197 Для места «Молодёжный театр «3Д»» (`id: 1172`) в `public/data/main-map.json` подготовить из трёх переданных JPEG WebP-обложку, квадратную миниатюру и фотокарусель из трёх слайдов в заданном порядке; первый кадр использовать как обложку и миниатюру маркера, старые неиспользуемые ассеты удалить штатным helper-скриптом. Проверка: `jq empty`, форматы и размеры изображений, `pnpm typecheck`, `pnpm build`, ручная visual QA `/maps/main?place=1172` на desktop/mobile; новое автоматизированное тестовое покрытие не добавлялось.

---

## Phase 46: Техническое отключение аналитики на время вкладки

**Цель**: дать владельцу проекта безопасную ссылку для собственных посещений без загрязнения статистики и без постоянного opt-out в браузере.

- [X] T198 Добавить обработку точного параметра `analytics=off` до React-render: сохранить session opt-out, удалить параметр из URL с сохранением остальных частей адреса и дать ему приоритет над автозагрузкой и analytics consent без изменения consent UI. По явному разрешению пользователя расширить `tests/e2e/analytics-consent.spec.ts` сценарием очистки URL, отсутствия script/`window.ym`, принятия consent и перезагрузки в той же вкладке. Синхронизировать `spec.md`, `plan.md`, `contracts/routes.md` и `tasks.md`. Проверка: focused e2e desktop/mobile, `pnpm typecheck`, `pnpm build`, ручной smoke дефолтного режима.

---

## Phase 47: Оптимизация структуры главной карты

**Цель**: уменьшить размер `public/data/main-map.json` и закрепить один источник истины для координат без изменения пользовательского поведения.

- [X] T199 Удалить из `public/data/main-map.json` неиспользуемые `properties.section`, `properties.type`, `balloonContent.button`, остаточный `balloonContent.coordinates` и избыточный `visibility.public: true`; сохранить скрытые места с `visibility.public: false`, не менять остальные карты и нормализовать только крайние пробелы/CRLF в описаниях. Обновить `.agents/skills/add-map-place/scripts/add-map-place.mjs`, `.agents/skills/add-map-place/SKILL.md`, `.agents/skills/add-map-place/references/place-data-rules.md`, `specs/001-kursk-places-map/contracts/data-format.md`, `specs/001-kursk-places-map/plan.md` и `tasks.md`, чтобы новые места не создавали legacy-поля. Проверка: `jq empty public/data/main-map.json`, контроль legacy-полей через `jq`, `pnpm typecheck`, `pnpm build`; новое автоматизированное тестовое покрытие не добавлялось.

---

## Phase 48: Маркеры без кластеризации

**Цель**: показывать все места отдельными фотомаркерами и разносить близкие точки без cluster circles/counts, сохраняя маркеры максимально близко к истинным позициям.

- [X] T200 Убрать MapLibre clustering из source и слоёв карты; добавить детерминированный screen-space layout маркеров в `src/components/map/markerLayout.ts`, передавать служебные `markerOffset`, `markerTextOffset` и `markerSortKey` через `placeSource`, применять смещение как runtime-геометрию MapLibre source и `markerSortKey` в `placeLayers`, пересчитывать раскладку в `KurskMap` при смене мест, active place, zoom и resize. Обновить существующий e2e-сценарий кластеров на проверку отсутствия cluster layers и добавить разрешённые unit-тесты layout/source. Проверка: `vitest run tests/unit/markerLayout.test.ts tests/unit/placeSource.test.ts`, `tsc -b --pretty false`, targeted Playwright `tests/e2e/map-interactions.spec.ts` на desktop через dev server `5174`, `vite build` и копирование `dist/index.html` в `dist/404.html`; ручная visual QA desktop/mobile подтвердила отсутствие cluster layers, наличие marker layer, работу hover по смещённому маркеру и 41 место в source. `pnpm build` в этом worktree не дошёл до build script из-за политики `ERR_PNPM_IGNORED_BUILDS` для `esbuild`.
- [X] T201 Заменить дискретный layout близких маркеров на непрерывный screen-space solver: маркеры используют предыдущий offset для стабильности, притягиваются к истинной точке, допускают не более половины визуальной площади перекрытия, пересчитываются во время `zoom`/`move` через `requestAnimationFrame`, а `selected` и `hovered` получают приоритетный `markerSortKey` поверх обычных маркеров. Новые или изменённые automated tests не добавлялись по ограничению пользователя. Проверка: прямой `./node_modules/.bin/tsc -b --pretty false`, прямой `./node_modules/.bin/vite build && cp dist/index.html dist/404.html`; Playwright visual/diagnostic QA на `1440×900` и `390×844` через dev server `5174`: cluster layers отсутствуют, в source 41 место, desktop max overlap ratio `0.4706`, mobile max overlap ratio `0.4997`, hover и selected поднимают целевой маркер до максимального sort key, во время zoom source обновился 13 раз до `zoomend`, скриншоты сохранены в `output/playwright/marker-layout-desktop.png` и `output/playwright/marker-layout-mobile-map.png`. `pnpm exec tsc` не запускал TypeScript из-за политики `ERR_PNPM_IGNORED_BUILDS` для `esbuild`, поэтому использован уже установленный локальный бинарь.
- [X] T202 Разделить физическую раскладку и порядок отрисовки hover-состояния: `selected` продолжает влиять на solver, а `hovered` больше не меняет `markerOffset` и runtime-геометрию; при hover пересчитываются только `markerSortKey` поверх текущих сохранённых offset-ов, поэтому подпись появляется и маркер поднимается без сдвига группы. Новые или изменённые automated tests не добавлялись по ограничению пользователя. Проверка: прямой `./node_modules/.bin/tsc -b --pretty false`, прямой `./node_modules/.bin/vite build && cp dist/index.html dist/404.html`; Playwright visual/diagnostic QA через dev server `5174` на desktop `1440×900` и mobile `390×844`: при hover delta runtime coordinates/`markerOffset`/projected point равна `0`, `hoverProgress` достигает `1`, hovered marker получает максимальный доступный `markerSortKey`, а при одновременном selected+hover другого маркера selected остаётся выше (`41` против `40`). Скриншоты сохранены в `output/playwright/hover-no-shift-desktop.png` и `output/playwright/hover-no-shift-mobile.png`.
- [X] T203 Заморозить физическую раскладку при обычном `pan` без изменения zoom: убрать `move` как причину запуска solver-а, добавить fingerprint физического layout по zoom, viewport, видимым местам и active id, сохранять текущие `markerOffset` при перемещении карты и продолжать пересчитывать solver на `zoom`, `resize`, смену мест и selected-состояние. Новые или изменённые automated tests не добавлялись по ограничению пользователя. Проверка: прямой `./node_modules/.bin/tsc -b --pretty false`, прямой `./node_modules/.bin/vite build && cp dist/index.html dist/404.html`; Playwright diagnostic QA на `/maps/main?zoom=9.23`: desktop после серии `panBy` показал `changedOffsets: 0`, `maxOffsetDelta: 0` и residual единого screen-сдвига около `1e-13`, mobile pan показал те же `0` для offsets; при zoom был один `source.setData` и 27 изменившихся offsets; hover сохранил `offsetDelta: 0`, а selected остался выше hovered (`41` против `40`).

---

## Phase 49: PR-проверки в GitHub Actions

**Цель**: запускать существующие typecheck, unit, build и e2e проверки для pull request автоматически и вручную без добавления нового тестового покрытия.

- [X] T204 Добавить workflow `.github/workflows/pr-checks.yml` с триггерами `pull_request` и `workflow_dispatch`: установить pnpm `10.6.2`, Node `lts/*`, зависимости, Chromium для Playwright, затем выполнить `pnpm typecheck`, `pnpm test:unit`, `pnpm build` и `pnpm test:e2e`; Playwright report загружать artifact-ом только при падении. При локальном прогоне unit-проверки выявили дрейф active-маркера на доли пикселя, поэтому solver закрепляет active-маркер в collision-парах с обычными маркерами; e2e-проверки выявили, что route actions должны оставаться настоящими ссылками, а optional-карточка должна проверять публичное неполное место `«Тепловские высоты»`, сохраняя hidden fixture «Картинг» скрытым по data integrity контракту; Playwright webServer запускает локальный Vite binary напрямую, чтобы не упираться в локальную политику `ERR_PNPM_IGNORED_BUILDS`. Проверка пройдена локально: `./node_modules/.bin/tsc -b --pretty false`, `./node_modules/.bin/vitest run` (`69` passed), `./node_modules/.bin/vite build && cp dist/index.html dist/404.html`, `./node_modules/.bin/playwright test` (`45` passed, `1` skipped); после push проверить запуск workflow на PR.
- [X] T205 Исправить CI-падение search e2e: GitHub Actions trace показал, что клик по категории применял фильтр и запускал fit bounds, но последующий `zoomend` записывал `zoom` из устаревшего snapshot-а `searchParams` и затирал `category`; затем повторный прогон выявил, что `fillSearchBox` проверял desktop searchbox через мгновенный `isVisible()` до завершения первого render-а и преждевременно уходил в mobile fallback. В `src/app/App.tsx` добавлен синхронный ref текущих query params и единый helper обновления URL-состояния, поэтому быстрые записи `category`/`zoom`/`place`/`about` больше не перезаписывают соседние параметры; в `tests/e2e/support/searchControls.ts` helper теперь ждёт появления либо desktop searchbox, либо mobile-кнопки поиска перед заполнением. Новое тестовое покрытие не добавлялось: проверка выполняется существующим e2e-сценарием и PR workflow.
- [X] T206 Исправить замечания review по PR: hover-sort в `KurskMap` использует актуальный `placesRef.current`, поэтому после поиска или категории hover больше не может перезаписать MapLibre source устаревшим набором мест; visual QA screenshots удалены из git index, а `output/playwright/` добавлен в `.gitignore`, чтобы будущие ручные проверки не создавали binary churn в PR.
- [X] T207 Исправить зависание MapLibre canvas на короткой высоте iPhone/PWA restore: `App` фиксирует корневой слой как `h-dvh min-h-dvh`, а `KurskMap` добавляет app-level lifecycle fallback поверх встроенного MapLibre `trackResize`: события `visualViewport`, `pageshow`, `visibilitychange`, `orientationchange`, `focus` и `resize` вызывают `map.resize({ source: "app-viewport-sync" })` только когда canvas и контейнер реально расходятся. Синхронизировать `spec.md`, `plan.md` и `tasks.md`. Новое автоматизированное тестовое покрытие не добавлялось по решению пользователя. Проверка: `./node_modules/.bin/tsc -b --pretty false`, `./node_modules/.bin/vite build && cp dist/index.html dist/404.html`, локальная diagnostic QA размеров canvas на desktop/mobile и ручная iPhone Safari/PWA проверка.
- [X] T208 Расширить workflow `.github/workflows/pr-checks.yml` триггером `push` для ветки `main`, чтобы каждый новый коммит основной ветки запускал существующий полный регрессионный набор, включая `pnpm test:e2e`; отдельный workflow не создавать, шаги и загрузку Playwright report при падении сохранить без изменений. Обновить `package.json.version` до `0.1.2` как patch-улучшение CI-процесса и синхронизировать `plan.md`/`quickstart.md`. Проверка: инспекция YAML, `pnpm typecheck`, `pnpm test:unit`, `pnpm build`, `pnpm test:e2e`; после push в `main` проверить запуск `PR checks` в GitHub Actions.

---

## Phase 50: Версия проекта в диалоге

**Цель**: показывать пользователю текущую публичную версию приложения в диалоге «О проекте» и зафиксировать правило ручного SemVer-инкремента после завершения фич.

- [X] T208 Добавить `projectInfo.version` из `package.json.version` и вывести строку `Версия 0.1.0` в шапке `AboutProjectDialog` вторичным muted-текстом без отдельного блока. Зафиксировать в `AGENTS.md`, что после завершения очередной фичи нужно вручную инкрементировать `package.json.version` по SemVer: `patch` для исправлений и мелких улучшений, `minor` для новой пользовательской функции или заметного расширения поведения, `major` для несовместимых изменений публичного поведения, данных или процесса. Синхронизировать `spec.md`, `plan.md` и `tasks.md`. Новое автоматизированное тестовое покрытие не добавлялось по решению пользователя. Проверка: `pnpm typecheck` и `pnpm build` в текущем окружении остановились до запуска скриптов на `ERR_PNPM_IGNORED_BUILDS` для `esbuild@0.27.7`; фактическая проверка выполнена прямыми локальными командами `./node_modules/.bin/tsc -b --pretty false`, `./node_modules/.bin/vite build`, `cp dist/index.html dist/404.html`; ручная Playwright visual QA production preview на desktop `1280×720` и mobile `390×844` подтвердила видимый текст `Версия 0.1.0` и отсутствие horizontal overflow.

---

## Phase 51: Свежесть PWA-кеша

**Цель**: применять новый app shell после deploy без hard refresh, сохраняя отсутствие update prompt.

- [X] T209 Включить `clientsClaim` в Workbox и добавить обработчик `controlling` в `src/services/pwa/registerServiceWorker.ts`: при update-событии страница автоматически перезагружается ровно один раз, а первичная установка worker не вызывает reload. Обновить разрешённый существующий unit-тест, синхронизировать `spec.md`, `plan.md`, `tasks.md`, `contracts/pwa-behavior.md` и `quickstart.md`, инкрементировать `package.json.version` до `0.1.1`. Новое дополнительное автоматизированное покрытие не добавлялось. Проверка: `./node_modules/.bin/vitest run tests/unit/registerServiceWorker.test.ts`, `./node_modules/.bin/tsc -b --pretty false`, `./node_modules/.bin/vite build && cp dist/index.html dist/404.html`, инспекция `dist/sw.js`; ручной двухверсионный PWA-smoke запланирован для production preview.

---

## Phase 52: Установка PWA на экран телефона

**Цель**: сделать установку PWA обнаружимой на Android и iOS и отследить использование install-сценария через Яндекс.Метрику.

- [X] T210 Добавить `usePwaInstallPrompt`, мобильную dismissible-подсказку установки, секцию установки в диалоге «О проекте» только до standalone-режима, iOS standalone meta tags и обычные manifest icons без maskable purpose. Android использует `beforeinstallprompt` по явному клику, iOS показывает инструкцию Safari «Поделиться» → «На экран “Домой”» → «Добавить», standalone-состояние не показывает install CTA или install-секцию в «О проекте». Расширить typed analytics events событиями действий `pwa_install_prompt_clicked`, `pwa_install_prompt_result`, `pwa_install_dismissed` и `pwa_app_installed`; параметры ограничить безопасными labels `platform`, `source` и `outcome`, без auto-tracking показов подсказки. Обновить `AGENTS.md`, `spec.md`, `plan.md`, `quickstart.md`, `contracts/pwa-behavior.md`, `contracts/analytics-events.md` и поднять `package.json.version` до `0.2.0` как minor-функцию. Новое автоматизированное тестовое покрытие не добавлялось по ограничению пользователя. Проверка: `pnpm typecheck`, `pnpm build`, ручная visual QA desktop/mobile и ручная Android/iOS PWA QA.
- [X] T211 Исправить название PWA при установке: заменить `manifest.short_name` с `Курск` на `Куда в Курске`, чтобы мобильный install prompt и подпись установленного приложения не сокращали бренд до города. Обновить существующий PWA e2e-тест manifest без добавления нового покрытия, синхронизировать `spec.md`, `plan.md`, `contracts/pwa-behavior.md` и поднять `package.json.version` до `0.2.1` как patch. Проверка: `pnpm typecheck`, `pnpm build`, focused Playwright `tests/e2e/pwa.spec.ts --project=mobile`, инспекция `dist/manifest.webmanifest`.
- [X] T212 Исправить регрессию mobile E2E после install UX: при `[data-notice-open="true"]` плашка результатов больше не скрывается через `display: none`, а поднимается над нижней install-плашкой, поэтому `empty-results` и счётчик результатов остаются видимыми. Синхронизировать `spec.md`, `plan.md`, `contracts/pwa-behavior.md` и поднять `package.json.version` до `0.2.2` как patch. Новое автоматизированное тестовое покрытие не добавлялось; используется существующий mobile Playwright-сценарий поиска, который уже поймал регрессию. Проверка: `corepack pnpm typecheck`, `corepack pnpm test:unit`, `corepack pnpm build`, `corepack pnpm exec playwright test tests/e2e/search.spec.ts:6 --project=mobile`.

---

## Phase 53: Обложка усадьбы Фета

**Цель**: обновить визуальное представление места на основной карте без изменения данных одноимённой community-карты.

- [X] T213 Обновить обложку и миниатюру места «Усадьба Афанасия Фета» (`id: 91`) только в `public/data/main-map.json` из локального файла `/Users/cherkalexander/Downloads/ChatGPT Image Jul 10, 2026, 09_50_07 PM.png`; создать hash-именованные WebP-ассеты `public/place-images/91-image-usadba-afanasiya-feta-14c3e826f1.webp` и `public/place-thumbnails/91-thumbnail-usadba-afanasiya-feta-14c3e826f1.webp`, удалить старые неиспользуемые ассеты и поднять `package.json.version` до `0.2.3` как patch. Новое автоматизированное тестовое покрытие не добавлялось. Проверка: `jq empty public/data/main-map.json public/data/elena-koltysheva-objects.json`, dry-run helper-а перед записью, проверка WebP-размеров через `file`.

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
Task: "T031 [P] [US1] Реализовать подготовку GeoJSON source для публичных мест и runtime layout properties маркеров в src/components/map/placeSource.ts"
Task: "T034 [P] [US1] Реализовать маленький ненавязчивый логотип поверх карты в src/components/map/MapLogo.tsx"
```

### User Story 2

```bash
Task: "T040 [P] [US2] Написать Playwright-тест открытия карточки полного места и route actions в tests/e2e/place-details.spec.ts"
Task: "T041 [P] [US2] Написать Playwright-тест скрытия optional блоков для неполного места в tests/e2e/place-details-optional.spec.ts"
Task: "T186 [US2] Реализовать единый крупный фотоблок PlacePhotoGallery с кнопками, клавиатурой и touch-свайпом"
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

## Контентные обновления

- [X] 2026-07-10 Добавлена «Академия Тенниса» на главную карту с локальной WebP-обложкой, каруселью из четырёх фото, адресом, координатами, официальным сайтом и ссылкой ВКонтакте. Проверка: `jq empty public/data/main-map.json`, `pnpm typecheck`, `pnpm build`; новое автоматизированное покрытие не добавлялось.
