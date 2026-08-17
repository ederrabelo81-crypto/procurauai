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
Criar arquivo `supabase/migrations/XXXX_add_verification_fields.sql`:

```sql
-- Migration: Add verification fields to businesses
-- Date: 2025-08-17
-- Purpose: Support manual validation workflow without Google API dependency

-- Add new columns
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'google_places',
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN businesses.data_source IS 'Origem do dado: google_places, manual, user_submission, partnership';
COMMENT ON COLUMN businesses.verification_status IS 'Status de validação: pending, verified, rejected, needs_update';
COMMENT ON COLUMN businesses.verified_at IS 'Data/hora da validação manual';
COMMENT ON COLUMN businesses.verified_by IS 'ID do usuário que validou (admin)';
COMMENT ON COLUMN businesses.last_synced_at IS 'Última sincronização com Google Places (se aplicável)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS businesses_verification_status_idx 
ON businesses (verification_status)
WHERE verification_status != 'verified';

CREATE INDEX IF NOT EXISTS businesses_city_status_idx 
ON businesses (city, verification_status);

-- Create enum type for data sources (optional, for stricter validation)
DO $$ BEGIN
  CREATE TYPE business_data_source AS ENUM ('google_places', 'manual', 'user_submission', 'partnership');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Future: migrate to enum type
-- ALTER TABLE businesses 
--   ALTER COLUMN data_source TYPE business_data_source 
--   USING data_source::business_data_source;
```

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

#### C. Novo Script: `validate-businesses.mjs`

Criar script para revisão manual em lote:

```javascript
#!/usr/bin/env node
/**
 * validate-businesses.mjs
 * 
 * Gera relatório de estabelecimentos pendentes de validação
 * Permite aprovação/rejeição em lote via CLI ou CSV
 */

import { createClient } from '@supabase/supabase-js';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltam credenciais do Supabase no .env.local');
  console.error('Necessário: SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse arguments
const args = process.argv.slice(2);
const cityFilter = args.find(a => a.startsWith('--city='))?.split('=')[1];
const exportCsv = args.includes('--export-csv');
const importCsv = args.find(a => a.startsWith('--import-csv='))?.split('=')[1];

async function main() {
  console.log('🔍 Buscando estabelecimentos pendentes de validação...\n');
  
  let query = supabase
    .from('businesses')
    .select('id, name, address, city, category, phone, whatsapp, google_place_id, verification_status, data_source')
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: false });
  
  if (cityFilter) {
    query = query.eq('city', cityFilter);
    console.log(`Filtro: cidade = ${cityFilter}`);
  }
  
  const { data: businesses, error } = await query;
  
  if (error) {
    console.error('❌ Erro ao buscar dados:', error.message);
    process.exit(1);
  }
  
  console.log(`📊 Encontrados ${businesses.length} estabelecimentos pendentes\n`);
  
  if (businesses.length === 0) {
    console.log('✅ Nenhum estabelecimento pendente!');
    return;
  }
  
  // Exportar CSV para revisão offline
  if (exportCsv) {
    const csvPath = `data/validation/pending-${new Date().toISOString().split('T')[0]}.csv`;
    fs.mkdirSync(path.dirname(csvPath), { recursive: true });
    
    const csvContent = [
      ['id', 'name', 'address', 'city', 'category', 'phone', 'whatsapp', 'google_place_id', 'action'],
      ...businesses.map(b => [
        b.id,
        b.name,
        b.address,
        b.city,
        b.category,
        b.phone,
        b.whatsapp || '',
        b.google_place_id,
        'pending'
      ])
    ].map(row => row.join(',')).join('\n');
    
    fs.writeFileSync(csvPath, csvContent);
    console.log(`📄 CSV exportado: ${csvPath}`);
    console.log('   Edite a coluna "action" para: verified, rejected, ou leave as pending');
    console.log(`   Depois execute: node scripts/validate-businesses.mjs --import-csv=${csvPath}\n`);
  }
  
  // Importar CSV com validações
  if (importCsv) {
    console.log(`📥 Importando validações de ${importCsv}...`);
    const content = fs.readFileSync(importCsv, 'utf-8');
    const lines = content.split('\n').slice(1); // Skip header
    
    const updates = [];
    const stats = { verified: 0, rejected: 0, skipped: 0 };
    
    for (const line of lines) {
      const [id, , , , , , , , action] = line.split(',');
      if (!id || action === 'pending') {
        stats.skipped++;
        continue;
      }
      
      updates.push({
        id,
        updates: {
          verification_status: action === 'verified' ? 'verified' : 'rejected',
          verified_at: action === 'verified' ? new Date().toISOString() : null,
          verified_by: '00000000-0000-0000-0000-000000000000' // Admin system
        }
      });
      
      stats[action === 'verified' ? 'verified' : 'rejected']++;
    }
    
    // Batch update
    for (const update of updates) {
      await supabase
        .from('businesses')
        .update(update.updates)
        .eq('id', update.id);
    }
    
    console.log('✅ Validações aplicadas:');
    console.log(`   Verificados: ${stats.verified}`);
    console.log(`   Rejeitados: ${stats.rejected}`);
    console.log(`   Ignorados: ${stats.skipped}\n`);
    return;
  }
  
  // Modo interativo (padrão)
  console.log('📋 Amostra dos primeiros 10 estabelecimentos:\n');
  
  for (let i = 0; i < Math.min(10, businesses.length); i++) {
    const b = businesses[i];
    console.log(`${i + 1}. ${b.name}`);
    console.log(`   📍 ${b.address} - ${b.city}`);
    console.log(`   🏷️  ${b.category}`);
    console.log(`   📞 ${b.phone || 'Sem telefone'}`);
    console.log(`   💬 ${b.whatsapp || 'Sem WhatsApp'} ⚠️`);
    console.log(`   🔗 google_place_id: ${b.google_place_id}`);
    console.log('');
  }
  
  console.log('💡 Para validar em massa, use: --export-csv');
  console.log('   Ou filtre por cidade: --city="Monte Santo de Minas"\n');
}

main().catch(console.error);
```

