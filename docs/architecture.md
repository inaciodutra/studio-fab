# Architecture - StudioFab v1

## 1. Visao geral
Arquitetura web SPA com frontend React/Vite e backend Supabase (Postgres, Auth, Storage, Edge Functions).

## 2. Componentes
- Frontend: React + TypeScript + shadcn/ui.
- Data access: `@supabase/supabase-js`.
- Banco: Postgres (Supabase) com RLS por workspace.
- Auth: Supabase Auth (email/senha e OAuth Google).
- Funcoes serverless: convite/aceite e utilitarios.

## 3. Dominios de dados
- Identidade e acesso: `profiles`, `user_roles`, `workspaces`, `invitations`.
- Catalogo: `materials`, `products`, `clients`, `config`.
- Operacao: `orders`, `order_items`, `stock`, `stock_movements`.
- Apoio: `supplies`.

## 4. Fluxos criticos
1. Criacao de pedido
- Usuario cria pedido e itens.
- Sistema calcula custo/preco/margem.
- Persistencia deve evitar pedido orfao.

2. Entrega de pedido
- Mudanca de status para `Entregue`.
- Baixa de estoque por item aplicavel.
- Registro em `stock_movements`.
- Idempotencia obrigatoria.

3. Gestao de equipe
- Admin envia convite por email.
- Usuario aceita convite e entra no workspace.
- Roles controlam permissao de escrita.

## 5. Seguranca
- RLS habilitado em tabelas de negocio.
- Policies por workspace e por role.
- Operacoes administrativas restritas a `ADMIN`.

## 6. Decisoes arquiteturais
1. Multi-tenant por `workspace_id`.
2. Regras de negocio principais no app e, quando necessario, em camada SQL/funcoes.
3. Qualidade obrigatoria por gates locais e CI.

## 7. Observabilidade minima (v1)
- Logs de erro de UI.
- Logs de funcoes edge.
- Alertas para falhas de operacao critica (pedido/estoque/convite).

## 8. Pendencias tecnicas atuais
- Normalizar encoding de textos PT-BR.
- Reforcar integridade de pedido/itens.
- Garantir idempotencia no fluxo de entrega.
- Restaurar ambiente de testes/lint totalmente funcional.
