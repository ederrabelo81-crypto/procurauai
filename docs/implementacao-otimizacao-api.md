# Implementação Técnica - Otimização do Uso da API Google Maps

## 🎯 Objetivo

Eliminar o consumo recorrente da API do Google Maps em produção, utilizando-a **apenas para coleta inicial** de dados. Após a importação para o Supabase e validação manual, o app deve funcionar **sem chamadas à API**.

---

## 📊 Situação Atual vs. Situação Desejada

### Antes (Modelo Atual)
```
┌──────────────┐    API Call    ┌─────────────┐
│   Frontend   │ ────────────→ │ Google Maps │
│   (React)    │ ←──────────── │    API      │
│              │   Response    │             │
└──────────────┘               └─────────────┘
       ↓
  Cada renderização = 1 chamada API
  Custo: R$ 0,017 - R$ 0,031 por requisição
```

### Depois (Modelo Otimizado)
```
┌──────────────┐    Read Only   ┌─────────────┐
│   Frontend   │ ────────────→ │  Supabase   │
│   (React)    │ ←──────────── │  (Postgres) │
│              │   Dados       │             │
└──────────────┘   Locais      └─────────────┘
       ↓
  ZERO chamadas à API em produção
  Custo: R$ 0 (apenas coleta inicial)
```

---

## 🔧 Mudanças Necessárias

### 1. Schema do Banco de Dados (Supabase)

#### Campos Existentes (✅ Já temos)
```sql
-- Tabela businesses já possui:
- latitude DOUBLE PRECISION
- longitude DOUBLE PRECISION
- location GEOGRAPHY(POINT, 4326)
- address TEXT
- city TEXT
- hours TEXT
- phone TEXT
- whatsapp TEXT
- google_place_id TEXT
```

#### Campos Novos (Adicionar)
```sql
-- Adicionar colunas de controle de qualidade
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'google_places',
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- Criar índice para filtragem por status
CREATE INDEX IF NOT EXISTS businesses_verification_status_idx 
ON businesses (verification_status);

-- Índice composto para buscas por cidade + status
CREATE INDEX IF NOT EXISTS businesses_city_status_idx 
ON businesses (city, verification_status);
```

#### Script SQL Completo

O SQL de verdade está em
[`supabase/migrations/20260817_add_verification_fields.sql`](../supabase/migrations/20260817_add_verification_fields.sql)
— aplique-o pelo SQL Editor do Supabase. É idempotente: pode rodar de novo sem
efeito colateral.

Além das colunas e índices acima, a migração faz duas coisas que o esboço não
fazia:

- **`check` nos valores permitidos** de `data_source` e `verification_status`,
  em vez de `enum`. Com `text` + `check`, aceitar um valor novo é um `alter`
  simples; com `enum` seria migração de tipo.
- **Backfill de quem já estava aprovado.** `add column ... default` preenche as
  linhas antigas com `'pending'`, então não sobra nenhum `null` para filtrar:
  quem já tinha `is_verified = true` precisa ser promovido explicitamente, ou
  volta para a fila de revisão sem motivo.

⚠️ O banco de produção **não segue** `supabase/schema.sql` (ver §11 do
`CLAUDE.md`). Confira no painel se as colunas `city` e `is_verified` existem com
esses nomes antes de rodar.

---


### 2. Scripts de Coleta e Importação

#### A. Script `collect-places.mjs` (Já existe, ajustar comportamento)

**Mudança principal:** Garantir que todos os campos necessários sejam extraídos

```javascript
// scripts/collect-places.mjs
// Ajustes necessários:

// 1. Incluir campo data_source na saída
const placeData = {
  google_place_id: place.id,
  name: place.displayName,
  address: formatAddress(place.formattedAddress),
  latitude: place.location?.latitude,
  longitude: place.location?.longitude,
  phone: formatPhoneNumber(place.internationalPhoneNumber),
  website: place.websiteUri,
  hours: formatOpeningHours(place.openingHours),
  category: categorizePlace(place.types),
  rating: place.rating,
  user_ratings_count: place.userRatingCount,
  data_source: 'google_places',        // ← NOVO
  verification_status: 'pending',      // ← NOVO
  last_synced_at: new Date().toISOString(), // ← NOVO
  city: city                           // ← Garantir que está presente
};

// 2. Salvar metadados da coleta
const metadata = {
  collected_at: new Date().toISOString(),
  cities: cities,
  categories: categories,
  total_requests: requestCount,
  api_version: 'places_new',
  language: 'pt-BR'
};

fs.writeFileSync(
  path.join(outDir, `metadata-${dateStr}.json`),
  JSON.stringify(metadata, null, 2)
);
```

