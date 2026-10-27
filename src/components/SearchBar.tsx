import { type FormEvent, useId, useRef, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [city, setCity] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled) return;

    const trimmedCity = city.trim();
    if (trimmedCity.length < 2) {
      setValidationError(
        trimmedCity ? 'Digite ao menos 2 caracteres.' : 'Digite o nome de uma cidade.',
      );
      inputRef.current?.focus();
      return;
    }

    setValidationError(null);
    onSearch(trimmedCity);
  }

  return (
    <form
      role="search"
      aria-label="Buscar cidades"
      aria-busy={disabled}
      onSubmit={handleSubmit}
      className="flex w-full items-end gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md"
    >
      <div className="min-w-0 flex-1">
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-white">
          Buscar cidade
        </label>
        <input
          ref={inputRef}
          id={inputId}
          name="city"
          type="search"
          value={city}
          onChange={(event) => {
            setCity(event.target.value);
            setValidationError(null);
          }}
          aria-invalid={validationError ? true : undefined}
          aria-describedby={validationError ? errorId : undefined}
          placeholder="Ex.: São Paulo"
          disabled={disabled}
          className="min-h-11 w-full rounded-lg border border-white/15 bg-night-900/70 px-3 text-base text-white placeholder:text-white/50 focus:border-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400/40 disabled:cursor-not-allowed disabled:opacity-60"
        />
        {validationError && (
          <p id={errorId} role="alert" className="mt-2 text-sm text-red-200">
            {validationError}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="min-h-11 shrink-0 rounded-lg bg-accent-400 px-4 font-semibold text-night-900 transition-colors enabled:hover:bg-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Buscar
      </button>
    </form>
  );
}
