type PlaceTipProps = {
  tip?: string;
};

export function PlaceTip({ tip }: PlaceTipProps) {
  if (!tip) {
    return null;
  }

  return (
    <aside
      className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-lower)] p-3 text-sm leading-snug text-[var(--color-text-secondary)]"
      data-testid="place-tip"
    >
      {tip}
    </aside>
  );
}
