# Análise de Negócio - Procurauai

## 📋 Resumo Executivo

O **Procurauai** é um guia comercial digital focado em cidades do interior de Minas Gerais, atualmente centrado em Monte Santo de Minas (22 mil habitantes). A plataforma conecta consumidores locais a negócios, serviços e eventos através de uma interface moderna e funcional.

### Situação Atual
- ✅ MVP funcional com tecnologia moderna (React, Supabase, Google Maps)
- ✅ Sistema de coleta de dados via Google Places API implementado
- ✅ Foco inicial em Monte Santo de Minas
- ⚠️ Consumo contínuo da API do Google Maps para exibição de dados
- ⚠️ Escopo geográfico limitado

---

## 🎯 Validação da Ideia de Negócio

### 1. Problema que Resolve

| Problema | Solução Procurauai |
|----------|-------------------|
| Comércio local sem presença digital | Listagem completa com fotos, horários, WhatsApp |
| Dificuldade de encontrar serviços na região | Busca inteligente com filtros e categorias |
| Ausência de avaliações confiáveis | Sistema de reviews próprio |
| Eventos e ofertas não centralizados | Seção dedicada de eventos e promoções |
| Dependência de indicações boca-a-boca | Plataforma de descoberta centralizada |

### 2. Tamanho de Mercado

#### Região Alvo Expandida

| Cidade | Habitantes | Estabelecimentos Estimados* | Prioridade |
|--------|-----------|---------------------------|------------|
| São Sebastião do Paraíso | 71.000 | ~2.500 | Alta |
| Guaxupé | 52.000 | ~1.800 | Alta |
| Guaranésia | 19.000 | ~650 | Média |
| Monte Santo de Minas | 22.000 | ~750 | Base atual |
| Arceburgo | 10.000 | ~350 | Média |
| Itamogi | 10.000 | ~350 | Média |
| Passos | 114.000 | ~4.000 | Futuro (fase 2) |
| **Total** | **~298.000** | **~10.400** | - |

*Estimativa: 1 estabelecimento para cada 28-30 habitantes (média IBGE para cidades do interior)

#### Potencial de Receita

**Modelo de Monetização Sugerido:**

| Plano | Preço/mês | Benefícios | Conversão Esperada |
|-------|----------|-----------|-------------------|
| Gratuito | R$ 0 | Listagem básica | 85-90% dos estabelecimentos |
| Pro | R$ 49-79 | Fotos ilimitadas, destaque na busca, analytics | 8-12% |
| Destaque | R$ 99-149 | Topo das buscas, banner rotativo, posts semanais | 2-3% |

**Receita Mensal Potencial (região completa):**
- Cenário conservador (5% conversão paga): **R$ 25.000-35.000/mês**
- Cenário moderado (10% conversão paga): **R$ 50.000-70.000/mês**
- Cenário otimista (15% conversão paga): **R$ 75.000-100.000/mês**

### 3. Concorrência

| Tipo | Exemplos | Vantagens | Desvantagens |
|------|---------|----------|-------------|
| Google Maps | Global | Onipresente, gratuito | Pouco engajamento local, sem WhatsApp direto |
| iFood/Rappi | Delivery | Grande alcance | Apenas restaurantes, comissão alta (20-30%) |
| Guias municipais | Sites de prefeituras | Oficiais | Desatualizados, UX ruim |
| Páginas amarelas | Online | Tradicional | Obsoleto, sem mobile-first |
| **Procurauai** | **Regional** | **Foco local, WhatsApp, curadoria humana** | **Menor alcance inicial** |

### 4. Diferenciais Competitivos

✅ **WhatsApp como botão de conversão principal** - O dado mais valioso, não disponível via APIs automáticas  
✅ **Curadoria humana** - Dados validados com os próprios comerciantes  
✅ **Foco hiperlocal** - Entende a dinâmica de cidades pequenas  
✅ **Comunidade e eventos** - Vai além de listagem, cria engajamento  
✅ **Preço acessível** - Fraction do custo de anúncios no Google/Facebook  

---

## 🚀 Potencial de Crescimento

### Fases de Expansão

