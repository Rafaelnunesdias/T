# XFlow ERP + XFlow Delivery
## Plano de Desenvolvimento em Etapas — Claude Code

---

## Instruções Gerais

Este documento define as 10 etapas de desenvolvimento do ecossistema XFlow ERP + XFlow Delivery.

O XFlow é um **SaaS multi-segmento para o setor alimentício** — atende fábricas de alimentos, restaurantes, lanchonetes, pizzarias, confeitarias e dark kitchens. A X Salgados é usada apenas como exemplo de cliente para fins de seed/demonstração; nenhuma etapa deve travar o sistema a esse caso específico.

### Regras obrigatórias para o Claude Code

- **Executar tudo de forma autônoma.** O usuário não vai rodar nenhum comando manualmente. Tudo — instalação de dependências, criação de arquivos, configuração de ambiente, execução de scripts — deve ser feito pelo Claude Code sem intervenção humana.
- **Nunca pedir para o usuário executar algo.** Nenhum `npm install`, nenhum `npm run dev`, nenhum comando de terminal deve ser deixado para o usuário rodar.
- **Cada etapa deve terminar funcionando e responsiva.** Ao final de cada etapa, revisar obrigatoriamente se o código está correto e se o layout está responsivo em mobile (375px), tablet (768px) e desktop (1280px+). Nenhuma etapa avança sem essa validação.
- Não avançar para a próxima etapa sem a anterior estar 100% funcional.
- Ao iniciar cada etapa, ler o contexto completo antes de escrever qualquer código.
- Usar **português brasileiro** em todas as interfaces, mensagens, labels e comentários de código.

---

## Etapa 1 — Fundação do Projeto e Configuração do Ambiente

### Objetivo
Criar toda a estrutura base dos dois projetos (ERP e Delivery) e do backend, instalar todas as dependências e deixar tudo rodando — sem que o usuário precise executar nenhum comando.

**O projeto no Supabase já está criado pelo usuário.** O Claude Code não precisa criar nem configurar o banco — apenas ler as credenciais do `.env` e criar as tabelas que ainda não existirem.

### Banco de Dados

O banco de dados é o **Supabase** (PostgreSQL gerenciado na nuvem).

- Usar o client oficial do Supabase (`@supabase/supabase-js`) para toda comunicação com o banco. Não usar Prisma.
- As credenciais do Supabase (`SUPABASE_URL` e `SUPABASE_KEY`) já estão no arquivo `.env` do backend.
- Criar todas as tabelas via SQL direto no Supabase (arquivo `backend/db/schema.sql`) e executar via client ou API do Supabase — o Claude Code deve fazer isso automaticamente.
- Criar o seed de dados automaticamente via script executado pelo Claude Code (arquivo `backend/db/seed.sql` ou script equivalente).

### Tarefas

**Monorepo / Estrutura de Pastas**
- Criar estrutura separada para `erp/` e `delivery/` no frontend.
- Criar pasta `backend/` única compartilhada pelos dois sistemas.
- Criar todos os arquivos de configuração necessários (`.env`, `.gitignore`, etc.).

**Backend**
- Inicializar o projeto Node.js com Express.
- Instalar todas as dependências automaticamente.
- Configurar conexão com o Supabase usando `@supabase/supabase-js`.
- Criar arquivo `.env` com as variáveis `SUPABASE_URL`, `SUPABASE_KEY` e `PORT`.
- Configurar CORS para aceitar os dois frontends.
- Configurar estrutura de rotas base (`/api/erp` e `/api/delivery`).
- Iniciar o servidor automaticamente.

**Frontend ERP**
- Inicializar o projeto React com Vite e TypeScript.
- Instalar todas as dependências automaticamente.
- Configurar estilização, roteamento e gerenciamento de dados.
- Configurar tema global (Dark Mode / Light Mode).
- Definir paleta de cores: `#7b4b34`, `#fc6901`, `#54240d`.
- Iniciar o servidor de desenvolvimento automaticamente.

**Frontend Delivery**
- Inicializar o projeto React com Vite e TypeScript.
- Instalar todas as dependências automaticamente.
- Configurar tema global separado (mais voltado ao consumidor).
- Iniciar o servidor de desenvolvimento automaticamente.

