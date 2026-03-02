# SF-002 - Correcao de Encoding e UX Base PT-BR

## Metadados
- Status: `In Progress`
- Prioridade: `P1`
- Owner principal: `@ux-design-expert`
- Co-owner: `@dev`
- Dependencias: `SF-001`

## Objetivo
Eliminar caracteres corrompidos e padronizar linguagem/consistencia da interface em portugues-BR.

## Criterios de Aceite
- [x] Textos criticos de navegacao e formularios sem caracteres quebrados.
- [x] Terminologia consistente em toda a UI.
- [x] Mensagens de erro/sucesso padronizadas.
- [ ] Revisao visual desktop e mobile concluida.

## Tasks
- [x] Corrigir encoding em paginas principais (`Login`, `Register`, `Sidebar`, `Orders`, `Reports`, `Stock`, `Config`).
- [x] Revisar placeholders/labels/textos de feedback.
- [x] Padronizar textos em PT-BR.
- [ ] Validar regressao visual em telas principais.

## Plano de Testes
- [ ] Smoke test de navegacao nas rotas principais.
- [x] Verificacao manual de strings corrompidas.
- [ ] Teste rapido em viewport mobile.

## Definition of Done
- [ ] Criterios de aceite atendidos.
- [ ] Nenhuma regressao funcional detectada nas telas revisadas.

## File List
- [x] `src/pages/Login.tsx`
- [x] `src/pages/Register.tsx`
- [x] `src/components/layout/Sidebar.tsx`
- [x] `src/pages/Orders.tsx`
- [x] `src/pages/Reports.tsx`
- [x] `src/pages/Stock.tsx`
- [x] `src/pages/Config.tsx`
