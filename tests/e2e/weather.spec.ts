import { expect, test } from '@playwright/test';

test('busca cidade, mostra previsão e alterna para Fahrenheit', async ({ page }) => {
  await page.route('**/v1/search**', async (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get('name')).toBe('São Paulo');

    await route.fulfill({
      json: {
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            latitude: -23.5505,
            longitude: -46.6333,
            timezone: 'America/Sao_Paulo',
            admin1: 'São Paulo',
            country: 'Brasil',
            country_code: 'BR',
          },
        ],
      },
    });
  });

  await page.route('**/v1/forecast**', async (route) => {
    const url = new URL(route.request().url());
    expect(url.searchParams.get('forecast_days')).toBe('5');
    expect(url.searchParams.get('temperature_unit')).toBe('celsius');

    await route.fulfill({
      json: {
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-10-27T09:00',
          temperature_2m: 0,
          relative_humidity_2m: 60,
          apparent_temperature: 0,
          weather_code: 0,
          wind_speed_10m: 12,
          precipitation: 0,
          surface_pressure: 1013,
        },
        daily: {
          time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
          weather_code: [0, 1, 2, 3, 45],
          temperature_2m_min: [0, 1, 2, 3, 4],
          temperature_2m_max: [10, 11, 12, 13, 14],
          precipitation_probability_max: [0, 10, 20, 30, 40],
        },
      },
    });
  });

  await page.goto('/');
  await page.getByLabel('Buscar cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByRole('status', { name: 'Temperatura atual' })).toHaveText('0 °C');

  await page.getByRole('button', { name: 'Fahrenheit' }).click();

  await expect(page.getByRole('status', { name: 'Temperatura atual' })).toHaveText('32 °F');
});

for (const scenario of [
  { name: 'sem results', body: {} },
  { name: 'com results vazio', body: { results: [] } },
]) {
  test(`mostra estado vazio quando o geocoding responde ${scenario.name}`, async ({ page }) => {
    let forecastRequests = 0;

    await page.route('**/v1/search**', async (route) => {
      await route.fulfill({ json: scenario.body });
    });
    await page.route('**/v1/forecast**', async (route) => {
      forecastRequests += 1;
      await route.fulfill({ json: {} });
    });

    await page.goto('/');
    await page.getByLabel('Buscar cidade').fill('Cidade sem resultados');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
    expect(forecastRequests).toBe(0);
  });
}

test('renderiza clima e previsão no viewport mobile 375 x 812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.route('**/v1/search**', async (route) => {
    await route.fulfill({
      json: {
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            latitude: -23.5505,
            longitude: -46.6333,
            timezone: 'America/Sao_Paulo',
            admin1: 'São Paulo',
            country: 'Brasil',
            country_code: 'BR',
          },
        ],
      },
    });
  });
  await page.route('**/v1/forecast**', async (route) => {
    await route.fulfill({
      json: {
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-10-27T09:00',
          temperature_2m: 18,
          relative_humidity_2m: 60,
          apparent_temperature: 18,
          weather_code: 1,
          wind_speed_10m: 12,
          precipitation: 0,
          surface_pressure: 1013,
        },
        daily: {
          time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
          weather_code: [1, 2, 3, 45, 61],
          temperature_2m_min: [14, 15, 16, 13, 12],
          temperature_2m_max: [22, 23, 24, 21, 20],
          precipitation_probability_max: [0, 10, 20, 30, 40],
        },
      },
    });
  });

  await page.goto('/');
  await page.getByLabel('Buscar cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Clima atual' })).toBeVisible();
  await expect(page.getByRole('status', { name: 'Temperatura atual' })).toHaveText('18 °C');
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(375);
});

