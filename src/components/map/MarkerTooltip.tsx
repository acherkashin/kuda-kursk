type MarkerTooltipProps = {
  name: string | null;
};

export function MarkerTooltip({ name }: MarkerTooltipProps) {
  if (!name) {
    return null;
  }

  return (
    <div className="marker-tooltip" data-testid="marker-tooltip" role="status">
      {name}
    </div>
  );
}
