# Task: Test Flow

**Task ID:** ai-studio/test-flow
**Version:** 1.0.0
**Agent:** qa-validator
**Gate:** QG-TEST
**Depends On:** build-flow (QG-BUILD passed)

---

## Proposito

Validar que o fluxo funciona corretamente com inputs variados, edge cases e cenarios reais. Garantir qualidade antes de empacotar e monetizar.

## Tipo de Executor

**Autonomo** — Agent executa suite de testes completa

## Inputs

```yaml
required:
  - field: flow_executable
    description: "Fluxo executavel completo"
    format: yaml
    location: "flows/{flow-slug}/flow-executable.yaml"
    validation: "QG-BUILD must be APPROVED"
```

## Steps

### Step 1: Gerar Plano de Teste (3 min)

Criar suite com 7 cenarios minimos:
1. **Happy Path** (P1) — Input padrao, output esperado
2. **Input Minimo** (P1) — Menor input possivel
3. **Input Extenso** (P2) — Input muito grande
4. **Input em Ingles** (P2) — Idioma diferente
5. **Input Irrelevante** (P2) — Fora do dominio
6. **Reproducibilidade** (P1) — Mesmo input 3x
7. **UX/Clareza** (P1) — Usuario leigo consegue usar

### Step 2: Executar Testes (15-25 min)

Para cada cenario:
1. Preparar input de teste
2. Executar fluxo completo
3. Avaliar output contra criterios
4. Registrar: PASS / FAIL / WARNING
5. Documentar observacoes e screenshots

### Step 3: Calcular Metricas de Qualidade (3 min)

| Metrica | Threshold |
|---------|-----------|
| Completude | >= 90% |
| Relevancia | >= 85% |
| Formato | 100% |
| Clareza | >= 85% |
| Consistencia | >= 80% |
| Seguranca | 100% |

### Step 4: Emitir Veredicto (2 min)

```yaml
verdicts:
  PASS: "Todos os P1 passaram, media >= 85%"
  PASS_WITH_NOTES: "P1 passaram com observacoes menores"
  FAIL: "Algum P1 falhou OU media < 85%"
  BLOCKED: "Fluxo nao executa / erro critico"
```

### Step 5: Gerar Relatorio (3 min)

Salvar em `flows/{flow-slug}/test-results/test-report.yaml`

## Output

```yaml
output:
  primary: "flows/{flow-slug}/test-results/test-report.yaml"
  gate: "QG-TEST: {verdict}"
```

## Validacao

- [ ] Plano de teste com 7+ cenarios
- [ ] Todos os cenarios P1 executados
- [ ] Cenarios P2 executados (quando aplicavel)
- [ ] Metricas calculadas
- [ ] Veredicto emitido com justificativa
- [ ] Issues documentadas com severity e recomendacao
- [ ] Relatorio salvo

**Threshold:** 6/7

## Esforco Estimado

| Componente | Tempo |
|-----------|-------|
| Plano de teste | 3 min |
| Executar testes | 15-25 min |
| Metricas | 3 min |
| Veredicto | 2 min |
| Relatorio | 3 min |
| **Total** | **25-35 min** |

---

**Proxima task:** package-flow (monetization-strategist) se PASS
**Retorno:** build-flow (prompt-crafter) se FAIL
