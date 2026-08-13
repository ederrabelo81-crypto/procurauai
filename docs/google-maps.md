# Google Maps no Procura UAI

Guia completo: como obter a chave, restringir, configurar no projeto e como a
integração está organizada no código.

---

## 1. Criar a chave no Google Cloud

1. Acesse <https://console.cloud.google.com/google/maps-apis> e faça login.
2. **Crie ou selecione um projeto** (ex.: `procura-uai`).
3. Ative o **faturamento**. É obrigatório mesmo dentro da cota gratuita — o
   Google concede um crédito mensal recorrente que cobre com folga o uso de uma
   cidade do porte de Monte Santo de Minas, mas sem faturamento ativo as APIs
   retornam erro.
4. Em **APIs e serviços → Biblioteca**, ative as três APIs que o app usa:

   | API | Onde é usada |
   | --- | --- |
   | **Maps JavaScript API** | mapa interativo da rota `/mapa` |
   | **Maps Embed API** | mapas das páginas de detalhe (iframe) |
   | **Maps Static API** | miniaturas de mapa dentro dos cards |
   | **Street View Static API** | fachada de comércio ainda sem foto própria |

   > A **Geocoding API** só é necessária se você for rodar os scripts de coleta
   > que convertem endereço em coordenadas (`scripts/`).

   > ⚠️ Ativar a API na Biblioteca **não basta**: se a chave estiver com
   > "Restrições de API" ligadas (etapa 2), a Street View Static API também
   > precisa entrar naquela lista, senão a chave recusa a chamada. É o erro mais
   > comum aqui.

   > Cuidado com o nome: a **Street View Publish API** é outra coisa (upload de
   > panoramas próprios). A que o app usa é a **Static**.

5. Em **APIs e serviços → Credenciais**, clique em
   **Criar credenciais → Chave de API** e copie o valor gerado.

---

## 2. Restringir a chave (não pule esta etapa)

A chave fica exposta no JavaScript do navegador — isso é normal e esperado no
Maps. A proteção contra uso indevido vem das restrições, não do sigilo.

Ainda na tela da credencial:

**Restrições de aplicativo → Referenciadores HTTP (sites)**

```
http://localhost:5173/*
http://127.0.0.1:5173/*
https://procurauai.com.br/*
https://*.procurauai.com.br/*
https://*.vercel.app/*
```

**Restrições de API → Restringir chave**

Marque apenas: Maps JavaScript API, Maps Embed API, Maps Static API.

**Orçamento e alertas**

Em **Faturamento → Orçamentos e alertas**, crie um alerta (ex.: R$ 50/mês). É a
rede de segurança contra um pico inesperado de requisições.

---

## 3. Criar o Map ID (recomendado)

O Map ID habilita os marcadores avançados (`AdvancedMarker`) e permite estilizar
o mapa pela nuvem, sem mexer no código.

1. **Google Maps Platform → Map Management → Create Map ID**.
2. Tipo: **JavaScript**. Nome: `procura-uai-web`.
3. Associe um estilo de mapa (dá para criar um estilo quente, combinando com a
   paleta do app) e copie o Map ID gerado.

Sem `VITE_GOOGLE_MAPS_MAP_ID` o app cai em `DEMO_MAP_ID`, que funciona mas exibe
marca d'água e ignora o estilo salvo.

---

## 4. Configurar no projeto

**Local** — em `.env.local`:

```dotenv
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
VITE_GOOGLE_MAPS_MAP_ID=abc123def456
```

Reinicie o `npm run dev`: o Vite só lê variáveis de ambiente na inicialização.

**Produção (Vercel)** — `Settings → Environment Variables`, as mesmas duas
variáveis, escopo `Production` (e `Preview`, se quiser mapas nos previews).

Para conferir o que foi carregado, abra a rota `/debug-env`.

---

## 5. Como a integração está organizada

```
src/lib/maps.ts                    ← chave, Map ID e todos os construtores de URL
src/components/maps/
  ├── MapsProvider.tsx             ← carrega a Maps JS API uma única vez, na raiz
  ├── MapEmbed.tsx                 ← iframe (Embed API) para páginas de detalhe
  ├── MiniMap.tsx                  ← imagem estática (Static API) para cards
  ├── MapPlaceholder.tsx           ← substituto em CSS quando não há chave
  └── index.ts
src/pages/MapPage.tsx              ← rota /mapa
```

### Regras

**1. Nenhuma chave fora de `src/lib/maps.ts`.**
Nada de `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` espalhado por componente e,
principalmente, nada de chave escrita direto na string da URL.

```tsx
// ❌ não faça
<iframe src={`https://www.google.com/maps/embed/v1/place?key=AIzaSy...&q=${q}`} />

