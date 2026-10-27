import { describe, expect, it } from 'vitest';
import { formatDayLabel, getShortDate } from '../../src/lib/format';

describe('formatDayLabel', () => {
  it('usa rótulos relativos para hoje e amanhã', () => {
    expect(formatDayLabel('2026-10-27', 0)).toBe('Hoje');
    expect(formatDayLabel('2026-10-28', 1)).toBe('Amanhã');
  });

  it('retorna o dia da semana para os demais índices', () => {
    expect(formatDayLabel('2026-10-29', 2)).toBe('quinta-feira');
  });
});

describe('getShortDate', () => {
  it('formata a data local como dd/MM', () => {
    expect(getShortDate('2026-10-27')).toBe('27/10');
  });
});
