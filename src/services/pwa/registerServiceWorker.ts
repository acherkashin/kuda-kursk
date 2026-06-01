export type ServiceWorkerUpdatePrompt = {
  needRefresh: boolean;
  updateServiceWorker: () => Promise<void>;
};

type WorkboxLike = {
  addEventListener: (eventName: "waiting" | "controlling", listener: () => void) => void;
  messageSkipWaiting: () => void;
  register: () => Promise<unknown>;
};

export type RegisterServiceWorkerOptions = {
  onNeedRefresh?: (prompt: ServiceWorkerUpdatePrompt) => void;
  createWorkbox?: () => Promise<WorkboxLike>;
  reload?: () => void;
};

export function registerServiceWorker(options: RegisterServiceWorkerOptions = {}): ServiceWorkerUpdatePrompt {
  const idlePrompt: ServiceWorkerUpdatePrompt = {
    needRefresh: false,
    updateServiceWorker: async () => undefined
  };

  if (
    (import.meta.env.DEV && !options.createWorkbox) ||
    typeof navigator === "undefined" ||
    (!("serviceWorker" in navigator) && !options.createWorkbox)
  ) {
    return idlePrompt;
  }

  const createWorkbox =
    options.createWorkbox ??
    (async () => {
      const { Workbox } = await import("workbox-window");
      return new Workbox("/sw.js") as WorkboxLike;
    });
  const reload = options.reload ?? (() => window.location.reload());

  void createWorkbox().then((workbox) => {
    const updatePrompt: ServiceWorkerUpdatePrompt = {
      needRefresh: true,
      updateServiceWorker: async () => {
        workbox.messageSkipWaiting();
      }
    };

    workbox.addEventListener("waiting", () => {
      options.onNeedRefresh?.(updatePrompt);
    });
    workbox.addEventListener("controlling", reload);
    void workbox.register();
  });

  return idlePrompt;
}