// ✅ faça
import { MapEmbed } from '@/components/maps';
<MapEmbed target={query} title={nome} className="aspect-video rounded-lg" />
```

**2. Um provider só.**
`<MapsProvider>` fica em `src/App.tsx`, envolvendo todo o app. Componentes que
renderizam `<Map>` consultam `useMapsReady()` — nunca montam outro `APIProvider`.

**3. Card usa mapa estático; página usa mapa interativo.**
Uma lista com 20 comércios monta 20 imagens em cache do navegador, não 20
instâncias da Maps JavaScript API. A diferença aparece na fatura e no tempo de
carregamento.

**4. Links externos não gastam cota.**
`mapsSearchUrl()` e `mapsDirectionsUrl()` usam a Maps URLs API, que é pública e
não exige chave. Use sempre esses helpers em botões "abrir no Maps" / "rota".

**5. Sem chave, o app continua funcionando.**
`hasMapsKey` é `false`, `MapsProvider` não carrega nada e todo mapa cai no
`MapPlaceholder` — uma malha de quarteirões desenhada em CSS. Nada quebra.

### API de `src/lib/maps.ts`

| Função | Para quê |
| --- | --- |
| `hasMapsKey` | booleano: há chave configurada? |
| `toLatLng(lat, lng)` | valida coordenadas e devolve `LatLng` ou `null` |
| `buildPlaceQuery(...partes)` | monta a busca textual ignorando campos vazios |
| `mapsSearchUrl(alvo)` | link "ver no Google Maps" (sem cota) |
| `mapsDirectionsUrl(alvo)` | link "traçar rota" (sem cota) |
| `mapsEmbedUrl(alvo)` | URL do iframe; `null` sem chave |
| `mapsStaticUrl(centro)` | URL da imagem estática; `null` sem chave |
| `mapsStreetViewUrl(alvo)` | foto da fachada; `null` sem chave |
| `mapsStreetViewMetadataUrl(alvo)` | consulta **gratuita** de cobertura (JSON) |
| `distanceKm(a, b)` | distância em km (Haversine) |
| `formatDistance(km)` | `"320 m"`, `"1,4 km"`, `"12 km"` |
| `DEFAULT_CENTER` | praça matriz de Monte Santo de Minas |

---

## 6. Problemas comuns

| Sintoma | Causa provável |
| --- | --- |
| Mapa cinza escrito "For development purposes only" | faturamento não ativado no projeto do Cloud |
| `RefererNotAllowedMapError` no console | a origem atual não está na lista de referenciadores da chave |
| `ApiNotActivatedMapError` | a API específica (JavaScript/Embed/Static) não foi ativada |
| `InvalidKeyMapError` | chave errada, ou o `npm run dev` não foi reiniciado após editar o `.env.local` |
| Marcadores não aparecem | falta o Map ID — `AdvancedMarker` exige um |
| Marca d'água "Demo" no mapa | rodando com `DEMO_MAP_ID`; configure `VITE_GOOGLE_MAPS_MAP_ID` |
| Mapa vira malha quadriculada | não há chave configurada; é o `MapPlaceholder` |
| Card sem mapa, só a foto | o registro não tem `latitude`/`longitude` no Supabase |
| Comércio sem foto mostra o mapa, nunca a fachada | Street View Static API não ativada, ou fora da lista de "Restrições de API" da chave |
| Fachada aparece em bairro sem cobertura | a consulta de metadados falhou (CORS/rede) e o app assumiu que valia tentar |

### Diagnóstico do Street View

O endpoint de metadados é **gratuito** e o campo `status` diz exatamente o que
está errado — comece sempre por ele:

```
https://maps.googleapis.com/maps/api/streetview/metadata?location=-20.8903,-46.7029&key=SUA_CHAVE
```

| `status` | Significado | Ação |
| --- | --- | --- |
| `OK` | há panorama no local | funcionando |
| `ZERO_RESULTS` | configuração certa, sem cobertura ali | normal; o card cai no mapa |
| `REQUEST_DENIED` | API não ativada, fora das restrições da chave, ou faturamento | revisar etapas 1, 2 e o faturamento |
| `OVER_QUERY_LIMIT` | cota estourada | revisar limites no console |

---

## 7. Coordenadas no banco

`MiniMap` e a rota `/mapa` dependem de `latitude` e `longitude` preenchidos na
tabela `businesses`. Registros sem coordenadas caem no fallback (foto de capa
nos cards; ausência no mapa). O processo de preenchimento está descrito em
[`coleta-de-dados.md`](coleta-de-dados.md).

Consulta rápida para medir a cobertura:

```sql
select
  count(*)                                                  as total,
  count(*) filter (where latitude is not null)              as com_coordenadas,
  round(100.0 * count(*) filter (where latitude is not null) / count(*), 1) as cobertura_pct
from businesses;
```
