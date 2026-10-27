import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

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
  results?: unknown;
}

interface ForecastResponse {
  timezone?: unknown;
  current?: {
    time?: unknown;
    temperature_2m?: unknown;
    weather_code?: unknown;
    apparent_temperature?: unknown;
    relative_humidity_2m?: unknown;
    wind_speed_10m?: unknown;
    precipitation?: unknown;
    surface_pressure?: unknown;
  } | null;
  daily?: {
    time?: unknown;
    weather_code?: unknown;
    temperature_2m_min?: unknown;
    temperature_2m_max?: unknown;
    precipitation_probability_max?: unknown;
  } | null;
}

export class WeatherServiceError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'WeatherServiceError';
    this.status = status;
  }
}

interface TimedFetchResult {
  response: Response;
  body?: unknown;
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
  );
}

function isGeocodingResult(result: unknown): result is GeocodingResult {
  if (typeof result !== 'object' || result === null) return false;

  const candidate = result as Record<string, unknown>;
  return (
    typeof candidate.id === 'number' &&
    Number.isFinite(candidate.id) &&
    readString(candidate.name) !== undefined &&
    typeof candidate.latitude === 'number' &&
    Number.isFinite(candidate.latitude) &&
    typeof candidate.longitude === 'number' &&
    Number.isFinite(candidate.longitude)
  );
}

async function fetchWithTimeout(url: string): Promise<TimedFetchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return { response };

    return { response, body: await response.json() };
  } catch (error) {
    if (isAbortError(error)) {
      throw new WeatherServiceError('A requisição demorou demais.');
    }

    if (error instanceof SyntaxError) {
      throw new WeatherServiceError('Resposta inválida da Open-Meteo.');
    }

    throw new WeatherServiceError('Falha de rede.');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`;
  const { response, body } = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(
      `Falha ao buscar cidades (HTTP ${response.status}).`,
      response.status,
    );
  }

  if (typeof body !== 'object' || body === null) {
    throw new WeatherServiceError('Resposta inválida da Open-Meteo.');
  }

  const results = (body as GeocodingResponse).results;
  if (results === undefined || results === null) return [];
  if (!Array.isArray(results)) {
    throw new WeatherServiceError('Resposta inválida da Open-Meteo.');
  }

  return results.map((result) => {
    if (!isGeocodingResult(result)) {
      throw new WeatherServiceError('Resposta inválida da Open-Meteo.');
    }

    return {
      id: result.id,
      name: result.name.trim(),
      latitude: result.latitude,
      longitude: result.longitude,
      ...(readString(result.timezone) ? { timezone: readString(result.timezone) } : {}),
      ...(readString(result.admin1) ? { region: readString(result.admin1) } : {}),
      ...(readString(result.country) ? { country: readString(result.country) } : {}),
      ...(readString(result.country_code) ? { countryCode: readString(result.country_code) } : {}),
    };
  });
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function readSeriesValue(series: unknown, index: number): unknown {
  return Array.isArray(series) ? series[index] : undefined;
}

export async function getWeather(city: City): Promise<WeatherData> {
  const searchParams = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
      'precipitation',
      'surface_pressure',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_min',
      'temperature_2m_max',
      'precipitation_probability_max',
    ].join(','),
    timezone: 'auto',
    forecast_days: '5',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });
  const { response, body } = await fetchWithTimeout(`${FORECAST_URL}?${searchParams.toString()}`);

  if (!response.ok) {
    throw new WeatherServiceError(
      `Falha ao carregar o clima (HTTP ${response.status}).`,
      response.status,
    );
  }

  if (typeof body !== 'object' || body === null) {
    throw new WeatherServiceError('Resposta inválida da Open-Meteo.');
  }

  const data = body as ForecastResponse;
  if (!data?.current || !data.daily) {
    throw new WeatherServiceError('Resposta incompleta: current ou daily ausente.');
  }

  const timezone = readString(data.timezone);
  const observedAt = readString(data.current.time);
  const temperatureC = readNumber(data.current.temperature_2m);
  const currentWeatherCode = readNumber(data.current.weather_code);
  const precipitationMm =
    data.current.precipitation === null ? 0 : readNumber(data.current.precipitation);

  if (!timezone || !observedAt || temperatureC === undefined || currentWeatherCode === undefined) {
    throw new WeatherServiceError('Resposta incompleta nos campos essenciais do clima atual.');
  }

  const dates = data.daily.time;
  if (
    !Array.isArray(dates) ||
    dates.length < 5 ||
    dates.slice(0, 5).some((date) => readString(date) === undefined)
  ) {
    throw new WeatherServiceError(
      'Resposta incompleta: daily.time não contém cinco datas válidas.',
    );
  }

  const current: CurrentWeather = {
    observedAt,
    temperatureC,
    weatherCode: currentWeatherCode,
    ...(readNumber(data.current.apparent_temperature) !== undefined
      ? { apparentTemperatureC: readNumber(data.current.apparent_temperature) }
      : {}),
    ...(readNumber(data.current.relative_humidity_2m) !== undefined
      ? { relativeHumidityPct: readNumber(data.current.relative_humidity_2m) }
      : {}),
    ...(readNumber(data.current.wind_speed_10m) !== undefined
      ? { windSpeedKmh: readNumber(data.current.wind_speed_10m) }
      : {}),
    ...(precipitationMm !== undefined ? { precipitationMm } : {}),
    ...(readNumber(data.current.surface_pressure) !== undefined
      ? { pressureHpa: readNumber(data.current.surface_pressure) }
      : {}),
  };

  const forecast: ForecastDay[] = Array.from({ length: 5 }, (_, index) => {
    const dateLocal = readString(dates[index]);
    const weatherCode = readNumber(readSeriesValue(data.daily?.weather_code, index));
    const temperatureMinC = readNumber(readSeriesValue(data.daily?.temperature_2m_min, index));
    const temperatureMaxC = readNumber(readSeriesValue(data.daily?.temperature_2m_max, index));

    if (!dateLocal) {
      throw new WeatherServiceError(`Resposta incompleta: data ausente no dia ${index + 1}.`);
    }

    if (
      weatherCode === undefined ||
      temperatureMinC === undefined ||
      temperatureMaxC === undefined
    ) {
      return { status: 'unavailable', dateLocal };
    }

    const precipitationProbabilityMaxPct = readNumber(
      readSeriesValue(data.daily?.precipitation_probability_max, index),
    );

    return {
      status: 'available',
      dateLocal,
      weatherCode,
      temperatureMinC,
      temperatureMaxC,
      ...(precipitationProbabilityMaxPct !== undefined ? { precipitationProbabilityMaxPct } : {}),
    };
  });

  const hasMissingCurrentMetrics =
    current.apparentTemperatureC === undefined ||
    current.relativeHumidityPct === undefined ||
    current.windSpeedKmh === undefined ||
    current.precipitationMm === undefined ||
    current.pressureHpa === undefined;
  const hasIncompleteForecast = forecast.some(
    (day) => day.status === 'unavailable' || day.precipitationProbabilityMaxPct === undefined,
  );

  return {
    city,
    timezone,
    current,
    forecast,
    completeness: hasMissingCurrentMetrics || hasIncompleteForecast ? 'partial' : 'complete',
    retrievedAt: new Date().toISOString(),
  };
}
