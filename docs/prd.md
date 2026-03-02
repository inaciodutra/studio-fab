# PRD - StudioFab v1

## 1. Resumo
StudioFab v1 e um sistema web para operacao de micro e pequenas fabricas criativas (com foco inicial em impressao 3D), cobrindo cadastro, orcamento, pedido, estoque e relatorios financeiros.

## 2. Problema
Negocios pequenos controlam pedidos e custos em planilhas soltas, gerando:
- precificacao inconsistente;
- baixa visibilidade de margem;
- erros de estoque;
- retrabalho operacional.

## 3. Objetivo da v1
Centralizar a operacao comercial e produtiva com controle de margem e estoque por workspace.

## 4. ICP (cliente ideal)
- Pequenas operacoes de impressao 3D / producao artesanal.
- Time de 1 a 10 pessoas.
- Necessidade de multiusuario por papeis.

## 5. Escopo v1
### In-scope
- Autenticacao e workspaces.
- Perfis e papeis (`ADMIN`, `OPERADOR`, `VISUALIZADOR`).
- Cadastros: clientes, produtos, materiais.
- Pedidos com calculo de custo, preco e margem.
- Estoque e movimentacoes.
- Relatorios e exportacao CSV.
- Importacao CSV de clientes/produtos.
- Convites de equipe.

### Out-of-scope
- Marketplace de fluxos de IA.
- Automacoes avancadas com LLM.
- BI externo e dashboards customizados.
- Aplicativo mobile nativo.

## 6. Requisitos funcionais principais
1. Usuario autenticado acessa apenas dados do proprio workspace.
2. Pedido deve persistir com itens de forma consistente.
3. Mudanca para `Entregue` deve impactar estoque uma unica vez.
4. Relatorios exibem receita, custo e lucro por periodo.
5. Convites e papeis controlam autorizacao de operacao.

## 7. Requisitos nao-funcionais
- Confiabilidade de dados transacionais.
- UX em PT-BR sem texto corrompido.
- Gates de qualidade ativos (`lint`, `typecheck`, `test`).
- Observabilidade minima para erros criticos.

## 8. KPIs v1 (60-90 dias)
1. Taxa de pedidos com margem calculada: >= 95%.
2. Divergencia de estoque em pedidos entregues: <= 2%.
3. Tempo medio de cadastro de pedido: <= 5 min.
4. Taxa de falha em fluxo de pedido: <= 1%.
5. Adoção semanal (WAU por workspace ativo): meta definida por operacao.

## 9. Riscos
- Dependencias quebradas no ambiente local podem atrasar releases.
- Erros de status de pedido podem gerar estoque inconsistente.
- Mudancas de role sem validacao E2E podem abrir falhas de seguranca.

## 10. Roadmap v1 (priorizado)
1. SF-001 Hardening de ambiente e qualidade.
2. SF-002 Correcao de encoding e UX base.
3. SF-003 Integridade de pedidos e estoque.
4. SF-004 Testes de regressao do nucleo.
5. SF-005 Operacao de equipe e convites.
6. SF-006 Prontidao de producao.
