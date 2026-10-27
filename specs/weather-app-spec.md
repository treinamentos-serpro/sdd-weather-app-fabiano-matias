# Especificação de Produto — Weather App

## Overview

Aplicação web responsiva para buscar uma cidade e consultar seu clima atual e a previsão diária de hoje mais quatro dias. A versão inicial atende às personas hipotéticas do discovery: rotina diária, planejamento de viagem e atividades ao ar livre.

- **Idioma:** pt-BR; datas no formato `dd/MM` e horário de 24 horas.
- **Dados:** Open-Meteo, sem API key, sujeito à verificação de termos e atribuição antes da distribuição.
- **Unidades:** Celsius inicial; Fahrenheit disponível. Vento em km/h, precipitação em mm e probabilidade em porcentagem.
- **Conta e armazenamento:** sem autenticação, persistência de servidor, geolocalização automática ou armazenamento local de preferências. A unidade volta a Celsius ao iniciar uma nova visita.
- **Plataforma:** web responsiva; aplicativo nativo não faz parte da versão inicial.

## Functional Requirements

- **FR-01 — Buscar cidades:** aceitar nome de cidade, opcionalmente acompanhado por região ou país, com pelo menos dois caracteres após remover espaços nas extremidades; aceitar caracteres Unicode; exibir no máximo cinco localidades cobertas pelo serviço, em ordem de relevância retornada, com cidade, região e país quando disponíveis.
- **FR-02 — Selecionar localidade:** exigir seleção explícita de um resultado. A seleção determina a localidade usada para clima atual e previsão; nomes iguais não podem ser selecionados implicitamente.
- **FR-03 — Consultar clima atual:** apresentar temperatura, condição meteorológica, sensação térmica, umidade relativa e velocidade do vento quando fornecidas. Temperatura e condição são campos essenciais; outros campos ausentes são omitidos. Exibir também a hora de referência retornada pelo provedor, convertida para o horário local.
- **FR-04 — Consultar previsão:** apresentar cinco entradas diárias, de hoje até hoje + 4, no fuso horário da localidade. Cada entrada apresenta data, condição e temperaturas mínima/máxima; probabilidade máxima de precipitação é exibida quando fornecida.
- **FR-05 — Alternar temperatura:** permitir alternar entre Celsius e Fahrenheit em todas as temperaturas visíveis. Converter o valor original e arredondar ao inteiro mais próximo; mostrar `°C` ou `°F` junto ao valor. A preferência dura apenas até o fim da visita atual.
- **FR-06 — Usar em dispositivos móveis:** permitir concluir busca, seleção e consulta em telas de 320 CSS px de largura ou maiores, sem controles cortados nem rolagem horizontal.
- **FR-07 — Comunicar estados:** apresentar estados distintos para busca vazia, carregamento, nenhum resultado, resposta parcial, falha e timeout. Falhas permitem nova tentativa manual e não apresentam dados antigos como atuais.

## User Stories

- **US-01:** Como Decisora da rotina diária, quero ver o clima atual da cidade selecionada para me preparar para o dia (FR-02, FR-03).
- **US-02:** Como Planejador de viagem, quero consultar cinco dias do destino para organizar o que levar (FR-04).
- **US-03:** Como Praticante de atividades ao ar livre, quero comparar as mínimas, máximas e condições dos próximos dias para planejar atividades (FR-04).
- **US-04:** Como Decisora da rotina diária, quero buscar e identificar a cidade correta para consultar seus dados meteorológicos (FR-01, FR-02).
- **US-05:** Como Decisora da rotina diária, quero escolher Celsius ou Fahrenheit para interpretar as temperaturas na unidade que prefiro (FR-05).
- **US-06:** Como Decisora da rotina diária, quero concluir a consulta pelo celular para me preparar antes de sair (FR-06).
- **US-07:** Como Planejador de viagem, quero saber quando uma consulta está carregando, incompleta ou falhou para decidir se posso usar os dados ou tentar novamente (FR-07).

## Acceptance Criteria