#### Fase 1: Consolidação Regional (Meses 1-6)
- Completar Monte Santo de Minas (meta: 400+ estabelecimentos ativos)
- Expandir para Arceburgo e Itamogi (cidades coladas, mesma dinâmica)
- Validar modelo de monetização com primeiros assinantes Pro

#### Fase 2: Dominação da Micro-região (Meses 6-12)
- Entrar em Guaranésia, São Sebastião do Paraíso e Guaxupé
- Atingir 2.000+ estabelecimentos na base
- Implementar sistema de anúncios e banners pagos
- Parcerias com associações comerciais locais

#### Fase 3: Expansão para Centros Maiores (Ano 2)
- Adicionar Passos (114k habitantes) e outras cidades da região
- 5.000+ estabelecimentos
- Funcionalidades premium: delivery integrado, agendamentos online
- App PWA com notificações push

#### Fase 4: Franchising do Modelo (Ano 3+)
- Licenciar a plataforma para outras regiões de MG
- White-label para prefeituras e associações comerciais
- Expansão para outros estados (interior de SP, PR, RS)

### Métricas de Sucesso (KPIs)

| Métrica | Meta 6 meses | Meta 12 meses | Meta 24 meses |
|---------|-------------|--------------|---------------|
| Estabelecimentos ativos | 800 | 2.500 | 6.000 |
| Usuários únicos/mês | 5.000 | 20.000 | 60.000 |
| Conversão para planos pagos | 5% | 10% | 12% |
| Receita mensal recorrente | R$ 10k | R$ 50k | R$ 150k |
| Ticket médio por cliente pago | R$ 67 | R$ 72 | R$ 75 |

---

## 🔧 Melhorias Críticas no Modelo Atual

### 1. **Otimização do Uso da API do Google Maps** ⭐ PRIORIDADE MÁXIMA

#### Problema Atual
O consumo contínuo da API do Google para exibição de mapas e dados gera custos recorrentes desnecessários, especialmente com a expansão para múltiplas cidades.

#### Solução Proposta: **Modelo Híbrido de Coleta e Armazenamento**

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO OTIMIZADO                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. COLETA INICIAL (API Google - UMA VEZ)                  │
│     └─→ Script collect-places.mjs                           │
│         • Busca estabelecimentos por categoria/cidade       │
│         • Extrai: nome, endereço, coords, horário, tel      │
│         • Custo: ~100-200 requisições por cidade            │
│         • Dentro da cota grátis (1.000/mês)                 │
│                                                             │
│  2. ARMAZENAMENTO NO SUPABASE                              │
│     └─→ Importação via import-businesses.mjs                │
│         • Dados persistidos na tabela `businesses`          │
│         • google_place_id como chave de deduplicação        │
│         • Campos críticos: lat/lng, address, hours, phone   │
│                                                             │
│  3. VALIDAÇÃO MANUAL                                       │
│     └─→ Painel Admin (a desenvolver)                        │
│         • Curador revisa dados importados                   │
│         • Adiciona WhatsApp (dado mais valioso!)            │
│         • Corrige categorias, horários, fotos               │
│         • Contato direto com comerciante = prospecção       │
│                                                             │
│  4. APP EM PRODUÇÃO (ZERO API GOOGLE)                      │
│     └─→ Leitura direta do Supabase                          │
│         • Mapas: usa coordenadas salvas (lat/lng)           │
│         • Endereço: texto armazenado                        │
│         • Google Maps Embed: só se necessário, com cache    │
│         • Custo recorrente: R$ 0                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Implementação Técnica

**A. Modificação no Schema do Supabase**

Adicionar campos para controle de qualidade dos dados:

```sql
-- Adicionar à tabela businesses
ALTER TABLE businesses ADD COLUMN data_source TEXT DEFAULT 'google_places';
-- Valores: 'google_places', 'manual', 'user_submission', 'partnership'

ALTER TABLE businesses ADD COLUMN verification_status TEXT DEFAULT 'pending';
-- Valores: 'pending', 'verified', 'rejected', 'needs_update'

ALTER TABLE businesses ADD COLUMN verified_at TIMESTAMPTZ;
ALTER TABLE businesses ADD COLUMN verified_by UUID REFERENCES auth.users(id);

ALTER TABLE businesses ADD COLUMN last_synced_at TIMESTAMPTZ;
-- Última vez que dados foram sincronizados com Google (se aplicável)
```

