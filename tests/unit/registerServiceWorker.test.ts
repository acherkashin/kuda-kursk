import { describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "../../src/services/pwa/registerServiceWorker";

describe("registerServiceWorker", () => {
  it("registers the service worker and reloads once when an update starts controlling the page", async () => {
    const controllingListeners: Array<(event: { isUpdate?: boolean }) => void> = [];
    const reloadPage = vi.fn();
    const workbox = {
      addEventListener: vi.fn((type: "controlling", listener: (event: { isUpdate?: boolean }) => void) => {
        controllingListeners.push(listener);
      }),
      messageSkipWaiting: vi.fn(),
      register: vi.fn(async () => undefined)
    };

    const result = registerServiceWorker({ createWorkbox: async () => workbox, reloadPage });
    await Promise.resolve();

    expect(result).toBeUndefined();
    expect(workbox.addEventListener).toHaveBeenCalledTimes(1);
    expect(workbox.addEventListener).toHaveBeenCalledWith("controlling", expect.any(Function));
    expect(workbox.messageSkipWaiting).not.toHaveBeenCalled();
    expect(workbox.register).toHaveBeenCalledTimes(1);
    const [controllingListener] = controllingListeners;
    if (!controllingListener) {
      throw new Error("controlling listener was not registered");
    }

    controllingListener({ isUpdate: false });
    expect(reloadPage).not.toHaveBeenCalled();

    controllingListener({ isUpdate: true });
    controllingListener({ isUpdate: true });
    expect(reloadPage).toHaveBeenCalledTimes(1);
  });
});
