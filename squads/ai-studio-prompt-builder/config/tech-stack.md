# Tech Stack — AI Studio Prompt Builder

## Modelos de IA

| Modelo | Uso | Prioridade |
|--------|-----|-----------|
| Claude Sonnet 4.6 | Prompts complexos, chain-of-thought | Primary |
| Claude Haiku 4.5 | Tasks rapidas, classificacao | Secondary |
| GPT-4o | Fallback, comparacao | Tertiary |

## Ferramentas

| Ferramenta | Uso |
|-----------|-----|
| Claude Code | Ambiente de desenvolvimento e execucao |
| AIOS Core | Framework de orquestracao |
| Zoom | Workshops ao vivo |
| Hotmart/Eduzz | Pagamento e entrega |
| Instagram/LinkedIn | Distribuicao de conteudo |
| Canva | Design de carrosseis |

## Formatos de Output

| Formato | Quando |
|---------|--------|
| Markdown | Documentacao, READMEs, guias |
| YAML | Configuracoes, designs, reports |
| JSON | Outputs estruturados de prompts |

## Principios Tecnicos

1. **Prompts reproduziveis** — Mesmo input = output consistente
2. **Model-agnostic** — Fluxos devem funcionar com 2+ modelos
3. **Minimal dependencies** — Zero infra complexa
4. **Portuguese-first** — Todo output em PT-BR
