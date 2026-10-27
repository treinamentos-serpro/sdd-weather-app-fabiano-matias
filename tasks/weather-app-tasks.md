# Backlog de Tarefas — Weather App

Tarefas derivadas de [plans/weather-app-plan.md](../plans/weather-app-plan.md) e rastreadas à spec. A sequência das entregas representa a ordem de implementação; dependências explícitas podem ser usadas para paralelizar tarefas independentes.

- **Prioridade:** P0 = necessário para MVP ou liberação; P1 = hardening após a primeira fatia demonstrável e antes da validação final; P2 = opcional/post-MVP. Não há itens P2 porque o escopo aprovado não contém trabalho opcional.
- **Tamanho:** P = pequeno (uma mudança focada); M = médio (uma unidade funcional com vários arquivos/testes); G = grande (mais de uma unidade, deve ser dividido antes de iniciar). As tarefas atuais estão estimadas em P ou M.

## Sequência proposta em fatias verticais

1. **Busca visível:** implementar T-01, T-02, T-03, T-04, T-06 e T-08; preparar testes em paralelo com T-10 e validar a fatia com T-13, T-14 e T-16. Resultado demonstrável: pesquisar uma cidade, escolher entre resultados e ver estados vazio/erro, sem depender de forecast.
2. **Clima e previsão:** acrescentar T-05, T-07 e T-09; validar conversão/normalização com T-11/T-12, hook com T-15, UI com T-17 e fluxo integrado com T-18/T-19. Resultado demonstrável: clima atual, cinco dias e alternância de temperatura.
3. **Pronto para release:** concluir T-20, T-21 e T-22. Resultado: validação NFR/browser, gate legal do provedor e comandos de qualidade aprovados.

P0 entrega o fluxo de produto e seus testes essenciais; P1 vem depois da primeira demonstração, mas continua necessário para atender aos requisitos de produção. Tarefas de tamanhos G devem ser divididas antes de iniciar; nenhuma tarefa atual está estimada como G.

## Entrega 1 — Tipos e funções puras

### T-01 — Definir contratos TypeScript do domínio
- **Descrição:** criar os tipos compartilhados usados por integração, hooks e UI.
- **Prioridade:** P0.
- **Tamanho:** P.
- **Critérios de aceite:** `src/types/weather.ts` exporta `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `Unit`, `QueryStatus`, `DataCompleteness` e `QueryError`; `Unit` aceita somente `celsius`/`fahrenheit`; `QueryStatus` aceita somente `idle/loading/success/error/empty`; temperaturas do domínio são Celsius; `ForecastDay` é discriminado por `available/unavailable`; `pnpm build` termina sem erro de TypeScript.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data.
- **Rastreio:** FR-01 a FR-07; AC-01 a AC-12; NFR-04.

### T-02 — Implementar funções puras do domínio
- **Descrição:** criar conversão de temperatura, mapeamento WMO e normalização dos payloads.
- **Prioridade:** P0.
- **Tamanho:** M.
- **Critérios de aceite:** conversão retorna `68` para `20 °C` e `32` para `0 °C`, sem mutar o valor canônico; código WMO recebe rótulo pt-BR; arrays diários são alinhados pela mesma data; campo essencial ausente produz erro/dia indisponível e campo opcional ausente permanece ausente; funções não executam rede nem acessam DOM.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/mapOpenMeteo.ts`, `src/lib/weatherCode.ts`, `src/lib/temperature.ts`.
- **Tipo:** Data.
- **Rastreio:** FR-03 a FR-05; AC-04 a AC-07, AC-10.

## Entrega 2 — Services

