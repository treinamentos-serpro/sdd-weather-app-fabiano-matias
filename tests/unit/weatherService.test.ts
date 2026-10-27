import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  id: 3448439,
  name: 'São Paulo',
  latitude: -23.5505,
  longitude: -46.6333,
  timezone: 'America/Sao_Paulo',
  region: 'São Paulo',
  country: 'Brasil',
  countryCode: 'BR',
};

function createResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function createForecastResponse() {
  return {
    timezone: 'America/Sao_Paulo',
    current: {
      time: '2026-10-27T09:00',
      temperature_2m: 20,
      relative_humidity_2m: 60,
      apparent_temperature: 19,
      weather_code: 0,
      wind_speed_10m: 12,
      precipitation: null,
      surface_pressure: 1013,
    },
    daily: {
      time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
      weather_code: [0, 1, 2, 3, 45],
      temperature_2m_min: [15, 16, 17, 14, 13],
      temperature_2m_max: [24, 25, 26, 22, 21],
      precipitation_probability_max: [0, 10, 20, 35, 40],
    },
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it.each(['', '   ', '  \t\n'])('retorna vazio sem chamar fetch para input %j', async (input) => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities(input)).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('mapeia os resultados do geocoding para City', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
        results: [
          {
            id: city.id,
            name: city.name,
            latitude: city.latitude,
            longitude: city.longitude,
            timezone: city.timezone,
            admin1: city.region,
            country: city.country,
            country_code: city.countryCode,
          },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities(' São Paulo ')).resolves.toEqual([city]);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toContain(`name=${encodeURIComponent('São Paulo')}`);
  });

  it('retorna vazio quando results está ausente', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createResponse({}));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('São Paulo')).resolves.toEqual([]);
  });

  it('retorna vazio quando results é uma lista vazia', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createResponse({ results: [] })));
    await expect(searchCities('Cidade inexistente')).resolves.toEqual([]);
  });

  it.each([
    "L'Haÿ-les-Roses",
    '東京',
    'São Tomé & Príncipe',
  ])('preserva a consulta especial %s', async (name) => {
    const fetchMock = vi.fn().mockResolvedValue(createResponse({ results: [] }));
    vi.stubGlobal('fetch', fetchMock);

    await searchCities(`  ${name}  `);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain(`name=${encodeURIComponent(name)}`);
    expect(new URL(url).searchParams.get('name')).toBe(name);
  });

  it('lança WeatherServiceError para resposta HTTP não-ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createResponse({}, 503));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('São Paulo')).rejects.toBeInstanceOf(WeatherServiceError);
  });
});

describe('getWeather', () => {
  it('mapeia current e cinco itens diários, convertendo precipitação null para zero', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createResponse(createForecastResponse()));
    vi.stubGlobal('fetch', fetchMock);

    const weather = await getWeather(city);

    expect(weather.city).toEqual(city);
    expect(weather.current).toEqual({
      observedAt: '2026-10-27T09:00',
      temperatureC: 20,
      weatherCode: 0,
      apparentTemperatureC: 19,
      relativeHumidityPct: 60,
      windSpeedKmh: 12,
      precipitationMm: 0,
      pressureHpa: 1013,
    });
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast).toEqual([
      {
        status: 'available',
        dateLocal: '2026-10-27',
        weatherCode: 0,
        temperatureMinC: 15,
        temperatureMaxC: 24,
        precipitationProbabilityMaxPct: 0,
      },
      {
        status: 'available',
        dateLocal: '2026-10-28',
        weatherCode: 1,
        temperatureMinC: 16,
        temperatureMaxC: 25,
        precipitationProbabilityMaxPct: 10,
      },
      {
        status: 'available',
        dateLocal: '2026-10-29',
        weatherCode: 2,
        temperatureMinC: 17,
        temperatureMaxC: 26,
        precipitationProbabilityMaxPct: 20,
      },
      {
        status: 'available',
        dateLocal: '2026-10-30',
        weatherCode: 3,
        temperatureMinC: 14,
        temperatureMaxC: 22,
        precipitationProbabilityMaxPct: 35,
      },
      {
        status: 'available',
        dateLocal: '2026-10-31',
        weatherCode: 45,
        temperatureMinC: 13,
        temperatureMaxC: 21,
        precipitationProbabilityMaxPct: 40,
      },
    ]);
    expect(weather.completeness).toBe('complete');
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([
    { current: null, daily: createForecastResponse().daily },
    { current: createForecastResponse().current, daily: null },
  ])('lança WeatherServiceError se current ou daily estiver ausente', async (payload) => {
    const fetchMock = vi.fn().mockResolvedValue(createResponse(payload));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it.each(['current', 'daily'])('rejeita resposta sem a propriedade %s', async (field) => {
    const payload = createForecastResponse();
    Reflect.deleteProperty(payload, field);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createResponse(payload)));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Resposta incompleta: current ou daily ausente.',
    });
  });

  it.each(['temperature_2m', 'weather_code'])('rejeita current sem %s', async (field) => {
    const response = createForecastResponse();
    Reflect.deleteProperty(response.current, field);
    const fetchMock = vi.fn().mockResolvedValue(createResponse(response));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Resposta incompleta nos campos essenciais do clima atual.',
    });
  });

  it('lança WeatherServiceError para resposta HTTP não-ok do forecast', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createResponse({}, 503));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      status: 503,
    });
  });

  it('converte falha de rede em WeatherServiceError', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Falha de rede.',
    });
  });

  it('converte JSON malformado em WeatherServiceError', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Resposta inválida da Open-Meteo.',
    });
  });

  it('converte timeout de 10 segundos em WeatherServiceError', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_url: string, options?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = getWeather(city);
    const rejection = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'A requisição demorou demais.',
    });
    await vi.advanceTimersByTimeAsync(10_000);

    await rejection;
  });

  it('preserva dados opcionais ausentes e dias incompletos como parciais', async () => {
    const response = createForecastResponse();
    const partialResponse = {
      ...response,
      current: {
        ...response.current,
        relative_humidity_2m: null,
      },
      daily: {
        ...response.daily,
        temperature_2m_min: [15, 16, null, 14, 13],
        precipitation_probability_max: [0, null, 20, 35, 40],
      },
    };
    const fetchMock = vi.fn().mockResolvedValue(createResponse(partialResponse));
    vi.stubGlobal('fetch', fetchMock);

    const weather = await getWeather(city);

    expect(weather.current).not.toHaveProperty('relativeHumidityPct');
    expect(weather.current.precipitationMm).toBe(0);
    expect(weather.forecast[1]).toEqual({
      status: 'available',
      dateLocal: '2026-10-28',
      weatherCode: 1,
      temperatureMinC: 16,
      temperatureMaxC: 25,
    });
    expect(weather.forecast[2]).toEqual({
      status: 'unavailable',
      dateLocal: '2026-10-29',
    });
    expect(weather.completeness).toBe('partial');
  });
});
