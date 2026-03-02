# StudioFab

Sistema web para gestao operacional de pequenas fabricas criativas, com foco em pedidos, custos, estoque e relatorios.

## Stack
- React + Vite + TypeScript
- Supabase (Postgres, Auth, Storage, Edge Functions)
- Tailwind + shadcn/ui

## Requisitos
- Node.js 20+
- npm 10+

## Setup
```bash
npm install
cp .env.example .env
# preencher VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

## Scripts
```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
```

## Documentacao de Produto
- PRD: `docs/prd.md`
- Arquitetura: `docs/architecture.md`
- Backlog executavel: `docs/stories/`

## Escopo v1
- Autenticacao + workspace
- Clientes, produtos e materiais
- Pedidos com calculo de margem
- Estoque e movimentacoes
- Relatorios e exportacao CSV
- Convites de equipe e papeis
