export type Unit = 'celsius' | 'fahrenheit';

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export type DataCompleteness = 'complete' | 'partial';

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  region?: string;
  country?: string;
  countryCode?: string;
}

export interface CurrentWeather {
  observedAt: string;
  temperatureC: number;
  weatherCode: number;
  apparentTemperatureC?: number;
  relativeHumidityPct?: number;
  windSpeedKmh?: number;
  precipitationMm?: number;
  pressureHpa?: number;
}

export type ForecastDay =
  | {
      status: 'available';
      dateLocal: string;
      weatherCode: number;
      temperatureMinC: number;
      temperatureMaxC: number;
      precipitationProbabilityMaxPct?: number;
    }
  | {
      status: 'unavailable';
      dateLocal: string;
    };

export interface WeatherData {
  city: City;
  timezone: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
  completeness: DataCompleteness;
  retrievedAt: string;
}

export interface QueryError {
  kind: 'network' | 'timeout' | 'http' | 'invalid-response';
  message: string;
}
