# Análise de Discovery — Aplicação de Previsão do Tempo

## Resumo Executivo

- O produto permitirá buscar cidades, consultar o clima atual e a previsão de cinco dias, alternando entre Celsius e Fahrenheit, com acesso em dispositivos móveis.
- Os usos considerados incluem decisões da rotina diária, planejamento de viagens e atividades ao ar livre; essas personas ainda precisam ser validadas.
- Para a primeira versão, foram escolhidos Open-Meteo sem API key, previsão de hoje mais quatro dias, Celsius padrão, interface pt-BR e ausência de autenticação ou persistência no servidor.
- Ainda é necessário definir quais dados serão exibidos, como funcionará a busca e o início da experiência, e quais serão as regras de atualização, falhas e suporte a dispositivos.
- Os principais riscos são dados indisponíveis ou associados à cidade errada, experiência móvel inadequada e critérios de qualidade sem metas verificáveis; essas decisões devem ser fechadas antes da especificação.

## Contexto

A empresa solicitou uma aplicação para que usuários consultem informações meteorológicas de cidades. O briefing estabelece cinco capacidades principais: buscar cidades, consultar o clima atual, visualizar uma previsão de cinco dias, alternar entre Celsius e Fahrenheit e usar a aplicação em dispositivos móveis.

O briefing não define público-alvo específico, fonte dos dados, detalhes meteorológicos exibidos, comportamento para falhas nem metas mensuráveis de qualidade. Algumas decisões foram fechadas para destravar a especificação e estão registradas ao final deste documento; as demais lacunas permanecem em aberto.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise cidades para selecionar o local cujas condições meteorológicas deseja consultar.
- **RF-02 — Consultar clima atual:** apresentar as condições atuais da cidade selecionada.
- **RF-03 — Consultar previsão:** apresentar a previsão do tempo para um período de cinco dias da cidade selecionada.
- **RF-04 — Alternar unidade de temperatura:** permitir alternar a exibição da temperatura entre Celsius e Fahrenheit.
- **RF-05 — Acessar em dispositivos móveis:** disponibilizar as funcionalidades da aplicação em dispositivos móveis.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** a interface deve se adaptar a telas de dispositivos móveis, conforme exigido pelo briefing.
- **RNF-02 — Usabilidade:** busca, consulta das condições meteorológicas e alternância de unidade devem ser compreensíveis e utilizáveis.
- **RNF-03 — Desempenho:** buscas e informações meteorológicas devem ser apresentadas sem demora excessiva; o briefing não define um limite de tempo.
- **RNF-04 — Confiabilidade:** a aplicação deve lidar de forma adequada com indisponibilidade da rede ou da fonte de dados; o comportamento esperado ainda precisa ser definido.
- **RNF-05 — Acessibilidade:** a interface deve permitir que usuários com diferentes necessidades acessem as funções principais; critérios e nível de conformidade precisam ser definidos.

## Riscos

| Categoria | Risco | Probabilidade | Impacto | Estratégia de mitigação |
| --- | --- | --- | --- | --- |
| Técnico | O provedor meteorológico pode ficar indisponível, lento ou retornar dados incompletos. | Média | Alto: usuários podem não conseguir consultar o clima ou receber informações parciais. | Definir timeout, tratar falhas e respostas inválidas, apresentar estado de erro com nova tentativa e avaliar cache de dados recentes. |
| Técnico | Limites de uso, mudanças de contrato ou requisitos de licença do provedor podem restringir o serviço. | Média | Alto: consultas podem falhar ou a aplicação pode incorrer em custos e restrições não planejados. | Validar limites, licença, atribuição e estabilidade antes da escolha; monitorar uso e documentar uma alternativa compatível. |
| Produto | Cidades homônimas ou cobertura geográfica insuficiente podem levar à seleção de uma localidade errada ou impedir a busca. | Alta | Alto: a previsão apresentada pode não corresponder ao local pretendido. | Exibir cidade junto de estado/região e país nos resultados; validar cobertura para os mercados prioritários e permitir corrigir a seleção. |
| Técnico | Fuso horário e definição ambígua de “cinco dias” podem produzir datas inesperadas ou inconsistentes. | Média | Médio: usuários podem interpretar incorretamente o período da previsão. | Fixar a regra do período e usar o fuso horário da localidade; cobrir limites de dia e fuso horário em testes. |
| Produto | O conteúdo do clima atual e da previsão pode não corresponder ao que os usuários esperam. | Média | Alto: a aplicação pode ser funcional, mas insuficiente para decisões cotidianas ou planejamento. | Validar os campos prioritários com usuários e explicitar o escopo dos dados antes de fechar a interface. |
| Técnico | Conversões ou rótulos inconsistentes entre Celsius, Fahrenheit e outras unidades podem induzir a erro. | Média | Alto: valores meteorológicos podem ser interpretados incorretamente. | Centralizar conversões, exibir unidade junto aos valores e cobrir conversões e arredondamento com testes. |
| Produto | Layout ou interação de busca inadequados em telas pequenas podem dificultar o uso móvel. | Média | Alto: o requisito central de uso em dispositivos móveis não será atendido na prática. | Projetar e validar fluxos mobile-first em larguras representativas, incluindo teclado virtual, toque e acessibilidade. |
| Técnico | Conexão instável, carregamento sem feedback ou estados de erro/vazio pouco claros podem deixar o usuário sem orientação. | Alta | Médio: consultas parecem travadas e o usuário não sabe como se recuperar. | Definir estados de carregamento, vazio e erro; oferecer nova tentativa e, se aprovado, indicar dados em cache e sua atualização. |
| Produto | Público, metas de qualidade e critérios de sucesso não definidos podem levar a prioridades conflitantes. | Alta | Médio: decisões de produto e aceite ficam subjetivas, causando retrabalho e divergência entre stakeholders. | Confirmar público prioritário, métricas e critérios verificáveis antes de estabelecer o escopo da especificação. |