**Banco de Dados — Supabase**
- O projeto no Supabase **já está criado**. As credenciais (`SUPABASE_URL` e `SUPABASE_KEY`) já estão no arquivo `.env` do backend.
- Antes de criar qualquer tabela, o Claude Code deve inspecionar as tabelas que já existem no banco para não duplicar ou sobrescrever nada.
- Criar apenas as tabelas que ainda não existirem, com todas as entidades necessárias:
  - `businesses` (multi-tenant: fábrica, restaurante, etc.)
  - `users`, `clients`, `products`, `categories`
  - `orders`, `order_items`, `production_orders`
  - `stock`, `stock_movements`, `ingredients`
  - `transactions`, `deliveries`, `delivery_zones`
  - `addresses`, `coupons`, `fiscal_coupons`
- A tabela `businesses` deve ter campo `type` (`fabrica`, `restaurante`, `lanchonete`, `pizzaria`, `confeitaria`, `dark_kitchen`).
- Todas as tabelas operacionais devem ter `business_id` (multi-tenant).
- Criar e executar automaticamente o seed com dados de pelo menos 2 negócios diferentes.

### Revisão Obrigatória ao Final
- [ ] Dois frontends rodando automaticamente.
- [ ] Backend conectado ao Supabase sem erros.
- [ ] Todas as tabelas criadas e seed populado.
- [ ] Layout responsivo verificado em 375px, 768px e 1280px.

---

## Etapa 2 — Autenticação e Controle de Perfis

### Objetivo
Implementar o sistema de login, controle de perfis e proteção de rotas para o ERP.

### Tarefas

**Backend**
- Criar endpoint `POST /api/auth/login`.
- Criar endpoint `POST /api/auth/refresh`.
- Criar endpoint `POST /api/auth/logout`.
- Criar endpoint `POST /api/auth/forgot-password`.
- Implementar geração e validação de token de sessão contendo `userId`, `role` e validade.
- Criar middleware de autenticação para proteger todas as rotas do ERP.
- Criar middleware de autorização por perfil (`admin`, `producao`, `financeiro`, `atendente`, `motoboy`).

**Frontend ERP — Tela de Login**
- Criar tela de login premium (sem landing page).
- Layout: logo centralizada, e-mail, senha, recuperar senha, lembrar acesso.
- Visual inspirado em Linear e Stripe.
- Dark Mode ativo por padrão.
- Implementar validação de formulário.
- Armazenar token de sessão de forma segura no cliente.
- Redirecionar para dashboard após login bem-sucedido.

**Frontend ERP — Proteção de Rotas**
- Criar `PrivateRoute` que verifica token antes de renderizar.
- Criar `RoleRoute` que verifica o perfil do usuário.
- Redirecionar para login se token inválido ou expirado.
- Cada perfil deve ver apenas as rotas permitidas.

**Perfis e Redirecionamentos**

| Perfil        | Rota Inicial após Login  |
|---------------|--------------------------|
| Administrador | `/erp/dashboard`         |
| Produção      | `/erp/producao`          |
| Financeiro    | `/erp/financeiro`        |
| Atendente     | `/erp/pedidos`           |

> O sistema não possui perfil de Motoboy. A gestão de entregas é feita pelo Administrador ou Atendente no módulo de Logística.

### Revisão Obrigatória ao Final
- [ ] Login funcional com sessão autenticada.
- [ ] Cada perfil acessa apenas suas rotas.
- [ ] Sessão persistida entre acessos.
- [ ] Tela de login responsiva em todos os breakpoints.

---

## Etapa 3 — Layout Base do ERP e Dashboard Administrativo

### Objetivo
Criar o shell visual do ERP (sidebar, topbar, layout) e o dashboard administrativo com gráficos reais.

### Tarefas

**Layout Base do ERP**
- Criar Sidebar com navegação por perfil.
- Criar Topbar com nome do usuário, perfil e botão de logout.
- Criar área de conteúdo principal responsiva.
- Implementar toggle Dark Mode / Light Mode.
- Aplicar animações de transição entre rotas.

**Sidebar — Itens por Perfil**

Administrador: Dashboard, Pedidos, Produção, Estoque (interno), Clientes, Financeiro, Configurações.

Produção: Produção.

Financeiro: Financeiro.

Atendente: Pedidos, Clientes.

**Dashboard Administrativo**
- Criar cards de métricas:
  - Vendas do dia.
  - Vendas do mês.
  - Pedidos em andamento.
  - Entregas concluídas.
  - Entregas pendentes.
  - Lucro do mês.
