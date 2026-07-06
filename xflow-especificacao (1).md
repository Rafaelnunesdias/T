# XFlow ERP + XFlow Delivery
## Especificação Técnica e Visual do Projeto

---

## Contexto

O setor alimentício — fábricas de alimentos, restaurantes, lanchonetes, pizzarias, confeitarias, dark kitchens — ainda opera, em sua maioria, com processos manuais:
pedidos recebidos por WhatsApp, anotações em papel, controle de estoque feito à mão e rotas de entrega definidas sem sistema. Isso gera erros, retrabalho, atrasos e perda de informação.

O **XFlow ERP** é um SaaS multi-segmento voltado para qualquer negócio do ramo alimentício, e não um sistema fechado para um único tipo de operação. A configuração do sistema se adapta ao tipo de negócio do cliente (fábrica, restaurante, lanchonete, etc.).

A **X Salgados** é utilizada neste documento apenas como exemplo de cliente/caso de uso para ilustrar o funcionamento do sistema — o produto final deve ser genérico o suficiente para atender qualquer negócio do setor.

O objetivo deste projeto é eliminar esses gargalos operacionais com um ecossistema digital integrado, moderno e profissional, aplicável a múltiplos tipos de negócio alimentício.

---

## Visão Geral da Solução

O projeto é composto por dois sistemas distintos que se comunicam em tempo real:

**Sistema 1 — XFlow ERP**
Sistema interno de gestão, usado por fábricas, restaurantes e demais negócios alimentícios. Apenas colaboradores autorizados acessam.

**Sistema 2 — XFlow Delivery**
Portal público (white-label, customizável por cliente) para que consumidores finais realizem pedidos online junto ao negócio cadastrado no XFlow ERP.

Todo pedido feito no portal do cliente entra automaticamente no ERP do negócio correspondente, sem nenhuma intervenção manual.

### Tipos de Negócio Suportados

O sistema deve ser configurável para diferentes perfis de operação, entre eles:

- Fábricas de alimentos (ex: salgados, doces, congelados).
- Restaurantes.
- Lanchonetes e hamburguerias.
- Pizzarias.
- Confeitarias.
- Dark kitchens / cozinhas industriais.

A lógica de produção, estoque e entrega deve ser flexível o suficiente para se adaptar a cada um desses modelos, sem exigir reescrita do sistema.

---

## Tecnologias

A escolha das tecnologias (frontend, backend, banco de dados, ORM, autenticação, mapas, etc.) fica a critério de quem for implementar o projeto (Claude Code), de acordo com as melhores práticas no momento da execução.

Este documento foca em **estrutura, funcionalidades, fluxos e identidade visual** — não prescreve stack técnica.

---

## Identidade Visual

### O que NÃO fazer

- Criar site institucional com banner de produto.
- Usar layout genérico ou de projeto escolar.
- Componentes desalinhados ou fora de padrão.
- Gráficos quebrados ou telas vazias.
- Aparência amadora em qualquer tela.

### O que FAZER

O visual deve ser inspirado em produtos SaaS premium como:
Stripe, Linear, Notion, Asana, Monday, GitHub.

Características obrigatórias:
- Premium e corporativo.
- Moderno e responsivo.
- Suporte a Dark Mode e Light Mode.
- Interface limpa com UX profissional.
- Componentes consistentes em todo o sistema.

### Paleta de Cores

| Nome            | Hex       |
|-----------------|-----------|
| Marrom          | `#7b4b34` |
| Laranja         | `#fc6901` |
| Marrom Escuro   | `#54240d` |

---

## Tela de Login

O sistema abre diretamente na tela de login. Não há landing page.

Elementos obrigatórios:
- Logo centralizada.
- Campo de e-mail.
- Campo de senha.
- Link "Recuperar senha".
- Checkbox "Lembrar acesso".

O visual deve ser premium. Sem formulários genéricos.

---

## Sistema 1 — XFlow ERP

### Perfis de Usuário

| Perfil        | Acesso Principal                          |
|---------------|-------------------------------------------|
| Administrador | Acesso total ao sistema                   |
| Produção      | Kanban de produção e ordens               |
| Financeiro    | Receitas, despesas e relatórios           |
| Atendente     | Pedidos e clientes                        |
| Motoboy       | Entregas, rotas e ganhos                  |

---

### Ordem de Produção

Substituir o conceito de "cupom" por Ordem de Produção (OP).

Formato do número:

```
OP-2026-000154
```

A OP acompanha todo o ciclo de vida do pedido, desde a cozinha até a entrega.

