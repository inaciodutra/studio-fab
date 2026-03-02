---
name: aios-studiofab-session-default
description: Bootstrap padrao de sessao do StudioFab (AIOS Master + squads locais).
---

# StudioFab Session Bootstrap

## Objetivo
Padronizar a abertura de toda sessao no projeto `StudioFab`.

## Sequencia Padrao
1. Ativar `@aios-master` como orquestrador principal.
2. Carregar os squads locais em `squads/` via skills locais em `.codex/skills`.
3. Manter os atalhos de squad (`/` e `@`) disponiveis para troca rapida.

## Squad Ativo Atual
- `ai-studio-prompt-builder` -> orquestrador `aspb-chief`

## Comandos de Inicio
- `/aios-master`
- `/skills` -> `aios-squad-ai-studio-prompt-builder`

## Regra de Operacao
- O AIOS Master permanece como controlador principal da sessao.
- Os agentes de squad entram apenas quando a tarefa for de dominio do squad.