**Uso do script:**
```bash
# Ver pendentes
node scripts/validate-businesses.mjs

# Filtrar por cidade
node scripts/validate-businesses.mjs --city="Guaxupé"

# Exportar para CSV (revisão offline)
node scripts/validate-businesses.mjs --export-csv

# Importar validações feitas no CSV
node scripts/validate-businesses.mjs --import-csv=data/validation/pending-2025-08-17.csv
```

---

### 3. Frontend - Componentes de Mapa

#### A. Modificar `src/lib/maps.ts`

```typescript
// src/lib/maps.ts
// Adicionar funções para mapa estático sem API call

export interface MapOptions {
  latitude: number;
  longitude: number;
  zoom?: number;
  width?: number;
  height?: number;
  useGoogleEmbed?: boolean; // Default: false
}

/**
 * Gera URL de mapa estático usando coordenadas salvas
 * Opções:
 * 1. OpenStreetMap + Leaflet (grátis, sem API key)
 * 2. Google Static Maps (só se necessário, com cache)
 * 3. Placeholder desenhado em CSS (fallback)
 */
export function getStaticMapUrl(options: MapOptions): string {
  const { latitude, longitude, zoom = 15, width = 400, height = 300 } = options;
  
  // Opção 1: OpenStreetMap (recomendado)
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${calculateBbox(latitude, longitude, zoom)}&layer=mapnik`;
  
  // Opção 2: Google Static Maps (só se useGoogleEmbed=true)
  if (options.useGoogleEmbed && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`;
  }
  
  // Opção 3: Stadia Maps (alternativa gratuita)
  const stadiaApiKey = import.meta.env.VITE_STADIA_MAPS_API_KEY;
  if (stadiaApiKey) {
    return `https://tiles.stadiamaps.com/tiles/alidade_smooth/${zoom}/${Math.floor((longitude + 180) / 360 * Math.pow(2, zoom))}/${Math.floor((1 - Math.log(Math.tan(latitude * Math.PI / 180) + 1 / Math.cos(latitude * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))}.png?key=${stadiaApiKey}`;
  }
  
  // Fallback: OSM direto
  return osmUrl;
}

