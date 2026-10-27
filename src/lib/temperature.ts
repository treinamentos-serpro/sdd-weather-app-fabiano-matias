import type { Unit } from '../types/weather';

export function convertTemperature(temperatureC: number, unit: Unit): number {
  return unit === 'fahrenheit' ? (temperatureC * 9) / 5 + 32 : temperatureC;
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function formatTemperature(temperatureC: number | null | undefined, unit: Unit): string {
  if (typeof temperatureC !== 'number' || !Number.isFinite(temperatureC)) return '—';
  const temperature = convertTemperature(temperatureC, unit);
  if (!Number.isFinite(temperature)) return '—';

  return `${Math.round(temperature)} ${unitLabel(unit)}`;
}
