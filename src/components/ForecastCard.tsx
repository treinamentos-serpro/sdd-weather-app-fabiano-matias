import { formatDayLabel, formatMetric, getShortDate } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCodePresentation } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const dayLabel = formatDayLabel(day.dateLocal, index);
  const shortDate = getShortDate(day.dateLocal);

  if (day.status === 'unavailable') {
    return (
      <article className="flex min-h-52 flex-col rounded-lg border border-white/10 bg-white/5 p-4 text-white shadow-glass backdrop-blur-md">
        <header>
          <h3 className="text-sm font-semibold capitalize text-white/85">{dayLabel}</h3>
          <time dateTime={day.dateLocal} className="mt-1 block text-xs text-white/65">
            {shortDate}
          </time>
        </header>
        <p className="mt-6 text-sm text-white/60">Previsão indisponível</p>
      </article>
    );
  }

  const condition = getWeatherCodePresentation(day.weatherCode);
  const precipitation = day.precipitationProbabilityMaxPct;

  return (
    <article className="flex min-h-52 flex-col rounded-lg border border-white/10 bg-white/5 p-4 text-white shadow-glass backdrop-blur-md">
      <header>
        <h3 className="text-sm font-semibold capitalize text-white/85">{dayLabel}</h3>
        <time dateTime={day.dateLocal} className="mt-1 block text-xs text-white/65">
          {shortDate}
        </time>
      </header>

      <div className="mt-4 flex flex-1 flex-col items-center text-center">
        <span aria-hidden="true" className="text-4xl">
          {condition.icon}
        </span>
        <p className="mt-2 min-h-10 text-sm text-white/70">{condition.label}</p>

        <dl className="mt-4 grid w-full grid-cols-2 gap-2 text-center">
          <div className="flex min-w-0 flex-col items-center gap-1">
            <dt className="text-xs text-white/70">Máxima</dt>
            <dd className="text-sm font-semibold">
              {formatTemperature(day.temperatureMaxC, unit)}
            </dd>
          </div>
          <div className="flex min-w-0 flex-col items-center gap-1">
            <dt className="text-xs text-white/70">Mínima</dt>
            <dd className="text-sm text-white/80">
              {formatTemperature(day.temperatureMinC, unit)}
            </dd>
          </div>
        </dl>
      </div>

      <p className="mt-4 border-t border-white/10 pt-3 text-center text-xs text-white/65">
        Chuva: {formatMetric(precipitation, '%')}
      </p>
    </article>
  );
}
