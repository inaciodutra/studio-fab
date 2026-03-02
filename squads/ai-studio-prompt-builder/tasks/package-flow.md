# Task: Package Flow

**Task ID:** ai-studio/package-flow
**Version:** 1.0.0
**Agent:** monetization-strategist
**Gate:** QG-SHIP
**Depends On:** test-flow (QG-TEST passed)

---

## Proposito

Empacotar o fluxo validado em produto pronto para venda. Definir preco, criar material de suporte e preparar estrategia de lancamento.

## Tipo de Executor

**Interativo** — Requer aprovacao de Inacio no pricing e posicionamento

## Inputs

```yaml
required:
  - field: flow_executable
    description: "Fluxo testado e aprovado"
    location: "flows/{flow-slug}/flow-executable.yaml"
  - field: test_report
    description: "Relatorio de teste aprovado"
    location: "flows/{flow-slug}/test-results/test-report.yaml"
```

## Steps

### Step 1: Calcular Value Equation (3 min)

Aplicar Hormozi Value Equation ao fluxo:
- **Dream Outcome:** O que o usuario recebe? (1-10)
- **Perceived Likelihood:** Quao credivel? (1-10)
- **Time Delay:** Quao rapido? (1-10, invertido)
- **Effort & Sacrifice:** Quao facil? (1-10, invertido)

```
Value = (Dream Outcome x Perceived Likelihood) / (Time Delay x Effort)
```

### Step 2: Definir Pricing (5 min)

**Elicitar de Inacio:**
Apresentar 3 opcoes de preco baseadas na Value Equation:

| Formato | Preco Sugerido | Justificativa |
|---------|---------------|---------------|
| Self-service | R$47-97 | Acesso ao fluxo + tutorial |
| Workshop ao vivo | R$497-997 | Inacio aplica ao vivo (Zona de Genialidade) |
| Bundle | R$197-297 | Fluxo + materiais + bonus |

### Step 3: Criar Material de Suporte (10 min)

1. **README do fluxo** — O que faz, para quem, como usar
2. **Video tutorial** (roteiro) — Passo a passo em 15 min
3. **Quick start guide** — 1 pagina, "comece em 5 min"
4. **Demo script** — Roteiro de Inacio demonstrando ao vivo (5 min)
5. **FAQ** — 5 perguntas mais comuns

### Step 4: Preparar Go-to-Market (5 min)

```yaml
launch_plan:
  product_name: "Fluxo [Nome]"
  tagline: "1 frase de impacto"
  price: "R$ X"
  landing_page_sections:
    - hero: "Headline + subheadline + CTA"
    - problem: "A dor que resolve"
    - solution: "Como o fluxo resolve"
    - demo: "Video de demonstracao"
    - proof: "Depoimentos e cases"
    - pricing: "Preco + garantia"
    - cta: "Botao de compra"
  launch_sequence:
    - "20 DMs para circulo quente"
    - "3 posts de conteudo-isca"
    - "1 live de demonstracao"
    - "Abertura de vendas"
```

### Step 5: Gate QG-SHIP (2 min)

Checklist final:
- [ ] Preco definido e aprovado por Inacio
- [ ] Value Equation calculada (score >= 3.0)
- [ ] README do fluxo escrito
- [ ] Roteiro de demo pronto
- [ ] Quick start guide pronto
- [ ] FAQ com 5+ perguntas
- [ ] Launch plan definido
- [ ] Material de suporte completo

## Output

```yaml
output:
  primary: "flows/{flow-slug}/package/"
  contents:
    - "package/README.md"
    - "package/pricing.yaml"
    - "package/launch-plan.yaml"
    - "package/quick-start.md"
    - "package/demo-script.md"
    - "package/faq.md"
  gate: "QG-SHIP: APPROVED"
```

## Validacao

**Threshold:** 7/8

## Esforco Estimado

| Componente | Tempo |
|-----------|-------|
| Value Equation | 3 min |
| Pricing | 5 min |
| Material de suporte | 10 min |
| Go-to-market | 5 min |
| Gate | 2 min |
| **Total** | **25 min** |

---

**Proxima task:** amplify-content (content-amplifier)
