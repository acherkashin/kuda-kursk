import type { Meta, StoryObj } from "@storybook/react-vite";
import { CategoryFilter } from "./CategoryFilter";

const futureCategories = [
  { slug: "coffee", label: "Кофейни" },
  { slug: "restaurants", label: "Рестораны" },
  { slug: "nature", label: "Природа" },
  { slug: "chalet", label: "🏡 Шале" },
  { slug: "culture", label: "Культура" },
  { slug: "kids", label: "С детьми" }
] as const;

const meta = {
  title: "Filters/CategoryFilter",
  component: CategoryFilter,
  decorators: [
    (Story) => (
      <div className="w-[min(760px,calc(100vw-32px))] bg-[var(--color-page)] p-4">
        <Story />
      </div>
    )
  ],
  parameters: {
    layout: "centered"
  },
  args: {
    onCategorySelect: () => undefined
  }
} satisfies Meta<typeof CategoryFilter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeCategory: null,
    categories: [{ slug: "chalet", label: "🏡 Шале" }]
  }
};

export const Selected: Story = {
  args: {
    activeCategory: "chalet",
    categories: [{ slug: "chalet", label: "🏡 Шале" }]
  }
};

export const MobileOverflow: Story = {
  args: {
    activeCategory: "chalet",
    categories: futureCategories
  },
  decorators: [
    (Story) => (
      <div className="w-[280px] overflow-hidden bg-[var(--color-page)]">
        <Story />
      </div>
    )
  ]
};
