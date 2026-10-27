import { describe, expect, it } from 'vitest';
import { getWeatherCodePresentation } from '../../src/lib/weatherCodes';

describe('getWeatherCodePresentation', () => {
  it('retorna a apresentação de um código WMO conhecido', () => {
    expect(getWeatherCodePresentation(0)).toEqual({
      label: 'Céu limpo',
      icon: '☀️',
    });
  });

  it('retorna fallback para um código desconhecido', () => {
    expect(getWeatherCodePresentation(999)).toEqual({
      label: 'Condição indisponível',
      icon: '🌡️',
    });
  });
});