## Perguntas em Aberto

- **Público e objetivo:** Quem é o público prioritário e em quais decisões ou situações a aplicação deve ajudá-lo? **Impacto:** sem isso, não é possível priorizar fluxos, conteúdo, experiência mobile ou métricas de sucesso.
- **Escopo do clima atual:** Quais dados caracterizam o clima atual (por exemplo, temperatura, condição, sensação térmica, umidade, vento ou precipitação)? **Impacto:** diferentes interpretações mudam o contrato de dados, o layout e o que conta como uma consulta concluída.
- **Escopo da previsão:** Quais informações devem ser mostradas para cada dia e a previsão deve ser diária, horária ou ambas? **Impacto:** isso define o volume de dados, a estrutura da interface e a utilidade da previsão para planejamento.
- **Período de cinco dias:** Decidido: hoje mais os quatro dias seguintes. Qual fuso horário determina a virada do dia? **Impacto:** a janela está definida, mas datas calculadas no fuso errado ainda podem divergir da expectativa local.
- **Busca de cidades:** A busca aceita nome, cidade e país, estado/região ou código postal? Deve sugerir resultados enquanto o usuário digita? **Impacto:** sem critérios, a experiência de busca e a integração de geocodificação podem ser inadequadas ou inconsistentes.
- **Desambiguação e cobertura:** Como diferenciar cidades homônimas e quais países ou regiões precisam ser cobertos? **Impacto:** o usuário pode consultar a localidade errada ou não encontrar sua cidade.
- **Cidade inicial e geolocalização:** A aplicação deve abrir com uma cidade padrão, pedir localização atual ou aguardar uma busca? A localização automática é opcional? **Impacto:** isso altera o primeiro uso, requer permissões e pode bloquear o acesso se a decisão não for definida.
- **Múltiplas cidades:** O usuário pode manter, favoritar ou alternar entre mais de uma cidade? **Impacto:** essa decisão afeta navegação, persistência local e o escopo do produto.
- **Fonte e direitos dos dados:** Decidido: Open-Meteo, sem API key. Quais requisitos de licença, atribuição, cobertura e limites de uso devem ser atendidos? **Impacto:** o provedor está escolhido, mas restrições de uso ou cobertura incompatível ainda podem afetar a distribuição e a confiabilidade do produto.
- **Atualização dos dados:** Com que frequência as condições atuais e previsões devem ser atualizadas? É aceitável exibir dados desatualizados, e como isso será indicado? **Impacto:** sem uma meta de atualização, o produto pode exibir informação antiga como se fosse atual ou fazer chamadas excessivas.
- **Unidades:** Decidido: Celsius como unidade padrão; Fahrenheit continua disponível conforme o requisito. A alternância afeta apenas temperatura? Quais unidades serão usadas para vento, precipitação e distância? **Impacto:** o padrão inicial está definido, mas unidades secundárias ainda podem ficar inconsistentes ou ser interpretadas incorretamente.
- **Persistência das preferências:** Decidido: não haverá persistência de servidor. A cidade selecionada e a unidade escolhida devem persistir localmente após recarregar ou reabrir a aplicação? **Impacto:** o armazenamento no servidor está fora do escopo, mas o comportamento entre visitas ainda não está definido.
- **Idioma e localização:** Decidido: idioma da interface pt-BR. Quais formatos de data/hora e convenções regionais devem ser usados? **Impacto:** o idioma da interface está definido, mas formatos inadequados ainda podem causar confusão; suportar outros idiomas exigiria escopo adicional.
- **Mobile e plataformas:** “Usar em dispositivos móveis” significa um site responsivo ou também um aplicativo nativo? Quais larguras, sistemas, navegadores e orientações de tela devem ser suportados? **Impacto:** a resposta muda arquitetura, esforço, testes e critérios de aceite.
- **Conectividade e cache:** A aplicação precisa funcionar offline ou mostrar a última consulta em cache? Por quanto tempo os dados podem ser reutilizados? **Impacto:** sem essa resposta, não se sabe se falhas de rede devem interromper o uso nem qual complexidade de armazenamento implementar.
- **Estados e recuperação:** O que deve acontecer durante carregamento, busca sem resultados, cidade inválida, falha do provedor, limite de requisições ou resposta incompleta? Deve haver ação para tentar novamente? **Impacto:** falhas podem deixar a tela sem orientação ou levar o usuário a acreditar que os dados estão corretos.
- **Desempenho e disponibilidade:** Quais metas mensuráveis existem para carregamento, resposta da busca e disponibilidade, e em quais condições de rede/dispositivo? **Impacto:** “sem demora excessiva” não é verificável e pode gerar desacordo sobre qualidade e lançamento.
- **Acessibilidade:** Qual nível de conformidade e quais recursos são necessários (teclado, leitor de tela, contraste, redução de movimento)? **Impacto:** sem critérios, barreiras de uso podem passar despercebidas e ser caras para corrigir depois.
- **Privacidade e permissões:** A aplicação coleta ou armazena localização, histórico de buscas ou outros dados? Por quanto tempo e com qual consentimento? **Impacto:** a decisão afeta confiança, permissões, armazenamento e obrigações de privacidade.
- **Limites do produto:** Histórico meteorológico, alertas, notificações, contas ou compartilhamento fazem parte do escopo ou estão explicitamente fora dele? **Impacto:** sem limites claros, expectativas e estimativas podem crescer durante a implementação.
- **Critérios de sucesso:** Como será medido se a aplicação atende às necessidades (por exemplo, sucesso ao encontrar uma cidade, tempo para consultar o clima ou uso recorrente)? **Impacto:** sem métricas, não há base objetiva para validar a solução ou priorizar melhorias.

