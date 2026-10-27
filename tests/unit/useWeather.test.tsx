import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorState from '../../src/components/states/ErrorState';
import { useWeather } from '../../src/hooks/useWeather';
import { mockWeatherData } from '../../src/mocks/weather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/services/weatherService')>();
  return { ...original, searchCities: vi.fn(), getWeather: vi.fn() };
});

beforeEach(() => {
  vi.resetAllMocks();
});

function RetryScenario() {
  const { status, error, search, retry } = useWeather();
  return (
    <>
      <button type="button" onClick={() => void search('São Paulo')}>
        Buscar
      </button>
      {status === 'error' && <ErrorState message={error ?? ''} onRetry={retry} />}
      {status === 'success' && <p role="status">Clima carregado</p>}
    </>
  );
}

describe('useWeather: falhas e retry', () => {
  it('refaz a busca após falha offline usando o botão de retry', async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'))
      .mockResolvedValueOnce([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const user = userEvent.setup();
    render(<RetryScenario />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Verifique sua conexão');
    expect(getWeather).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Clima carregado');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(searchCities).toHaveBeenNthCalledWith(1, 'São Paulo');
    expect(searchCities).toHaveBeenNthCalledWith(2, 'São Paulo');
    expect(getWeather).toHaveBeenCalledExactlyOnceWith(mockWeatherData.city);
  });

  it('retry de seleção repete apenas forecast para a mesma cidade', async () => {
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'))
      .mockResolvedValueOnce(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.selectCity(mockWeatherData.city));
    expect(result.current.status).toBe('error');
    expect(result.current.data).toBeNull();
    await act(async () => result.current.retry());

    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenLastCalledWith(mockWeatherData.city);
    expect(result.current.status).toBe('success');
    expect(result.current.error).toBeNull();
  });

  it.each([
    [new WeatherServiceError('A requisição demorou demais.'), 'A requisição demorou demais.'],
    [new WeatherServiceError('HTTP 429', 429), 'Muitas consultas'],
    [new WeatherServiceError('HTTP 503', 503), 'O serviço de clima está indisponível.'],
    [new WeatherServiceError('current ou daily ausente'), 'Não foi possível obter dados válidos'],
    [new Error('Detalhe interno confidencial'), 'Não foi possível carregar os dados.'],
  ])('apresenta mensagem amigável para %s', async (failure, message) => {
    vi.mocked(getWeather).mockRejectedValueOnce(failure);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.selectCity(mockWeatherData.city));

    expect(result.current.status).toBe('error');
    expect(result.current.error).toContain(message);
    expect(result.current.data).toBeNull();
  });
});
