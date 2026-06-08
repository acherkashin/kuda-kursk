import type { Photo } from "../../domain/places";
import { resolvePublicPath } from "../../services/publicPath";

type PhotoCarouselProps = {
  photos: Photo[];
  title: string;
};

export function PhotoCarousel({ photos, title }: PhotoCarouselProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <div
      className="grid auto-cols-full grid-flow-col overflow-x-auto rounded-xl bg-[var(--color-surface-lower)] [scroll-snap-type:x_mandatory]"
      aria-label={`Фотографии: ${title}`}
    >
      {photos.map((photo) => (
        <figure
          className="m-0 min-h-[230px] overflow-hidden [scroll-snap-align:start] max-[700px]:min-h-[42dvh]"
          key={`${photo.src}-${photo.caption ?? ""}`}
        >
          <img className="block h-[250px] w-full object-cover max-[700px]:h-[42dvh]" src={resolvePublicPath(photo.src)} alt={photo.caption ?? title} loading="lazy" />
          {photo.caption ? <figcaption className="px-3.5 py-2 text-[13px] text-[var(--color-muted)]">{photo.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  );
}
