import { formatMetric } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCodePresentation } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function formatObservedTime(observedAt: string): string {
  return /T\d{2}:\d{2}/.exec(observedAt)?.[0].slice(1) ?? '—';
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const condition = getWeatherCodePresentation(current.weatherCode);
  const locationDetails = [city.region, city.country].filter(Boolean).join(', ');

  return (
    <article
      aria-labelledby="current-weather-title"
      className="rounded-lg border border-white/10 bg-white/5 p-5 text-white shadow-glass backdrop-blur-md sm:p-7"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="current-weather-title" className="text-sm font-medium text-white/70">
            Clima atual
          </h2>
          <h3 className="mt-2 text-2xl font-semibold">
            {city.name?.trim() || 'Localidade indisponível'}
          </h3>
          {locationDetails && <p className="mt-1 text-sm text-white/60">{locationDetails}</p>}
        </div>

        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <span aria-hidden="true" className="shrink-0 text-4xl sm:text-6xl">
            {condition.icon}
          </span>
          <div className="min-w-0">
            <p
              role="status"
              aria-label="Temperatura atual"
              className="whitespace-nowrap text-5xl font-semibold leading-none tracking-normal sm:text-7xl"
            >
              {formatTemperature(current.temperatureC, unit)}
            </p>
            <p className="mt-2 text-base text-white/75">{condition.label}</p>
            {current.apparentTemperatureC !== undefined && (
              <p className="mt-1 text-sm text-white/75">
                Sensação térmica: {formatTemperature(current.apparentTemperatureC, unit)}
              </p>
            )}
            <p className="mt-1 text-sm text-white/55">
              Atualizado às {formatObservedTime(current.observedAt)}
            </p>
          </div>
        </div>
      </div>

      <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-5 sm:grid-cols-4">
        <div>
          <dt className="text-sm text-white/60">Umidade</dt>
          <dd className="mt-1 text-lg font-medium">
            {formatMetric(current.relativeHumidityPct, '%')}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-white/60">Vento</dt>
          <dd className="mt-1 text-lg font-medium">
            {formatMetric(current.windSpeedKmh, ' km/h')}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-white/60">Precipitação</dt>
          <dd className="mt-1 text-lg font-medium">
            {formatMetric(current.precipitationMm, ' mm')}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-white/60">Pressão</dt>
          <dd className="mt-1 text-lg font-medium">{formatMetric(current.pressureHpa, ' hPa')}</dd>
        </div>
      </dl>
    </article>
  );
}
