# 📊 Resumo Executivo - Procurauai

## Ideia de Negócio: ✅ VALIDADA COM ALTO POTENCIAL

---

## 🎯 O Que É

**Guia comercial digital para cidades do interior de MG**
- Conecta consumidores locais a negócios, serviços e eventos
- Foco em **WhatsApp como botão de conversão** (dado mais valioso!)
- Curadoria humana + tecnologia escalável

---

## 📍 Mercado Alvo Expandido

| Cidade | Habitantes | Estabelecimentos | Prioridade |
|--------|-----------|-----------------|------------|
| São Sebastião do Paraíso | 71.000 | ~2.500 | 🔴 Alta |
| Guaxupé | 52.000 | ~1.800 | 🔴 Alta |
| Guaranésia | 19.000 | ~650 | 🟡 Média |
| **Monte Santo de Minas** | **22.000** | **~750** | **Base atual** |
| Arceburgo | 10.000 | ~350 | 🟡 Média |
| Itamogi | 10.000 | ~350 | 🟡 Média |
| Passos | 114.000 | ~4.000 | ⚪ Futuro |
| **TOTAL** | **~298.000** | **~10.400** | - |

---

## 💰 Potencial Financeiro

### Receita Mensal (Região Completa)
```
Cenário Conservador (5% conversão):  R$ 25.000-35.000/mês
Cenário Moderado (10% conversão):    R$ 50.000-70.000/mês
Cenário Otimista (15% conversão):    R$ 75.000-100.000/mês
```

### Modelos de Monetização
| Plano | Preço | Benefícios | Conversão Esperada |
|-------|------|-----------|-------------------|
| Gratuito | R$ 0 | Listagem básica | 85-90% |
| Pro | R$ 49-79/mês | Fotos, destaque, analytics | 8-12% |
| Destaque | R$ 99-149/mês | Topo buscas, banners | 2-3% |

---

## 🏆 Diferenciais Competitivos

✅ **WhatsApp direto** - Ninguém mais tem isso automatizado  
✅ **Curadoria humana** - Dados validados com comerciantes  
✅ **Foco hiperlocal** - Entende cidade pequena  
✅ **Comunidade + Eventos** - Engajamento além de listagem  
✅ **Preço acessível** - Fração do Google/Facebook ads  

---

## ⚠️ Problema Crítico Atual

**Consumo contínuo da API do Google Maps = Custos recorrentes altos**

```
❌ ANTES: Cada visualização de mapa = chamada API paga
   • 1 cidade: R$ 255/mês → R$ 3.060/ano
   • 7 cidades: R$ 1.785/mês → R$ 21.420/ano
   • 20 cidades: R$ 5.100/mês → R$ 61.200/ano
```

---

## ✅ Solução Proposta

**Modelo Híbrido: API Google SÓ para coleta inicial**

```
FLUXO OTIMIZADO:

1. COLETA INICIAL (Google Places API - UMA VEZ)
   └─→ Script existente: collect-places.mjs
   └─→ Custo: ~100-200 requisições/cidade (GRÁTIS na cota mensal)

2. ARMAZENAMENTO (Supabase)
   └─→ Dados persistidos no PostgreSQL
   └─→ google_place_id como chave única

3. VALIDAÇÃO MANUAL (Painel Admin)
   └─→ Revisar dados importados
   └─→ Adicionar WhatsApp (ouro!)
   └─→ Corrigir categorias, horários, fotos
   └─→ Contato com comerciante = PROSPECÇÃO

4. APP EM PRODUÇÃO (ZERO API GOOGLE)
   └─→ Leitura direta do Supabase
   └─→ Mapas: OpenStreetMap (grátis) ou coordenadas salvas
   └─→ Custo recorrente: R$ 0
```

### Economia Estimada
```
7 cidades da região: R$ 21.420/ano economizados ✅
```

---

## 🚀 Roadmap de Implementação

### Semana 1-2: Otimização API (PRIORIDADE #1)
- [ ] Adicionar campos de validação no banco
- [ ] Criar script de validação em lote
- [ ] Substituir mapas Google por OSM
- [ ] Painel admin básico para curadoria

### Mês 1: Completar Monte Santo de Minas
- [ ] 400+ estabelecimentos com WhatsApp válido
- [ ] 10-15 clientes Pro (plano fundador)
- [ ] Validar fluxo de campo

### Mês 2: Arceburgo + Itamogi
- [ ] Coleta Google (1 tarde)
- [ ] Validação manual (2 semanas)
- [ ] Lançamento conjunto

### Mês 3: Guaranésia
- [ ] Mesma dinâmica de MSM

### Mês 4-5: Paraíso + Guaxupé
- [ ] Mercados maiores (70k + 50k hab)
- [ ] Equipe de 2 coletores em campo

### Mês 6+: Passos (Fase 2)
- [ ] Centro regional (114k hab)
- [ ] Estratégia diferenciada

---

## 📈 Métricas de Sucesso

| KPI | 6 meses | 12 meses | 24 meses |
|-----|--------|---------|----------|
| Estabelecimentos ativos | 800 | 2.500 | 6.000 |
| Usuários únicos/mês | 5.000 | 20.000 | 60.000 |
| Conversão planos pagos | 5% | 10% | 12% |
| Receita mensal (MRR) | R$ 10k | R$ 50k | R$ 150k |

---

## ⚠️ Riscos e Mitigações

| Risco | Mitigação |
|-------|----------|
| Baixa adesão de comerciantes | Casos de sucesso, demos grátis |
| Dificuldade de monetização | Freemium, foco em valor percebido |
| Escala operacional | Automação, processos, parcerias locais |
| Concorrência Google/iFood | Diferenciação local + WhatsApp |

---

## 🎯 Próximos Passos Imediatos (30 Dias)

### 1. **Implementar otimização da API Google** ⭐ PRIORIDADE MÁXIMA
   - Modificar scripts para coleta única
   - Validar que app funciona SEM chamadas recorrentes
   - Economia anual: R$ 3.000-21.000+

### 2. **Completar Monte Santo de Minas**
   - Meta: 400 estabelecimentos com WhatsApp
   - Fechar 10-15 clientes Pro (fundador)
   - Validar processo de campo

### 3. **Preparar expansão Arceburgo/Itamogi**
   - Coleta Google (1 tarde)
   - Roteiro de campo planejado
   - Contato associação comercial

### 4. **Construir painel admin básico**
   - CRUD de estabelecimentos
   - Validação em lote
   - Upload de fotos

### 5. **Documentar cases de sucesso**
   - Depoimentos primeiros clientes
   - Métricas de acesso
   - Material de vendas

---

## 💡 Conclusão

### Veredito: ✅ IDEA VALIDADA

**Pontos Fortes:**
1. ✅ Problema real não resolvido no interior
2. ✅ Tecnologia adequada e escalável
3. ✅ Modelo de coleta eficiente (R$ 0)
4. ✅ Diferencial claro (WhatsApp + curadoria)
5. ✅ Mercado grande o suficiente

**Atenção Crítica:**
1. ⚠️ Execução operacional é tudo (campo, validação)
2. ⚠️ Monetização requer prova de valor primeiro
3. ⚠️ Expansão deve ser gradual e baseada em métricas
4. ⚠️ **Otimizar API Google ANTES de expandir**

---

## 📞 Contato

**Eder Rabelo**  
📧 ederrabelo81@gmail.com  
📱 (11) 98193-7266  
🌐 procurauai.com.br

---

*Documento criado em Agosto 2025*  
*Versão 1.0 - Resumo Executivo*