### T-03 — Implementar services Open-Meteo
- **Descrição:** encapsular geocoding e forecast, parâmetros, timeout e erros de transporte.
- **Prioridade:** P0.
- **Tamanho:** M.
- **Critérios de aceite:** geocoding válido monta `name`, `count=5`, `language=pt`, `format=json`; forecast monta coordenadas, `timezone=auto`, `forecast_days=5` e unidades definidas no plano; funções aceitam `AbortSignal`; rede, HTTP, timeout de 8 s e resposta inválida resultam em `QueryError.kind` correspondente; payloads são normalizados antes de sair do service.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/services/openMeteo.ts`.
- **Tipo:** Data.
- **Rastreio:** FR-01 a FR-04, FR-07; AC-01 a AC-05, AC-09, AC-12; NFR-01, NFR-04, NFR-05.

## Entrega 3 — Hooks e estado

### T-04 — Implementar hook de busca de cidades
- **Descrição:** gerenciar validação, resultados, estado vazio, erro e retry manual.
- **Prioridade:** P0.
- **Tamanho:** M.
- **Critérios de aceite:** input vazio/menor que dois caracteres não chama o service; busca válida percorre `idle → loading → success`; zero resultados terminam em `empty`; falha termina em `error`; consulta permanece após vazio/erro; são expostas no máximo cinco opções; resposta obsoleta não substitui a busca mais recente.
- **Dependências:** T-01, T-03.
- **Arquivos prováveis:** `src/hooks/useCitySearch.ts`.
- **Tipo:** UI.
- **Rastreio:** FR-01, FR-02, FR-07; AC-01 a AC-03, AC-12.

### T-05 — Implementar hook de clima
- **Descrição:** gerenciar cidade selecionada, WeatherData, status, erro e retry manual.
- **Prioridade:** P0.
- **Tamanho:** M.
- **Critérios de aceite:** antes da seleção Forecast não é chamado; seleção usa as coordenadas escolhidas; estados são `idle/loading/success/error`; timeout ocorre em 8 s; retry repete a cidade selecionada; mudança de cidade cancela a solicitação anterior; dados anteriores não são apresentados como atuais; resposta parcial retorna `success` com `completeness = 'partial'`.
- **Dependências:** T-01, T-02, T-03.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** UI.
- **Rastreio:** FR-02 a FR-04, FR-07; AC-03 a AC-05, AC-09, AC-10; NFR-01, NFR-04, NFR-06.

## Entrega 4 — Componentes

### T-06 — Criar busca e estados acessíveis
- **Descrição:** implementar UI de busca, resultados e mensagens, sem acesso direto a APIs.
- **Prioridade:** P0.
- **Tamanho:** M.
- **Critérios de aceite:** selecionar uma opção chama apenas o callback dessa opção; resultados exibem cidade e região/país quando fornecidos; mensagens correspondem aos AC-01, AC-02, AC-09 e AC-12; loading usa `role=status`, erro usa `role=alert`; input, opções e retry são operáveis por teclado.
- **Dependências:** T-04.
- **Arquivos prováveis:** `src/components/CitySearch.tsx`, `src/components/QueryStatus.tsx`.
- **Tipo:** UI.
- **Rastreio:** FR-01, FR-02, FR-07; AC-01 a AC-03, AC-09, AC-12; NFR-02.

### T-07 — Criar apresentação meteorológica e unidade
- **Descrição:** renderizar clima atual, cinco dias e controle Celsius/Fahrenheit usando modelos do domínio.
- **Prioridade:** P0.
- **Tamanho:** M.
- **Critérios de aceite:** renderiza os campos definidos para clima e previsão; ausências opcionais não geram valor substituto; dia indisponível mostra “Previsão indisponível”; todos os valores de temperatura são derivados de Celsius via função pura; componentes não importam services nem nomes de campo Open-Meteo.
- **Dependências:** T-01, T-02, T-05.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/ForecastList.tsx`, `src/components/TemperatureUnitToggle.tsx`.
- **Tipo:** UI.
- **Rastreio:** FR-03 a FR-05, FR-07; AC-04 a AC-07, AC-10.

## Entrega 5 — Integração da aplicação

### T-08 — Integrar a fatia vertical de busca
- **Descrição:** compor a busca real na tela principal antes de integrar dados meteorológicos.
- **Prioridade:** P0.
- **Tamanho:** P.
- **Critérios de aceite:** `App` conecta `useCitySearch`, `CitySearch` e `QueryStatus`; submeter busca válida exibe resultados selecionáveis; vazio/erro mostra a mensagem correspondente; selecionar cidade define a seleção sem chamar Forecast; layout usa Tailwind dark glassmorphism e não tem overflow horizontal em 320 × 640 CSS px.
- **Dependências:** T-04, T-06.
- **Arquivos prováveis:** `src/App.tsx`, `src/main.tsx`, `src/index.css`.
- **Tipo:** UI.
- **Rastreio:** FR-01, FR-02, FR-07; AC-01 a AC-03, AC-12; NFR-02, NFR-03.

