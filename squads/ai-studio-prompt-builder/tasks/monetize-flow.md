# Task: Monetize Flow

**Task ID:** ai-studio/monetize-flow
**Version:** 1.0.0
**Agent:** monetization-strategist + aspb-chief
**Depends On:** package-flow (QG-SHIP passed) + amplify-content

---

## Proposito

Executar a estrategia de lancamento e monetizacao do fluxo. Esta e a task final do pipeline — onde o fluxo vira receita real. Foco: R$5.000 nos primeiros 2 meses com 3-5 fluxos validados.

## Tipo de Executor

**Interativo** — Requer acao de Inacio (DMs, lives, workshops)

## Steps

### Step 1: Preparar Lancamento (1 dia)

- [ ] Landing page ativa com copy e CTA
- [ ] Mecanismo de pagamento configurado (Pix + cartao)
- [ ] Material de conteudo-isca pronto (do content-amplifier)
- [ ] Lista de 20 pessoas do circulo quente
- [ ] Demo gravada ou agendada

### Step 2: Lancamento Soft (Semana 1)

**Inacio executa (Zona de Genialidade: comunicar + ser o rosto):**
- [ ] Enviar 20 DMs pessoais com oferta direta
- [ ] Publicar 3 pecas de conteudo-isca
- [ ] Fazer 1 live demonstrando o fluxo ao vivo
- [ ] Coletar interesse (minimo 5 interessados)

### Step 3: Venda (Semana 2)

- [ ] Converter interessados em compradores
- [ ] Executar workshop ao vivo (se formato workshop)
- [ ] Entregar acesso ao fluxo (se formato self-service)
- [ ] Meta: 5 vendas = R$2.485+ (a R$497)

### Step 4: Proof Stack (Semana 3)

- [ ] Coletar 3+ depoimentos com resultado concreto
- [ ] Documentar cases de sucesso
- [ ] Atualizar landing page com proof social
- [ ] Publicar 5 pecas de conteudo derivado dos resultados

### Step 5: Escala (Semana 4+)

- [ ] Abrir segunda edicao com preco ajustado (+20%)
- [ ] Usar proof stack da primeira edicao
- [ ] Testar novos canais de aquisicao
- [ ] Avaliar: escalar este fluxo ou criar o proximo?

## Metricas de Sucesso

| Metrica | Target Minimo | Target Ideal |
|---------|---------------|-------------|
| DMs enviadas | 20 | 40 |
| Interessados | 5 | 10 |
| Vendas | 5 | 10 |
| Receita | R$2.485 | R$4.970 |
| Depoimentos | 3 | 5 |
| NPS | 7+ | 9+ |

## Tracking

```yaml
monetization_tracker:
  flow_id: "FLOW-001"
  launch_date: "2026-XX-XX"
  metrics:
    dms_sent: 0
    interested: 0
    sales: 0
    revenue: 0
    testimonials: 0
    nps: null
  status: "pre-launch | launched | generating-revenue | scaling"
```

## Output

```yaml
output:
  primary: "flows/{flow-slug}/monetization/tracker.yaml"
  secondary: "flows/{flow-slug}/monetization/testimonials/"
  revenue: "Receita real gerada"
```

---

**Meta do squad:** 3-5 fluxos monetizados em 60 dias = R$5.000+
