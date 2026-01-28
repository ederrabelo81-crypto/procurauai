
# Procurauai - O seu guia comercial local

![Capa](https://procurauai.com.br/assets/img/og-image.png)

## 🚀 Sobre o Projeto

O Procurauai é um guia comercial completo e moderno para a cidade de Monte Santo de Minas e região. A plataforma tem como objetivo conectar consumidores a negócios, serviços e eventos locais de forma rápida, intuitiva e eficiente.

### ✨ Funcionalidades Principais

-   **Busca Inteligente:** Encontre o que precisa com filtros avançados e sugestões em tempo real.
-   **Listagens Detalhadas:** Informações completas sobre cada negócio, incluindo fotos, horários, contato e localização no mapa.
-   **Avaliações e Comentários:** Compartilhe suas experiências e ajude outros usuários.
-   **Eventos e Ofertas:** Fique por dentro de tudo que acontece na cidade.
-   **Perfil de Negócio:** Ferramentas para empresários gerenciarem suas listagens e interagirem com clientes.

### 🛠️ Tecnologias Utilizadas

-   **Frontend:**
    -   [React](https://react.dev/)
    -   [Vite](https://vitejs.dev/)
    -   [TypeScript](https://www.typescriptlang.org/)
    -   [Tailwind CSS](https://tailwindcss.com/)
    -   [Shadcn UI](https://ui.shadcn.com/)
-   **Backend & Infraestrutura:**
    -   [Firebase](https://firebase.google.com/) (Firestore, Authentication, Storage)
    -   [Vercel](https://vercel.com/) (Hospedagem e Deploy)
-   **APIs Externas:**
    -   [Google Maps API](https://developers.google.com/maps)

---

## 💻 Para Desenvolvedores

### 📋 Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)
-   Conta no [Firebase](https://firebase.google.com/) e um projeto criado.
-   Conta na [Vercel](https://vercel.com/) para deploy.
-   Chave de API do [Google Maps](https://developers.google.com/maps/gmp-get-started).

### ⚙️ Instalação e Configuração

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/ederrabelo81-crypto/procurauai.git
    cd procurauai
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Configuração das Variáveis de Ambiente:**

    -   Crie um arquivo `.env.local` na raiz do projeto.
    -   Adicione as seguintes variáveis com as suas respectivas chaves obtidas nos serviços (Firebase, Google Maps):

        ```
        # Configuração do Firebase
        VITE_API_KEY=sua_api_key_do_firebase
        VITE_AUTH_DOMAIN=seu_auth_domain_do_firebase
        VITE_PROJECT_ID=seu_project_id_do_firebase
        VITE_STORAGE_BUCKET=seu_storage_bucket_do_firebase
        VITE_MESSAGING_SENDER_ID=seu_messaging_sender_id_do_firebase
        VITE_APP_ID=seu_app_id_do_firebase

        # Chave da API do Google Maps (opcional, para funcionalidades de mapa)
        VITE_GOOGLE_MAPS_API_KEY=sua_api_key_do_google_maps
        ```

4.  **Execute o servidor de desenvolvimento:**

    ```bash
    npm run dev
    ```

    O servidor estará disponível em `http://localhost:5173`.

### 📦 Build para Produção

Para criar uma versão otimizada do projeto para produção, execute:

```bash
npm run build
```

A saída será gerada na pasta `dist/`.

### 🚀 Deploy

O deploy é feito automaticamente pela Vercel a cada `push` na branch `main`.

1.  **Configure as Variáveis de Ambiente na Vercel:**

    -   Acesse o painel do seu projeto na Vercel.
    -   Vá para `Settings` -> `Environment Variables`.
    -   Adicione as mesmas variáveis do seu arquivo `.env.local` (ex: `VITE_API_KEY`, `VITE_GOOGLE_MAPS_API_KEY`, etc.) com os seus respectivos valores.

2.  **Faça o push do seu código:**

    ```bash
    git push origin main
    ```

    A Vercel irá iniciar um novo build e deploy automaticamente.

---

## 🗺️ Roadmap do Projeto

-   [ ] **Módulo de Anúncios:** Sistema de banners e destaques pagos.
-   [ ] **Integração com WhatsApp Business API:** Agendamentos e pedidos direto da plataforma.
-   [ ] **App PWA (Progressive Web App):** Melhorias para instalação no celular e uso offline.
-   [ ] **Painel Administrativo:** Gestão de usuários, listagens e conteúdo.
-   [ ] **Sistema de Notificações:** Alertas sobre novas ofertas, eventos e mensagens.

---

## 🤝 Como Contribuir

Contribuições são o que fazem a comunidade de código aberto um lugar incrível para aprender, inspirar e criar. Qualquer contribuição que você fizer será **muito apreciada**.

1.  **Faça um Fork** do projeto.
2.  **Crie uma Branch** para sua Feature (`git checkout -b feature/AmazingFeature`).
3.  **Faça o Commit** de suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`).
4.  **Faça o Push** para a Branch (`git push origin feature/AmazingFeature`).
5.  **Abra um Pull Request**.

---

## 📄 Licença

Distribuído sob a Licença MIT. Veja `LICENSE` para mais informações.

---

## 🏆 Reconhecimento e Padrões

-   **Estrutura de Pastas:** Mantemos uma estrutura organizada para facilitar a manutenção e escalabilidade.

    ```
    /src
    ├── assets         # Imagens, fontes, etc.
    ├── components     # Componentes React reutilizáveis
    │   ├── ui         # Componentes de UI genéricos (botões, cards)
    │   └── common     # Componentes de domínio específico
    ├── data           # Mock data, dados estáticos
    ├── hooks          # React Hooks customizados
    ├── lib            # Funções utilitárias, configs
    ├── pages          # Componentes de página (rotas)
    ├── services       # Lógica de negócio, chamadas de API
    ├── styles         # Estilos globais
    └── App.tsx        # Componente principal
    └── main.tsx       # Ponto de entrada da aplicação
    ```

-   **Qualidade de Código:**
    -   **ESLint:** Para garantir um padrão de código consistente.
    -   **Prettier:** Para formatação automática do código.

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
