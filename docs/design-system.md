# Design System "Almanaque"

Referência visual do Procura UAI. Serve para manter as telas novas coerentes com
as existentes e evitar que a interface volte a parecer um template genérico.

---

## A ideia

Um **almanaque impresso de cidade do interior de Minas**. Papel encorpado, tinta
marrom-escura, telhado de barro, azulejo de igreja e a mostarda dos letreiros
pintados à mão do comércio da praça.

O que isso significa na prática:

- Nada de cinza neutro puro — **todo cinza tem temperatura**. Os "cinzas" do app
  são bege esverdeado no claro e marrom-carvão no escuro.
- **Terracota domina.** Azulejo e mostarda são acentos pontuais, não colegas de
  igual peso. Paleta tímida e distribuída por igual é o que faz uma interface
  parecer feita por sorteio.
- Cantos **pouco arredondados** (`--radius: 0.5rem`). Cartão é folha de papel,
  não bolha.
- Sombra é **espessura de papel**, não desfoque genérico: uma linha dura embaixo
  mais uma sombra quente e curta.
- Fundo tem **atmosfera** — halos de cor, grão e linhas de pauta finíssimas.
  Nunca um `#fff` chapado.

---

## Cores

Tokens em `src/index.css`, expostos ao Tailwind em `tailwind.config.ts`.
**Sempre use o token**, nunca a cor crua do Tailwind (`bg-orange-500` e afins).

| Token | Claro | Escuro | Papel |
| --- | --- | --- | --- |
| `background` | `#F4EFE4` papel | `#14110F` noite | fundo da página |
| `foreground` | `#211C18` tinta | `#F2EADC` creme | texto |
| `card` | `#FBF7EF` | `#1E1A17` | superfícies elevadas |
| `primary` | `#C4472C` telha | `#E86A45` brasa | **cor dominante**, CTAs, links |
| `secondary` | `#1E6F68` azulejo | `#3FA79C` | acento frio, letreiro, selos |
| `accent` | `#D99A20` mostarda | `#F0B841` | destaque, ofertas |
| `muted` / `muted-foreground` | bege | marrom-carvão | apoio, metadados |
| `destructive` | `#B3261E` | — | erros, exclusão |
| `whatsapp` | verde | — | exclusivo do canal WhatsApp |

**Status:** `status-open`, `status-closed`, `status-pending`.
**Categorias:** `category-food`, `category-classifieds`, `category-deals`,
`category-services`, `category-events`, `category-obituary`, `category-news`.

O tema escuro não é um inversor automático: é uma segunda paleta, escrita à mão
no bloco `.dark`. Ao criar um token novo, defina os dois valores.

---

## Tipografia

Três famílias, cada uma com uma função — misturar as funções é o caminho mais
curto para a tela parecer genérica.

| Família | Classe | Uso |
| --- | --- | --- |
| **Fraunces** | `font-display` | títulos (`h1`–`h4` já usam por padrão) |
| **Archivo** | `font-sans` | corpo, botões, rótulos de formulário |
| **Azeret Mono** | `font-mono` | micro-labels, números, preços, distâncias |

Carregadas via `<link>` no `index.html`, com `preconnect`.

### Utilitários

```html
<!-- Rótulo em caixa alta, mono, tracking largo -->
<p class="eyebrow text-primary">Fome agora</p>

<!-- Manchete com os eixos SOFT/WONK do Fraunces exagerados -->
<h1 class="display-wonky text-[2rem]">Tudo que a cidade tem.</h1>
```

Números que o usuário compara (preço, distância, contagem) vão em `font-mono` —
alinham na vertical e param de competir com o texto ao redor.

---

## Componentes

### `.almanac-card`

Cartão padrão: fundo `card`, borda de 1px, sombra de papel e elevação de 3px no
hover.

```tsx
<article className="almanac-card overflow-hidden">…</article>
```

Substituiu o antigo `bg-card rounded-2xl card-shadow hover:card-shadow-hover`.

### `.stamp`

Base dos selos: mono, caixa alta, contorno de 1px, cantos de 3px.
Já vem aplicada em `<BadgePill>`.

### `.rule-line`

Filete pontilhado que preenche o espaço entre título e ação. Use dentro de um
`flex` com o resto do conteúdo em largura fixa.

```tsx
<div className="flex items-center gap-3">
  <h2>Comer Agora</h2>
  <span className="rule-line" />
  <Link to="…">Ver todos</Link>
</div>
```

### `.eyebrow`

Rótulo de apoio acima de títulos. Sempre com cor explícita
(`text-primary`, `text-muted-foreground`).

### `.logo-mark`

Obrigatória em toda `<img src="/logo.svg">`. O logo é tinta escura; no tema
noturno a classe aplica `invert + hue-rotate(180deg)`, devolvendo a luminosidade
sem trocar as cores da marca.

### Fundos texturizados

- `bg-hatch` — hachura diagonal fina (cabeçalhos, faixas, rodapé)
- `bg-grid bg-grid-cell` — malha de quarteirões (fallback de mapa, telas vazias)

---

## Motion

> Um carregamento de página bem orquestrado entrega mais que dez
> micro-interações espalhadas.

### Revelação em cascata

Aplique `reveal-stagger` no **container**; os filhos diretos entram em sequência
com atraso automático (40 ms a 580 ms) via `animation-delay`.

```tsx
<main className="reveal-stagger space-y-10">
  <ComerAgoraBlock />
  <OfertasBlock />
  …
</main>
```

Para um elemento isolado: `reveal`.

### Animações nomeadas

| Classe | Efeito |
| --- | --- |
| `animate-marquee` | letreiro rolante (`CityTicker`) |
| `animate-scale-in` | dropdowns e popovers |
| `animate-slide-up` | folhas e drawers |
| `animate-sheen` | brilho que percorre skeletons |
| `animate-sway` | oscilação sutil de selos |
| `skeleton-pulse` | placeholder de carregamento |
| `pulse-open` | ponto pulsante de "aberto agora" |

Tudo é CSS puro — sem biblioteca de animação. `prefers-reduced-motion: reduce`
desliga o conjunto globalmente, já tratado em `src/index.css`.

### Física dos botões

Botões sólidos têm espessura (sombra dura embaixo) e **afundam** ao serem
pressionados: `active:translate-y-0.5 active:shadow-none`. Cartões e botões de
contorno **sobem** no hover. Mantenha essa lógica — é o que dá tato à interface.

---

## Ao criar uma tela nova

1. Comece pelos tokens. Se precisou de uma cor que não existe, adicione um token
   (nos dois temas) em vez de escrever a cor no componente.
2. Título em `font-display`, rótulo em `.eyebrow`, número em `font-mono`.
3. Cartão é `.almanac-card`. Selo é `<BadgePill>`.
4. Seção começa com `<SectionHeader>` — ele já traz kicker, ícone, filete e ação.
5. Container de lista ganha `reveal-stagger`.
6. Carrossel horizontal: `-mx-4 flex gap-3 overflow-x-auto px-4 scrollbar-hide fade-edges`.
7. Confira no tema escuro antes de considerar pronto.

## O que evitar

- Cores cruas do Tailwind (`bg-blue-500`, `text-purple-600`) — sempre token.
- Glassmorphism e gradientes roxos sobre branco.
- `rounded-2xl`/`rounded-3xl` em cartões — o raio do sistema é `rounded-lg`.
- Inter, Roboto e fontes de sistema.
- Sombras azuladas ou neutras — a sombra aqui é quente.
