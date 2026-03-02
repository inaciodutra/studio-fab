# SF-001 - Hardening de Ambiente e Qualidade

## Metadados
- Status: `In Progress`
- Prioridade: `P0`
- Owner principal: `@dev`
- Co-owners: `@devops`, `@qa`
- Dependencias: `SF-000`

## Objetivo
Restaurar pipeline de qualidade para permitir evolucao segura do produto.

## Criterios de Aceite
- [x] `npm run lint` executa sem erro.
- [x] `npm run typecheck` existe e executa sem erro.
- [x] `npm test` executa sem erro.
- [ ] Pipeline CI executa os 3 gates automaticamente.
- [ ] Documentacao de setup local atualizada com comandos corretos.

## Tasks
- [x] Corrigir dependencias quebradas (`node_modules`/`package-lock`/resolucao).
- [x] Adicionar script `typecheck` no `package.json`.
- [x] Ajustar configuracao de lint/test para estado executavel.
- [ ] Criar workflow de CI com gates obrigatorios.
- [x] Atualizar README com passo a passo de setup/validacao.

## Plano de Testes
- [x] Rodar `npm run lint`.
- [x] Rodar `npm run typecheck`.
- [x] Rodar `npm test`.
- [ ] Validar execucao no CI.

## Definition of Done
- [ ] Criterios de aceite atendidos.
- [ ] Evidencias de execucao anexadas em comentario de story/PR.

## File List
- [x] `package.json`
- [x] `package-lock.json` (se necessario)
- [ ] `.github/workflows/*` (pipeline)
- [x] `README.md`
