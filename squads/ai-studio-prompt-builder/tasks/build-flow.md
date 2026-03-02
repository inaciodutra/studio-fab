# Task: Build Flow

**Task ID:** ai-studio/build-flow
**Version:** 1.0.0
**Agent:** prompt-crafter
**Gate:** QG-BUILD
**Depends On:** design-flow (QG-DESIGN passed)

---

## Proposito

Construir os prompts reais de cada step do fluxo a partir do design aprovado. Transforma a arquitetura (planta) em prompts funcionais (construcao).

## Tipo de Executor

**Autonomo** — Agent executa com base no flow-design.yaml

## Inputs

```yaml
required:
  - field: flow_design
    description: "Arquivo flow-design.yaml aprovado"
    format: yaml
    location: "flows/{flow-slug}/flow-design.yaml"
    validation: "QG-DESIGN must be APPROVED"
```

## Steps

### Step 1: Carregar Design (1 min)

Ler flow-design.yaml completo. Verificar QG-DESIGN = APPROVED.

### Step 2: Construir Prompts (10-20 min)

Para CADA step no design:

1. **System Prompt** — Definir persona, regras, formato de saida
2. **User Prompt Template** — Template com {{variaveis}} do usuario
3. **Variables** — Documentar cada variavel (tipo, required, default)
4. **Output Format** — Especificar formato esperado (markdown, json, yaml)
5. **Model Config** — Modelo recomendado, temperature, max_tokens
6. **Guardrails** — Regras de seguranca e validacao de output

### Step 3: Conectar Steps (5 min)

Verificar que o output de cada step alimenta corretamente o input do proximo:
- Output format do step N compativel com input do step N+1
- Variaveis de contexto propagadas corretamente
- Nenhuma informacao perdida entre steps

### Step 4: Criar Versao Executavel (5 min)

Gerar arquivo final com todos os prompts prontos para execucao:
- `flows/{flow-slug}/prompts/step-{N}-{name}.yaml` por step
- `flows/{flow-slug}/flow-executable.yaml` com fluxo completo

### Step 5: Self-Test Rapido (5 min)

Executar 1 run completo do fluxo com input de exemplo:
- Verificar que cada step roda sem erro
- Verificar que output final faz sentido
- Anotar ajustes necessarios

## Output

```yaml
output:
  primary: "flows/{flow-slug}/flow-executable.yaml"
  prompts: "flows/{flow-slug}/prompts/*.yaml"
  test_run: "flows/{flow-slug}/test-runs/initial-test.yaml"
  gate: "QG-BUILD: APPROVED"
```

## Validacao

- [ ] Todos os steps tem system prompt
- [ ] Todos os steps tem user prompt template
- [ ] Variaveis documentadas com tipo e default
- [ ] Output format especificado por step
- [ ] Conexoes entre steps verificadas
- [ ] Model config definido por step
- [ ] Guardrails incluidos
- [ ] Self-test executado com sucesso
- [ ] Fluxo completo roda sem erros

**Threshold:** 8/9

## Esforco Estimado

| Componente | Tempo |
|-----------|-------|
| Carregar design | 1 min |
| Construir prompts | 10-20 min |
| Conectar steps | 5 min |
| Versao executavel | 5 min |
| Self-test | 5 min |
| **Total** | **25-35 min** |

---

**Proxima task:** test-flow (qa-validator)