### T-09 — Integrar clima atual, previsão e unidade
- **Descrição:** completar a tela usando a cidade selecionada para carregar e apresentar clima e previsão.
- **Prioridade:** P0.
- **Tamanho:** M.
- **Critérios de aceite:** ao selecionar uma cidade, `App` conecta `useWeather` a `CurrentWeather`, `ForecastList` e `TemperatureUnitToggle`; exibe clima atual e cinco dias; loading/erro/retry funcionam; alternar unidade não aciona Forecast; em 1280 × 800 CSS px não há overflow horizontal.
- **Dependências:** T-05, T-07, T-08.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/CurrentWeather.tsx`, `src/components/ForecastList.tsx`, `src/components/TemperatureUnitToggle.tsx`.
- **Tipo:** UI.
- **Rastreio:** FR-02 a FR-07; AC-03 a AC-11; NFR-01 a NFR-03, NFR-06.

## Entrega 6 — Testes

### T-10 — Preparar a configuração Vitest
- **Descrição:** habilitar setup comum e descoberta de testes unitários, de services, hooks e componentes.
- **Prioridade:** P0.
- **Tamanho:** P.
- **Critérios de aceite:** `tests/setup.ts` carrega `@testing-library/jest-dom/vitest`; include do Vitest cobre `tests/unit`, `tests/services`, `tests/hooks` e `tests/components`, excluindo `tests/e2e`; `pnpm test -- --passWithNoTests` termina com código 0.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `vite.config.ts`, `tests/setup.ts`.
- **Tipo:** Infra.
- **Rastreio:** AC-01 a AC-12; NFR-01 a NFR-03; Testing Strategy do plano.

### T-11 — Testar conversão de unidade
- **Descrição:** testar isoladamente as conversões e formatações Celsius/Fahrenheit com Vitest.
- **Prioridade:** P0.
- **Tamanho:** P.
- **Critérios de aceite:** testes afirmam `20 °C → 68 °F`, `0 °C → 32 °F`, conversão inversa e arredondamento conforme AC-07; verificam que o valor canônico não é mutado; não importam DOM nem chamam `fetch`.
- **Dependências:** T-02, T-10.
- **Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`.
- **Tipo:** Test.
- **Rastreio:** FR-05; AC-06, AC-07.

### T-12 — Testar normalização e códigos meteorológicos
- **Descrição:** cobrir parsing, validação e mapeamento WMO com testes unitários puros.
- **Prioridade:** P0.
- **Tamanho:** M.
- **Critérios de aceite:** testes cobrem código WMO conhecido, campos opcionais ausentes, temperatura/código atual essencial ausente, dia essencial incompleto e arrays diários desalinhados; nenhum teste importa DOM ou chama `fetch`.
- **Dependências:** T-02, T-03, T-10.
- **Arquivos prováveis:** `tests/unit/lib/mapOpenMeteo.test.ts`, `tests/unit/lib/weatherCode.test.ts`.
- **Tipo:** Test.
- **Rastreio:** FR-03, FR-04; AC-04, AC-05, AC-10; NFR-04.

### T-13 — Testar service com mock de fetch
- **Descrição:** validar requests e respostas sem rede externa.
- **Prioridade:** P0.
- **Tamanho:** M.
- **Critérios de aceite:** `fetch` mockado confirma URL e cada parâmetro de ambas as APIs; cobre Unicode, zero resultados, oito cidades limitadas a cinco, HTTP 429/5xx, falha de rede, JSON inválido, timeout de 8 s, `AbortSignal` cancelado e payload parcial; nenhum teste faz conexão externa.
- **Dependências:** T-03, T-10.
- **Arquivos prováveis:** `tests/services/openMeteo.test.ts`.
- **Tipo:** Test.
- **Rastreio:** AC-01 a AC-03, AC-09, AC-10, AC-12; NFR-01, NFR-04.

