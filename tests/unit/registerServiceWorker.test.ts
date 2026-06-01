import { describe, expect, it, vi } from "vitest";
import { registerServiceWorker, type ServiceWorkerUpdatePrompt } from "../../src/services/pwa/registerServiceWorker";

describe("registerServiceWorker", () => {
  it("notifies callers when an update is waiting and exposes an update action", async () => {
    const listeners = new Map<string, () => void>();
    const workbox = {
      addEventListener: vi.fn((eventName: string, listener: () => void) => {
        listeners.set(eventName, listener);
      }),
      messageSkipWaiting: vi.fn(),
      register: vi.fn(async () => undefined)
    };
    let prompt: ServiceWorkerUpdatePrompt | undefined;

    registerServiceWorker({
      createWorkbox: async () => workbox,
      onNeedRefresh: (nextPrompt) => {
        prompt = nextPrompt;
      },
      reload: vi.fn()
    });
    await Promise.resolve();

    listeners.get("waiting")?.();

    expect(prompt).toBeDefined();
    const updatePrompt = prompt as ServiceWorkerUpdatePrompt;
    expect(updatePrompt.needRefresh).toBe(true);
    await updatePrompt.updateServiceWorker();
    expect(workbox.messageSkipWaiting).toHaveBeenCalledTimes(1);
  });
});
