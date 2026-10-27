import { useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, QueryStatus, WeatherData } from '../types/weather';

type LastOperation = { kind: 'search'; name: string } | { kind: 'select'; city: City };

export interface UseWeatherResult {
  status: QueryStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof WeatherServiceError) {
    if (error.message === 'A requisição demorou demais.') {
      return 'A requisição demorou demais. Tente novamente.';
    }
    if (error.message === 'Falha de rede.') {
      return 'Falha de rede. Verifique sua conexão e tente novamente.';
    }
    if (error.status === 429) {
      return 'Muitas consultas no momento. Aguarde um pouco e tente novamente.';
    }
    if (error.status !== undefined) {
      return 'O serviço de clima está indisponível. Tente novamente mais tarde.';
    }
    return 'Não foi possível obter dados válidos do clima. Tente novamente.';
  }
  return 'Não foi possível carregar os dados. Tente novamente.';
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const requestIdRef = useRef(0);
  const lastOperationRef = useRef<LastOperation | null>(null);

  async function loadCityWeather(city: City, requestId: number) {
    const weatherData = await getWeather(city);
    if (requestId !== requestIdRef.current) return;

    setData(weatherData);
    setError(null);
    setStatus('success');
  }

  async function runSearch(name: string, rememberOperation: boolean): Promise<void> {
    const normalizedName = name.trim();
    const requestId = ++requestIdRef.current;

    if (rememberOperation) {
      lastOperationRef.current = { kind: 'search', name: normalizedName };
    }

    setQuery(normalizedName);
    setCities([]);
    setData(null);
    setError(null);
    setStatus('loading');

    try {
      const results = await searchCities(normalizedName);
      if (requestId !== requestIdRef.current) return;

      setCities(results);
      if (results.length === 0) {
        setStatus('empty');
        return;
      }

      await loadCityWeather(results[0], requestId);
    } catch (requestError) {
      if (requestId !== requestIdRef.current) return;

      setError(getErrorMessage(requestError));
      setStatus('error');
    }
  }

  async function runSelection(city: City, rememberOperation: boolean): Promise<void> {
    const requestId = ++requestIdRef.current;

    if (rememberOperation) {
      lastOperationRef.current = { kind: 'select', city };
    }

    setQuery(city.name);
    setData(null);
    setError(null);
    setStatus('loading');

    try {
      await loadCityWeather(city, requestId);
    } catch (requestError) {
      if (requestId !== requestIdRef.current) return;

      setError(getErrorMessage(requestError));
      setStatus('error');
    }
  }

  async function search(name: string): Promise<void> {
    await runSearch(name, true);
  }

  async function selectCity(city: City): Promise<void> {
    await runSelection(city, true);
  }

  async function retry(): Promise<void> {
    const lastOperation = lastOperationRef.current;
    if (!lastOperation) return;

    if (lastOperation.kind === 'search') {
      await runSearch(lastOperation.name, false);
      return;
    }

    await runSelection(lastOperation.city, false);
  }

  return { status, data, cities, error, query, search, selectCity, retry };
}
