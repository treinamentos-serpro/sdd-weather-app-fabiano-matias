import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

const dateHeadingFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
});

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { status, data, error, search, retry } = useWeather();
  const resultRef = useRef<HTMLElement>(null);
  const previousStatusRef = useRef(status);
  const dateHeading = dateHeadingFormatter.format(new Date());

  useEffect(() => {
    if (previousStatusRef.current === 'loading' && status !== 'loading' && status !== 'idle') {
      resultRef.current?.focus();
    }
    previousStatusRef.current = status;
  }, [status]);

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-accent-400 px-4 py-3 font-semibold text-night-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Pular para o conteúdo
      </a>
      <header className="border-b border-white/10 bg-night-900/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:block">
            <a
              href="#main-content"
              className="inline-flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            >
              <span
                aria-hidden="true"
                className="grid size-10 place-items-center rounded-lg border border-accent-400/30 bg-accent-500/15 text-xl text-accent-400"
              >
                ☼
              </span>
              <span>
                <span className="block text-lg font-bold leading-tight">Clima</span>
                <span className="block text-xs text-white/55">Previsão meteorológica</span>
              </span>
            </a>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-normal text-white/55 lg:hidden">
              Clima local
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end lg:w-[min(100%,52rem)]">
            <div className="min-w-0 flex-1">
              <SearchBar onSearch={search} disabled={status === 'loading'} />
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-start">
              <span className="text-xs font-medium text-white/55 sm:hidden">Temperatura</span>
              <UnitToggle unit={unit} onChange={setUnit} />
            </div>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        aria-busy={status === 'loading'}
        className="mx-auto max-w-7xl px-4 py-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-400 sm:px-6 sm:py-10 lg:px-8"
      >
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase text-accent-400">{dateHeading}</p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Visão do tempo</h1>
          </div>
          <span className="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/55 lg:inline-flex">
            Celsius ou Fahrenheit
          </span>
        </div>

        <section
          ref={resultRef}
          tabIndex={-1}
          aria-label="Resultado da consulta"
          className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-400"
        >
          {status === 'idle' && (
            <EmptyState
              title="Consulte o tempo da sua cidade"
              tip="Pesquise uma cidade para consultar as condições atuais e a previsão para cinco dias."
            />
          )}

          {status === 'loading' && <LoadingState message="Carregando clima..." />}

          {status === 'empty' && (
            <EmptyState
              title="Nenhuma cidade encontrada"
              tip="Confira a grafia ou tente informar a região e o país."
            />
          )}

          {status === 'error' && (
            <ErrorState message={error ?? 'Não foi possível carregar o clima.'} onRetry={retry} />
          )}

          {status === 'success' && data && (
            <div className="space-y-6">
              <CurrentWeather city={data.city} current={data.current} unit={unit} />
              <ForecastList forecast={data.forecast} unit={unit} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