- **AC-01 — Busca (FR-01):** **Given** o campo de busca vazio, **When** a pessoa envia a busca, **Then** o sistema exibe “Digite o nome de uma cidade.” e não chama o serviço de geocoding. **Given** uma consulta com menos de dois caracteres após trim, **When** enviada, **Then** exibe “Digite ao menos 2 caracteres.” sem chamada externa. **Given** consulta válida e duas localidades na resposta, **When** a busca termina, **Then** apresenta exatamente essas duas opções com os metadados disponíveis. **Given** oito localidades na resposta, **When** os resultados são exibidos, **Then** apresenta somente as cinco primeiras na ordem recebida.
- **AC-02 — Resultado vazio (FR-01, FR-07):** **Given** uma busca válida cuja resposta bem-sucedida contém zero localidades, **When** a busca termina, **Then** exibe “Nenhuma cidade encontrada. Confira a grafia ou tente informar cidade e país.”, preserva a consulta e não solicita dados meteorológicos.
- **AC-03 — Seleção (FR-02):** **Given** dois resultados com identificadores geográficos distintos, **When** a pessoa seleciona o segundo, **Then** a localidade selecionada corresponde ao segundo resultado e as consultas de clima atual e previsão usam suas coordenadas e fuso horário, nunca os do primeiro.
- **AC-04 — Clima atual (FR-03):** **Given** resposta de teste para a cidade selecionada com 20 °C, condição “Céu limpo”, sensação térmica 19 °C, umidade 60%, vento 12 km/h e hora local 10:30, **When** os dados são carregados, **Then** esses valores e o nome da cidade ficam visíveis com rótulos e unidades corretos e a hora aparece em formato de 24 horas.
- **AC-05 — Previsão (FR-04):** **Given** relógio de teste em 10/06 e fuso `America/Sao_Paulo`, com cinco previsões diárias de 10 a 14/06, **When** a previsão é carregada, **Then** exibe exatamente essas cinco datas em ordem, com condição, mínima, máxima e unidade, sem entrada para 15/06.
- **AC-06 — Unidade inicial (FR-05):** **Given** uma nova visita e resposta com 20 °C, **When** o clima é exibido, **Then** mostra `20 °C`.
- **AC-07 — Conversão (FR-05):** **Given** temperaturas de 20 °C, 0 °C e 10 °C no clima atual e previsão, **When** a pessoa seleciona Fahrenheit, **Then** mostra 68 °F, 32 °F e 50 °F em todos esses campos; **When** seleciona Celsius, **Then** mostra novamente 20 °C, 0 °C e 10 °C.
- **AC-08 — Responsividade (FR-06):** **Given** viewport de 320 × 640 e depois 1280 × 800 CSS px, **When** a pessoa completa busca, seleção e consulta, **Then** todos os controles ficam visíveis e operáveis, sem rolagem horizontal.
- **AC-09 — Carregamento e falha (FR-07):** **Given** consulta pendente, **When** a resposta ainda não chegou, **Then** “Carregando...” é anunciado por `role=status`. **Given** erro de rede, erro do provedor ou timeout, **When** a solicitação termina, **Then** “Não foi possível carregar os dados. Tente novamente.” é anunciado por `role=alert`, um botão “Tentar novamente” é exibido e dados anteriores não são apresentados como atuais. **When** a nova tentativa retorna dados válidos, **Then** o alerta desaparece e os dados da localidade selecionada são apresentados.
- **AC-10 — Resposta parcial (FR-03, FR-04, FR-07):** **Given** resposta atual sem sensação térmica, umidade ou vento, mas com temperatura e condição, **When** os dados são exibidos, **Then** os campos ausentes são omitidos e não recebem valor substituto. **Given** ausência de temperatura ou condição atual, **When** a resposta é processada, **Then** o sistema apresenta o estado de falha e não mostra o cartão como completo. **Given** previsão de cinco dias com probabilidade de precipitação ausente em um dia, **When** a previsão é exibida, **Then** esse campo é omitido apenas nesse dia. **Given** um dia sem data, condição, mínima ou máxima, **When** a previsão é exibida, **Then** esse dia apresenta “Previsão indisponível” e os demais dias válidos continuam visíveis.
- **AC-11 — Idioma (FR-07):** **Given** qualquer estado coberto pelos critérios, **When** exibido, **Then** rótulos, mensagens, datas e controles usam pt-BR, datas `dd/MM` e horas de 24 horas.
- **AC-12 — Falha de busca (FR-01, FR-07):** **Given** uma busca válida e uma falha de rede ou do serviço de geocoding, **When** a solicitação termina, **Then** “Não foi possível buscar cidades. Tente novamente.” é anunciado por `role=alert`, o texto pesquisado permanece no campo, o botão “Tentar novamente” é exibido e nenhuma consulta meteorológica é iniciada. **When** a pessoa tenta novamente e a busca retorna resultados, **Then** o alerta desaparece e os resultados são exibidos.

