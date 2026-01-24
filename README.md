# Procura UAI

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0--beta-blue)
![License](https://img.shields.io/badge/license-Private-red)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

**Plataforma regional de busca e descoberta de serviços, comércios e profissionais em Monte Santo de Minas e região**

[Demo](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) • [Documentação](#-documentação) • [Contribuir](#-como-contribuir) • [Roadmap](#-roadmap)

</div>

---

## 📖 Sobre o Projeto

O **Procura UAI** é uma plataforma digital hiperlocal projetada para conectar cidadãos, comércios e serviços. Desenvolvido como um **Progressive Web App (PWA)**, o projeto oferece uma experiência fluida e otimizada para dispositivos móveis, funcionando como um guia completo da cidade na palma da mão.

Com foco em simplicidade e acessibilidade, o projeto facilita a descoberta de negócios locais através de uma taxonomia inteligente, busca eficiente e navegação intuitiva, fortalecendo a economia regional de Monte Santo de Minas.

### 🎯 Diferenciais

- ✨ **Foco Regional** - Especialmente desenvolvido para Monte Santo de Minas e região.
- 📍 **Taxonomia de 3 Camadas** - Organização precisa por Tipo de Listagem, Categoria e Tags.
- 📱 **Mobile First & PWA** - Instalável e otimizado para smartphones.
- 🚀 **Performance** - Construído com Vite e React para carregamento instantâneo.
- 🎨 **Interface Moderna** - Design limpo utilizando shadcn/ui e Tailwind CSS.

---

## ✨ Funcionalidades

### MVP v1.0 (Concluído/Em Ajuste)

- [x] **Taxonomia Centralizada:** Sistema de 3 camadas para categorização precisa.
- [x] **Busca Global:** Barra de pesquisa inteligente com filtros por categoria.
- [x] **Módulos Especializados:**
    - `Comer Agora` (Urgência alimentar/Delivery)
    - `Negócios & Serviços` (Guia comercial)
    - `Classificados` (Compra/Venda/Doação)
    - `Agenda` (Eventos locais)
    - `Notícias & Falecimentos` (Utilidade pública)
- [x] **Páginas de Detalhes:** Visualização rica de informações para cada tipo de negócio.
- [x] **PWA Capabilities:** Manifesto e ícones configurados para instalação.
- [x] **Dark Mode:** Suporte completo a temas claro e escuro.

### Phase 2.0 (Próximos Passos)

- [ ] **Sistema de Favoritos:** Salvar estabelecimentos e eventos preferidos.
- [ ] **Geolocalização Avançada:** Integração com mapas para rotas diretas.
- [ ] **Publicação Direta:** Fluxo para usuários cadastrarem seus próprios anúncios.
- [ ] **Reviews & Avaliações:** Sistema de feedback da comunidade para negócios.
- [ ] **Filtros Dinâmicos:** Refinamento de busca por tags específicas (ex: "Aberto Agora", "Aceita Cartão").

### Phase 3.0 (Visão de Futuro)

- [ ] **Dashboard para Lojistas:** Painel para gerenciamento de ofertas e métricas.
- [ ] **Chat Integrado:** Comunicação direta via WhatsApp ou chat interno.
- [ ] **Notificações Push:** Alertas de novas ofertas e eventos urgentes.
- [ ] **Marketplace de Serviços:** Agendamento e contratação direta pela plataforma.

---

## 🛠️ Tecnologias

O projeto utiliza o que há de mais moderno no ecossistema web:

- **Core:** [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build:** [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes:** [shadcn/ui](https://ui.shadcn.com/)
- **Estado:** [TanStack Query](https://tanstack.com/query/latest)
- **Roteamento:** [React Router 6](https://reactrouter.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## 📂 Estrutura de Pastas

```text
src/
├── components/
│   ├── cards/       # Cards específicos (Business, Deal, Event, etc.)
│   ├── home/        # Blocos da página inicial (ComerAgora, Ofertas, etc.)
│   ├── listing/     # Seções de detalhes (Hero, Map, Reviews)
│   └── ui/          # Componentes base (Buttons, Inputs, etc.)
├── hooks/           # Lógica reutilizável (Search, PWA, Theme)
├── lib/             # Taxonomia, utilitários e constantes
└── pages/           # Views principais da aplicação
```

---

## 🚀 Como Executar

1. Clone o repositório: `git clone https://github.com/ederrabelo81-crypto/procurauai.git`
2. Instale as dependências: `npm install`
3. Inicie o dev server: `npm run dev`

---

Desenvolvido com ❤️ para a comunidade de Monte Santo de Minas.
