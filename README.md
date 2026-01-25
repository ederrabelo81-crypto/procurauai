# Procura UAI

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0--beta-blue)
![License](https://img.shields.io/badge/license-Private-red)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

**Plataforma regional de busca e descoberta de serviços, comércios e profissionais em Monte Santo de Minas e região**

[Demo](https://lovable.dev/projects/b00c6e7b-538e-41f7-adb4-d192ac6eb395) • [Documentação](#-documentação) • [Contribuir](#-como-contribuir) • [Roadmap](#-roadmap)

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
    - `Empregos` (opprtinidades de trabalho na região)
- [x] **Páginas de Detalhes:** Visualização rica de informações para cada tipo de negócio.
- [x] **PWA Capabilities:** Manifesto e ícones configurados para instalação.
- [x] **Dark Mode:** Suporte completo a temas claro e escuro.

### Phase 2.0 (Próximos Passos)

- [ ] **CMS Headless:** Usa WordPress no backend para entrada de dados.
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

### Pré-requisitos

- Node.js >= 18.x
- npm/yarn/pnpm
- Docker e Docker Compose (opcional)
- PostgreSQL 14+ com extensão PostGIS

### Instalação

```bash
# Clone o repositório
git clone https://github.com/ederrabelo81-crypto/procurauai.git
cd procurauai

# Instale as dependências do frontend
cd frontend
npm install

# Instale as dependências do backend
cd ../backend
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Inicie o banco de dados (Docker)

docker-compose up -d postgres redis

# Execute as migrations
npm run migrate

# Inicie o servidor de desenvolvimento
npm run dev
```

**Usando Docker**  (Recomendado)
```bash
#Clone o repositório
git clone https://github.com/ederrabelo81-crypto/procurauai.git
cd procurauai

#Configure o .env
cp .env.example .env

#Suba todos os serviços
docker-compose up -d

#Acesse a aplicação
Frontend: http://localhost:3000
Backend API: http://localhost:3001
PGAdmin: http://localhost:5050
```
📁 **Estrutura do Projeto**
```bash
procurauai/
├── frontend/                 # Aplicação Vue 3
│   ├── src/
│   │   ├── assets/          # Imagens, fontes, ícones
│   │   ├── components/      # Componentes reutilizáveis
│   │   │   ├── ui/         # Componentes base (Button, Input, etc)
│   │   │   ├── layout/     # Header, Footer, Sidebar
│   │   │   └── features/   # Componentes de features
│   │   ├── views/          # Páginas/Views
│   │   ├── stores/         # Pinia stores
│   │   ├── composables/    # Vue composables
│   │   ├── utils/          # Funções utilitárias
│   │   ├── types/          # TypeScript types
│   │   ├── router/         # Vue Router config
│   │   └── App.vue
│   ├── public/
│   ├── tests/
│   └── package.json
│
├── backend/                  # API Node.js
│   ├── src/
│   │   ├── controllers/    # Controllers
│   │   ├── models/         # Modelos do banco
│   │   ├── routes/         # Rotas da API
│   │   ├── middleware/     # Middlewares
│   │   ├── services/       # Lógica de negócio
│   │   ├── utils/          # Utilitários
│   │   ├── config/         # Configurações
│   │   └── server.ts
│   ├── migrations/         # Database migrations
│   ├── tests/
│   └── package.json
│
├── docs/                     # Documentação adicional
│   ├── API.md              # Documentação da API
│   ├── DESIGN_SYSTEM.md    # Design system
│   └── CONTRIBUTING.md     # Guia de contribuição
│
├── docker-compose.yml
├── .github/
│   └── workflows/          # GitHub Actions
├── README.md
└── LICENSE
```

---

### 📚 Documentação 

GET    /api/v1/search?q={termo}&lat={lat}&lng={lng}&radius=15<br>
GET    /api/v1/categories<br>
GET    /api/v1/business/{id}<br>
GET    /api/v1/reviews/{businessId}<br>
POST   /api/v1/reviews (auth required)<br>
GET    /api/v1/user/profile (auth required)<br>
POST   /api/v1/auth/register<br>
POST   /api/v1/auth/login<br>
POST   /api/v1/favorites (auth required)<br>
GET    /api/v1/favorites (auth required)<br>


---
### 🤝 Como Contribuir  
Contribuições são muito bem-vindas! <br>
**Para contribuir:<br>**
1. Fork o projeto<br>
2. Crie uma branch para sua feature (git checkout -b feature/MinhaFeature)<br>
3. Commit suas mudanças (git commit -m 'feat: adiciona nova funcionalidade')<br>
4. Push para a branch (git push origin feature/MinhaFeature)<br>
5. Abra um Pull Request<br>


---
### Padrões de Commit  
**Seguimos Conventional Commits:<br>**
feat: nova funcionalidade <br>
fix: correção de bug <br>
docs: alteração em documentação <br>
style: formatação, ponto e vírgula, etc <br>
refactor: refatoração de código <br>
test: adição ou correção de testes <br>
chore: tarefas de manutenção <br>


---
### 👥 Time <br>
Criado e mantido por:<br>
Eder Rabelo (@ederrabelo81-crypto)

### 📞 Contato  

📧 Email: ederrabelo81@gmail.com<br>
💬 Issues: GitHub Issues<br>
📱 WhatsApp: (11) 98193-7266<br>

### 🙏 Agradecimentos  

Comunidades de desenvolvedores Vue.js e TypeScript<br>
Contributors e early adopters<br>
Associações comerciais locais parceiras<br>


Desenvolvido com ❤️ para a comunidade de **Monte Santo de Minas** e região