## Non-Functional Requirements

- **NFR-01 — Desempenho:** com o provedor respondendo e conexão de referência de 10 Mbps/100 ms RTT, busca deve ter p95 ≤ 2 s e consulta meteorológica p95 ≤ 4 s, medidos do envio ao conteúdo utilizável. Solicitações encerram em até 8 s e então mostram o estado de timeout.
- **NFR-02 — Acessibilidade:** conformidade WCAG 2.2 AA nos fluxos principais; busca, seleção, unidade e nova tentativa operáveis por teclado; foco visível; mensagens de estado anunciadas; contraste mínimo conforme WCAG 2.2 AA.
- **NFR-03 — Compatibilidade e responsividade:** suportar versões estáveis atual e anterior de Chrome, Edge, Firefox e Safari; Safari no iOS e Chrome no Android. Testar larguras de 320 a 1920 CSS px.
- **NFR-04 — Confiabilidade:** não tratar ausência de resposta, resposta inválida ou campo essencial ausente como dado atual válido. Sem funcionamento offline ou cache de dados meteorológicos na versão inicial.
- **NFR-05 — Privacidade e transporte:** usar HTTPS; não coletar localização nem armazenar consultas ou preferências entre visitas; não enviar dados além do texto de busca e da localidade selecionada necessários às consultas do provedor.
- **NFR-06 — Atualidade:** carregar dados ao selecionar uma localidade e mostrar a hora de referência retornada pelo provedor; não declarar os dados “em tempo real”. Não há atualização automática na versão inicial.

## Traceability Matrix

| User Story | Requisitos funcionais | Acceptance Criteria | NFRs relevantes |
| --- | --- | --- | --- |
| US-01 — Consulta do clima atual | FR-02, FR-03 | AC-03, AC-04, AC-09, AC-10, AC-11 | NFR-01 (latência), NFR-02 (acessibilidade), NFR-03 (dispositivos suportados), NFR-04 (dados válidos), NFR-06 (hora de referência) |
| US-02 — Planejamento de viagem | FR-02, FR-04 | AC-03, AC-05, AC-09, AC-10, AC-11 | NFR-01 (latência), NFR-02 (acessibilidade), NFR-03 (dispositivos suportados), NFR-04 (dados válidos), NFR-06 (atualidade) |
| US-03 — Atividade ao ar livre | FR-02, FR-04 | AC-03, AC-05, AC-09, AC-10, AC-11 | NFR-01 (latência), NFR-02 (acessibilidade), NFR-03 (dispositivos suportados), NFR-04 (dados válidos), NFR-06 (atualidade) |
| US-04 — Encontrar a localidade correta | FR-01, FR-02 | AC-01, AC-02, AC-03, AC-11, AC-12 | NFR-01 (tempo de busca), NFR-02 (busca por teclado), NFR-03 (compatibilidade), NFR-04 (falha de serviço), NFR-05 (dados enviados ao provedor) |
| US-05 — Escolher unidade | FR-05 | AC-06, AC-07, AC-11 | NFR-02 (controle acessível), NFR-03 (compatibilidade/responsividade) |
| US-06 — Consultar pelo celular | FR-01, FR-02, FR-03, FR-04, FR-06 | AC-01, AC-03, AC-04, AC-05, AC-08, AC-11 | NFR-01 (latência), NFR-02 (acessibilidade), NFR-03 (dispositivos suportados), NFR-04 (dados válidos), NFR-06 (atualidade) |
| US-07 — Entender falhas de consulta | FR-01, FR-03, FR-04, FR-07 | AC-02, AC-09, AC-10, AC-11, AC-12 | NFR-01 (limite de timeout), NFR-02 (anúncio de estados), NFR-04 (tratamento de dados inválidos) |