#### B. Script `import-businesses.mjs` (Ajustar para novos campos)

```javascript
// scripts/import-businesses.mjs
// Ajustes no mapeamento de campos

const fieldMapping = {
  google_place_id: 'google_place_id',
  name: 'name',
  address: 'address',
  latitude: 'latitude',
  longitude: 'longitude',
  phone: 'phone',
  website: 'website',
  hours: 'hours',
  category: 'category',
  rating: 'rating',
  user_ratings_count: 'review_count',
  data_source: 'data_source',           // ← NOVO
  verification_status: 'verification_status', // ← NOVO
  last_synced_at: 'last_synced_at',     // ← NOVO
  city: 'city'
};

// Na função de upsert:
const businessRow = {
  ...mappedData,
  // Preservar dados manuais se já existir registro
  whatsapp: existing?.whatsapp || mappedData.whatsapp,
  cover_images: existing?.cover_images || [],
  description: existing?.description || generateDescription(mappedData),
  is_verified: false // Só fica true após validação manual
};
```

#### C. Script `validate-businesses.mjs` (implementado)

O script existe em [`scripts/validate-businesses.mjs`](../scripts/validate-businesses.mjs).
A referência é o próprio arquivo — este documento não repete o código, para não
divergir dele.

O fluxo é de mão dupla e passa por planilha, porque a revisão é humana:

```bash
# 1. Ver o que está pendente
node scripts/validate-businesses.mjs
node scripts/validate-businesses.mjs --city="Guaxupé" --limit=200

# 2. Exportar para revisão offline → data/validation/pending-AAAA-MM-DD.csv
node scripts/validate-businesses.mjs --export-csv

# 3. Revisar no Excel/Sheets, depois conferir a prévia
node scripts/validate-businesses.mjs --import-csv=data/validation/ARQUIVO.csv --dry-run

# 4. Aplicar
node scripts/validate-businesses.mjs --import-csv=data/validation/ARQUIVO.csv

node scripts/validate-businesses.mjs --help
```

Na planilha, a coluna `action` recebe `verified`, `rejected` ou `needs_update`
(vazio = decidir depois), e as colunas `phone` e `whatsapp` voltam para o banco
quando o revisor as altera. As demais colunas vão junto só para o revisor se
localizar.

Três decisões de implementação que valem registro:

- **A planilha é lida pelo nome do cabeçalho, não pela posição.** O revisor abre
  no Excel e pode reordenar colunas sem que a importação passe a gravar a coluna
  errada. O parser fica em [`scripts/lib/csv.mjs`](../scripts/lib/csv.mjs) e
  segue RFC 4180 — endereço com vírgula (`"Rua São João, 320 - Centro"`) não
  quebra a linha no meio, que era o defeito da primeira versão.
- **`verified_by` só é gravado com `--verified-by=UUID`.** A coluna é FK para
  `auth.users`; um UUID inventado derruba a gravação inteira com erro de chave
  estrangeira.
- **`--dry-run` mostra o que mudaria sem gravar.** É o passo obrigatório antes de
  qualquer escrita, como nos demais scripts de carga.

---


### 3. Frontend — Componentes de Mapa

> **Status: proposta, não implementado.** Nada nesta seção existe no código hoje.
> Antes de escrever qualquer coisa aqui, leia [`docs/google-maps.md`](google-maps.md)
> e o §9 do [`CLAUDE.md`](../CLAUDE.md).

#### O que já existe

