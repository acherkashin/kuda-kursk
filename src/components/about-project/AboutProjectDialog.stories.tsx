import type { Meta, StoryObj } from "@storybook/react-vite";
import { ANALYTICS_POLICY_VERSION } from "../../domain/analyticsEvents";
import { AboutProjectDialog } from "./AboutProjectDialog";

const meta = {
  title: "Project/AboutProjectDialog",
  component: AboutProjectDialog,
  parameters: {
    layout: "fullscreen"
  },
  decorators: [
    (Story) => (
      <div className="min-h-dvh bg-[var(--color-page)] bg-[radial-gradient(circle_at_28%_22%,rgba(196,87,26,0.10),transparent_24%),linear-gradient(135deg,#f2ede6,#e8dfd4)]">
        <Story />
      </div>
    )
  ],
  args: {
    isOpen: true,
    onAnalyticsConsentChange: () => undefined,
    onClose: () => undefined
  }
} satisfies Meta<typeof AboutProjectDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoAnalyticsChoice: Story = {
  args: {
    analyticsConsent: null
  }
};

export const AnalyticsAccepted: Story = {
  args: {
    analyticsConsent: {
      status: "accepted",
      policyVersion: ANALYTICS_POLICY_VERSION,
      updatedAt: "2026-06-10T10:00:00.000Z"
    }
  }
};

export const AnalyticsRejected: Story = {
  args: {
    analyticsConsent: {
      status: "rejected",
      policyVersion: ANALYTICS_POLICY_VERSION,
      updatedAt: "2026-06-10T10:00:00.000Z"
    }
  }
};

export const WithPwaInstall: Story = {
  args: {
    analyticsConsent: null,
    pwaInstall: {
      installMode: "manual-ios",
      isStandalone: false,
      platform: "ios"
    }
  }
};

export const InstalledPwa: Story = {
  args: {
    analyticsConsent: null,
    pwaInstall: {
      installMode: "unavailable",
      isStandalone: true,
      platform: "ios"
    }
  }
};