/**
 * Calcula bounding box para um zoom level
 */
function calculateBbox(lat: number, lng: number, zoom: number): string {
  const delta = 0.01 / Math.pow(2, zoom - 10);
  return `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
}

/**
 * Cache helper para evitar chamadas repetidas
 */
const mapCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

export async function getCachedMapUrl(options: MapOptions): Promise<string> {
  const cacheKey = `${options.latitude}-${options.longitude}-${options.zoom}`;
  const cached = mapCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.url;
  }
  
  const url = getStaticMapUrl(options);
  mapCache.set(cacheKey, { url, timestamp: Date.now() });
  
  return url;
}

/**
 * Gera link para abrir no Google Maps app (não usa API, só deep link)
 */
export function getGoogleMapsLink(options: { latitude: number; longitude: number; query?: string }): string {
  const { latitude, longitude, query } = options;
  const base = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  return query ? `${base}&destination_place_id=${query}` : base;
}
```

#### B. Modificar Componente `StaticMap.tsx`

```tsx
// src/components/maps/StaticMap.tsx
import React from 'react';
import { getStaticMapUrl, getGoogleMapsLink } from '../../lib/maps';

interface StaticMapProps {
  latitude: number;
  longitude: number;
  businessName?: string;
  width?: number;
  height?: number;
  showMarker?: boolean;
  className?: string;
}

export function StaticMap({
  latitude,
  longitude,
  businessName,
  width = 400,
  height = 300,
  showMarker = true,
  className = ''
}: StaticMapProps) {
  // Usar OpenStreetMap como padrão (zero custo)
  const mapUrl = getStaticMapUrl({
    latitude,
    longitude,
    zoom: 15,
    width,
    height,
    useGoogleEmbed: false // ← Importante: false por default
  });
  
  const googleMapsLink = getGoogleMapsLink({ latitude, longitude });
  
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ width, height }}>
      {/* Mapa OSM embed */}
      <iframe
        src={mapUrl}
        width={width}
        height={height}
        style={{ border: 0 }}
        loading="lazy"
        title={`Mapa de ${businessName || 'localização'}`}
        className="w-full h-full"
      />
      
      {/* Marker overlay (opcional) */}
      {showMarker && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg" />
        </div>
      )}
      
      {/* Link para abrir no app */}
      <a
        href={googleMapsLink}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 bg-white px-3 py-1.5 rounded-md shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors pointer-events-auto"
      >
        Abrir no Google Maps →
      </a>
    </div>
  );
}
```

#### C. Atualizar Página de Detalhes do Negócio

```tsx
// src/pages/BusinessDetail.tsx
// Substituir componente de mapa

// ANTES:
import { GoogleMapComponent } from '@/components/maps/GoogleMapComponent';
<GoogleMapComponent apiKey={VITE_GOOGLE_MAPS_API_KEY} placeId={business.google_place_id} />

// DEPOIS:
import { StaticMap } from '@/components/maps/StaticMap';
{business.latitude && business.longitude ? (
  <StaticMap
    latitude={business.latitude}
    longitude={business.longitude}
    businessName={business.name}
    width={400}
    height={300}
    showMarker={true}
  />
) : (
  <div className="text-center py-8 bg-gray-100 rounded-lg">
    <p className="text-gray-500">Mapa não disponível</p>
    <p className="text-sm text-gray-400">Endereço: {business.address}</p>
  </div>
)}
```

---

### 4. Painel Administrativo (Esboço)

Criar estrutura básica para validação manual:

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
