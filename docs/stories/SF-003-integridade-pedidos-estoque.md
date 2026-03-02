# SF-003 - Integridade de Pedidos e Estoque

## Metadados
- Status: `In Progress`
- Prioridade: `P0`
- Owner principal: `@architect`
- Co-owners: `@data-engineer`, `@dev`
- Dependencias: `SF-001`, `SF-002`

## Objetivo
Garantir consistencia de dados no fluxo critico de pedido e baixa de estoque.

## Criterios de Aceite
- [x] Criacao de pedido+itens ocorre de forma transacional (sem pedido orfao).
- [x] Mudanca para status `Entregue` e idempotente (sem baixa duplicada).
- [ ] Reprocessamento/retentativa nao gera movimentos de estoque incorretos.
- [x] Logs de erro cobrem falhas de persistencia de pedido/estoque.

## Tasks
- [ ] Modelar abordagem transacional (RPC/funcao SQL/edge function).
- [x] Refatorar fluxo de criacao de pedido para operacao atomica.
- [x] Implementar controle de idempotencia na transicao de status.
- [x] Revisar movimentacao de estoque e referencias (`stock_movements`).
- [ ] Adicionar validacoes de negocio para estados invalidos.

## Plano de Testes
- [ ] Criar pedido com itens (caminho feliz).
- [ ] Simular erro no meio da criacao e validar rollback.
- [ ] Alternar status para `Entregue` duas vezes e validar estoque.
- [ ] Testar mudancas de status em sequencia fora de ordem.

## Definition of Done
- [ ] Criterios de aceite atendidos.
- [ ] Cenarios de integridade cobertos por testes.

## File List
- [x] `src/pages/Orders.tsx`
- [ ] `supabase/*` (migracoes, funcoes ou policies, se necessario)
- [ ] `src/integrations/supabase/types.ts` (se esquema mudar)