## Edge Cases

- **Input vazio/espaços:** rejeitar antes da chamada externa, preservando o foco no campo e mostrando a mensagem do AC-01; remover espaços apenas das extremidades.
- **Caracteres especiais:** enviar nomes acentuados, apóstrofos, hífens e Unicode sem alteração semântica; manter o texto digitado. Sem resultado, usar o AC-02.
- **Cidade inexistente/geocoding vazio:** tratar resposta bem-sucedida sem resultados como estado vazio, nunca como falha do provedor; usar uma única mensagem definida no AC-02 e não consultar previsão.
- **Falha de geocoding:** exibir “Não foi possível buscar cidades. Tente novamente.” e oferecer nova tentativa; não limpar a consulta nem solicitar clima.
- **Falha meteorológica/timeout:** aplicar AC-09; timeout após 8 s. Resposta tardia de uma solicitação encerrada não pode substituir dados de uma seleção mais recente.
- **Resposta parcial:** aplicar AC-10; em previsão diária, omitir apenas o campo ausente; se data, mínima/máxima ou condição estiver ausente para um dia, mostrar “Previsão indisponível” nesse dia e manter as demais datas.
- **Resultados homônimos:** apresentar região e país quando disponíveis e exigir seleção explícita; se os metadados não distinguirem os resultados, não selecionar automaticamente.
- **Consultas concorrentes:** somente a resposta da seleção mais recente pode atualizar a tela.
- **Mudança de dia/fuso:** usar o fuso IANA retornado para a localidade selecionada para determinar “hoje” e formatar as cinco datas.
- **Campo opcional ausente ou conversão:** omitir o campo ausente; converter apenas temperaturas presentes e manter intactas demais unidades.

## Assumptions

- A aplicação inicial é web responsiva, não nativa.
- A cobertura geográfica é a oferecida pelo serviço Open-Meteo; localidades não retornadas não podem ser consultadas.
- “Hoje” é calculado no fuso IANA da localidade selecionada.
- A unidade selecionada vale apenas durante a visita atual; uma nova visita começa em Celsius.
- Personas são hipóteses de discovery, não resultados de pesquisa validada.

## Risks

| Risco | Impacto | Mitigação |
| --- | --- | --- |
| Open-Meteo indisponível, limitado ou com cobertura insuficiente | Consultas falham ou localidades não são encontradas | Verificar cobertura e termos antes da distribuição; manter erros e tentativas conforme AC-09. |
| Cidade homônima selecionada incorretamente | Exibição de clima de outra localidade | Exigir seleção explícita e exibir região/país quando disponíveis. |
| Dados incompletos ou atrasados | Decisões baseadas em valores ausentes ou antigos | Aplicar AC-10 e exibir hora de referência do provedor. |
| Uso móvel inacessível ou lento | Fluxo principal indisponível para parte do público | Validar NFR-01 a NFR-03 em dispositivos e navegadores suportados. |

## Out of Scope

- Aplicativos nativos para iOS/Android, contas, autenticação, perfil e persistência de dados ou preferências no servidor/dispositivo.
- Lista de cidades salvas, favoritos, comparação simultânea entre localidades ou seleção automática de mais de uma cidade.
- Histórico meteorológico, previsão horária, mapas/radar, qualidade do ar, índice UV, pólen, nascer/pôr do sol e alertas meteorológicos.
- Notificações, compartilhamento, widgets, atualização periódica ou botão de atualização manual fora da nova seleção e da tentativa de recuperação de falha.
- Geolocalização automática, funcionamento offline e cache de dados meteorológicos.
- Idiomas além de pt-BR e unidades além de Celsius/Fahrenheit, km/h, mm e porcentagem.

## Open Questions

- **Gate de distribuição:** confirmar termos de uso, atribuição exigida, limites de requisição e cobertura do Open-Meteo para os mercados pretendidos. A distribuição não deve ocorrer antes dessa confirmação.