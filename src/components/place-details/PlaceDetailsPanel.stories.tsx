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
      tip: "Лучше приходить до полудня: в это время здесь светлее всего и проще занять стол у окна.",
      images: [
        {
          src: "/place-images/1-image-local-dba58e76a6.jpg",
          thumbnail: "/place-thumbnails/2010-thumbnail-dozapravka-589165129.jpg",
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
    },
    links: [
      {
        label: "Узнать подробнее",
        url: "https://example.com/story-cafe",
        kind: "site"
      },
      {
        label: "ВКонтакте",
        url: "https://vk.com/example",
        kind: "vk"
      },
      {
        label: "Telegram",
        url: "https://t.me/example",
        kind: "telegram"
      },
      {
        label: "Instagram",
        url: "https://www.instagram.com/example",
        kind: "instagram"
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

const placeWithLongAddress: PlaceFeature = {
  ...placeWithLandscapePhoto,
  id: "story-long-address",
  properties: {
    ...placeWithLandscapePhoto.properties,
    id: "story-long-address",
    balloonContent: {
      ...placeWithLandscapePhoto.properties.balloonContent,
      name: "Место с длинным адресом",
      address: "Курск, Центральный округ, улица Карла Маркса, 6, торгово-развлекательный центр Central Park, 4 этаж, рядом с кинотеатром"
    }
  }
};

const placeWithMultilineDescription: PlaceFeature = {
  ...placeWithLandscapePhoto,
  id: "story-multiline-description",
  geometry: {
    type: "Point",
    coordinates: [36.209583, 51.753512]
  },
  properties: {
    ...placeWithLandscapePhoto.properties,
    id: "story-multiline-description",
    balloonContent: {
      ...placeWithLandscapePhoto.properties.balloonContent,
      name: "Пляжный комплекс Городской",
      description:
        "Боевка — классическое место для прогулок по воде. Но иногда там ощущение, что весь Курск одновременно решил выйти на сапах, лодках и катамаранах.\n\nЕсли не хотите стоять в такой водной пробке, то вам на Пляжный комплекс Городской на Перекальского.\n\nОтплываете 10 метров от берега — и наслаждаетесь такими же прекрасными видами, как и на Боевке, только без необходимости лавировать между другими отдыхающими 🛶\n\nЛожитесь на сап, слушайте пение птиц, неспешно плывите по воде и наблюдайте за утятами, которые явно лучше всех понимают, как правильно проводить выходные.",
      address: "Курск, улица Перекальского",
      images: [
        {
          src: "/place-images/9005-plyazhnyy-kompleks-gorodskoy.webp",
          thumbnail: "/place-thumbnails/9005-plyazhnyy-kompleks-gorodskoy.webp",
          caption: "Пляжный комплекс Городской",
          order: 1
        }
      ]
    },
    links: []
  }
};

const placeWithoutExternalLinks: PlaceFeature = {
  ...placeWithLandscapePhoto,
  id: "story-without-external-links",
  properties: {
    ...placeWithLandscapePhoto.properties,
    id: "story-without-external-links",
    links: [],
    balloonContent: {
      name: "Ул. Ломоносова, 7",
      description: "Историческое здание на улице Ломоносова.",
      address: "ул. Ломоносова, 7",
      images: [
        {
          src: "/place-images/13-image-local-d61f833ba8.jpg",
          thumbnail: "/place-thumbnails/sketches/13.jpg",
          caption: "Ул. Ломоносова, 7",
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
      tip: "Загляните вечером: двор становится спокойнее, а вывески вокруг дают мягкий свет."
    },
    visibility: {
      public: true
    }
  }
};

const portalPlace: PlaceFeature = {
  type: "Feature",
  id: "story-portal-dozapravka",
  geometry: {
    type: "Point",
    coordinates: [36.1874, 51.7308]
  },
  properties: {
    id: "story-portal-dozapravka",
    mapLink: { slug: "dozapravka" },
    routable: false,
    balloonContent: {
      name: "Дозаправка",
      description:
        "Сообщество о курских кофейнях и местах, где можно выдохнуть и перезагрузиться. Откройте отдельную карту — мы собрали проверенные точки города.",
      address: "Курск",
      socials: [
        { label: "Telegram", url: "https://t.me/example", kind: "telegram" },
        { label: "ВКонтакте", url: "https://vk.com/example", kind: "vk" }
      ]
    },
    visibility: {
      public: true
    }
  }
};

const placeWithMapLink: PlaceFeature = {
  ...placeWithLandscapePhoto,
  id: "story-shop-maplink",
  properties: {
    ...placeWithLandscapePhoto.properties,
    id: "story-shop-maplink",
    mapLink: { slug: "illustrator-liza-silakova" },
    balloonContent: {
      ...placeWithLandscapePhoto.properties.balloonContent,
      name: "Комета",
      tip: "Здесь продают авторские открытки иллюстратора Лизы Силаковой — загляните за сувениром."
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
    onExternalLinkOpen: () => undefined,
    onOpenMap: () => undefined
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

export const LongAddressLocationRow: Story = {
  args: {
    place: placeWithLongAddress
  }
};

export const MultilineDescription: Story = {
  args: {
    place: placeWithMultilineDescription
  }
};

export const WithoutExternalLinks: Story = {
  args: {
    place: placeWithoutExternalLinks
  }
};

export const SubmapPortal: Story = {
  args: {
    place: portalPlace
  }
};

export const PlaceWithSubmapLink: Story = {
  args: {
    place: placeWithMapLink
  }
};