**B. Script de Validação em Lote**

Criar `scripts/validate-businesses.mjs`:

```javascript
// Carrega estabelecimentos com status 'pending'
// Gera relatório para revisão manual
// Permite aprovação/rejeição em lote
// Atualiza verification_status para 'verified'
```

**C. Componente de Mapa Offline-First**

Modificar `src/components/maps/StaticMap.tsx`:

```typescript
// ANTES: Chamada direta à API do Google para cada renderização
<MapComponent apiKey={VITE_GOOGLE_MAPS_API_KEY} />

// DEPOIS: Usa coordenadas salvas + mapa estático ou fallback
<StaticMap 
  latitude={business.latitude} 
  longitude={business.longitude}
  useGoogleEmbed={false} // Só true se usuário clicar em "ver no mapa"
/>
```

**D. Cache Estratégico (se precisar usar Google Maps)**

```typescript
// src/lib/maps.ts
const MAP_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

async function getStaticMapUrl(lat: number, lng: number) {
  const cached = await caches.match(`map-${lat}-${lng}`);
  if (cached && !isCacheExpired(cached)) {
    return cached;
  }
  
  // Só chama API se não tiver cache
  const url = buildGoogleStaticMapUrl(lat, lng);
  await caches.put(`map-${lat}-${lng}`, response);
  return url;
}
```

#### Economia Estimada

| Cenário | Modelo Atual | Modelo Otimizado | Economia Anual |
|---------|-------------|------------------|----------------|
| 1 cidade (MSM) | ~500 req/dia × R$ 0,017 = R$ 8,50/dia | 100 req/mês (coleta) = R$ 0 | **R$ 3.100/ano** |
| 7 cidades | ~3.500 req/dia = R$ 59,50/dia | 700 req/mês = R$ 0 | **R$ 21.700/ano** |
| 20 cidades | ~10.000 req/dia = R$ 170/dia | 2.000 req/mês = R$ 0 | **R$ 62.000/ano** |

*Valores baseados na pricing da Places API (New) - SKU Enterprise*

---

### 2. **Expansão Geográfica Estruturada**

#### Critérios para Entrada em Nova Cidade

✅ **Pré-requisitos obrigatórios:**
- Cidade anterior com ≥300 estabelecimentos ativos
- ≥50 usuários únicos/dia consistentes
- Pelo menos 5 clientes pagantes
- Processo de coleta e validação documentado

✅ **Indicadores de demanda:**
- Buscas no Google por "[categoria] em [cidade]"
- Grupos de Facebook/WhatsApp ativos na cidade
- Associação comercial organizada
- Eventos regulares (feiras, festas)

#### Plano de Rollout Regional

```
Semana 1-2:   Monte Santo de Minas (completo)
              ├─ 400+ estabelecimentos
              └─ Validação do modelo

Semana 3-6:   Campo (WhatsApp + fotos)
              └─ Conversão dos primeiros clientes Pro

Mês 2:        Arceburgo + Itamogi (cidades gêmeas)
              ├─ Coleta Google: 1 tarde
              └─ Campo: 2 semanas

Mês 3:        Guaranésia
              └─ Mesma dinâmica de MSM

Mês 4-5:      São Sebastião do Paraíso + Guaxupé
              ├─ Mercados maiores (70k + 50k hab)
              └─ Requer 2 coletores em campo

Mês 6+:       Passos (fase 2)
              └─ Cidade maior, estratégia diferente
```

#### Adaptações por Tamanho de Cidade

| Porte | Habitant es | Estratégia | Custo Coleta | Tempo Campo |
|-------|-----------|------------|--------------|-------------|
| Pequeno | <15k | 1 coletor, 2 semanas | R$ 0 (API grátis) | 10-15 dias |
| Médio | 15-50k | 2 coletores, 3 semanas | R$ 0-50 | 15-20 dias |
| Grande | 50-100k | Equipe 3-4 pessoas, 1 mês | R$ 100-200 | 25-30 dias |
| Muito grande | >100k | Parceria local + equipe | R$ 300+ | 40+ dias |