- Criar gráficos (biblioteca a critério da implementação):
  - Linha: faturamento dos últimos 30 dias.
  - Barras: pedidos por hora do dia.
  - Pizza: produtos mais vendidos.
  - Área: lucro vs despesas do mês.
- Todos os gráficos com dados do seed — nenhum gráfico vazio.

> O dashboard é o único local de visualização de dados do sistema. Não há página separada de Relatórios, BI ou exportação de PDF.

### Revisão Obrigatória ao Final
- [ ] Shell do ERP renderizando corretamente.
- [ ] Sidebar funcional por perfil sem Logística.
- [ ] Todos os gráficos visíveis e com dados.
- [ ] Layout responsivo verificado em todos os breakpoints.

---

## Etapa 4 — Módulo de Pedidos e Ordens de Produção

### Objetivo
Criar o fluxo completo de pedidos: cadastro, geração automática de OP e entrada na cozinha.

### Tarefas

**Backend**
- Criar endpoint `POST /api/orders` — cria pedido e gera OP automaticamente.
- Criar endpoint `GET /api/orders` — lista pedidos com filtros.
- Criar endpoint `GET /api/orders/:id` — detalhe do pedido.
- Criar endpoint `PATCH /api/orders/:id/status` — atualiza status.
- Lógica de geração do número OP: `OP-{ANO}-{SEQUENCIAL 6 DÍGITOS}`.
- Ao criar pedido: gerar OP, baixar estoque interno, registrar no financeiro.

**Frontend ERP — Tela de Pedidos (Atendente)**
- Listar todos os pedidos com status, cliente, valor e OP.
- Filtros por status, data e cliente.
- Botão para criar novo pedido manualmente.
- Formulário de novo pedido: buscar cliente, adicionar produtos, definir endereço, forma de pagamento e observações.
- Modal de detalhe do pedido com timeline de status.

**Frontend ERP — Tela de Produção (Kanban)**
- Três colunas: Recebido, Em Produção, Finalizado.
- Cards com: número da OP, cliente, lista de produtos, horário, prioridade.
- Drag and drop entre colunas para atualizar status.
- Cards com mesmo tamanho, alinhamento e visual padronizados.
- Atualização em tempo real via polling a cada 15 segundos.

**Regra de Negócio**
```
Criar Pedido
    → Gerar OP (OP-2026-000001)
    → Baixa automática no estoque INTERNO
    → Card aparece em "Recebido" no Kanban
    → Ao mover para "Em Produção" → status atualiza
    → Ao mover para "Finalizado" → entra na logística
```

### Revisão Obrigatória ao Final
- [ ] Pedidos criados geram OP automaticamente.
- [ ] OP aparece no Kanban imediatamente.
- [ ] Estoque interno atualizado após criação do pedido.
- [ ] Drag and drop funcional.
- [ ] Telas responsivas em todos os breakpoints.

---

## Etapa 5 — Módulo de Estoque Interno, Clientes, Financeiro e Cupom Fiscal

### Objetivo
Implementar o estoque interno de ingredientes, o cadastro de clientes, o módulo financeiro e a emissão de cupom fiscal vinculado aos pedidos.

### Importante — Escopo do Estoque

O estoque do XFlow é **estritamente interno**. Ele controla apenas ingredientes e insumos usados na produção. O estoque nunca gera documentos fiscais — isso é responsabilidade do módulo de Cupom Fiscal.

### Tarefas

**Módulo de Estoque Interno**

Backend:
- CRUD completo de ingredientes e insumos internos.
- Endpoint de entrada de estoque (compra de ingrediente).
- Endpoint de saída automática ao confirmar produção.
- Endpoint de alertas de estoque mínimo.
- Histórico de movimentações internas.

Frontend ERP:
- Tela de ingredientes: nome, unidade, quantidade atual, quantidade mínima.
- Badge de alerta vermelho quando abaixo do mínimo.
- Tela de entradas: registrar compra de ingrediente (fornecedor, quantidade, custo).
- Tela de histórico: todas as movimentações com data, tipo (entrada/saída) e quantidade.
- Saídas são geradas automaticamente pela produção — não há saída manual.

> Não criar tela de "Produtos" no estoque. Produtos são gerenciados no catálogo. O estoque controla apenas ingredientes e insumos de produção.

