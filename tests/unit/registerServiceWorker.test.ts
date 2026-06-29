import { describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "../../src/services/pwa/registerServiceWorker";

describe("registerServiceWorker", () => {
  it("registers the service worker without update listeners", async () => {
    const workbox = {
      addEventListener: vi.fn(),
      messageSkipWaiting: vi.fn(),
      register: vi.fn(async () => undefined)
    };

    const result = registerServiceWorker({ createWorkbox: async () => workbox });
    await Promise.resolve();

    expect(result).toBeUndefined();
    expect(workbox.addEventListener).not.toHaveBeenCalled();
    expect(workbox.messageSkipWaiting).not.toHaveBeenCalled();
    expect(workbox.register).toHaveBeenCalledTimes(1);
  });
});
