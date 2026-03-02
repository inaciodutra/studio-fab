# Checklist Operacional - Equipe e Convites (SF-005)

## Pre-requisitos
- [ ] Edge Functions implantadas: `accept-invitation`, `send-invitation-email`, `manage-team-member`
- [ ] Variaveis configuradas no Supabase: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`
- [ ] Migration `20260302104000_sf005_team_security_hardening.sql` aplicada

## Fluxo de Convite
- [ ] Admin envia convite para email valido
- [ ] Convite aparece em `Config > Equipe > Convites pendentes`
- [ ] Email de convite e disparado (quando `RESEND_API_KEY` ativo)
- [ ] Nao-admin nao consegue inserir/gerenciar convites via API

## Fluxo de Aceite/Recusa
- [ ] Usuario convidado visualiza apenas convites do proprio email
- [ ] `Aceitar` move o usuario para o workspace convidado e atualiza papel
- [ ] `Recusar` altera status para `cancelled` (sem apagar historico)
- [ ] Usuario sem convites pendentes vai para `/dashboard`

## Governanca de Membros
- [ ] Admin consegue alterar papel de outro membro
- [ ] Sistema impede rebaixar o ultimo `ADMIN`
- [ ] Sistema impede remover o ultimo `ADMIN`
- [ ] Sistema impede auto-remocao por acao administrativa
- [ ] Remocao de membro cria workspace proprio para o removido e define papel `ADMIN`

## Validacao Rapida
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