Toda integração de mapa passa por `src/lib/maps.ts` e `src/components/maps/`.
Nenhum componente lê `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` nem monta URL do
Maps na mão — e código novo não deve começar a fazer isso.

| Arquivo | Papel | API | Cobrança |
| --- | --- | --- | --- |
| `MapsProvider` | carrega a Maps JavaScript API uma vez, na raiz | Maps JavaScript | por carregamento |
| `MiniMap` | imagem estática + link de rota | Maps Static | por imagem |
| `MapEmbed` | iframe de localização | Maps Embed | grátis (uso básico) |
| `MapPlaceholder` | fallback em CSS, sem chave | — | grátis |
| `mapsSearchUrl` / `mapsDirectionsUrl` | links "abrir no Maps" | Maps URLs | grátis, sem chave |
| `mapsStreetViewUrl` | fachada do comércio | Street View Static | por imagem |
| `mapsStreetViewMetadataUrl` | checa cobertura antes de pedir a foto | Street View Metadata | grátis |

`hasMapsKey` já é `false` quando não há chave, e `mapsEmbedUrl`/`mapsStaticUrl`
devolvem `null` — a UI cai no `MapPlaceholder`. Ou seja: **o app já roda com
custo zero de API**, ao preço de não mostrar mapa. A questão não é "como parar
de depender do Google", é "quanto mapa vale o que custa".

#### Onde dá para economizar, em ordem de esforço

**1. Trocar `MiniMap` por `MapEmbed` onde couber (barato, sem código novo)**

A Embed API não é cobrada no uso básico; a Static API é cobrada por imagem. Em
tela que só precisa mostrar "onde fica", o iframe resolve.

**2. Não montar o `MapsProvider` em rota que não usa mapa interativo (barato)**

A Maps JavaScript API cobra por carregamento, mesmo que o usuário não interaja.
Hoje o provider está na raiz, em `App.tsx`: vale medir quantas rotas realmente
precisam dele antes de deixar assim.

**3. Cachear a imagem estática (médio)**

Guardar a fachada e o mapa estático no Supabase Storage na primeira vez e servir
de lá nas seguintes. Elimina o custo por visita, mantendo a imagem. Casa com o
que `src/lib/businessPhotos.ts` já faz: a foto do comerciante, quando existe,
tem prioridade sobre o Street View.

**4. Trocar o provedor de tiles (caro, decisão de produto)**

OpenStreetMap, MapTiler ou Stadia no lugar do mapa interativo do Google. Exige
biblioteca de mapa nova (`@vis.gl/react-google-maps` sai), revisão do design
system e atribuição visível conforme a licença de cada provedor. Só faz sentido
depois de medir que os itens 1-3 não bastaram.

#### Regras para qualquer mudança aqui

- Função nova de mapa entra em `src/lib/maps.ts`, não num componente.
- O caminho sem chave (`hasMapsKey === false`) precisa continuar funcionando.
- Sem cor crua no Tailwind: use os tokens (`bg-muted`, `text-muted-foreground`),
  nunca `bg-gray-100`.
- Coordenada vem de `latitude`/`longitude` da tabela `businesses` (o schema de
  produção não usa `lat`/`lng` — ver §11 do `CLAUDE.md`).

#### Medir antes de mexer

Nenhuma das economias acima vale a pena no escuro. O primeiro passo é abrir
Google Cloud Console → Billing → Reports, filtrar por SKU do Maps Platform e
descobrir qual das APIs realmente pesa na fatura. Pode ser que a resposta seja
"nenhuma, o tráfego ainda é baixo demais" — e aí esta seção inteira espera.

---

### 4. Painel Administrativo (Esboço)

