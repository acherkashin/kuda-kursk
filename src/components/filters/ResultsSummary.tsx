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
    <div
      className="flex flex-wrap items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-[13px] font-semibold text-[var(--color-text-secondary)] shadow-[var(--shadow-rest)] tabular-nums"
      data-testid="results-summary"
    >
      <span className="h-2 w-2 rounded-full bg-[var(--color-text)]" aria-hidden="true" />
      <span className="whitespace-nowrap">
        {hasActiveSearch ? `${pluralizePlaces(count)} из ${total}` : `${pluralizePlaces(count)} на карте`}
      </span>
      {count === 0 ? (
        <div className="basis-full px-4 font-bold text-[var(--color-text)]" data-testid="empty-results">
          Ничего не нашлось
        </div>
      ) : null}
    </div>
  );
}
