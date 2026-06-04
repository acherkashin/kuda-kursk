type PlaceTipProps = {
  tip?: string;
};

export function PlaceTip({ tip }: PlaceTipProps) {
  if (!tip) {
    return null;
  }

  return (
    <aside
      className="rounded-r-lg border-l-[3px] border-l-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm leading-snug text-[var(--color-text-secondary)]"
      data-testid="place-tip"
    >
      <p className="m-0 mb-1.5 text-[10.5px] font-semibold not-italic uppercase tracking-[0.08em] text-[var(--color-accent)]">Совет</p>
      <p className="m-0 italic">{tip}</p>
    </aside>
  );
}
