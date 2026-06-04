import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResultsSummary } from "./ResultsSummary";

const meta = {
  title: "Filters/ResultsSummary",
  component: ResultsSummary,
  decorators: [
    (Story) => (
      <div className="p-8">
        <Story />
      </div>
    )
  ],
  parameters: {
    layout: "centered"
  }
} satisfies Meta<typeof ResultsSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllPlacesOnMap: Story = {
  args: {
    count: 128,
    total: 128,
    hasActiveSearch: false
  }
};

export const ActiveSearch: Story = {
  args: {
    count: 12,
    total: 128,
    hasActiveSearch: true
  }
};

export const EmptyResults: Story = {
  args: {
    count: 0,
    total: 128,
    hasActiveSearch: true
  }
};
