import type { Meta, StoryObj } from "@storybook/react-vite";
import type { PlaceFeature } from "../../domain/places";
import { PlaceDetailsPanel } from "./PlaceDetailsPanel";

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
    place: placeWithPhotos
  }
};

export const WithoutPhoto: Story = {
  args: {
    place: placeWithoutPhotos
  }
};