**Módulo de Cupom Fiscal**

O cupom fiscal é gerado para cada pedido finalizado. É um documento interno simplificado que registra a venda — não integra com SEFAZ nesta versão (sem emissão de NF-e real), mas segue o formato correto para uso operacional.

Backend:
- Tabela `fiscal_coupons` no banco: `id`, `order_id`, `business_id`, `number`, `client_name`, `client_document`, `items`, `subtotal`, `discount`, `total`, `payment_method`, `issued_at`, `status`.
- Numeração sequencial automática por negócio: `CF-{ANO}-{SEQUENCIAL 6 DÍGITOS}`.
- Endpoint `POST /api/fiscal/generate/:order_id` — gera cupom ao finalizar pedido.
- Endpoint `GET /api/fiscal` — lista cupons com filtros (data, cliente, status).
- Endpoint `GET /api/fiscal/:id` — detalhe do cupom.
- Endpoint `GET /api/fiscal/:id/pdf` — exporta cupom em PDF.
- Cupom gerado automaticamente quando o pedido muda para status "Finalizado".

Frontend ERP — Tela de Cupons Fiscais:
- Listagem de cupons com número, cliente, valor, data e status.
- Filtros por data, cliente e forma de pagamento.
- Modal de detalhe do cupom com todos os itens, valores e dados do cliente.
- Botão de exportar cupom individual em PDF.
- Badge de status: Emitido, Cancelado.

Formato do cupom (exibido em modal e PDF):
```
---------------------------------
        XFlow ERP — Cupom Fiscal
---------------------------------
CF-2026-000154
Data: 01/07/2026 14:32
---------------------------------
Cliente: Escola Aprender
Pedido: OP-2026-000312
---------------------------------
ITENS:
50x Coxinha de Frango    R$125,00
20x Kibe Assado           R$56,00
---------------------------------
Subtotal:                R$181,00
Desconto:                  R$0,00
Total:                   R$181,00
Pagamento: PIX
---------------------------------
```

**Módulo de Clientes**

Backend:
- CRUD completo de clientes.
- Endpoint de histórico de pedidos por cliente.
- Endpoint de produtos favoritos por cliente.
- Endpoint de total gasto por cliente.

Frontend ERP:
- Listagem de clientes com busca por nome e telefone.
- Página de perfil do cliente:
  - Nome, telefone e endereços salvos.
  - Total gasto e quantidade de pedidos.
  - Produtos favoritos.
  - Últimos pedidos com detalhe.

**Módulo Financeiro**

Backend:
- Registro automático de receita ao confirmar pedido.
- CRUD de despesas manuais.
- Endpoints de resumo diário, semanal, mensal e anual.

Frontend ERP:
- Cards: receita total, despesas totais, lucro líquido.
- Gráfico de linha: faturamento diário do mês.
- Gráfico de barras: receitas vs despesas por semana.
- Gráfico de área: lucro acumulado do ano.
- Filtros de período funcionais em todos os gráficos.

**Regra de Negócio — Cupom Fiscal**
```
Pedido finalizado (status = Finalizado)
    → Gerar Cupom Fiscal automaticamente (CF-2026-000154)
    → Registrar receita no Financeiro
    → Cupom disponível para consulta e exportação em PDF
```

### Revisão Obrigatória ao Final
- [ ] Estoque apenas interno — sem documentos fiscais no estoque.
- [ ] Baixa automática ao confirmar produção funcionando.
- [ ] Alertas de estoque mínimo visíveis.
- [ ] Cupom fiscal gerado automaticamente ao finalizar pedido.
- [ ] Exportação do cupom em PDF funcionando.
- [ ] Perfil de cliente com histórico completo.
- [ ] Gráficos financeiros com dados reais.
- [ ] Telas responsivas em todos os breakpoints.

---

## Etapa 6 — Módulo de Logística removido

> Este módulo foi removido do escopo do projeto a pedido dos professores orientadores. As tabelas `deliveries` e `delivery_zones` permanecem no banco para suporte ao rastreamento do portal do cliente, mas não há tela de logística, mapa ou Smart Delivery Map no ERP.

---

## Etapa 7 — Portal do Cliente: XFlow Delivery (Parte 1 — Vitrine)

### Objetivo
Criar o portal público do cliente no estilo iFood/99Food — hero de tela cheia, catálogo, carrinho e checkout integrado ao ERP.

