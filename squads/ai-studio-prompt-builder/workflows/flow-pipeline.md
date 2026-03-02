# Workflow: Flow Pipeline

**ID:** ai-studio/flow-pipeline
**Version:** 1.0.0
**Type:** Sequential with gates

---

## Visao Geral

Pipeline completo de criacao de fluxo de IA: da ideia ao produto monetizado.

```
IDEIA -> DESIGN -> BUILD -> TEST -> PACKAGE -> AMPLIFY -> MONETIZE
         [QG-D]   [QG-B]   [QG-T]   [QG-S]
```

## Fases

### Fase 1: Design
- **Task:** design-flow
- **Agent:** flow-architect
- **Input:** Ideia bruta de Inacio
- **Output:** flow-design.yaml
- **Gate:** QG-DESIGN (arquitetura aprovada)
- **Tempo:** 15-20 min

### Fase 2: Build
- **Task:** build-flow
- **Agent:** prompt-crafter
- **Input:** flow-design.yaml aprovado
- **Output:** flow-executable.yaml + prompts/
- **Gate:** QG-BUILD (fluxo funcional)
- **Tempo:** 25-35 min

### Fase 3: Test
- **Task:** test-flow
- **Agent:** qa-validator
- **Input:** flow-executable.yaml
- **Output:** test-report.yaml
- **Gate:** QG-TEST (testes passaram)
- **Tempo:** 25-35 min
- **Se FAIL:** Retorna para Fase 2

### Fase 4: Package
- **Task:** package-flow
- **Agent:** monetization-strategist
- **Input:** Fluxo testado + test-report
- **Output:** package/ (pricing, launch plan, materiais)
- **Gate:** QG-SHIP (pronto para venda)
- **Tempo:** 25 min

### Fase 5: Amplify (paralela com Fase 6)
- **Task:** amplify-content
- **Agent:** content-amplifier
- **Input:** package/
- **Output:** content/ (10+ pecas)
- **Tempo:** 25 min

### Fase 6: Monetize
- **Task:** monetize-flow
- **Agent:** monetization-strategist + aspb-chief
- **Input:** package/ + content/
- **Output:** Receita real
- **Tempo:** Ongoing

## Regras

1. **Nenhuma fase pode ser pulada** — cada gate e blocking
2. **Max 2 fluxos em design simultaneo** — foco > dispersao
3. **Max 1 fluxo em build** — construcao precisa de atencao
4. **Retorno no FAIL:** Test pode retornar para Build (max 3 iteracoes)
5. **Chief monitora:** aspb-chief acompanha todo o pipeline

## Tempo Total

| Cenario | Tempo |
|---------|-------|
| Happy path (sem retorno) | ~2h |
| Com 1 retorno de teste | ~3h |
| Com 2 retornos | ~4h |

## Comando

```
@aspb-chief *new-flow
# Inicia pipeline completo
```
