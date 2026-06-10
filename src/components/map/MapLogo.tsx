import type { ReactNode } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { resolvePublicPath } from "../../services/publicPath";

type MapLogoProps = {
  actionSlot?: ReactNode;
  className?: string;
  logoSrc: string;
  onBack?: (() => void) | undefined;
  subtitle?: string;
  title: string;
};

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="grid h-9 w-9 flex-none cursor-pointer place-items-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface-lower)] text-[var(--color-text)] transition-[border-color,box-shadow,transform] duration-150 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-rest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-[0.95]"
      type="button"
      aria-label="На главную карту"
      onClick={onClick}
    >
      <ArrowLeftIcon aria-hidden="true" size={18} />
    </button>
  );
}

export function MapLogo({ actionSlot, className, logoSrc, onBack, subtitle, title }: MapLogoProps) {
  const content = (
    <>
      <img
        className="h-8 w-8 flex-none rounded-lg object-cover max-[520px]:h-7 max-[520px]:w-7"
        src={resolvePublicPath(logoSrc)}
        alt={`Логотип «${title}»`}
        width="32"
        height="32"
      />
      <span className="grid min-w-0 gap-0.5">
        <span className="truncate leading-none tracking-[-0.02em]">{title}</span>
        {subtitle ? (
          <span className="whitespace-normal break-words text-[12px] leading-snug font-medium text-[var(--color-muted)] max-[520px]:text-[11px]">
            {subtitle}
          </span>
        ) : null}
      </span>
    </>
  );

  // Внутри под-карты бренд-блок несёт ведущую кнопку «назад» и не ведёт на главную ссылкой —
  // навигацию домой берёт на себя стрелка.
  if (onBack || actionSlot) {
    // На мобильном бренд-блок тянется на всю ширину строки (actionSlot = поиск справа);
    // на desktop под-карты он остаётся компактным рядом с полем поиска.
    const widthClass = className ?? (actionSlot ? "w-full" : "w-[430px] max-w-[min(430px,calc(100vw-32px))] flex-none");

    return (
      <div className={`flex min-h-11 min-w-0 items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 py-[5px] text-[15px] font-bold text-[var(--color-text)] shadow-[var(--shadow-rest)] transition-[box-shadow,border-color] duration-150 ${widthClass}`}>
        {onBack ? (
          <>
            <BackButton onClick={onBack} />
            <span className="flex min-w-0 flex-1 items-center gap-2">{content}</span>
          </>
        ) : (
          <a
            className="flex min-w-0 flex-1 items-center gap-2 text-[var(--color-text)] no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            href={import.meta.env.BASE_URL}
            aria-label={title}
          >
            {content}
          </a>
        )}
        {actionSlot}
      </div>
    );
  }

  return (
    <a
      className="inline-flex min-h-12 max-w-[280px] flex-none items-center gap-2.5 whitespace-nowrap rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-[15px] font-bold text-[var(--color-text)] no-underline shadow-[var(--shadow-rest)] transition-[box-shadow,border-color] duration-150 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-raised)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] max-[700px]:max-w-[210px] max-[700px]:min-h-11 max-[520px]:max-w-[170px] max-[520px]:gap-2 max-[520px]:px-2.5"
      href={import.meta.env.BASE_URL}
      aria-label={title}
    >
      {content}
    </a>
  );
}
