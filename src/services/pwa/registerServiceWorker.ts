export type ServiceWorkerUpdatePrompt = {
  needRefresh: boolean;
  updateServiceWorker: () => Promise<void>;
};

export function registerServiceWorker(): ServiceWorkerUpdatePrompt {
  if ("serviceWorker" in navigator) {
    void import("workbox-window").then(({ Workbox }) => {
      const workbox = new Workbox("/sw.js");
      void workbox.register();
    });
  }

  return {
    needRefresh: false,
    updateServiceWorker: async () => undefined
  };
}
