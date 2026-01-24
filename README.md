# Procura UAI 🚀

O **Procura UAI** é uma plataforma digital hiperlocal projetada para conectar cidadãos, comércios e serviços em Monte Santo de Minas e região. Desenvolvido como um **Progressive Web App (PWA)**, o projeto oferece uma experiência fluida e otimizada para dispositivos móveis, funcionando como um guia completo da cidade na palma da mão.

---

## 🌟 Funcionalidades Principais

A plataforma é estruturada em torno de uma **Taxonomia Central de 3 camadas** (Tipo de Listagem → Categoria → Tags), permitindo uma navegação intuitiva e buscas precisas.

| Módulo | Descrição |
| :--- | :--- |
| **🍽️ Comer Agora** | Foco em urgência alimentar, destacando estabelecimentos abertos e opções de delivery. |
| **🏪 Negócios & Serviços** | Guia completo de comércio local, prestadores de serviço e profissionais liberais. |
| **🛒 Classificados** | Espaço para compra, venda, troca e doações entre membros da comunidade. |
| **💸 Ofertas** | Vitrine de descontos, cupons e promoções ativas por tempo limitado. |
| **📅 Agenda da Cidade** | Calendário de eventos, shows, festas religiosas e workshops locais. |
| **📍 Lugares** | Guia turístico e de lazer, destacando praças, parques e pontos históricos. |
| **🏠 Imóveis** | Portal de aluguel e venda de casas, apartamentos e terrenos na região. |
| **📰 Notícias & Utilidade** | Informações locais, comunicados oficiais e notas de falecimento (serviço comunitário). |
| **🚗 Automotivo** | Compra e venda de veículos, motos e serviços relacionados. |
| **💼 Empregos** | Mural de vagas e oportunidades profissionais locais. |

---

## 🛠️ Tecnologias Utilizadas

O projeto utiliza o que há de mais moderno no ecossistema de desenvolvimento web para garantir performance e escalabilidade:

*   **Framework:** [React](https://reactjs.org/) com [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
*   **Componentes UI:** [shadcn/ui](https://ui.shadcn.com/) (baseado em Radix UI)
*   **Gerenciamento de Estado & Queries:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
*   **Roteamento:** [React Router DOM v6](https://reactrouter.com/)
*   **Ícones:** [Lucide React](https://lucide.dev/)
*   **Animações:** [Framer Motion](https://www.framer.com/motion/) e `tailwindcss-animate`
*   **Testes:** [Vitest](https://vitest.dev/) e [Testing Library](https://testing-library.com/)

---

## 📂 Estrutura do Projeto

A arquitetura segue padrões de organização por responsabilidade:

```text
src/
├── assets/          # Ativos estáticos (ícones, imagens)
├── components/      # Componentes React reutilizáveis
│   ├── cards/       # Cards específicos para cada tipo de listagem
│   ├── home/        # Blocos e seções da página inicial
│   ├── listing/     # Componentes para páginas de detalhes
│   └── ui/          # Componentes de interface base (shadcn)
├── data/            # Mock data e fontes de dados estáticas
├── hooks/           # Hooks customizados (Busca, Favoritos, PWA, etc.)
├── lib/             # Utilitários, taxonomia e configurações centrais
├── pages/           # Páginas da aplicação (Views)
└── test/            # Configurações e arquivos de teste
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos

*   [Node.js](https://nodejs.org/) (versão 18 ou superior)
*   Gerenciador de pacotes (npm, pnpm ou bun)

### Instalação

1.  Clone o repositório:
    ```bash
    git clone https://github.com/ederrabelo81-crypto/procurauai.git
    ```

2.  Acesse o diretório:
    ```bash
    cd procurauai
    ```

3.  Instale as dependências:
    ```bash
    npm install
    ```

4.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

---

## 📱 PWA (Progressive Web App)

O Procura UAI foi concebido para ser instalado no smartphone do usuário sem a necessidade de lojas de aplicativos (App Store/Play Store).

*   **Offline Ready:** Cache de recursos essenciais.
*   **Mobile First:** Interface otimizada para toque e navegação por gestos.
*   **Instalável:** Suporte a manifesto e service workers para adição à tela de início.

---

## 📄 Licença

Este projeto está sob a licença privada do proprietário. Consulte o arquivo `package.json` para mais detalhes sobre a versão e dependências.

---

Desenvolvido com ❤️ para a comunidade de Monte Santo de Minas.
