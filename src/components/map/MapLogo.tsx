import type { ReactNode } from "react";

type MapLogoProps = {
  actionSlot?: ReactNode;
  subtitle?: string;
  title: string;
};

export function MapLogo({ actionSlot, subtitle, title }: MapLogoProps) {
  const content = (
    <>
      <img
        className="h-8 w-8 flex-none rounded-lg object-contain max-[520px]:h-7 max-[520px]:w-7"
        src="/brand/kuda-v-kurske-logo-128.webp"
        alt="Логотип Куда в Курске"
        width="32"
        height="32"
      />
      <span className="grid min-w-0 gap-0.5">
        <span className="truncate leading-none">{title}</span>
        {subtitle ? (
          <span className="truncate text-[12px] leading-none font-medium text-[var(--color-muted)] max-[520px]:text-[11px]">
            {subtitle}
          </span>
        ) : null}
      </span>
    </>
  );

  if (actionSlot) {
    return (
      <div className="flex min-h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 py-1.5 text-[15px] font-bold text-[var(--color-text)] shadow-[var(--shadow-rest)] transition-[box-shadow,border-color] duration-150">
        <a
          className="flex min-w-0 flex-1 items-center gap-2 text-[var(--color-text)] no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          href="/"
          aria-label={title}
        >
          {content}
        </a>
        {actionSlot}
      </div>
    );
  }

  return (
    <a
      className="inline-flex min-h-12 max-w-[280px] flex-none items-center gap-2.5 whitespace-nowrap rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-[15px] font-bold text-[var(--color-text)] no-underline shadow-[var(--shadow-rest)] transition-[box-shadow,border-color] duration-150 hover:border-[var(--color-line-strong)] hover:shadow-[var(--shadow-raised)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] max-[700px]:max-w-[210px] max-[700px]:min-h-11 max-[520px]:max-w-[170px] max-[520px]:gap-2 max-[520px]:px-2.5"
      href="/"
      aria-label={title}
    >
      {content}
    </a>
  );
}
