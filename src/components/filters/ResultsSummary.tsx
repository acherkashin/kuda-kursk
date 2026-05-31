type ResultsSummaryProps = {
  count: number;
  total: number;
  hasActiveSearch: boolean;
  onReset: () => void;
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

export function ResultsSummary({ count, total, hasActiveSearch, onReset }: ResultsSummaryProps) {
  return (
    <div className="results-summary" data-testid="results-summary">
      <span>
        {pluralizePlaces(count)} из {total}
      </span>
      {hasActiveSearch ? (
        <button className="text-button" type="button" onClick={onReset}>
          Сбросить
        </button>
      ) : null}
      {count === 0 ? (
        <div className="empty-results" data-testid="empty-results">
          Ничего не нашлось
        </div>
      ) : null}
    </div>
  );
}
