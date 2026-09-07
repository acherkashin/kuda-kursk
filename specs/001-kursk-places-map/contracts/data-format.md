# Контракт данных мест и карт сообществ

## Файл мест

Путь главной карты по умолчанию: `public/data/main-map.json`.

```ts
type PlaceFeature = {
  type: "Feature";
  id: string | number;
  geometry: {
    type: "Point";
    coordinates: [longitude: number, latitude: number];
  };
  properties: {
    id: string | number;
    balloonContent: BalloonContent;
    links?: ExternalLink[];
    visibility?: PlaceVisibility;
    [key: string]: unknown;
  };
};

type BalloonContent = {
  image: string;
  mapThumbnail: string;
  images?: Photo[];
  name: string;
  description: string;
  address: string;
  tip?: string;
  [key: string]: unknown;
};

type Photo = {
  src: string;
  caption?: string;
  order?: number;
};

type ExternalLink = {
  id?: string;
  label: string;
  url: string;
  kind?: "site" | "details" | "vk" | "telegram" | "instagram" | "phone" | "other" | string;
};

type PlaceVisibility = {
  public?: boolean;
  communitySlugs?: string[];
  linkOnly?: boolean;
};
```

## Пример

```json
{
  "type": "Feature",
  "id": 4,
  "geometry": {
    "type": "Point",
    "coordinates": [36.194813, 51.745877]
  },
  "properties": {
    "id": 4,
    "balloonContent": {
      "image": "/place-images/4-image-bank.webp",
      "name": "Государственное управление Банка России по Курской области",
      "description": "Курское отделение Государственного банка открыто 8 сентября 1865 года.",
      "address": "г. Курск・ул. Ленина, 83",
      "mapThumbnail": "/place-map-thumbnails/4-map-thumbnail-5f91ca7cc3.webp"
    }
  }
}
```

## Правила импорта

- `geometry.coordinates` всегда `[longitude, latitude]`.
- Если координаты для Курска выглядят как `[latitude, longitude]`, импорт должен завершиться ошибкой валидации.
- Строка координат для карточки и копирования вычисляется из `geometry.coordinates` в порядке `latitude, longitude`; `balloonContent.coordinates` не используется.
- Карточка использует только `images` (если массив непустой) или обязательное `image`; `mapThumbnail` используется только MapLibre-маркером и никогда не является fallback фотографией карточки.
- При переносе исторического `thumbnail` в `mapThumbnail` файл копируется без изменения пикселей, кадрирования или формата; генератор квадратного WebP применяется только к новым местам или подтверждённой замене обложки.
- Устаревшие поля `properties.section`, `properties.type` и `balloonContent.button` не используются интерфейсом и не должны добавляться в новые записи.
- Дополнительные поля в `properties` разрешены и должны сохраняться для будущего backend/CMS, но UI показывает только поддержанные поля.
- Отсутствующие optional поля не создают пустые блоки интерфейса.
- Отображаемые внешние ссылки хранятся в `properties.links`, а не в `balloonContent.url`, `balloonContent.externalUrl` или `balloonContent.socials`.
- `kind: "site"` и `kind: "details"` показываются как текстовая кнопка «Узнать подробнее».
- `kind: "vk"`, `kind: "telegram"` и `kind: "instagram"` показываются как кнопки соцсетей с логотипом, только если ссылка ведёт на официальный канал самого места.
- Редакционные Telegram-посты карты `illustrator-liza-silakova` хранятся как `kind: "details"`, чтобы не выглядеть официальной соцсетью места.
- Ссылки на `gokursk.ru` не используются в данных и интерфейсе.

## Файл карт сообществ

Путь по умолчанию: `public/data/community-maps.json`.

```ts
type CommunityMap = {
  slug: string;
  title: string;
  description?: string;
  placeIds: Array<string | number>;
  linkOnlyPlaceIds?: Array<string | number>;
  theme?: {
    accentColor?: string;
    logoSrc?: string;
  };
};
```

## Правила видимости

- Основная карта показывает места с `visibility.public !== false` и без `visibility.linkOnly === true`.
- Карта сообщества показывает `placeIds` и `linkOnlyPlaceIds`, если они существуют в данных.
- Link-only место не должно описываться как приватное или защищённое авторизацией.
