# Границы
## Обязательно
- Markdown-файлы, кроме папки .specify/ и служебной папки .agents/skills/, должны быть на русском
- Markdown-файлы в `specs/` должны быть на русском, но в них разрешены служебные термины Spec Kit и технические/product labels на английском, включая `Clarifications`, `Session`, `Phase`, `Priority`, `Checkpoint`, `User Story`, `MVP`, `Setup`, `Foundational`, `Polish`, `contracts`, `quickstart`, `route`, `slug`
- Markdown-файлы в папке .specify/ должны быть на английском
- Markdown-файлы в папке .agents/skills/ являются служебными инструкциями локальных навыков и не подпадают под языковое правило проекта

# Процесс
## Spec Kit
- В проекте используется [Spec Kit](https://github.com/github/spec-kit).
- Текущая фича, над которой мы работаем, определяется именем активной ветки; 
- Описание фич хранится в папке specs.

## Обязательное чтение
Перед планированием или реализацией функции прочитайте:

- `.specify/memory/constitution.md`

# Технологии
- Frontend-only PWA на React, Vite и TypeScript.
- Tailwind CSS v4 для стилизации интерфейса.
- Стили необходимо писать через утилиты Tailwind; нативный CSS использовать только когда задачу нельзя корректно решить средствами Tailwind.
- Motion для анимаций и переходов состояния.
- MapLibre GL JS с OpenFreeMap для карты.
- vite-plugin-pwa и workbox-window для PWA-слоя.
- React Router Declarative Mode для маршрутизации.
- Собственные TypeScript-валидаторы для данных, без Zod.
- Яндекс.Метрика подключается только после явного согласия пользователя.

<!-- SPECKIT START -->
Текущий план функции: specs/001-kursk-places-map/plan.md
<!-- SPECKIT END -->
