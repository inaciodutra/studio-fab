# Task: Design Flow

**Task ID:** ai-studio/design-flow
**Version:** 1.0.0
**Agent:** flow-architect
**Gate:** QG-DESIGN

---

## Proposito

Transformar uma ideia bruta de fluxo de IA em uma arquitetura completa e construivel. Esta task e o ponto de entrada do pipeline — tudo comeca aqui.

## Tipo de Executor

**Interativo** — Requer input de Inacio (a ideia do fluxo)

## Inputs

```yaml
required:
  - field: idea
    description: "Descricao da ideia do fluxo (pode ser vaga, 1-3 frases)"
    format: text
    example: "Quero um fluxo que pega a expertise de alguem e transforma em framework visual"

optional:
  - field: target_user
    description: "Para quem e esse fluxo"
    default: "Empreendedores brasileiros"
  - field: category
    description: "traducao | framework | analise | geracao | automacao"
    default: "traducao"
  - field: complexity
    description: "simples | medio | complexo"
    default: "medio"
```

## Steps

### Step 1: Capturar a Ideia (2 min)

**Elicitar de Inacio:**
1. Qual problema esse fluxo resolve?
2. Para quem? (target user)
3. O que o usuario recebe no final? (output desejado)
4. Qual parte desse fluxo e "traducao de complexidade"? (Zona de Genialidade)

### Step 2: Mapear Arquitetura (5-10 min)

**Agent executa:**
1. Decomponha em steps atomicos (3-7 steps ideal)
2. Para cada step, defina: input, output, prompt pattern, modelo
3. Mapeie conexoes entre steps
4. Identifique onde a "magia" acontece (step de traducao)

### Step 3: Selecionar Patterns (3 min)

**Agent executa:**
Para cada step, selecionar prompt pattern adequado:
- `direct` — Output simples
- `chain-of-thought` — Analise complexa
- `few-shot` — Formato especifico
- `structured-input` — Coleta de dados
- `role-play` — Simulacao de expert
- `translation` — Traducao de complexidade (core da Zona de Genialidade)

### Step 4: Validar com Inacio (2 min)

**Elicitar:**
- Apresentar arquitetura visual (A -> B -> C -> D)
- Confirmar: "Esse fluxo faz o que voce imaginou?"
- Ajustar se necessario

### Step 5: Documentar Design (3 min)

**Agent executa:**
- Gerar `flows/{flow-slug}/flow-design.yaml`
- Incluir: purpose, architecture, steps, connections, metadata
- Marcar como "APPROVED" no QG-DESIGN

## Output

```yaml
output:
  primary: "flows/{flow-slug}/flow-design.yaml"
  secondary: "flows/{flow-slug}/README.md"
  gate: "QG-DESIGN: APPROVED"
```

## Validacao

- [ ] Problema claro e especifico
- [ ] Target user definido
- [ ] 3-7 steps atomicos
- [ ] Input/output de cada step documentado
- [ ] Prompt pattern selecionado por step
- [ ] Conexoes mapeadas
- [ ] Alinhamento com Zona de Genialidade confirmado
- [ ] Inacio aprovou o design

**Threshold:** 7/8

## Esforco Estimado

| Componente | Tempo |
|-----------|-------|
| Capturar ideia | 2 min |
| Mapear arquitetura | 5-10 min |
| Selecionar patterns | 3 min |
| Validar com Inacio | 2 min |
| Documentar | 3 min |
| **Total** | **15-20 min** |

---

**Proxima task:** build-flow (prompt-crafter)
