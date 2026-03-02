# SF-004 - Testes de Regressao do Nucleo

## Metadados
- Status: `Completed`
- Prioridade: `P0`
- Owner principal: `@qa`
- Co-owner: `@dev`
- Dependencias: `SF-003`

## Objetivo
Cobrir fluxos criticos do produto com testes automatizados para reduzir regressao no core de negocio.

## Criterios de Aceite
- [x] Suite de testes cobre autenticacao/permissoes, pedidos, calculos, estoque e importacao no nivel de regras de negocio.
- [x] Cenarios de permissao por papel (`ADMIN`, `OPERADOR`, `VISUALIZADOR`) testados.
- [x] Threshold minimo de cobertura definido e atingido no core.
- [x] Documentacao de estrategia de testes registrada.

## Tasks
- [x] Mapear cenarios criticos e converter em casos de teste.
- [x] Implementar testes unitarios adicionais em regras de negocio.
- [x] Implementar validacao de fluxo pedido/estoque em modulo testavel (`orderRules`).
- [x] Implementar testes de permissao por role.
- [x] Publicar relatorio de cobertura e gaps.

## Plano de Testes
- [x] `npm test` com suite completa.
- [x] Validar cobertura do modulo de calculo.
- [x] Validar cobertura dos fluxos de pedido/estoque em regras puras.

## Relatorio de Cobertura
- Comando: `npx vitest run --coverage`
- Escopo core: `src/lib/calculations.ts`, `src/lib/importCsv.ts`, `src/lib/orderRules.ts`, `src/lib/permissions.ts`
- Resultado:
- Statements: `98.8%`
- Branches: `90.38%`
- Functions: `92.3%`
- Lines: `98.8%`
- Threshold configurado em `vitest.config.ts` e atendido:
- Lines/Statements >= `85%`
- Functions >= `80%`
- Branches >= `75%`

## Definition of Done
- [x] Criterios de aceite atendidos.
- [x] Cobertura e relatorio anexados.

## File List
- [x] `src/lib/importCsv.ts`
- [x] `src/lib/permissions.ts`
- [x] `src/lib/orderRules.ts`
- [x] `src/hooks/useAuth.ts`
- [x] `src/pages/Import.tsx`
- [x] `src/pages/Orders.tsx`
- [x] `src/test/calculations.test.ts`
- [x] `src/test/importCsv.test.ts`
- [x] `src/test/permissions.test.ts`
- [x] `src/test/orderRules.test.ts`
- [x] `vitest.config.ts`
- [x] `docs/qa/testing-strategy.md`