### T-14 — Testar hook de busca
- **Descrição:** cobrir transições de estado e ações de geocoding com service controlado.
- **Prioridade:** P0.
- **Tamanho:** P.
- **Critérios de aceite:** testes afirmam `idle → loading → success`, zero resultados em `empty`, rejeição em `error`, zero chamadas para input inválido, retenção da consulta, uma chamada por retry e descarte de resposta atrasada da busca anterior.
- **Dependências:** T-04, T-10.
- **Arquivos prováveis:** `tests/hooks/useCitySearch.test.ts`.
- **Tipo:** Test.
- **Rastreio:** FR-01, FR-02, FR-07; AC-01 a AC-03, AC-12.

### T-15 — Testar hook de clima
- **Descrição:** verificar estado, retry, timeout, cancelamento e parcialidade com services controlados.
- **Prioridade:** P0.
- **Tamanho:** M.
- **Critérios de aceite:** testes verificam `idle/loading/success/error`, coordenadas solicitadas, retry manual, timeout com relógio falso em 8 s, cancelamento, resposta obsoleta ignorada, campo essencial em `error` e campo opcional em `success/partial`; sem rede real.
- **Dependências:** T-05, T-10.
- **Arquivos prováveis:** `tests/hooks/useWeather.test.ts`.
- **Tipo:** Test.
- **Rastreio:** FR-02 a FR-04, FR-07; AC-03 a AC-05, AC-09, AC-10.

### T-16 — Testar componentes nos estados de busca
- **Descrição:** validar interação, mensagens e acessibilidade dos componentes de busca/status.
- **Prioridade:** P0.
- **Tamanho:** M.
- **Critérios de aceite:** Testing Library renderiza e afirma os estados `loading`, `error`, `empty` e `success`; cobre input vazio, submit, escolha do segundo resultado, textos AC-01/02/09/12, roles `status/alert`, foco/teclado e retry; componentes não executam requests durante renderização ou interação.
- **Dependências:** T-06, T-10.
- **Arquivos prováveis:** `tests/components/CitySearch.test.tsx`, `tests/components/QueryStatus.test.tsx`.
- **Tipo:** Test.
- **Rastreio:** AC-01 a AC-03, AC-09, AC-12; NFR-02.

### T-17 — Testar apresentação meteorológica
- **Descrição:** validar campos meteorológicos, estado parcial e conversão no UI.
- **Prioridade:** P0.
- **Tamanho:** M.
- **Critérios de aceite:** fixtures afirmam campos/rótulos/unidades de AC-04/05; campo opcional ausente é omitido; dia indisponível mostra “Previsão indisponível”; todas as temperaturas refletem a prop `Unit`; alternar unidade não chama service.
- **Dependências:** T-07, T-10.
- **Arquivos prováveis:** `tests/components/CurrentWeather.test.tsx`, `tests/components/ForecastList.test.tsx`, `tests/components/TemperatureUnitToggle.test.tsx`.
- **Tipo:** Test.
- **Rastreio:** AC-04 a AC-07, AC-10, AC-11; NFR-02.

### T-18 — Configurar matriz Playwright
- **Descrição:** habilitar projetos desktop e mobile para a matriz de compatibilidade da spec.
- **Prioridade:** P1.
- **Tamanho:** M.
- **Critérios de aceite:** configuração declara Chromium, Firefox, WebKit, WebKit/iOS e Chromium/Android; `pnpm exec playwright test --list` carrega a configuração; a matriz documenta navegadores atuais e anteriores requeridos e identifica execução em CI versus validação manual.
- **Dependências:** T-09.
- **Arquivos prováveis:** `playwright.config.ts`, `docs/browser-matrix.md`.
- **Tipo:** Infra.
- **Rastreio:** FR-06; AC-08; NFR-03.

