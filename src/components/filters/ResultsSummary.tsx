type ResultsSummaryProps = {
  count: number;
  total: number;
  hasActiveSearch: boolean;
};

function pluralizePlaces(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} место`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} места`;
  }

  return `${count} мест`;
}

export function ResultsSummary({ count, total, hasActiveSearch }: ResultsSummaryProps) {
  return (
    <div className="flex items-center justify-between gap-2 text-[13px] text-[var(--color-muted)] tabular-nums" data-testid="results-summary">
      <span>
        {pluralizePlaces(count)} из {total}
      </span>
      {count === 0 ? (
        <div className="basis-full font-bold text-[var(--color-text)]" data-testid="empty-results">
          Ничего не нашлось
        </div>
      ) : null}
    </div>
  );
}
