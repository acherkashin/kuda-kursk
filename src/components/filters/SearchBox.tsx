import { SearchIcon, XIcon } from "lucide-react";

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
};

export function SearchBox({ value, onChange, onReset }: SearchBoxProps) {
  return (
    <div className="grid min-h-[42px] grid-cols-[auto_1fr_auto] items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-lower)] px-2.5">
      <SearchIcon aria-hidden="true" size={18} />
      <input
        className="min-w-0 border-0 bg-transparent text-[var(--color-text)] outline-0"
        aria-label="Поиск мест"
        type="text"
        value={value}
        placeholder="Найти место"
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button
          className="grid h-7 w-7 place-items-center rounded-lg border-0 bg-[var(--color-accent-soft)] text-[var(--color-text)]"
          type="button"
          aria-label="Сбросить поиск"
          onClick={onReset}
        >
          <XIcon aria-hidden="true" size={16} />
        </button>
      ) : null}
    </div>
  );
}
