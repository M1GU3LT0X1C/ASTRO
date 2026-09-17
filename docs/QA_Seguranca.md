# 🛡️ Documentação Mestre de Qualidade e Segurança (QA & Security)

**Projeto:** Astro (AstroPets)  
**Ambiente:** Produção (`main`) / Homologação Front-end  
**Data:** 17 de setembro de 2026  

## 1. Controle de Revisão

| Data | Versão | Descrição da Alteração | Responsável |
| :--- | :--- | :--- | :--- |
| 15/09/2026 | 1.0 | Criação inicial do Plano de Testes focado na validação de interface (UI) e usabilidade do Front-end. | Agatha Fernanda Silva Magalhães |
| 17/09/2026 | 1.1 | Unificação da documentação: inclusão da auditoria de segurança do Back-end (RLS, Rate Limit, Middleware). | Agatha Fernanda Silva Magalhães |

---

## 2. Visão Geral
Este documento unifica os relatórios de testes e auditoria do projeto **Astro**, consolidando duas frentes fundamentais para o lançamento do MVP: 
1. **Segurança e Infraestrutura:** Correções de vulnerabilidades críticas no banco de dados e na autenticação.
2. **Qualidade de Software (Front-end):** Validação de usabilidade, interações de interface (UI) e navegação do usuário.

A plataforma atua como um ecossistema B2B2C conectando adotantes, ONGs e clínicas veterinárias, exigindo alto rigor tanto na proteção de dados sensíveis quanto na experiência de uso.

---

## 3. 🔒 Auditoria e Implementações de Segurança (Back-end)
Esta seção documenta a resolução de vulnerabilidades apontadas pela Vercel e pelo Supabase, garantindo que o sistema saia de um estado de exposição para uma arquitetura blindada.

* **Proteção de Dados (Row Level Security - RLS):** O RLS foi ativado em todas as tabelas principais (`animais`, `clinicas`, `parceiros`, `ongs`). Políticas restritivas foram criadas (`publico ve disponiveis` e `autenticado gerencia animais`), impedindo que agentes externos façam download da base de dados via `curl`.
* **Defesa Contra Força Bruta (Rate Limit):** Implementado bloqueio no *client-side* da tela de login. Após 5 tentativas incorretas para o mesmo e-mail, o sistema bloqueia o acesso por 15 minutos.
* **Isolamento Server-Side:** O arquivo `layout.tsx` do Dashboard foi refatorado para Server Component, transferindo a validação de usuário para o servidor e impedindo que a autenticação seja burlada via console do navegador.
* **Estabilidade de Rotas (Middleware):** Adicionado um *matcher* no `middleware.ts` para ignorar assets estáticos (`_next/static`) e validar sessões corretamente via `getUser()`, eliminando loops infinitos de redirecionamento.
* **Gestão de Credenciais e Headers:** Migração para o uso exclusivo da `publishable_key` e implementação de políticas de segurança estritas (HSTS `max-age=63072000`) no `next.config.ts`.

---

## 4. 🧪 Especificação e Execução de Casos de Teste (Front-end / UI)
Bateria de testes focada na interface gráfica, simulando a jornada real do usuário para garantir responsividade, fluxos sem quebra e feedback visual correto.

### 🟢 CT-001 | Módulo: Landing Page
* **Cenário:** Redirecionamentos da tela inicial.
* **Pré-condições:** Acessar a página inicial.
* **Passos de Execução:** 
  1. Clicar no botão "Entrar" no cabeçalho.
  2. Voltar à página inicial.
  3. Rolar a página e clicar em "Conheça nossa história".
* **Resultado Esperado:** Os botões devem redirecionar o usuário para a tela de Login e para a seção "Sobre Nós", respectivamente, sem erros de carregamento.
* **Prioridade:** Alta
* **Status:** ✅ Aprovado

### 🟢 CT-002 | Módulo: Landing Page
* **Cenário:** Interação visual (Hover) nos botões de ação.
* **Pré-condições:** Acessar a página inicial.
* **Passos de Execução:** 
  1. Passar o cursor sobre "Encontrar meu pet".
  2. Passar o cursor sobre "Buscar clínicas próximas".
* **Resultado Esperado:** Os botões devem apresentar feedback visual suave (mudança de cor ou sombreamento) e o cursor deve mudar para o formato de clique (pointer).
* **Prioridade:** Baixa
* **Status:** ✅ Aprovado

### 🟢 CT-003 | Módulo: Autenticação
* **Cenário:** Comportamento de erro em formulário de Login.
* **Pré-condições:** Acessar tela de Login.
* **Passos de Execução:** 
  1. Deixar os campos e-mail e senha em branco.
  2. Clicar em "Entrar".
* **Resultado Esperado:** O front-end deve bloquear a ação e exibir uma mensagem de erro ou destacar os campos em vermelho exigindo preenchimento.
* **Prioridade:** Alta
* **Status:** ✅ Aprovado

### 🟢 CT-004 | Módulo: Ajuda (FAQ)
* **Cenário:** Interação de expansão de perguntas (Accordion).
* **Pré-condições:** Acessar a aba "Ajuda".
* **Passos de Execução:** 
  1. Clicar no "+" da pergunta "O Astro realiza adoções?".
  2. Clicar no "-" da mesma pergunta.
* **Resultado Esperado:** A resposta deve ser exibida empurrando o conteúdo abaixo de forma suave (expansão) e ocultada ao clicar em "-" (recolhimento).
* **Prioridade:** Média
* **Status:** ✅ Aprovado

### 🟢 CT-006 | Módulo: Novo Pet
* **Cenário:** Validação de campos obrigatórios vazios (RF04).
* **Pré-condições:** Acessar o menu lateral "Novo Pet".
* **Passos de Execução:** 
  1. Deixar "Nome do Pet" em branco.
  2. Preencher os demais campos.
  3. Clicar em "Publicar".
* **Resultado Esperado:** O formulário não deve ser submetido e um aviso visual (borda vermelha ou texto de alerta) deve aparecer no campo "Nome do Pet".
* **Prioridade:** Crítica
* **Status:** ✅ Aprovado

### 🟢 CT-007 | Módulo: Novo Pet
* **Cenário:** Interação com componentes de seleção (Dropdowns e Toggles).
* **Pré-condições:** Acessar tela "Novo Pet".
* **Passos de Execução:** 
  1. Abrir os menus de Porte, Sexo e Espécie.
  2. Clicar nas chaves (toggles) de "Castrado" e "Vacinado".
  3. Selecionar ícones de personalidade (ex: "Energético").
* **Resultado Esperado:** Os dropdowns devem listar as opções corretamente, os toggles devem alternar cor/posição, e os ícones de personalidade devem indicar estado selecionado.
* **Prioridade:** Alta
* **Status:** ✅ Aprovado

---

## 5. ✅ Critérios de Conclusão e Aceite (DoD)
A liberação desta versão para o ambiente de Produção atendeu aos seguintes requisitos de qualidade:
- [x] **Segurança:** 100% das tabelas do banco de dados protegidas por políticas RLS ativas.
- [x] **Estabilidade:** Ausência de loops de redirecionamento (Middleware operante) e implementação de Rate Limit ativo no login.
- [x] **Interface e Usabilidade:** Todos os testes visuais e de formulários (CT-001 a CT-007) executados e aprovados. Nenhuma falha severa (*Blocker*) detectada na renderização dos componentes ou na submissão de dados incompletos.