### T-19 — Testar fluxo E2E principal em desktop e mobile
- **Descrição:** validar o percurso principal e estados de erro em navegador com APIs interceptadas.
- **Prioridade:** P0.
- **Tamanho:** M.
- **Critérios de aceite:** Playwright executa busca → seleção → clima/previsão → alternância em viewport desktop e em viewport mobile de 320 × 640 CSS px; testa também input vazio, zero resultados, falha de geocoding, timeout/retry, resposta parcial e resposta antiga após troca de cidade; todas as rotas Open-Meteo são interceptadas e não há conexão externa.
- **Dependências:** T-09, T-18.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`, `tests/e2e/fixtures/openMeteo.ts`.
- **Tipo:** Test.
- **Rastreio:** AC-01 a AC-12; FR-01 a FR-07.

### T-20 — Verificar acessibilidade, viewports e desempenho
- **Descrição:** validar NFRs em browser sob condições de teste documentadas.
- **Prioridade:** P1.
- **Tamanho:** M.
- **Critérios de aceite:** fluxos passam por teclado e anunciam loading/erro; 320 × 640 e 1280 × 800 não têm overflow horizontal; relatório registra perfil de rede, amostras e p95; aprovação requer busca ≤ 2 s, consulta ≤ 4 s e timeout em 8 s.
- **Dependências:** T-18, T-19.
- **Arquivos prováveis:** `tests/e2e/nfr.spec.ts`, `docs/quality-results.md`.
- **Tipo:** Test.
- **Rastreio:** AC-08, AC-09; NFR-01 a NFR-03.

## Entrega 7 — Hardening e liberação

### T-21 — Validar termos e cobertura Open-Meteo
- **Descrição:** confirmar o gate do provedor antes da distribuição.
- **Prioridade:** P0.
- **Tamanho:** P.
- **Critérios de aceite:** registro contém URL oficial e data de consulta para termos/licença, atribuição, limites e cobertura das localidades-alvo; cada item é marcado `aprovado` ou `bloqueia distribuição`; distribuição só é liberada quando todos estiverem aprovados.
- **Dependências:** T-03.
- **Arquivos prováveis:** `docs/open-meteo-review.md`.
- **Tipo:** Infra.
- **Rastreio:** Spec — Open Questions (gate de distribuição) e Risks (limites/licença/cobertura do provedor).

### T-22 — Executar gates de qualidade da entrega
- **Descrição:** rodar validação final de lint, build e suítes de teste.
- **Prioridade:** P0.
- **Tamanho:** M.
- **Critérios de aceite:** em ambiente com dependências instaladas, `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` retornam código 0; CI não contém falhas ou testes ignorados sem justificativa.
- **Dependências:** T-11 a T-21.
- **Arquivos prováveis:** `src/`, `tests/` e configurações relacionadas.
- **Tipo:** Test.
- **Rastreio:** FR-01 a FR-07; AC-01 a AC-12; NFR-01 a NFR-04; checklist de validação de código em `.github/copilot-instructions.md`.

## Matriz de rastreabilidade — Requisitos Funcionais

| Requisito da spec | Tarefas de implementação | Tarefas de teste/validação |
| --- | --- | --- |
| FR-01 — Buscar cidades | T-03, T-04, T-06, T-08 | T-13, T-14, T-16, T-19 |
| FR-02 — Selecionar localidade | T-04, T-05, T-06, T-08, T-09 | T-14, T-15, T-16, T-19 |
| FR-03 — Consultar clima atual | T-02, T-03, T-05, T-07, T-09 | T-12, T-13, T-15, T-17, T-19 |
| FR-04 — Consultar previsão de cinco dias | T-02, T-03, T-05, T-07, T-09 | T-12, T-13, T-15, T-17, T-19 |
| FR-05 — Alternar unidade de temperatura | T-02, T-07, T-09 | T-11, T-17, T-19 |
| FR-06 — Usar em dispositivos móveis | T-08, T-09 | T-18, T-19, T-20 |
| FR-07 — Comunicar estados da consulta | T-03, T-04, T-05, T-06, T-07, T-08, T-09 | T-13, T-14, T-15, T-16, T-19 |

**Cobertura:** todos os requisitos funcionais FR-01 a FR-07 têm tarefas de implementação e teste/validação. Nenhum requisito funcional está sem tarefa correspondente.