Exemplo de card de OP:

```
Pedido:   50 Coxinhas
Cliente:  Escola Aprender
OP:       OP-2026-000154
Status:   Em Produção
```

---

### Fluxo Operacional Completo

```
Cliente faz pedido
        ↓
Sistema gera Ordem de Produção
        ↓
Pedido entra na cozinha (Kanban)
        ↓
Produção inicia
        ↓
Produção finalizada
        ↓
Pedido entra na logística
        ↓
Motoboy recebe a entrega
        ↓
Cliente valida o recebimento (código de 4 dígitos)
        ↓
Entrega finalizada
        ↓
Financeiro atualizado automaticamente
        ↓
Relatórios atualizados em tempo real
```

---

### Dashboard Administrativo

Painel premium com os seguintes indicadores:

- Vendas do dia e do mês.
- Pedidos por hora e por região.
- Produtos mais vendidos.
- Lucro e faturamento.
- Entregas concluídas e pendentes.
- Tempo médio de entrega.

Todos os gráficos devem estar visíveis, populados e funcionais.
Nenhuma métrica pode aparecer zerada ou vazia.

---

### Módulo de Produção (Kanban)

Tela exclusiva para uso da cozinha.

Modelo Kanban com três colunas:

```
[ Recebido ]  →  [ Em Produção ]  →  [ Finalizado ]
```

Cada card deve exibir:
- Número da OP.
- Nome do cliente.
- Lista de produtos.
- Horário do pedido.
- Nível de prioridade.

Os cards devem ter tamanho, alinhamento e visual padronizados.

---

### Módulo de Estoque

Controle completo com os seguintes módulos:

- Ingredientes.
- Produtos acabados.
- Entradas de estoque.
- Saídas de estoque.

Funcionalidades obrigatórias:
- Baixa automática ao confirmar produção.
- Alertas de estoque mínimo.
- Histórico de movimentações.
- Relatórios de consumo.

---

### Módulo de Clientes

Ao abrir o perfil de um cliente, exibir:

- Nome completo e telefone.
- Endereço principal.
- Total gasto na plataforma.
- Quantidade de pedidos realizados.
- Produtos favoritos.
- Histórico detalhado dos últimos pedidos.

A visualização dos pedidos recentes deve ser clara, organizada e com informações completas.

---

### Módulo Financeiro

Exibir com clareza:

- Receitas totais.
- Despesas registradas.
- Lucro líquido.

Gráficos obrigatórios com filtros por período:
- Diário.
- Semanal.
- Mensal.
- Anual.

Todos os gráficos devem estar visíveis e funcionais.

---

### Módulo de Relatórios e BI

Indicadores obrigatórios:

- Ticket médio por pedido.
- Produtos mais vendidos.
- Horários de pico.
- Top clientes por faturamento.
- Regiões com mais vendas.
- Taxa de cancelamento.
- Eficiência logística.

Nenhum gráfico pode ficar invisível ou sem dados.

---

### Smart Delivery Map

Este é o principal diferencial do projeto.

Inspirado em: iFood, Uber, Loggi, Google Maps.

O mapa deve exibir em tempo real:

- 🏭 Localização da fábrica.
- 🛵 Posição de cada motoboy.
- 📦 Localização dos pedidos em rota.

#### Zonas de Entrega

**Zona Verde — até 3 km**
Menor tempo e menor custo de entrega.

**Zona Azul — de 3 km a 8 km**
Rota equilibrada entre distância e tempo.

**Zona Roxa — acima de 8 km**
Rota alternativa com maior tempo estimado.

Cada zona deve exibir:
- Quantidade de pedidos ativos.
- Tempo médio de entrega.
- Entregadores disponíveis.
- Faturamento da região.

---

### Roteamento Inteligente

O sistema deve sugerir automaticamente a melhor sequência de entregas:

```
Pedido A  →  Pedido B  →  Pedido C  →  Pedido D
```

Critérios de otimização:
- Menor distância total percorrida.
- Menor tempo de entrega.
- Menor consumo de combustível.

---

### Validação de Entrega

Ao chegar ao endereço do cliente, o motoboy solicita os últimos 4 dígitos do telefone cadastrado.

Exemplo:

```
Telefone:  31987654321
Código:    4321
```

Somente após a confirmação do código o status é atualizado para **Entregue**.

Objetivo: garantir que a entrega ocorreu de fato no endereço correto.

---

### Painel do Motoboy

Tela dedicada ao perfil motoboy com:

