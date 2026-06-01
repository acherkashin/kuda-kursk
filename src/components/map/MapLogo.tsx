export function MapLogo() {
  return (
    <a
      className="absolute top-[max(16px,env(safe-area-inset-top))] left-[max(16px,env(safe-area-inset-left))] z-2 inline-flex min-h-10 max-w-[min(280px,calc(100vw-32px))] items-center gap-2 whitespace-nowrap rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-[15px] font-bold text-[var(--color-text)] no-underline shadow-[var(--shadow-panel)] max-[640px]:top-[max(12px,env(safe-area-inset-top))] max-[640px]:left-[max(12px,env(safe-area-inset-left))] max-[640px]:min-h-[38px] max-[640px]:text-sm"
      href="/"
      aria-label="Куда в Курске"
    >
      <img
        className="h-7 w-7 flex-none rounded-sm object-contain"
        src="/brand/kuda-v-kurske-logo-128.webp"
        alt="Логотип Куда в Курске"
        width="28"
        height="28"
      />
      <span>Куда в Курске</span>
    </a>
  );
}
