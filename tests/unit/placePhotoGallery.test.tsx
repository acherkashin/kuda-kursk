import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { Photo } from "../../src/domain/places";
import { PlacePhotoGallery } from "../../src/components/place-details/PlacePhotoGallery";
import { PlaceDetailsPanel } from "../../src/components/place-details/PlaceDetailsPanel";

const photos: Photo[] = [
  { src: "/place-images/first.jpg", caption: "Первый кадр" },
  { src: "/place-images/second.jpg", caption: "Второй кадр" },
  { src: "/place-images/third.jpg", caption: "Третий кадр" }
];

beforeAll(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  }));
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("PlacePhotoGallery", () => {
  it("показывает только активное полное изображение и листает фотографии по кругу", () => {
    const { container } = render(
      <PlacePhotoGallery photos={photos} placeId="place-one" title="Место" onClose={() => undefined} />
    );

    expect(screen.getByRole("img", { name: "Первый кадр" }).getAttribute("src")).toContain("/place-images/first.jpg");
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(screen.getByText("1 / 3")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Предыдущее фото" }));
    expect(screen.getByRole("img", { name: "Третий кадр" }).getAttribute("src")).toContain("/place-images/third.jpg");
    expect(screen.getByText("3 / 3")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Следующее фото" }));
    expect(screen.getByRole("img", { name: "Первый кадр" }).getAttribute("src")).toContain("/place-images/first.jpg");
  });

  it("поддерживает клавиатуру и touch-свайп", () => {
    render(<PlacePhotoGallery photos={photos} placeId="place-one" title="Место" onClose={() => undefined} />);

    const gallery = screen.getByRole("region", { name: "Фотографии: Место" });
    fireEvent.keyDown(gallery, { key: "ArrowRight" });
    expect(screen.getByRole("img", { name: "Второй кадр" })).toBeTruthy();

    fireEvent.pointerDown(gallery, { clientX: 220, clientY: 120, pointerId: 1, pointerType: "touch" });
    fireEvent.pointerUp(gallery, { clientX: 300, clientY: 124, pointerId: 1, pointerType: "touch" });
    expect(screen.getByRole("img", { name: "Первый кадр" })).toBeTruthy();
  });

  it("сбрасывается на первую фотографию при смене места", () => {
    const { rerender } = render(
      <PlacePhotoGallery photos={photos} placeId="place-one" title="Первое место" onClose={() => undefined} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Следующее фото" }));
    expect(screen.getByRole("img", { name: "Второй кадр" })).toBeTruthy();

    rerender(
      <PlacePhotoGallery
        photos={[{ src: "/place-images/other.jpg", caption: "Другое место" }]}
        placeId="place-two"
        title="Второе место"
        onClose={() => undefined}
      />
    );

    expect(screen.getByRole("img", { name: "Другое место" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Следующее фото" })).toBeNull();
    expect(screen.queryByText("1 / 1")).toBeNull();
  });

  it("сохраняет навигацию при ошибке активного изображения", () => {
    render(<PlacePhotoGallery photos={photos} placeId="place-one" title="Место" onClose={() => undefined} />);

    fireEvent.error(screen.getByRole("img", { name: "Первый кадр" }));

    expect(screen.getByRole("status").textContent).toBe("Не удалось загрузить фотографию");
    fireEvent.click(screen.getByRole("button", { name: "Следующее фото" }));
    expect(screen.getByRole("img", { name: "Второй кадр" })).toBeTruthy();
  });

  it("передаёт закрытие карточки наружу", () => {
    const onClose = vi.fn();
    render(<PlacePhotoGallery photos={photos} placeId="place-one" title="Место" onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Закрыть карточку" }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe("PlaceDetailsPanel с фотогалереей", () => {
  it("показывает все фотографии в едином верхнем блоке", () => {
    const { container } = render(
      <PlaceDetailsPanel
        place={{
          type: "Feature",
          id: "gallery-place",
          geometry: { type: "Point", coordinates: [36.19, 51.73] },
          properties: {
            id: "gallery-place",
            balloonContent: {
              name: "Место с фотографиями",
              description: "Описание места",
              address: "Курск",
              images: photos
            }
          }
        }}
        onClose={() => undefined}
        onRouteOpen={() => undefined}
        onExternalLinkOpen={() => undefined}
        onOpenMap={() => undefined}
      />
    );

    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(screen.getByRole("region", { name: "Фотографии: Место с фотографиями" })).toBeTruthy();
    expect(screen.queryByLabelText("Ещё фотографии")).toBeNull();
  });
});
