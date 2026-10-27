import type { City } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  admin1?: string;
  country?: string;
  country_code?: string;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

export class WeatherServiceError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'WeatherServiceError';
    this.status = status;
  }
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new WeatherServiceError(
      `Falha ao buscar cidades (HTTP ${response.status}).`,
      response.status,
    );
  }

  const data = (await response.json()) as GeocodingResponse;

  return (data.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    ...(result.timezone ? { timezone: result.timezone } : {}),
    ...(result.admin1 ? { region: result.admin1 } : {}),
    ...(result.country ? { country: result.country } : {}),
    ...(result.country_code ? { countryCode: result.country_code } : {}),
  }));
}