## Decisões

- **Fonte de dados: Open-Meteo, sem API key.** Justificativa: permite consultar dados meteorológicos sem exigir que a aplicação gerencie uma chave de API. **Resolve:** qual provedor usar e se uma chave é necessária. **Ainda requer validação:** licença, atribuição, cobertura geográfica e limites de uso.
- **Período da previsão: hoje mais os quatro dias seguintes.** Justificativa: torna explícito o significado de “cinco dias” e inclui a condição de hoje na janela. **Resolve:** se o dia atual faz parte da previsão. **Ainda requer definição:** o fuso horário usado para determinar a data local.
- **Unidade padrão: Celsius.** Justificativa: define um valor inicial consistente para a interface em pt-BR, mantendo a alternância para Fahrenheit prevista no requisito. **Resolve:** qual unidade apresentar inicialmente. **Ainda requer definição:** unidades de vento, precipitação e distância e persistência da escolha.
- **Sem autenticação e sem persistência de servidor.** Justificativa: mantém o escopo centrado na consulta meteorológica, sem contas nem armazenamento de dados de usuário no backend. **Resolve:** se haverá login e armazenamento no servidor. **Ainda requer definição:** se preferências serão mantidas localmente no dispositivo.
- **Idioma da interface: pt-BR.** Justificativa: fixa o idioma para a primeira versão e permite escrever conteúdo e mensagens de forma consistente. **Resolve:** qual idioma usar na interface. **Ainda requer definição:** formatos de data/hora e eventual suporte multilíngue.

## Suposições

- A consulta meteorológica acontece para uma cidade escolhida pelo usuário.
- A alternância entre Celsius e Fahrenheit altera a unidade das temperaturas exibidas, sem mudar os dados meteorológicos subjacentes.
- A previsão de cinco dias é referente à cidade selecionada; o significado exato do período ainda precisa ser confirmado.
- “Usar em dispositivos móveis” implica uma interface adaptável e utilizável em telas móveis, mas não confirma a necessidade de um aplicativo nativo.
- A aplicação depende de uma fonte externa ou serviço de dados meteorológicos, embora o briefing não determine qual.

## Personas

Estas personas são hipóteses iniciais, pois o briefing não define público-alvo; devem ser validadas com usuários.

- **Decisora da rotina diária:** quer consultar rapidamente o clima da cidade onde está para decidir como se vestir ou se precisa levar guarda-chuva. **Contexto de uso:** principalmente mobile, em momentos curtos antes de sair; desktop ocasional. **Métrica de sucesso:** consegue encontrar a cidade correta e tomar uma decisão com confiança em menos de 30 segundos.
- **Planejador de viagem:** quer consultar a previsão de cinco dias do destino para decidir o que levar e organizar atividades. **Contexto de uso:** desktop durante o planejamento e mobile durante a viagem. **Métrica de sucesso:** encontra a previsão do destino e entende as condições para o período pretendido sem precisar repetir a busca.
- **Praticante de atividades ao ar livre:** quer verificar as condições previstas para decidir quando realizar uma atividade externa. **Contexto de uso:** mobile antes de sair e desktop ao planejar os próximos dias. **Métrica de sucesso:** consegue identificar as condições relevantes para o dia escolhido e decidir se mantém ou altera seus planos.