---

### 3. **Monetização e Sustentabilidade**

#### Fluxo de Receita Diversificado

```
┌────────────────────────────────────────────────────────────┐
│                 RECEITA RECORRENTE (MRR)                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Planos de Assinatura (70% da receita)                    │
│  ├─ Pro (R$ 49-79/mês)                                    │
│  └─ Destaque (R$ 99-149/mês)                              │
│                                                            │
│  Anúncios e Patrocínios (20% da receita)                  │
│  ├─ Banners rotativos na home                             │
│  ├─ Destaque por categoria                                │
│  └─ Posts patrocinados no feed                            │
│                                                            │
│  Serviços Premium (10% da receita)                        │
│  ├─ Gestão de redes sociais (R$ 300-500/mês)              │
│  ├─ Sessão de fotos profissional (R$ 150/sessão)          │
│  └─ Configuração de Google Meu Negócio (R$ 200 one-time)  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

#### Estratégia de Preços por Porto de Cidade

| Cidade | Plano Pro | Plano Destaque | Justificativa |
|--------|----------|---------------|---------------|
| MSM, Arceburgo, Itamogi | R$ 49/mês | R$ 99/mês | Poder aquisitivo menor |
| Guaranésia | R$ 59/mês | R$ 119/mês | Classe média consolidada |
| Paraíso, Guaxupé | R$ 79/mês | R$ 149/mês | Mercado maior, mais competição |
| Passos | R$ 99/mês | R$ 179/mês | Centro regional |

#### Táticas de Aquisição de Clientes Pagantes

1. **Freemium com limite temporal**: 30 dias grátis no plano Pro
2. **Fundador**: primeiros 50 clientes de cada cidade = 50% off vitalício
3. **Indicação**: indique 3 comércios = 1 mês grátis
4. **Pacote anual**: 2 meses grátis no pagamento anual
5. **Associações comerciais**: desconto de 20% para associados

---

### 4. **Tecnologia e Infraestrutura**

#### Stack Atual (✅ Adequada)

| Camada | Tecnologia | Avaliação |
|--------|-----------|----------|
| Frontend | React 18 + Vite + TypeScript | ✅ Excelente |
| UI | Tailwind + shadcn/ui | ✅ Moderna, rápida |
| Backend | Supabase (Postgres + Auth) | ✅ Escalável, barato |
| Hospedagem | Vercel | ✅ CDN global, free tier generoso |
| Banco | PostgreSQL + PostGIS | ✅ Ideal para geoqueries |

#### Melhorias Técnicas Sugeridas

**A. Otimização de Performance**

```typescript
// Implementar React Query com cache agressivo
const { data: businesses } = useQuery({
  queryKey: ['businesses', city, category],
  queryFn: () => fetchBusinesses(city, category),
  staleTime: 5 * 60 * 1000, // 5 minutos
  gcTime: 30 * 60 * 1000,   // 30 minutos no cache
});
```

**B. SEO Local**

```typescript
// Gerar sitemap dinâmico por cidade
// /monte-santo-de-minas/restaurantes
// /guaxupe/farmacias
// Schema.org LocalBusiness markup em cada página
```

**C. Analytics Próprio**

```typescript
// Evitar Google Analytics (privacidade + performance)
// Usar Plausible ou Fathom (pagos, mas valem a pena)
// Ou construir analytics simples no Supabase
```

**D. PWA (Progressive Web App)**

```json
// manifest.json
{
  "name": "Procurauai",
  "short_name": "Procurauai",
  "display": "standalone",
  "offline_enabled": true,
  "cache_strategy": "network-first"
}
```

---

### 5. **Operações e Processos**

#### Checklist de Lançamento por Cidade

```markdown
## Pré-lançamento (Semana 1)
- [ ] Coleta Google Places API completada
- [ ] Dados importados no Supabase
- [ ] Revisão manual no Google Sheets
- [ ] Categorias padronizadas
- [ ] Descrições em pt-BR (script fix-descriptions)

