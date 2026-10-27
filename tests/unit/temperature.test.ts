import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it('converte Celsius para Fahrenheit nos valores de referência', () => {
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
    expect(convertTemperature(100, 'fahrenheit')).toBe(212);
    expect(convertTemperature(-40, 'fahrenheit')).toBe(-40);
  });

  it('retorna Celsius sem conversão e converte valores intermediários', () => {
    expect(convertTemperature(21.5, 'celsius')).toBe(21.5);
    expect(convertTemperature(20, 'fahrenheit')).toBe(68);
  });
});

describe('formatTemperature', () => {
  it('arredonda o valor convertido e inclui o símbolo da unidade', () => {
    expect(formatTemperature(20.4, 'celsius')).toBe('20 °C');
    expect(formatTemperature(20.5, 'celsius')).toBe('21 °C');
    expect(formatTemperature(-40, 'fahrenheit')).toBe('-40 °F');
    expect(formatTemperature(20, 'fahrenheit')).toBe('68 °F');
    expect(formatTemperature(21, 'fahrenheit')).toBe('70 °F');
  });
});

describe('unitLabel', () => {
  it('retorna o símbolo correspondente à unidade', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
