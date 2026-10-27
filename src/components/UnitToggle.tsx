import { type KeyboardEvent, useRef } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const celsiusButtonRef = useRef<HTMLButtonElement>(null);
  const fahrenheitButtonRef = useRef<HTMLButtonElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentUnit: Unit) {
    let nextUnit: Unit | undefined;

    if (event.key === 'ArrowRight') {
      nextUnit = currentUnit === 'celsius' ? 'fahrenheit' : 'celsius';
    } else if (event.key === 'ArrowLeft') {
      nextUnit = currentUnit === 'fahrenheit' ? 'celsius' : 'fahrenheit';
    } else if (event.key === 'Home') {
      nextUnit = 'celsius';
    } else if (event.key === 'End') {
      nextUnit = 'fahrenheit';
    }

    if (!nextUnit) return;

    event.preventDefault();
    onChange(nextUnit);

    if (nextUnit === 'celsius') {
      celsiusButtonRef.current?.focus();
    } else {
      fahrenheitButtonRef.current?.focus();
    }
  }

  const baseButtonClassName =
    'min-h-10 min-w-12 rounded-md px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900';

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1 backdrop-blur-md"
    >
      <button
        ref={celsiusButtonRef}
        type="button"
        aria-label="Celsius"
        aria-pressed={unit === 'celsius'}
        tabIndex={unit === 'celsius' ? 0 : -1}
        onClick={() => onChange('celsius')}
        onKeyDown={(event) => handleKeyDown(event, 'celsius')}
        className={`${baseButtonClassName} ${
          unit === 'celsius'
            ? 'bg-accent-400 text-night-900'
            : 'text-white/75 hover:bg-white/10 hover:text-white'
        }`}
      >
        °C
      </button>
      <button
        ref={fahrenheitButtonRef}
        type="button"
        aria-label="Fahrenheit"
        aria-pressed={unit === 'fahrenheit'}
        tabIndex={unit === 'fahrenheit' ? 0 : -1}
        onClick={() => onChange('fahrenheit')}
        onKeyDown={(event) => handleKeyDown(event, 'fahrenheit')}
        className={`${baseButtonClassName} ${
          unit === 'fahrenheit'
            ? 'bg-accent-400 text-night-900'
            : 'text-white/75 hover:bg-white/10 hover:text-white'
        }`}
      >
        °F
      </button>
    </div>
  );
}
