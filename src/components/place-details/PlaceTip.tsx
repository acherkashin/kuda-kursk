type PlaceTipProps = {
  tip?: string;
};

export function PlaceTip({ tip }: PlaceTipProps) {
  if (!tip) {
    return null;
  }

  return (
    <aside className="place-tip" data-testid="place-tip">
      {tip}
    </aside>
  );
}
