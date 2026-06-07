import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PlaceFeature } from "../../domain/places";
import { PlaceDetailsPanel } from "./PlaceDetailsPanel";

const tallPhotoFixtureSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 1100">
    <rect width="600" height="1100" fill="#d8c6b4" />
    <rect x="46" y="48" width="508" height="260" fill="#7b8f87" />
    <rect x="46" y="342" width="508" height="332" fill="#f2dfc6" />
    <rect x="46" y="710" width="508" height="342" fill="#9b5f3d" />
    <circle cx="438" cy="188" r="64" fill="#f7efe4" />
  </svg>
`;
const tallPhotoFixture = `data:image/svg+xml,${encodeURIComponent(tallPhotoFixtureSvg)}`;

const placeWithPhotos: PlaceFeature = {
  type: "Feature",
  id: "story-cafe",
  geometry: {
    type: "Point",
    coordinates: [36.193, 51.73]
  },
  properties: {
    id: "story-cafe",
    balloonContent: {
      name: "Кофейня у Красной площади",
      description:
        "Небольшое место для спокойного завтрака и короткой встречи в центре. Внутри тихо, а из окон хорошо видно городское движение.",
      address: "Курск, Красная площадь, 2",
      coordinates: "51.730000, 36.193000",
      tip: "Лучше приходить до полудня: в это время здесь светлее всего и проще занять стол у окна.",
      externalUrl: "/places/story-cafe",
      images: [
        {
          src: "/place-images/1-image-local-dba58e76a6.jpg",
          thumbnail: "/place-thumbnails/2010-thumbnail-11e842fddd.jpg",
          caption: "Зал кофейни",
          order: 1
        },
        {
          src: "/place-images/2-image-local-437bc9a2fd.jpg",
          thumbnail: "/place-thumbnails/2008-thumbnail-ce6615bef6.jpg",
          caption: "Деталь интерьера",
          order: 2
        }
      ],
      socials: [
        {
          label: "Telegram",
          url: "https://t.me/example",
          kind: "telegram"
        }
      ]
    },
    links: [
      {
        label: "Сайт места",
        url: "https://example.com",
        kind: "site"
      }
    ],
    visibility: {
      public: true
    }
  }
};

const placeWithLandscapePhoto: PlaceFeature = {
  ...placeWithPhotos,
  id: "story-park-hotel",
  properties: {
    ...placeWithPhotos.properties,
    id: "story-park-hotel",
    balloonContent: {
      ...placeWithPhotos.properties.balloonContent,
      name: "Парк-отель «Песчаный»",
      images: [
        {
          src: "/place-images/320-image-1b82889cd9.jpg",
          thumbnail: "/place-thumbnails/320-f29160ce22.webp",
          caption: "Парк-отель",
          order: 1
        }
      ]
    }
  }
};

const placeWithTallPhoto: PlaceFeature = {
  ...placeWithLandscapePhoto,
  id: "story-tall-photo",
  properties: {
    ...placeWithLandscapePhoto.properties,
    id: "story-tall-photo",
    balloonContent: {
      ...placeWithLandscapePhoto.properties.balloonContent,
      name: "Высокий кадр",
      images: [
        {
          src: tallPhotoFixture,
          caption: "Кадр выше лимита",
          order: 1
        }
      ]
    }
  }
};

const placeWithoutPhotos: PlaceFeature = {
  type: "Feature",
  id: "story-square",
  geometry: {
    type: "Point",
    coordinates: [36.191, 51.736]
  },
  properties: {
    id: "story-square",
    balloonContent: {
      name: "Тихий двор на Ленина",
      description:
        "Небольшой городской двор рядом с привычным маршрутом по центру. Хороший пример карточки, где у места пока нет фотографии.",
      address: "Курск, улица Ленина, 12",
      coordinates: "51.736000, 36.191000",
      tip: "Загляните вечером: двор становится спокойнее, а вывески вокруг дают мягкий свет."
    },
    visibility: {
      public: true
    }
  }
};

const meta = {
  title: "Place/PlaceDetailsPanel",
  component: PlaceDetailsPanel,
  parameters: {
    layout: "fullscreen"
  },
  decorators: [
    (Story) => (
      <div className="min-h-dvh bg-[var(--color-page)]">
        <Story />
      </div>
    )
  ],
  args: {
    onClose: () => undefined,
    onRouteOpen: () => undefined,
    onExternalLinkOpen: () => undefined
  }
} satisfies Meta<typeof PlaceDetailsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPhoto: Story = {
  args: {
    place: placeWithLandscapePhoto
  }
};

export const PortraitPhoto: Story = {
  args: {
    place: placeWithPhotos
  }
};

export const TallPhotoLimit: Story = {
  args: {
    place: placeWithTallPhoto
  }
};

export const WithoutPhoto: Story = {
  args: {
    place: placeWithoutPhotos
  }
};