### Tarefas

**Backend**
- Endpoint `POST /api/clients/register` — cadastro de cliente.
- Endpoint `POST /api/clients/login` — login do cliente (token separado do ERP).
- Endpoint `GET /api/products/public` — catálogo público de produtos.
- Endpoint `GET /api/categories` — lista de categorias.
- Endpoint `POST /api/orders/client` — criar pedido pelo portal.
- Endpoint `GET /api/orders/client/:id/track` — rastrear pedido.
- Endpoint `GET /api/delivery/estimate` — calcular frete por endereço.

**Frontend Delivery — Página Inicial**

Layout inspirado em iFood e 99Food:
- Header fixo: logo XFlow Delivery à esquerda, links de navegação no centro, botões Entrar e Fazer Pedido à direita.
- Hero de tela cheia com foto de fundo de comida, gradiente escuro para legibilidade, headline grande, subtítulo e botão CTA laranja.
- Seção de categorias em linha com ícone + nome.
- Grid de produtos em destaque.
- Seção de promoções com cards destacados.
- Seção de avaliações de clientes.
- Footer com informações da empresa, links e redes sociais.

**Frontend Delivery — Catálogo**
- Sidebar de categorias à esquerda.
- Grid de produtos com: foto, nome, descrição, preço e botão adicionar.
- Busca de produto por nome.
- Badge de disponibilidade.
- Categorias configuráveis por tipo de negócio.

**Frontend Delivery — Carrinho**
- Drawer lateral.
- Lista de itens com controle de quantidade.
- Campo de cupom de desconto.
- Cálculo de frete automático.
- Resumo: subtotal, frete, desconto, total.
- Botão de finalizar pedido.

**Frontend Delivery — Checkout**
- Passo 1: Endereço de entrega.
- Passo 2: Forma de pagamento (PIX, Cartão, Dinheiro).
- Passo 3: Revisão e confirmação.
- Após confirmação: OP gerada automaticamente no ERP.
- Tela de sucesso com número do pedido e OP.

### Revisão Obrigatória ao Final
- [ ] Hero de tela cheia funcionando.
- [ ] Catálogo com produtos e categorias.
- [ ] Carrinho com cálculo de frete.
- [ ] Checkout em 3 passos funcional.
- [ ] OP gerada no ERP após confirmação.
- [ ] Layout responsivo em todos os breakpoints.

---

## Etapa 8 — Portal do Cliente: Área do Cliente e Rastreamento (estilo Shopee)

### Objetivo
Implementar a área logada do cliente com perfil, histórico e rastreamento de pedido estilo Shopee — sem mapa, com linha do tempo visual de etapas.

### Tarefas

**Frontend Delivery — Autenticação do Cliente**
- Tela de cadastro: nome, e-mail, telefone, senha.
- Tela de login: e-mail e senha.
- Recuperação de senha por e-mail.
- Header atualizado com avatar e menu do cliente após login.

**Frontend Delivery — Área do Cliente**
- Página de perfil: alterar nome, e-mail, telefone e senha.
- Gerenciamento de endereços: adicionar, editar e remover múltiplos endereços.
- Histórico de pedidos: lista com status, data, valor e OP.
- Detalhe do pedido: produtos, endereço, forma de pagamento e status.
- Total gasto na plataforma (card de destaque).

**Frontend Delivery — Rastreamento do Pedido (estilo Shopee)**

Inspirado no rastreamento da Shopee: linha do tempo vertical com etapas, sem mapa.

Etapas obrigatórias com ícone, label e horário de atualização:

```
✅ Pedido confirmado         — 14:32
🍳 Em preparo               — 14:35
✅ Pronto para entrega       — 15:10
🛵 Saiu para entrega         — 15:18
📦 Entregue                 — 15:44
```

Regras visuais:
- Etapas concluídas: ícone colorido + texto escuro + horário.
- Etapa atual: ícone laranja (`#fc6901`) + texto em destaque + animação de pulso.
- Etapas futuras: ícone cinza + texto muted.
- Linha vertical conectando todas as etapas.
- Sem mapa em nenhum momento do rastreamento.
- Atualização automática do status a cada 20 segundos (polling).

**Código de Verificação**
- Exibir código de entrega na tela do cliente (últimos 4 dígitos do telefone).
- Instrução: "Informe este código ao entregador na chegada."
- Após validação pelo motoboy no ERP, atualizar status para Entregue em tempo real na tela do cliente.

