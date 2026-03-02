# Task: Amplify Content

**Task ID:** ai-studio/amplify-content
**Version:** 1.0.0
**Agent:** content-amplifier
**Depends On:** package-flow (QG-SHIP passed)

---

## Proposito

Transformar cada fluxo empacotado em 10+ pecas de conteudo para aquisicao de novos clientes. Alimentar o topo do funil sem tirar Inacio da Zona de Genialidade.

## Tipo de Executor

**Autonomo** — Agent gera conteudo, Inacio apenas aprova e publica

## Inputs

```yaml
required:
  - field: flow_package
    description: "Pacote completo do fluxo (README, demo, pricing)"
    location: "flows/{flow-slug}/package/"
```

## Steps

### Step 1: Analisar Fluxo para Content Hooks (3 min)

Identificar:
- Qual DOR o fluxo resolve? (hook principal)
- Qual RESULTADO entrega? (proof hook)
- Qual METAFORA traduz a complexidade? (engagement hook)
- Qual NUMERO impressiona? (authority hook)

### Step 2: Gerar Content Pack (15 min)

Produzir minimo 10 pecas:

| # | Tipo | Plataforma | Proposito |
|---|------|-----------|-----------|
| 1 | Reel (roteiro) | Instagram | Awareness — hook + resultado |
| 2 | Reel (demo) | Instagram/TikTok | Demonstracao rapida |
| 3 | Carrossel | Instagram | Educativo — como funciona |
| 4 | Carrossel | LinkedIn | Profissional — case de uso |
| 5 | Post texto | LinkedIn | Storytelling + CTA |
| 6 | Thread | Twitter/X | Passo a passo |
| 7 | Newsletter | Email | Deep dive + CTA |
| 8 | Post | Instagram | Bastidores da criacao |
| 9 | Post | LinkedIn | Resultado + depoimento |
| 10 | Story sequence | Instagram | Behind the scenes |

### Step 3: Criar Calendario de Publicacao (5 min)

Distribuir as 10 pecas ao longo de 14 dias:
- Dias 1-3: Build anticipation (problema + teaser)
- Dias 4-5: Launch (demo + oferta)
- Dias 6-10: Sustain (proof + educacao)
- Dias 11-14: Close (urgencia + ultimas vagas)

### Step 4: Preparar para Aprovacao (2 min)

Apresentar content pack para Inacio:
- Formato: lista resumida com titulo + hook de cada peca
- Inacio aprova, ajusta ou descarta pecas
- Publicacao: Inacio publica ou delega

## Output

```yaml
output:
  primary: "flows/{flow-slug}/content/"
  contents:
    - "content/content-pack.yaml"
    - "content/calendar.yaml"
    - "content/pieces/reel-01.md"
    - "content/pieces/carrossel-01.md"
    - "content/pieces/post-linkedin-01.md"
    - "content/pieces/thread-01.md"
    - "content/pieces/newsletter-01.md"
    - "..."
```

## Validacao

- [ ] Minimo 10 pecas de conteudo
- [ ] Pelo menos 2 plataformas cobertas
- [ ] Hooks claros e orientados a dor/resultado
- [ ] Calendario de 14 dias definido
- [ ] Cada peca tem CTA claro
- [ ] Linguagem alinhada com voz de Inacio (Catalyst: inovacao + energia)

**Threshold:** 5/6

## Esforco Estimado

| Componente | Tempo |
|-----------|-------|
| Analisar hooks | 3 min |
| Gerar content pack | 15 min |
| Calendario | 5 min |
| Aprovacao | 2 min |
| **Total** | **25 min** |

---

**Proxima task:** monetize-flow (lancamento e vendas)
