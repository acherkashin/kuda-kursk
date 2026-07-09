import type { Meta, StoryObj } from "@storybook/react-vite";
import { PwaInstallNotice } from "./PwaInstallNotice";

const meta = {
  title: "PWA/PwaInstallNotice",
  component: PwaInstallNotice,
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "mobile1"
    }
  },
  decorators: [
    (Story) => (
      <div className="relative min-h-dvh overflow-hidden bg-[var(--color-page)] bg-[linear-gradient(135deg,#f2ede6,#e8dfd4)]">
        <Story />
      </div>
    )
  ],
  args: {
    onDismiss: () => undefined,
    onInstallClick: () => undefined
  }
} satisfies Meta<typeof PwaInstallNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AndroidPrompt: Story = {
  args: {
    installMode: "native-prompt",
    platform: "android"
  }
};

export const IosInstruction: Story = {
  args: {
    installMode: "manual-ios",
    platform: "ios"
  }
};
