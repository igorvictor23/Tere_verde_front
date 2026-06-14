# Terê Verde - Frontend (Interface de Usuário) 🌿

Esta é a interface oficial do **Terê Verde**, um Produto Mínimo Viável (MVP) acadêmico focado na divulgação e gestão de eventos de ecoturismo nos parques naturais de Teresópolis. 

A aplicação foi construída com foco em performance, acessibilidade e uma experiência de usuário (UX) imersiva, servindo como a ponte visual entre os visitantes, os administradores e a nossa API RESTful.

---

## 🎨 O Projeto e a Arquitetura Visual

Ao invés de depender de frameworks pesados, o front-end foi arquitetado de forma nativa (**Vanilla**), provando o domínio dos fundamentos da Web. A estrutura de estilos foi modularizada para facilitar a manutenção e o reaproveitamento de código, garantindo uma renderização extremamente rápida no navegador.

### Tecnologias Utilizadas
* **HTML5 Semântico:** Estruturação acessível e amigável para motores de busca (SEO).
* **CSS3 Modularizado:** Arquitetura de estilos dividida em responsabilidades (`base.css`, `layout.css`, `components.css`, `admin.css`), utilizando CSS Variables (Custom Properties) para consistência do *Design System*.
* **Vanilla JavaScript (ES6+):** Lógica de interface, manipulação direta do DOM e consumo de APIs utilizando `async/await` e a `Fetch API` nativa.
* **[Phosphor Icons](https://phosphoricons.com/):** Biblioteca de ícones vetoriais leves e consistentes para aprimorar a interface.

---

## ✨ Principais Funcionalidades

O front-end é dividido em duas grandes áreas de acesso: a visão pública (visitantes) e o painel administrativo.

### 🏕️ Visão Pública (Visitantes)
* **Página Inicial Dinâmica:** Carrosséis interativos apresentando a cidade e dicas para trilheiros.
* **Vitrine de Eventos:** Listagem pública de próximos eventos com design em *cards*, consumindo os dados diretamente da API.
* **Guia Virtual Integrado:** Um widget de chat flutuante onde os usuários podem tirar dúvidas em tempo real com uma Inteligência Artificial focada na natureza de Teresópolis.
* **Previsão do Tempo Sob Demanda:** Visualização dinâmica do clima para a data dos eventos, consumindo serviços meteorológicos.
* **Inscrição Simplificada:** Fluxo rápido de inscrição em eventos através de e-mail, com feedbacks visuais amigáveis.

### 🔒 Painel Administrativo
* **Autenticação Segura:** Tela de login validando credenciais na API e armazenando o token JWT de forma segura no *LocalStorage* da sessão.
* **Gestão de Eventos (CRUD):** Interface completa para que administradores possam criar, ler, atualizar e excluir eventos.
* **Feedbacks Visuais (Toasts e Modais):** Sistema personalizado de notificações não-intrusivas (Toasts) para confirmar ações de sucesso/erro e modais interativos para confirmação de ações críticas (como exclusão de registros).
* **Controle de Rota:** Redirecionamento automático (proteção de tela) caso o token do administrador expire ou não seja encontrado.

---

## ⚙️ Integração com o Backend

A interface atua de forma totalmente desacoplada, realizando requisições HTTP assíncronas para o nosso serviço principal.

* **Endpoints Consumidos:** O JavaScript `admin.js` e `script.js` são responsáveis por centralizar as chamadas para as rotas de login, eventos, chat e meteorologia.
* **Tratamento de Erros (*Graceful Degradation*):** A interface foi programada para não "quebrar" caso algum serviço falhe. Se a API estiver offline, o usuário recebe um feedback amigável via *Toast* ao invés de um erro genérico na tela.

---

## 🚀 Como Executar o Projeto Localmente

Por ser um projeto construído com tecnologias front-end nativas, a execução é extremamente simples, não exigindo gerenciadores de pacotes ou processos de *build*.

### Pré-requisitos
* Um navegador web moderno (Chrome, Firefox, Edge, Safari).
* Opcional: Extensão **Live Server** (no VS Code) para auto-reload durante o desenvolvimento.
* O [Backend do Terê Verde](https://github.com/igorvictor23/Tere_verde_back) rodando localmente (ou a URL de produção configurada nos arquivos `.js`).

### Passos para rodar
1. Clone este repositório:
   ```bash
   git clone [https://github.com/seu-usuario/tere-verde-front.git](https://github.com/seu-usuario/tere-verde-front.git)

2. Abra o arquivo `index.html` diretamente no seu navegador ou inicie a extensão Live Server (no VS Code).

3. O sistema já estará visível e pronto para uso!