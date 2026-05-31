import { SearchIcon, XIcon } from "lucide-react";

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
};

export function SearchBox({ value, onChange, onReset }: SearchBoxProps) {
  return (
    <div className="search-box">
      <SearchIcon aria-hidden="true" size={18} />
      <input
        aria-label="Поиск мест"
        type="search"
        value={value}
        placeholder="Найти место"
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button className="icon-button" type="button" aria-label="Сбросить поиск" onClick={onReset}>
          <XIcon aria-hidden="true" size={16} />
        </button>
      ) : null}
    </div>
  );
}