test('recupera de falha HTTP do forecast por retry manual', async ({ page }) => {
  let forecastRequests = 0;

  await page.route('**/v1/search**', async (route) => {
    await route.fulfill({
      json: {
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            latitude: -23.5505,
            longitude: -46.6333,
            timezone: 'America/Sao_Paulo',
            admin1: 'São Paulo',
            country: 'Brasil',
            country_code: 'BR',
          },
        ],
      },
    });
  });
  await page.route('**/v1/forecast**', async (route) => {
    forecastRequests += 1;

    if (forecastRequests === 1) {
      await route.fulfill({ status: 503, json: { error: true } });
      return;
    }

    await route.fulfill({
      json: {
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-10-27T09:00',
          temperature_2m: 18,
          relative_humidity_2m: 60,
          apparent_temperature: 18,
          weather_code: 1,
          wind_speed_10m: 12,
          precipitation: 0,
          surface_pressure: 1013,
        },
        daily: {
          time: ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31'],
          weather_code: [1, 2, 3, 45, 61],
          temperature_2m_min: [14, 15, 16, 13, 12],
          temperature_2m_max: [22, 23, 24, 21, 20],
          precipitation_probability_max: [0, 10, 20, 30, 40],
        },
      },
    });
  });

  await page.goto('/');
  await page.getByLabel('Buscar cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('alert')).toContainText(
    'O serviço de clima está indisponível. Tente novamente mais tarde.',
  );
  await page.getByRole('button', { name: 'Tentar novamente' }).click();

  await expect(page.getByRole('heading', { name: 'Clima atual' })).toBeVisible();
  await expect(page.getByRole('status', { name: 'Temperatura atual' })).toHaveText('18 °C');
  expect(forecastRequests).toBe(2);
});

for (const input of ['', '   ']) {
  test(`busca ${JSON.stringify(input)} não inicia chamadas de API`, async ({ page }) => {
    const requests: string[] = [];
    await page.route('https://*.open-meteo.com/**', async (route) => {
      requests.push(route.request().url());
      await route.fulfill({ json: {} });
    });

    await page.goto('/');
    await page.getByLabel('Buscar cidade').fill(input);
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();

    await expect(
      page.getByRole('heading', { name: 'Consulte o tempo da sua cidade' }),
    ).toBeVisible();
    await expect(page.getByRole('alert')).toHaveText('Digite o nome de uma cidade.');
    await expect(page.getByLabel('Buscar cidade')).toBeFocused();
    await expect(page.getByRole('button', { name: 'Buscar', exact: true })).toBeEnabled();
    expect(requests).toEqual([]);
  });
}

test('preserva caracteres especiais na busca e no campo após resultado vazio', async ({ page }) => {
  const query = "L'Haÿ-les-Roses & 東京";
  await page.route('**/v1/search**', async (route) => {
    expect(new URL(route.request().url()).searchParams.get('name')).toBe(query);
    await route.fulfill({ json: { results: [] } });
  });

  await page.goto('/');
  await page.getByLabel('Buscar cidade').fill(query);
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  await expect(page.getByLabel('Buscar cidade')).toHaveValue(query);
  await expect(page.getByRole('alert')).toHaveCount(0);
});

for (const missingField of ['current', 'daily']) {
  test(`forecast sem ${missingField} mostra erro e oferece retry`, async ({ page }) => {
    await page.route('**/v1/search**', async (route) => {
      await route.fulfill({
        json: {
          results: [
            {
              id: 3448439,
              name: 'São Paulo',
              latitude: -23.5505,
              longitude: -46.6333,
              timezone: 'America/Sao_Paulo',
            },
          ],
        },
      });
    });
    await page.route('**/v1/forecast**', async (route) => {
      const payload = { timezone: 'America/Sao_Paulo', current: {}, daily: {} };
      Reflect.deleteProperty(payload, missingField);
      await route.fulfill({ json: payload });
    });

    await page.goto('/');
    await page.getByLabel('Buscar cidade').fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();

    await expect(page.getByRole('alert')).toContainText(
      'Não foi possível obter dados válidos do clima. Tente novamente.',
    );
    await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeEnabled();
    await expect(page.getByRole('article', { name: 'Clima atual' })).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toHaveCount(0);
  });
}
