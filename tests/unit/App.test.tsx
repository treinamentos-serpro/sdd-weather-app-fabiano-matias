import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { type UseWeatherResult, useWeather } from '../../src/hooks/useWeather';
import { mockWeatherData } from '../../src/mocks/weather';

vi.mock('../../src/hooks/useWeather', () => ({ useWeather: vi.fn() }));

function hookState(overrides: Partial<UseWeatherResult> = {}): UseWeatherResult {
  return {
    status: 'idle',
    data: null,
    cities: [],
    error: null,
    query: '',
    search: vi.fn().mockResolvedValue(undefined),
    selectCity: vi.fn().mockResolvedValue(undefined),
    retry: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

beforeEach(() => vi.resetAllMocks());

describe('App: foco e loading', () => {
  it('mantém foco inicial e sinaliza busca ocupada com controles desabilitados', () => {
    vi.mocked(useWeather).mockReturnValue(hookState());
    const { rerender } = render(<App />);
    const input = screen.getByLabelText('Buscar cidade');
    input.focus();
    expect(input).toHaveFocus();

    vi.mocked(useWeather).mockReturnValue(hookState({ status: 'loading' }));
    rerender(<App />);
    expect(screen.getByRole('search')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
  });

  it.each([
    'success',
    'empty',
    'error',
  ] as const)('foca o resultado ao terminar em %s', (status) => {
    vi.mocked(useWeather).mockReturnValue(hookState({ status: 'loading' }));
    const { rerender } = render(<App />);
    vi.mocked(useWeather).mockReturnValue(
      hookState({
        status,
        data: status === 'success' ? mockWeatherData : null,
        error: 'Falha de rede.',
      }),
    );
    rerender(<App />);
    expect(screen.getByRole('region', { name: 'Resultado da consulta' })).toHaveFocus();
    expect(screen.getByRole('search')).toHaveAttribute('aria-busy', 'false');
  });

  it('não move o foco ao trocar unidade e não refaz busca', async () => {
    const state = hookState({ status: 'success', data: mockWeatherData });
    vi.mocked(useWeather).mockReturnValue(state);
    render(<App />);
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: 'Fahrenheit' });
    await user.click(button);
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status', { name: 'Temperatura atual' })).toHaveTextContent('68 °F');
    expect(state.search).not.toHaveBeenCalled();
    expect(state.selectCity).not.toHaveBeenCalled();
  });
});
