import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import { mockWeatherData } from '../../src/mocks/weather';

describe('CurrentWeather: sensação térmica', () => {
  it('exibe o campo quando fornecido e o converte junto à temperatura atual', () => {
    const { rerender } = render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={mockWeatherData.current}
        unit="celsius"
      />,
    );
    expect(screen.getByText('Sensação térmica: 19 °C')).toBeInTheDocument();
    rerender(
      <CurrentWeather
        city={mockWeatherData.city}
        current={mockWeatherData.current}
        unit="fahrenheit"
      />,
    );
    expect(screen.getByText('Sensação térmica: 66 °F')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Temperatura atual' })).toHaveTextContent('68 °F');
  });

  it('omite sensação térmica ausente', () => {
    const current = { ...mockWeatherData.current, apparentTemperatureC: undefined };
    render(<CurrentWeather city={mockWeatherData.city} current={current} unit="celsius" />);
    expect(screen.queryByText(/Sensação térmica:/)).not.toBeInTheDocument();
  });
});
