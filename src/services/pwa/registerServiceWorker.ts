import { resolvePublicPath } from "../publicPath";

type WorkboxLike = {
  register: () => Promise<unknown>;
};

export type RegisterServiceWorkerOptions = {
  createWorkbox?: () => Promise<WorkboxLike>;
};

export function registerServiceWorker(options: RegisterServiceWorkerOptions = {}): void {
  if (
    (import.meta.env.DEV && !options.createWorkbox) ||
    typeof navigator === "undefined" ||
    (!("serviceWorker" in navigator) && !options.createWorkbox)
  ) {
    return;
  }

  const createWorkbox =
    options.createWorkbox ??
    (async () => {
      const { Workbox } = await import("workbox-window");
      return new Workbox(resolvePublicPath("/sw.js")) as WorkboxLike;
    });

  void createWorkbox().then((workbox) => {
    void workbox.register();
  });
}
