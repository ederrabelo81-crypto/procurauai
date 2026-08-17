# 🗺️ Guia de Implementação - Multi-Cidades

## Visão Geral

Este documento descreve como expandir o Procurauai de Monte Santo de Minas para a região completa:

**Cidades alvo (7 municípios):**
1. Monte Santo de Minas (base atual)
2. Arceburgo
3. Itamogi
4. Guaranésia
5. São Sebastião do Paraíso
6. Guaxupé
7. Passos (fase 2)

---

## ✅ Validação da Ideia de Negócio

### A ideia é VÁLIDA e tem POTENCIAL

**Problemas que resolve:**
- Comércio local sem presença digital
- Dificuldade de encontrar serviços na região
- Ausência de plataforma com WhatsApp direto
- Dependência excessiva do Google Maps

**Diferenciais competitivos:**
1. ✅ WhatsApp como botão principal de conversão
2. ✅ Curadoria humana dos dados
3. ✅ Foco hiperlocal no interior
4. ✅ Custo zero de API em produção (após implementação)
5. ✅ Preço acessível para comerciantes locais

### Mercado Expandido

| Cidade | Habitantes | Estabelecimentos* | Prioridade |
|--------|-----------|------------------|------------|
| São Sebastião do Paraíso | 71.000 | ~2.500 | Alta |
| Guaxupé | 52.000 | ~1.800 | Alta |
| Guaranésia | 19.000 | ~650 | Média |
| Monte Santo de Minas | 22.000 | ~750 | Base |
| Arceburgo | 10.000 | ~350 | Média |
| Itamogi | 10.000 | ~350 | Média |
| Passos | 114.000 | ~4.000 | Futuro |
| **TOTAL** | **~298.000** | **~10.400** | - |

*Estimativa: 1 estabelecimento para cada 28-30 habitantes

### Potencial Financeiro

**Receita Mensal Potencial (região completa):**
- Cenário conservador (5% conversão): **R$ 25.000-35.000/mês**
- Cenário moderado (10% conversão): **R$ 50.000-70.000/mês**
- Cenário otimista (15% conversão): **R$ 75.000-100.000/mês**

---

## 🔧 Otimização da API Google Maps

### Problema Atual

O consumo contínuo da API do Google para exibição de mapas gera custos recorrentes desnecessários:
- 1 cidade: ~R$ 3.100/ano
- 7 cidades: ~R$ 21.700/ano
- 20 cidades: ~R$ 62.000/ano

### Solução: Modelo Híbrido

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO OTIMIZADO                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. COLETA INICIAL (API Google - UMA VEZ)                  │
│     • Script collect-places.mjs                             │
│     • Custo: ~100-200 requisições por cidade                │
│     • Dentro da cota grátis (1.000/mês)                     │
│                                                             │
│  2. ARMAZENAMENTO NO SUPABASE                              │
│     • Importação via import-businesses.mjs                  │
│     • Dados persistidos na tabela `businesses`              │
│     • google_place_id como chave de deduplicação            │
│                                                             │
│  3. VALIDAÇÃO MANUAL                                       │
│     • Script validate-businesses.mjs                        │
│     • Curador revisa dados importados                       │
│     • Adiciona WhatsApp (dado mais valioso!)                │
│     • Contato direto = prospecção de clientes               │
│                                                             │
│  4. APP EM PRODUÇÃO (ZERO API GOOGLE)                      │
│     • Leitura direta do Supabase                            │
│     • Mapas: usa coordenadas salvas (lat/lng)               │
│     • OpenStreetMap como fallback (grátis)                  │
│     • Custo recorrente: R$ 0                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Economia Estimada

| Cenário | Modelo Atual | Modelo Otimizado | Economia Anual |
|---------|-------------|------------------|----------------|
| 1 cidade | R$ 8,50/dia | R$ 0 | **R$ 3.100/ano** |
| 7 cidades | R$ 59,50/dia | R$ 0 | **R$ 21.700/ano** |
| 20 cidades | R$ 170/dia | R$ 0 | **R$ 62.000/ano** |

---

## 📋 Implementação Técnica

### Passo 1: Aplicar Migration no Banco de Dados

```bash
# No dashboard do Supabase, execute:
# SQL Editor > Run Query
```

Conteúdo do migration em:
`/workspace/supabase/migrations/20250817_add_verification_fields.sql`

**Campos adicionados:**
- `data_source`: Origem do dado (google_places, manual, user_submission, partnership)
- `verification_status`: Status de validação (pending, verified, rejected, needs_update)
- `verified_at`: Data/hora da validação manual
- `verified_by`: ID do usuário que validou
- `last_synced_at`: Última sincronização com Google

### Passo 2: Validar Estabelecimentos Existentes

```bash
# Ver estabelecimentos pendentes
node scripts/validate-businesses.mjs

# Filtrar por cidade específica
node scripts/validate-businesses.mjs --city="Monte Santo de Minas"

# Exportar para CSV (revisão offline)
node scripts/validate-businesses.mjs --export-csv

# Importar validações feitas no CSV
node scripts/validate-businesses.mjs --import-csv=data/validation/pending-2025-08-17.csv
```

**Fluxo de trabalho recomendado:**
1. Exporte todos os estabelecimentos pendentes
2. Revise no Excel/Google Sheets
3. Adicione WhatsApps (informação mais valiosa!)
4. Corrija categorias e horários
5. Marque como "verified" ou "rejected"
6. Importe as validações

### Passo 3: Coletar Dados das Novas Cidades

