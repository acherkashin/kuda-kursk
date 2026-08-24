import type { Meta, StoryObj } from "@storybook/react-vite";
import { CategoryGroupToggle } from "./CategoryGroupToggle";

const meta = {
  title: "Filters/CategoryGroupToggle",
  component: CategoryGroupToggle,
  args: {
    groups: [
      { value: "history-era", label: "Эпохи" },
      { value: "history-theme", label: "Сюжеты" }
    ],
    onGroupSelect: () => undefined
  }
} satisfies Meta<typeof CategoryGroupToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ErasSelected: Story = {
  args: {
    activeGroup: "history-era"
  }
};

export const ThemesSelected: Story = {
  args: {
    activeGroup: "history-theme"
  }
};
