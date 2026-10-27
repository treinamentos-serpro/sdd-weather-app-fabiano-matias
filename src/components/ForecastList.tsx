import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-heading" className="w-full">
      <h2 id="forecast-heading" className="mb-4 text-lg font-semibold text-white">
        Previsão para os próximos dias
      </h2>
      <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day) => (
          <li key={day.dateLocal} className="min-w-0">
            <ForecastCard day={day} unit={unit} />
          </li>
        ))}
      </ul>
    </section>
  );
}
