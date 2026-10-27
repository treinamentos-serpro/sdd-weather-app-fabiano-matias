const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC',
  weekday: 'long',
});

const shortDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC',
  day: '2-digit',
  month: '2-digit',
});

export function formatMetric(value: number | null | undefined, unit: string): string {
  return typeof value === 'number' && Number.isFinite(value) ? `${value}${unit}` : '—';
}

function parseLocalDate(dateLocal: string | null | undefined): Date | undefined {
  if (typeof dateLocal !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateLocal)) return undefined;
  const date = new Date(`${dateLocal}T12:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dateLocal
    ? undefined
    : date;
}

export function formatDayLabel(dateLocal: string | null | undefined, index: number): string {
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';

  const date = parseLocalDate(dateLocal);
  if (!date) return '—';

  return weekdayFormatter.format(date);
}

export function getShortDate(dateLocal: string | null | undefined): string {
  const date = parseLocalDate(dateLocal);
  if (!date) return '—';

  return shortDateFormatter.format(date);
}