### Revisão Obrigatória ao Final
- [ ] Área do cliente com perfil e histórico funcionando.
- [ ] Rastreamento estilo Shopee sem mapa.
- [ ] Linha do tempo com etapas e horários corretos.
- [ ] Etapa atual com animação de destaque.
- [ ] Atualização automática de status funcionando.
- [ ] Layout responsivo em todos os breakpoints.

---

## Etapa 9 — Integração Total, Polimento Visual e Testes Finais

### Objetivo
Garantir que os dois sistemas funcionam como um ecossistema integrado, corrigir inconsistências visuais e validar todos os fluxos de ponta a ponta.

### Tarefas

**Integração**
- Validar que todo pedido do portal Delivery dispara:
  - Geração de OP no ERP.
  - Aparecimento imediato no Kanban da cozinha.
  - Baixa automática no estoque interno.
  - Registro no financeiro.
  - Atualização do dashboard.
- Validar fluxo completo de ponta a ponta:
  ```
  Cliente faz pedido no Delivery
      → OP gerada no ERP
      → Cozinha recebe no Kanban
      → Produção finalizada
      → Cliente acompanha etapas (estilo Shopee, sem mapa)
      → Status = Entregue
      → Financeiro e dashboard atualizados
  ```

**Polimento Visual**
- Revisar alinhamento de todos os componentes em todas as telas.
- Garantir consistência de espaçamento, tipografia e cores.
- Verificar responsividade em mobile (375px), tablet (768px) e desktop (1280px+).
- Testar Dark Mode em todas as telas do ERP.
- Corrigir qualquer gráfico invisível ou sem dados.
- Corrigir qualquer tela vazia.
- Aplicar animações de entrada onde faltarem.

**Seed de Dados Completo**
- Garantir que o banco possui dados suficientes para demonstração, com **pelo menos 2 negócios diferentes**:
  - Mínimo 20 clientes cadastrados.
  - Mínimo 30 produtos com fotos (distribuídos entre os negócios).
  - Mínimo 100 pedidos em diferentes status.
  - Dados financeiros dos últimos 90 dias.
  - Movimentações de estoque interno realistas.

**Testes de Fluxo**
- Testar login de cada perfil do ERP.
- Testar criação de pedido pelo Atendente.
- Testar Kanban de Produção com drag and drop.
- Testar cadastro e pedido pelo portal Delivery.
- Testar rastreamento estilo Shopee (linha do tempo).
- Testar todos os gráficos do Dashboard.
- Testar cupom fiscal gerado ao finalizar pedido.

**Checklist Final de Qualidade**

- [ ] Nenhuma tela vazia.
- [ ] Nenhum gráfico quebrado.
- [ ] Nenhum componente desalinhado.
- [ ] Dark Mode funcionando em todas as telas do ERP.
- [ ] Layout responsivo em mobile, tablet e desktop.
- [ ] Todos os fluxos de integração validados.
- [ ] Seed de dados completo e realista.
- [ ] Cupom fiscal gerado automaticamente ao finalizar pedido.
- [ ] Rastreamento do cliente sem mapa, estilo Shopee.
- [ ] Sem logística, relatórios ou exportação de PDF no sistema.
- [ ] Estoque apenas interno.
- [ ] Visual premium em ambos os sistemas.
- [ ] Nenhuma aparência de projeto escolar.

### Resultado Esperado
Ecossistema completo, integrado, visualmente impressionante e funcionando de ponta a ponta.

---

## Resumo das Etapas

| Etapa | Descrição                                            | Sistema  |
|-------|------------------------------------------------------|----------|
| 1     | Fundação, configuração e banco multi-tenant          | Ambos    |
| 2     | Autenticação e controle de perfis                    | ERP      |
| 3     | Layout base do ERP e Dashboard                       | ERP      |
| 4     | Pedidos, Ordens de Produção e Kanban                 | ERP      |
| 5     | Estoque interno, Cupom Fiscal, Clientes e Financeiro | ERP      |
| 6     | ~~Logística~~ — removido do escopo                  | —        |
| 7     | Portal Delivery: Vitrine, Catálogo e Checkout        | Delivery |
| 8     | Portal Delivery: Área do Cliente e Rastreamento      | Delivery |
| 9     | Integração total, polimento e testes finais          | Ambos    |
