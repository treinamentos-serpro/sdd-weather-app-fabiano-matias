import type { Unit } from '../types/weather';

export function formatTemperature(temperatureC: number, unit: Unit): string {
  const temperature = unit === 'fahrenheit' ? (temperatureC * 9) / 5 + 32 : temperatureC;
  const symbol = unit === 'fahrenheit' ? '°F' : '°C';

  return `${Math.round(temperature)} ${symbol}`;
}
