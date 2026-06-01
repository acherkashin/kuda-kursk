type PlaceTipProps = {
  tip?: string;
};

export function PlaceTip({ tip }: PlaceTipProps) {
  if (!tip) {
    return null;
  }

  return (
    <aside
      className="rounded-lg border border-[var(--color-line)] bg-[#eef5ed] p-3 text-sm leading-snug text-[#243b2f]"
      data-testid="place-tip"
    >
      {tip}
    </aside>
  );
}