## Validação (Semana 2-3)
- [ ] Contato com 50+ estabelecimentos prioritários
- [ ] WhatsApp coletado e validado
- [ ] Fotos recebidas ou tiradas
- [ ] Horários confirmados
- [ ] Primeiros 10 clientes Pro fechados

## Lançamento (Semana 4)
- [ ] Release nas redes sociais
- [ ] Parceria com associação comercial
- [ ] Imprensa local (rádio, jornal)
- [ ] Grupo de WhatsApp da cidade
- [ ] Evento de lançamento (opcional)

## Pós-lançamento (Contínuo)
- [ ] 10-15 visitas/semana para novos cadastros
- [ ] Revisão trimestral de estabelecimentos
- [ ] Atualização de eventos e ofertas
- [ ] Relatórios mensais para clientes Pro
```

#### Equipe Mínima Viável

| Função | Dedicação | Quando Contratar |
|--------|----------|------------------|
| Founder/Vendas | Full-time | Agora (você) |
| Coletor/Curador | Part-time | Mês 2 (expansão) |
| Designer Freelancer | Projeto | Mês 3 (identidade visual) |
| Dev Frontend | Part-time | Mês 6 (features complexas) |
| Vendedor Comissionado | Comissão | Mês 9 (escalar vendas) |

---

## ⚠️ Riscos e Mitigações

### Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|-------------|---------|-----------|
| Baixa adesão de comerciantes | Média | Alto | Foco em casos de sucesso, demonstrações gratuitas |
| Concorrência do Google/iFood | Baixa | Médio | Diferenciação pelo local, WhatsApp, preço |
| Dificuldade de monetização | Média | Alto | Modelo freemium, foco em valor percebido |
| Escala operacional | Alta | Médio | Automação, processos documentados, parcerias locais |
| Mudança na API do Google | Baixa | Baixo | Dados já armazenados, dependência mínima |
| LGPD e privacidade | Média | Médio | Termos claros, opção de remoção, dados públicos apenas |

---

## 📊 Conclusão e Recomendações

### Veredito: ✅ IDEA VALIDADA COM ALTO POTENCIAL

**Pontos Fortes:**
1. Problema real e não resolvido em cidades do interior
2. Tecnologia adequada e escalável
3. Modelo de coleta eficiente e de baixo custo
4. Diferencial competitivo claro (WhatsApp + curadoria humana)
5. Mercado grande o suficiente para sustentabilidade

**Pontos de Atenção:**
1. Execução operacional é crítica (campo, validação)
2. Monetização requer prova de valor antes de cobrar
3. Expansão deve ser gradual e baseada em métricas
4. Dependência inicial do founder para vendas

### Próximos Passos Imediatos (30 dias)

1. **Implementar otimização da API Google** (prioridade #1)
   - Modificar scripts para coleta única
   - Validar que app funciona sem chamadas recorrentes
   - Documentar processo

2. **Completar Monte Santo de Minas**
   - Meta: 400 estabelecimentos com WhatsApp válido
   - Fechar 10-15 clientes Pro (fundador)
   - Validar fluxo de campo

3. **Preparar expansão para Arceburgo/Itamogi**
   - Coleta Google (1 tarde)
   - Planejar roteiro de campo
   - Contatar associação comercial

4. **Construir painel admin básico**
   - CRUD de estabelecimentos
   - Validação em lote
   - Upload de fotos

5. **Documentar cases de sucesso**
   - Depoimentos de primeiros clientes
   - Métricas de acesso/engajamento
   - Usar como material de vendas

---

## 📞 Contato e Próximos Passos

Este documento serve como guia estratégico para os próximos 12-24 meses do projeto. Recomendo revisão trimestral para ajustes de rota.

**Prioridade absoluta:** Implementar a otimização do uso da API do Google Maps antes de expandir para novas cidades, garantindo sustentabilidade financeira desde o início.

---

*Documento criado em Agosto 2025*  
*Versão 1.0*
