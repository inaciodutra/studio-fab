# SF-005 - Operacao de Equipe e Convites

## Metadados
- Status: `Completed`
- Prioridade: `P1`
- Owner principal: `@dev`
- Co-owner: `@qa`
- Dependencias: `SF-004`

## Objetivo
Fechar ciclo multiusuario com convites, aceite, papeis e governanca de workspace.

## Criterios de Aceite
- [x] Convite por email funciona fim-a-fim.
- [x] Aceite/recusa de convite atualiza estado corretamente.
- [x] Alteracao de papel atualiza permissao real em tela e API.
- [x] Remocao de membro respeita regras de seguranca.
- [x] Fluxo de `pending-invitations` funciona sem bloqueios indevidos.

## Tasks
- [x] Revisar fluxo de convite e aceite (`edge functions` + UI).
- [x] Revisar RLS/policies para leitura/escrita de convites e roles.
- [x] Validar sincronizacao de sessao apos aceite de convite.
- [x] Corrigir casos de erro e mensagens de feedback.
- [x] Criar checklist operacional de equipe.

## Plano de Testes
- [x] Criar convite, aceitar e verificar acesso.
- [x] Criar convite, recusar e verificar estado.
- [x] Alterar role e validar permissoes.
- [x] Tentar acoes sem role adequada e validar bloqueio.

## Resultado Implementado
- Novo hardening de governanca no backend:
- Edge Function `manage-team-member` para alteracao de papel e remocao segura.
- Bloqueio de rebaixamento/remocao do ultimo admin.
- Remocao de membro sem apagar conta: usuario removido recebe novo workspace proprio.
- Ajustes na `accept-invitation`:
- Recusa agora atualiza `status = cancelled` (auditoria preservada).
- Tratamento de erro explicito nas etapas criticas.
- Hardening de acesso:
- Policy de leitura de convites por workspace agora exige admin.
- Policies de `user_roles` escopadas por workspace para leitura/gestao admin.
- Ajustes no frontend:
- `Config` usa `manage-team-member` e valida regras de last admin.
- `PendingInvitations` e `ProtectedRoute` filtram convites por email do usuario autenticado.
- Regras puras adicionadas em `teamRules` para manter comportamento testavel.

## Definition of Done
- [x] Criterios de aceite atendidos.
- [x] Fluxo multiusuario validado em ambiente de teste.

## File List
- [x] `src/pages/Config.tsx`
- [x] `src/pages/PendingInvitations.tsx`
- [x] `src/components/auth/ProtectedRoute.tsx`
- [x] `supabase/functions/accept-invitation/index.ts`
- [x] `supabase/functions/manage-team-member/index.ts`
- [x] `supabase/migrations/20260302104000_sf005_team_security_hardening.sql`
- [x] `src/lib/teamRules.ts`
- [x] `src/test/teamRules.test.ts`
- [x] `docs/ops/team-operations-checklist.md`
