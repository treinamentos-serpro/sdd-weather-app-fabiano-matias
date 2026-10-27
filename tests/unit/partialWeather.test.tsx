import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import ForecastCard from '../../src/components/ForecastCard';
import { formatDayLabel, formatMetric, getShortDate } from '../../src/lib/format';
import { formatTemperature } from '../../src/lib/temperature';
import { mockWeatherData } from '../../src/mocks/weather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';

afterEach(() => vi.unstubAllGlobals());

describe('fallbacks de dados meteorológicos', () => {
  it.each([
    null,
    undefined,
    Number.NaN,
    Number.POSITIVE_INFINITY,
  ])('formata o valor inválido %s como indisponível', (value) => {
    expect(formatMetric(value, '%')).toBe('—');
    expect(formatTemperature(value, 'celsius')).toBe('—');
    expect(formatTemperature(value, 'fahrenheit')).toBe('—');
  });

  it('preserva zero válido nas métricas e temperaturas', () => {
    expect(formatMetric(0, '%')).toBe('0%');
    expect(formatTemperature(0, 'fahrenheit')).toBe('32 °F');
  });

  it.each([null, undefined, '', '2026-02-30', 'inválido'])('protege data inválida %s', (date) => {
    expect(getShortDate(date)).toBe('—');
    expect(formatDayLabel(date, 2)).toBe('—');
  });

  it('renderiza clima atual sem métricas opcionais ou valores inválidos visíveis', () => {
    render(
      <CurrentWeather
        city={mockWeatherData.city}
        unit="celsius"
        current={{ observedAt: '', temperatureC: 0, weatherCode: 999 }}
      />,
    );
    const article = screen.getByRole('article', { name: 'Clima atual' });
    const metrics = within(article).getAllByRole('definition');
    expect(metrics).toHaveLength(4);
    for (const metric of metrics) expect(metric).toHaveTextContent('—');
    expect(article).toHaveTextContent('Condição indisponível');
    expect(article).not.toHaveTextContent(/NaN|undefined|null|Infinity/);
  });

  it('renderiza probabilidade ausente sem inventar chuva zero', () => {
    render(
      <ForecastCard
        index={0}
        unit="fahrenheit"
        day={{
          status: 'available',
          dateLocal: '2026-10-27',
          weatherCode: 0,
          temperatureMinC: 0,
          temperatureMaxC: 10,
        }}
      />,
    );
    expect(screen.getByText('Chuva: —')).toBeInTheDocument();
    expect(screen.getByText('32 °F')).toBeInTheDocument();
    expect(screen.getByText('50 °F')).toBeInTheDocument();
    expect(screen.getByRole('article')).not.toHaveTextContent(/NaN|undefined|null|Infinity/);
  });

  it('trata results null como busca vazia', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ results: null })));
    await expect(searchCities('São Paulo')).resolves.toEqual([]);
  });

  it('omite metadados nulos ou vazios de cidade', async () => {
    const results = [
      {
        id: 1,
        name: ' Cidade ',
        latitude: 0,
        longitude: 0,
        timezone: null,
        admin1: '',
        country: null,
        country_code: ' ',
      },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ results })));
    await expect(searchCities('Cidade')).resolves.toEqual([
      { id: 1, name: 'Cidade', latitude: 0, longitude: 0 },
    ]);
  });

  it.each([null, undefined])('mapeia campos opcionais %s e dias incompletos', async (missing) => {
    const payload = {
      timezone: 'America/Sao_Paulo',
      current: {
        time: '2026-10-27T09:00',
        temperature_2m: 0,
        weather_code: 0,
        apparent_temperature: missing,
        relative_humidity_2m: missing,
        wind_speed_10m: missing,
        precipitation: missing,
        surface_pressure: missing,
      },
      daily: {
        time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
        weather_code: [0, missing, 0, 0, 0],
        temperature_2m_min: [0, 0, missing, 0, 0],
        temperature_2m_max: [10, 10, 10, missing, 10],
        precipitation_probability_max: [missing, missing, missing, missing, 0],
      },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(payload)));
    const weather = await getWeather(mockWeatherData.city);
    for (const field of [
      'relativeHumidityPct',
      'apparentTemperatureC',
      'windSpeedKmh',
      'pressureHpa',
    ]) {
      expect(weather.current).not.toHaveProperty(field);
    }
    expect(weather.current.precipitationMm).toBe(missing === null ? 0 : undefined);
    expect(weather.forecast.map((day) => day.status)).toEqual([
      'available',
      'unavailable',
      'unavailable',
      'unavailable',
      'available',
    ]);
    expect(weather.forecast[0]).not.toHaveProperty('precipitationProbabilityMaxPct');
    expect(weather.completeness).toBe('partial');
  });

  it.each(['timezone', 'current', 'daily'])('rejeita bloco essencial %s nulo', async (field) => {
    const payload = { timezone: 'America/Sao_Paulo', current: {}, daily: {}, [field]: null };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json(payload)));
    await expect(getWeather(mockWeatherData.city)).rejects.toBeInstanceOf(WeatherServiceError);
  });
});
