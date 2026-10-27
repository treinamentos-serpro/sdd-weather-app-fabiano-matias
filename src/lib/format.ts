export function formatDayLabel(dateLocal: string): string {
  const date = new Date(`${dateLocal}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) return dateLocal;

  const weekday = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    weekday: 'short',
  }).format(date);
  const dayAndMonth = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
  }).format(date);

  return `${weekday.replace('.', '')}, ${dayAndMonth}`;
}
