import { resolvePublicPath } from "../publicPath";

type WorkboxLike = {
  addEventListener: (type: "controlling", listener: (event: { isUpdate?: boolean }) => void) => void;
  register: () => Promise<unknown>;
};

export type RegisterServiceWorkerOptions = {
  createWorkbox?: () => Promise<WorkboxLike>;
  reloadPage?: () => void;
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
    let hasReloadedForUpdate = false;
    const reloadPage = options.reloadPage ?? (() => window.location.reload());

    workbox.addEventListener("controlling", (event) => {
      if (!event.isUpdate || hasReloadedForUpdate) {
        return;
      }

      hasReloadedForUpdate = true;
      reloadPage();
    });

    void workbox.register();
  });
}