```bash
# Editar scripts/collect-places.mjs para incluir novas cidades
const cities = [
  { name: 'Monte Santo de Minas', lat: -21.9339, lng: -46.9947 },
  { name: 'Arceburgo', lat: -21.9419, lng: -47.0689 },
  { name: 'Itamogi', lat: -21.9556, lng: -46.9153 },
  { name: 'Guaranésia', lat: -21.3056, lng: -46.8156 },
  { name: 'São Sebastião do Paraíso', lat: -20.9167, lng: -46.9833 },
  { name: 'Guaxupé', lat: -21.3019, lng: -46.7139 },
  { name: 'Passos', lat: -20.7156, lng: -46.6128 }
];

// Executar coleta
node scripts/collect-places.mjs
```

### Passo 4: Importar Dados Coletados

```bash
# Importar para o Supabase
node scripts/import-businesses.mjs

# Os novos registros virão com:
# - data_source: 'google_places'
# - verification_status: 'pending'
# - last_synced_at: timestamp atual
```

### Passo 5: Repetir Validação Manual para Cada Cidade

```bash
# Para cada cidade da expansão
node scripts/validate-businesses.mjs --city="Arceburgo" --export-csv
node scripts/validate-businesses.mjs --city="Itamogi" --export-csv
node scripts/validate-businesses.mjs --city="Guaranésia" --export-csv
# ... etc
```

### Passo 6: Modificar Componentes de Mapa (Opcional mas Recomendado)

Para eliminar completamente a dependência da API Google:

1. **Modificar `src/lib/maps.ts`** para usar OpenStreetMap como padrão
2. **Atualizar `src/components/maps/StaticMap.tsx`** para usar coordenadas salvas
3. **Implementar cache** de 7 dias para mapas estáticos

Exemplo de uso:
```typescript
<StaticMap 
  latitude={business.latitude} 
  longitude={business.longitude}
  useGoogleEmbed={false} // Padrão: false (usa OSM)
/>
```

---

## 📅 Cronograma de Expansão

### Fase 1: Consolidação Regional (Meses 1-6)

**Semana 1-2:**
- [ ] Aplicar migration no Supabase
- [ ] Validar todos os estabelecimentos de Monte Santo de Minas
- [ ] Adicionar WhatsApp de pelo menos 200 estabelecimentos

**Semana 3-4:**
- [ ] Coletar dados de Arceburgo e Itamogi
- [ ] Processar validação manual das duas cidades
- [ ] Lançar campanha nas 3 cidades

**Mês 2-3:**
- [ ] Fechar primeiros 20 clientes Pro
- [ ] Implementar sistema de anúncios
- [ ] Parceria com associações comerciais

**Mês 4-6:**
- [ ] Expandir para Guaranésia
- [ ] Atingir 800+ estabelecimentos ativos
- [ ] 5.000+ usuários únicos/mês

### Fase 2: Dominação da Micro-região (Meses 6-12)

**Mês 7-8:**
- [ ] Entrar em São Sebastião do Paraíso
- [ ] Entrar em Guaxupé
- [ ] Contratar 1-2 coletores em campo

**Mês 9-12:**
- [ ] Atingir 2.500+ estabelecimentos
- [ ] 20.000+ usuários únicos/mês
- [ ] R$ 50k+ de receita mensal recorrente

### Fase 3: Expansão para Centros Maiores (Ano 2)

- [ ] Adicionar Passos (114k habitantes)
- [ ] 5.000+ estabelecimentos
- [ ] Funcionalidades premium (delivery, agendamentos)
- [ ] App PWA com notificações push

---

## 🎯 Métricas de Sucesso (KPIs)

| Métrica | Meta 6 meses | Meta 12 meses | Meta 24 meses |
|---------|-------------|--------------|---------------|
| Estabelecimentos ativos | 800 | 2.500 | 6.000 |
| Usuários únicos/mês | 5.000 | 20.000 | 60.000 |
| Conversão para planos pagos | 5% | 10% | 12% |
| Receita mensal recorrente | R$ 10k | R$ 50k | R$ 150k |
| Ticket médio por cliente | R$ 67 | R$ 72 | R$ 75 |
| Custo com API Google | R$ 0 | R$ 0 | R$ 0 |

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|-------------|---------|-----------|
| Baixa adesão de comerciantes | Média | Alto | Campanha educativa + 30 dias grátis |
| Concorrência do Google Maps | Alta | Médio | Foco em WhatsApp + curadoria humana |
| Dados desatualizados | Alta | Médio | Validação trimestral + denúncias |
| Custo de aquisição alto | Média | Médio | Parcerias + programa de indicação |
| Expansão muito rápida | Baixa | Alto | Seguir critérios rígidos de entrada |

---

## 📞 Próximos Passos Imediatos

1. **Hoje:** Aplicar migration no Supabase
2. **Esta semana:** Validar estabelecimentos de Monte Santo de Minas
3. **Próxima semana:** Coletar dados de Arceburgo e Itamogi
4. **Mês que vem:** Lançar campanha regional

**Documentação complementar:**
- `/workspace/docs/ANALISE-COMPLETA-NEGOCIO.md` - Análise detalhada do negócio
- `/workspace/docs/implementacao-otimizacao-api.md` - Detalhes técnicos da API
- `/workspace/scripts/validate-businesses.mjs` - Script de validação
- `/workspace/supabase/migrations/20250817_add_verification_fields.sql` - Migration

---

## ✅ Checklist de Validação da Ideia

- [x] Problema real identificado
- [x] Mercado de ~300k habitantes e 10k+ estabelecimentos
- [x] Modelo de receita claro e testável
- [x] Diferenciais competitivos sustentáveis
- [x] Tecnologia adequada e escalável
- [x] Custo operacional reduzido com otimização da API
- [x] Plano de expansão geográfica definido
- [x] Scripts de validação implementados

**Conclusão:** A ideia de negócio é **VÁLIDA** e tem **ALTO POTENCIAL** de sucesso na região.