- Entregas pendentes.
- Entregas em rota.
- Entregas concluídas.
- Ganhos do dia.
- Ganhos da semana.
- Ganhos do mês.

---

## Sistema 2 — XFlow Delivery

Portal público acessado pelos clientes finais para realizar pedidos junto a qualquer negócio cadastrado (fábrica, restaurante, lanchonete, etc.).

O cliente não acessa o ERP em nenhum momento.

Visual inspirado em: iFood, McDonald's App, Burger King App, Habib's.

O catálogo, categorias e identidade visual do portal são configuráveis por negócio — uma fábrica de salgados exibirá categorias como "Coxinhas" e "Empadas", enquanto um restaurante exibirá "Pratos do dia" ou "Combos", por exemplo.

---

### Página Inicial

A página inicial deve conter:

- Banner moderno e profissional.
- Produtos em destaque.
- Categorias de produtos.
- Promoções ativas.
- Avaliações de clientes.
- Informações da empresa.
- Botão de pedido rápido.

---

### Catálogo de Produtos

Cada produto deve exibir:

- Foto do produto.
- Nome.
- Descrição.
- Preço.
- Disponibilidade.

Categorias disponíveis (exemplo — configurável por tipo de negócio):

- Coxinhas.
- Kibes.
- Empadas.
- Bolinhas de Queijo.
- Assados.
- Combos.
- Bebidas.

> Observação: para um restaurante, as categorias poderiam ser "Entradas", "Pratos Principais", "Sobremesas"; para uma pizzaria, "Pizzas Salgadas", "Pizzas Doces", "Bordas". O catálogo deve ser totalmente configurável por negócio.

---

### Carrinho

Funcionalidades obrigatórias:

- Adicionar produtos.
- Remover produtos.
- Alterar quantidade.
- Calcular frete automaticamente.
- Aplicar cupons de desconto.

---

### Checkout

O cliente deve informar:

- Nome completo.
- Telefone.
- Endereço de entrega.
- Observações do pedido.

Formas de pagamento aceitas:

- PIX.
- Cartão de crédito/débito.
- Dinheiro (com informação de troco).

Após a confirmação, o pedido é enviado automaticamente ao ERP.

---

### Área do Cliente

O cliente pode:

- Criar conta e fazer login.
- Alterar dados pessoais.
- Salvar múltiplos endereços.
- Consultar pedidos em andamento.
- Visualizar histórico completo.
- Consultar total gasto na plataforma.
- Gerenciar perfil.

---

### Rastreamento do Pedido

Inspirado no iFood. O cliente visualiza cada etapa com barra de progresso:

```
✔ Pedido recebido
✔ Em produção
✔ Produção finalizada
✔ Saiu para entrega
✔ Entregue
```

---

### Rastreamento do Motoboy

Quando o pedido sair para entrega, o cliente visualiza:

- 🛵 Posição aproximada do motoboy no mapa.
- 📍 Rota até o endereço de entrega.
- ⏱ Tempo estimado de chegada.
- 📦 Status atual da entrega.

---

### Código de Verificação

Ao finalizar o pedido, o sistema gera automaticamente um código de entrega baseado nos últimos 4 dígitos do telefone do cliente.

Exemplo:

```
Telefone:  31987654321
Código:    4321
```

O motoboy informa esse código ao finalizar a entrega.
O status só muda para **Entregue** após a validação.

---

## Integração Total entre os Sistemas

Todo pedido realizado no portal do cliente deve disparar automaticamente as seguintes ações no ERP:

- Geração de Ordem de Produção (OP).
- Aparecimento imediato na tela da cozinha (Kanban).
- Baixa automática no estoque.
- Atualização do financeiro.
- Entrada no Smart Delivery Map.
- Atualização dos relatórios e BI.

Os dois sistemas formam um único ecossistema integrado funcionando em tempo real:

```
X Salgados Delivery  ←→  XFlow ERP
```

---

## Padrão de Qualidade Esperado

O resultado final deve parecer um software SaaS premium utilizado por empresas reais do setor alimentício.

### Obrigatório em todas as telas:

- Componentes alinhados e padronizados.
- Gráficos visíveis e com dados reais.
- Nenhuma tela vazia ou com informação zerada.
- Dark Mode e Light Mode funcionando corretamente.
- Layout 100% responsivo.
- Navegação fluida e sem erros visuais.

### Proibido em qualquer tela:

- Aparência de projeto escolar.
- Componentes quebrados ou desalinhados.
- Gráficos sem renderização.
- Telas sem conteúdo.
- Visual genérico ou de template.
