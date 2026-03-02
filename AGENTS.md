# AGENTS.md - Synkra AIOS (Codex CLI)

Este arquivo define as instrucoes do projeto para o Codex CLI.

<!-- AIOS-MANAGED-START: core -->
## Core Rules

1. Siga a Constitution em `.aios-core/constitution.md`
2. Priorize `CLI First -> Observability Second -> UI Third`
3. Trabalhe por stories em `docs/stories/`
4. Nao invente requisitos fora dos artefatos existentes
<!-- AIOS-MANAGED-END: core -->

<!-- AIOS-MANAGED-START: quality -->
## Quality Gates

- Rode `npm run lint`
- Rode `npm run typecheck`
- Rode `npm test`
- Atualize checklist e file list da story antes de concluir
<!-- AIOS-MANAGED-END: quality -->

<!-- AIOS-MANAGED-START: codebase -->
## Project Map

- Core framework: `.aios-core/`
- CLI entrypoints: `bin/`
- Shared packages: `packages/`
- Tests: `tests/`
- Docs: `docs/`
<!-- AIOS-MANAGED-END: codebase -->

<!-- AIOS-MANAGED-START: commands -->
## Common Commands

- `npm run sync:ide`
- `npm run sync:ide:check`
- `npm run sync:skills:codex`
- `npm run sync:skills:codex:global` (opcional; neste repo o padrao e local-first)
- `npm run validate:structure`
- `npm run validate:agents`
<!-- AIOS-MANAGED-END: commands -->

<!-- AIOS-MANAGED-START: shortcuts -->
## Agent Shortcuts

Preferencia de ativacao no Codex CLI:
1. Use `/skills` e selecione `aios-<agent-id>` vindo de `.codex/skills` (ex.: `aios-architect`)
2. Se preferir, use os atalhos abaixo (`@architect`, `/architect`, etc.)

Interprete os atalhos abaixo carregando o arquivo correspondente em `.aios-core/development/agents/` (fallback: `.codex/agents/`), renderize o greeting via `generate-greeting.js` e assuma a persona ate `*exit`:

- `@architect`, `/architect`, `/architect.md` -> `.aios-core/development/agents/architect.md`
- `@dev`, `/dev`, `/dev.md` -> `.aios-core/development/agents/dev.md`
- `@qa`, `/qa`, `/qa.md` -> `.aios-core/development/agents/qa.md`
- `@pm`, `/pm`, `/pm.md` -> `.aios-core/development/agents/pm.md`
- `@po`, `/po`, `/po.md` -> `.aios-core/development/agents/po.md`
- `@sm`, `/sm`, `/sm.md` -> `.aios-core/development/agents/sm.md`
- `@analyst`, `/analyst`, `/analyst.md` -> `.aios-core/development/agents/analyst.md`
- `@devops`, `/devops`, `/devops.md` -> `.aios-core/development/agents/devops.md`
- `@data-engineer`, `/data-engineer`, `/data-engineer.md` -> `.aios-core/development/agents/data-engineer.md`
- `@ux-design-expert`, `/ux-design-expert`, `/ux-design-expert.md` -> `.aios-core/development/agents/ux-design-expert.md`
- `@squad-creator`, `/squad-creator`, `/squad-creator.md` -> `.aios-core/development/agents/squad-creator.md`
- `@aios-master`, `/aios-master`, `/aios-master.md` -> `.aios-core/development/agents/aios-master.md`
<!-- AIOS-MANAGED-END: shortcuts -->

## Squad Shortcuts (Locais)

Atalhos de squads instalados em `squads/`:

- `@ai-studio-prompt-builder`, `/ai-studio-prompt-builder`, `/ai-studio-prompt-builder.md` -> `squads/ai-studio-prompt-builder/agents/aspb-chief.md`
- `@aspb-chief`, `/aspb-chief`, `/aspb-chief.md` -> `squads/ai-studio-prompt-builder/agents/aspb-chief.md`
- `@flow-architect`, `/flow-architect`, `/flow-architect.md` -> `squads/ai-studio-prompt-builder/agents/flow-architect.md`
- `@prompt-crafter`, `/prompt-crafter`, `/prompt-crafter.md` -> `squads/ai-studio-prompt-builder/agents/prompt-crafter.md`
- `@monetization-strategist`, `/monetization-strategist`, `/monetization-strategist.md` -> `squads/ai-studio-prompt-builder/agents/monetization-strategist.md`
- `@qa-validator`, `/qa-validator`, `/qa-validator.md` -> `squads/ai-studio-prompt-builder/agents/qa-validator.md`
- `@content-amplifier`, `/content-amplifier`, `/content-amplifier.md` -> `squads/ai-studio-prompt-builder/agents/content-amplifier.md`

## StudioFab Session Default

Regra padrao para novas sessoes neste projeto (`StudioFab`):

1. Ativar `@aios-master` imediatamente no inicio da sessao.
2. Carregar squads locais de `squads/` e considerar seus atalhos `/` e `@` como ativos.
3. Priorizar o orquestrador do squad ao entrar via atalho do squad (ex.: `aspb-chief`).
4. Manter o AIOS Master como orquestrador principal e trocar para agentes de squad apenas sob demanda.

Comando operacional recomendado no inicio de cada sessao:
- `/aios-master`
- `/skills` -> `aios-squad-ai-studio-prompt-builder`
