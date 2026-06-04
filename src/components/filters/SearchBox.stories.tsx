import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchBox } from "./SearchBox";

const meta = {
  title: "Filters/SearchBox",
  component: SearchBox,
  decorators: [
    (Story) => (
      <div className="w-[min(520px,calc(100vw-32px))]">
        <Story />
      </div>
    )
  ],
  parameters: {
    layout: "centered"
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    const emptyActionProps = args.onEmptyAction ? { onEmptyAction: () => setValue("центр") } : {};

    return (
      <SearchBox
        {...args}
        {...emptyActionProps}
        value={value}
        onChange={setValue}
        onReset={() => setValue("")}
      />
    );
  }
} satisfies Meta<typeof SearchBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptySearch: Story = {
  args: {
    value: "",
    onChange: () => undefined,
    onReset: () => undefined
  }
};

export const FilledSearch: Story = {
  args: {
    value: "парк",
    onChange: () => undefined,
    onReset: () => undefined
  }
};

export const EmptyAction: Story = {
  args: {
    value: "",
    emptyActionLabel: "Показать пример",
    onChange: () => undefined,
    onReset: () => undefined,
    onEmptyAction: () => undefined
  }
};
