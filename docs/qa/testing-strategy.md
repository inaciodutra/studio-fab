# Estrategia de Testes - StudioFab

## Objetivo
Evitar regressao em regras criticas do dominio com foco em modulos puros e validacao automatica no CI/local.

## Escopo atual (SF-004)
- Calculos de precificacao e totais (`src/lib/calculations.ts`)
- Importacao CSV: mapeamento, validacao e transformacao (`src/lib/importCsv.ts`)
- Permissoes por papel (`src/lib/permissions.ts`)
- Regras de transicao de status/ponto de baixa de estoque (`src/lib/orderRules.ts`)

## Piramide de testes
- Unitarios: principal camada para regras de negocio puras.
- Integracao: proxima etapa para fluxos com Supabase (pedido + estoque).
- E2E: opcional para jornada critica de venda e importacao.

## Cobertura minima (core)
- Statements: `>= 85%`
- Lines: `>= 85%`
- Functions: `>= 80%`
- Branches: `>= 75%`

Configurada em `vitest.config.ts` para arquivos core em `src/lib`.

## Como validar
```bash
npm run lint
npm run typecheck
npm test
npx vitest run --coverage
```

## Resultado atual
- Suite: `16` testes passando.
- Cobertura core: `98.8% statements`, `90.38% branches`, `92.3% functions`, `98.8% lines`.
- Threshold atingido.