> **Esboço, não código pronto para colar.** O trecho abaixo mostra a ideia do
> fluxo; do jeito que está, ele quebra três convenções do projeto. Antes de virar
> arquivo em `src/`:
>
> 1. **Cor crua não passa.** `bg-blue-50`, `text-gray-600`, `bg-green-600` viram
>    tokens semânticos (`bg-card`, `text-muted-foreground`, `bg-primary`) — ver
>    [`docs/design-system.md`](design-system.md).
> 2. **Componente não chama `supabase.from()` direto.** A query vai para
>    `src/services/`, embrulhada em `executeSupabase()` (timeout + retry), e o
>    componente consome por um hook em `src/hooks/`.
> 3. **Link do Maps não se monta na mão.** Use `mapsSearchUrl()` de
>    `src/lib/maps.ts` no lugar da URL literal.
>
> Também não existe rota de admin hoje: criar a página exige registrar a rota em
> `src/App.tsx` **e** o link de origem, além de decidir como proteger o acesso
> (RLS + papel de admin). Enquanto isso não existe, a validação é feita pelo
> `scripts/validate-businesses.mjs`, que já cobre o fluxo por planilha.

Estrutura básica para validação manual:

```tsx
// src/pages/admin/ValidationPanel.tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function ValidationPanel() {
  const { data: pending, isLoading } = useQuery({
    queryKey: ['pending-validations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50);
      return data;
    }
  });
  
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase
        .from('businesses')
        .update({
          verification_status: 'verified',
          verified_at: new Date().toISOString(),
          verified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-validations']);
    }
  });
  
  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase
        .from('businesses')
        .update({ verification_status: 'rejected' })
        .eq('id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-validations']);
    }
  });
  
  if (isLoading) return <div>Carregando...</div>;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Validação de Estabelecimentos</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800">
          <strong>{pending?.length || 0}</strong> estabelecimentos aguardam validação
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Revise os dados importados do Google e confirme com contato telefônico quando possível
        </p>
      </div>
      
      <div className="space-y-4">
        {pending?.map(business => (
          <div key={business.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{business.name}</h3>
                <p className="text-gray-600">{business.address}</p>
                <p className="text-sm text-gray-500">
                  {business.city} • {business.category}
                </p>
                <div className="mt-2 space-x-4 text-sm">
                  <span>📞 {business.phone || 'Sem telefone'}</span>
                  <span className={business.whatsapp ? 'text-green-600' : 'text-red-500'}>
                    💬 {business.whatsapp || 'Sem WhatsApp ⚠️'}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => approveMutation.mutate(business.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  ✅ Aprovar
                </button>
                <button
                  onClick={() => rejectMutation.mutate(business.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  ❌ Rejeitar
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name + ' ' + business.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                >
                  🔍 Conferir no Google
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📊 Economia de Custos

### Cenário 1: Apenas Monte Santo de Minas
| Item | Modelo Antigo | Modelo Novo | Economia |
|------|--------------|-------------|----------|
| Chamadas API/dia | ~500 | ~0 | - |
| Custo/dia | R$ 8,50 | R$ 0 | R$ 8,50 |
| Custo/mês | R$ 255 | R$ 0 | R$ 255 |
| Custo/ano | R$ 3.060 | R$ 0 | **R$ 3.060** |

### Cenário 2: 7 Cidades da Região
| Item | Modelo Antigo | Modelo Novo | Economia |
|------|--------------|-------------|----------|
| Chamadas API/dia | ~3.500 | ~0 | - |
| Custo/dia | R$ 59,50 | R$ 0 | R$ 59,50 |
| Custo/mês | R$ 1.785 | R$ 0 | R$ 1.785 |
| Custo/ano | R$ 21.420 | R$ 0 | **R$ 21.420** |

### Cenário 3: 20 Cidades (Expansão Futura)
| Item | Modelo Antigo | Modelo Novo | Economia |
|------|--------------|-------------|----------|
| Chamadas API/dia | ~10.000 | ~0 | - |
| Custo/dia | R$ 170 | R$ 0 | R$ 170 |
| Custo/mês | R$ 5.100 | R$ 0 | R$ 5.100 |
| Custo/ano | R$ 61.200 | R$ 0 | **R$ 61.200** |

**Custo de Coleta Inicial (uma vez por cidade):**
- ~100-200 requisições para coletar toda uma cidade
- Dentro da cota grátis mensal (1.000 requisições)
- **Custo: R$ 0** se fizer 1-5 cidades/mês

---

## ✅ Checklist de Implementação

### Fase 1: Banco de Dados (Dia 1)
- [ ] Criar migration com novos campos
- [ ] Rodar migration no Supabase
- [ ] Validar que índices foram criados
- [ ] Testar queries com filtros por `verification_status`

### Fase 2: Scripts (Dia 2)
- [ ] Atualizar `collect-places.mjs` com novos campos
- [ ] Atualizar `import-businesses.mjs` com mapeamento
- [ ] Criar `validate-businesses.mjs`
- [ ] Testar fluxo completo com dados reais

### Fase 3: Frontend - Mapas (Dia 3-4)
- [ ] Criar `src/lib/maps.ts` com funções OSM
- [ ] Criar componente `StaticMap.tsx`
- [ ] Substituir em todas as páginas que usam mapa
- [ ] Testar em mobile e desktop

### Fase 4: Painel Admin (Dia 5-7)
- [ ] Criar rota `/admin/validacao`
- [ ] Implementar lista de pendentes
- [ ] Adicionar ações aprovar/rejeitar
- [ ] Adicionar filtro por cidade/status
- [ ] Exportar/importar CSV

### Fase 5: Validação e Deploy (Dia 8-10)
- [ ] Testar em staging
- [ ] Validar que ZERO chamadas à API Google
- [ ] Medir performance (deve melhorar)
- [ ] Deploy em produção
- [ ] Monitorar logs por 48h

---

## 🔍 Monitoramento Pós-Implementação

### Métricas para Acompanhar

```typescript
// src/lib/analytics.ts (exemplo simples)
const metrics = {
  // Contar quantos estabelecimentos estão em cada status
  verificationStats: async () => {
    const { data } = await supabase
      .from('businesses')
      .select('verification_status', { count: 'exact' })
      .group('verification_status');
    return data;
  },
  
  // Verificar se há chamadas à API Google (não deveria ter!)
  apiCallsCheck: () => {
    // Monitorar no Network tab do DevTools
    // Ou usar Google Cloud Console → APIs & Services
  },
  
  // Performance de carregamento de mapas
  mapLoadTime: () => {
    // Usar Performance API do browser
    const entries = performance.getEntriesByType('resource')
      .filter(r => r.name.includes('openstreetmap') || r.name.includes('stadiamaps'));
    return entries.map(e => e.duration);
  }
};
```

### Alertas Configuráveis

1. **Se `verification_status = 'pending'` > 100 por mais de 7 dias**
   - Enviar email para admin
   - Ação necessária: validar em lote

2. **Se alguma chamada à API Google for detectada em produção**
   - Log de erro crítico
   - Investigar imediatamente

3. **Se tempo de carregamento de mapa > 3s**
   - Otimizar tiles ou mudar provider

---

## 🚨 Troubleshooting

### Problema: Coordenadas não aparecem no frontend
**Solução:**
```sql
-- Verificar se dados foram importados corretamente
SELECT COUNT(*) FROM businesses WHERE latitude IS NULL AND longitude IS NULL;

-- Se tiver muitos, re-importar com script atualizado
node scripts/import-businesses.mjs --file=data/places/latest.json --update
```

### Problema: Mapa OSM não carrega
**Solução:**
- Verificar CORS no iframe
- Usar fallback para imagem estática
- Considerar Stadia Maps como alternativa

### Problema: Comerciantes reclamam que endereço está errado
**Solução:**
- Este é o ponto do processo de validação manual!
- Usar painel admin para corrigir
- Ligar para comerciante e confirmar dados
- Atualizar `verification_status` para 'verified' após correção

---

## 📚 Referências

- [OpenStreetMap](https://www.openstreetmap.org/)
- [Leaflet.js](https://leafletjs.com/) - Biblioteca JS para mapas interativos
- [Stadia Maps](https://stadiamaps.com/) - Alternativa gratuita ao Google Maps
- [Supabase GeoQueries](https://supabase.com/docs/guides/database/postgis)
- [Google Places API Pricing](https://developers.google.com/maps/billing-and-pricing/pricing)

---

*Documento criado em Agosto 2025*  
*Versão 1.0*
