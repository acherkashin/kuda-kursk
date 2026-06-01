import { Link } from "react-router";

type CommunityMapFallbackProps = {
  slug: string;
};

export function CommunityMapFallback({ slug }: CommunityMapFallbackProps) {
  return (
    <section
      className="fixed top-[72px] left-[max(16px,env(safe-area-inset-left))] z-3 w-[min(420px,calc(100vw-32px))] rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-panel)] max-[700px]:right-2 max-[700px]:left-2 max-[700px]:w-auto"
      data-testid="community-fallback"
      aria-label="Карта сообщества не найдена"
    >
      <h1 className="m-0 mb-1.5 text-xl tracking-normal">Карта не найдена</h1>
      <p className="m-0 mb-3 text-sm leading-snug text-[var(--color-muted)]">Ссылка `/community/{slug}` не совпала с подготовленными картами.</p>
      <Link
        className="inline-flex min-h-[30px] items-center rounded-lg border border-[var(--color-line)] bg-white px-2 py-1 text-[13px] font-bold text-[var(--color-text)] no-underline"
        to="/"
      >
        На основную карту
      </Link>
    </section>
  );
}
