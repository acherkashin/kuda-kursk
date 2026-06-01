type MarkerTooltipProps = {
  name: string | null;
};

export function MarkerTooltip({ name }: MarkerTooltipProps) {
  if (!name) {
    return null;
  }

  return (
    <div
      className="absolute top-[72px] left-[max(16px,env(safe-area-inset-left))] z-3 max-w-[min(320px,calc(100vw-32px))] rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 py-2 text-sm font-bold text-[var(--color-text)] shadow-[var(--shadow-panel)]"
      data-testid="marker-tooltip"
      role="status"
    >
      {name}
    </div>
  );
}
