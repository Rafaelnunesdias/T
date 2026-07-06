# XFlow Delivery — Referência do Portal do Cliente
## Baseado no modelo Bob's (chamaobobs.com.br) adaptado para o XFlow

---

## Por que o Bob's como referência?

O Bob's opera um portal próprio de pedidos online — o cliente acessa diretamente, escolhe os produtos e o pedido vai direto para a cozinha do restaurante, sem passar por iFood ou Rappi. Esse é exatamente o modelo do XFlow Delivery: o cliente acessa o portal, faz o pedido e ele cai automaticamente no ERP do negócio (fábrica, restaurante, lanchonete etc.).

---

## Estrutura de Páginas

### 1. Página Inicial (Home)

**O que o Bob's faz:**
- Hero de tela cheia com imagem de produto em destaque.
- Chamada direta para o pedido ("Peça já").
- Categorias de produtos visíveis logo abaixo do hero.
- Destaques e promoções em cards.

**O que o XFlow Delivery deve fazer:**
- Hero de tela cheia com foto de fundo de comida + gradiente escuro para legibilidade.
- Headline direta: "Peça agora, receba rápido."
- Botão CTA laranja (`#fc6901`) centralizado no hero.
- Seção de categorias em linha com ícone + nome logo abaixo do hero.
- Grid de produtos em destaque.
- Seção de promoções ativas.
- Seção de avaliações de clientes.
- Footer com informações do negócio.

---

### 2. Cardápio / Catálogo

**O que o Bob's faz:**
- Lista de produtos por categoria.
- Foto, nome, descrição curta e preço em cada card.
- Botão de adicionar ao carrinho direto no card.
- Filtro por categoria no topo ou sidebar.

**O que o XFlow Delivery deve fazer:**
- Sidebar de categorias à esquerda (configurável por tipo de negócio).
- Grid de produtos com: foto, nome, descrição, preço e botão "+".
- Badge de disponibilidade ("Disponível" / "Esgotado").
- Busca de produto por nome no topo.
- Ao clicar no produto: modal com foto grande, descrição completa, quantidade e botão adicionar.

**Exemplo de categorias para fábrica de salgados:**
- Coxinhas
- Kibes
- Empadas
- Bolinhas de Queijo
- Assados
- Combos
- Bebidas

> As categorias são configuráveis por tipo de negócio. Um restaurante teria "Pratos Principais", "Sobremesas" etc.

---

### 3. Carrinho

**O que o Bob's faz:**
- Drawer lateral com lista de itens.
- Controle de quantidade por item.
- Subtotal atualizado em tempo real.
- Botão de finalizar pedido.

**O que o XFlow Delivery deve fazer:**
- Drawer lateral deslizante da direita.
- Lista de itens com foto miniatura, nome, quantidade e subtotal.
- Botões de aumentar e diminuir quantidade.
- Botão de remover item.
- Campo de cupom de desconto.
- Cálculo de frete automático por endereço.
- Resumo: subtotal + frete + desconto = total.
- Botão "Finalizar pedido" laranja (`#fc6901`) no rodapé do drawer.

---

### 4. Checkout

**O que o Bob's faz:**
- Fluxo em etapas: endereço → pagamento → confirmação.
- Login obrigatório antes de finalizar.
- Opções de pagamento: cartão, PIX, dinheiro.

**O que o XFlow Delivery deve fazer:**

**Passo 1 — Endereço de entrega:**
- Selecionar endereço salvo ou cadastrar novo.
- Campo de CEP com preenchimento automático.
- Campo de complemento e referência.

**Passo 2 — Forma de pagamento:**
- PIX (exibir QR Code ou chave após confirmação).
- Cartão de crédito/débito.
- Dinheiro (campo para informar troco se necessário).

**Passo 3 — Revisão e confirmação:**
- Resumo do pedido: itens, endereço, pagamento, total.
- Botão "Confirmar pedido".

**Após confirmação:**
- Tela de sucesso com número do pedido e OP gerada.
- Instrução do código de entrega (últimos 4 dígitos do telefone).
- Botão "Acompanhar meu pedido".

---

### 5. Área do Cliente (Login obrigatório)

**O que o Bob's faz:**
- Cadastro com nome, e-mail, telefone e senha.
- Histórico de pedidos.
- Endereços salvos.
- Programa de fidelidade (Bob's Fã).

**O que o XFlow Delivery deve fazer:**
- Cadastro: nome, e-mail, telefone, senha.
- Login: e-mail e senha + recuperação por e-mail.
- Página de perfil: alterar dados pessoais e senha.
- Endereços salvos: adicionar, editar e remover múltiplos endereços.
- Histórico de pedidos: lista com status, data, valor e número da OP.
- Detalhe do pedido: produtos, endereço, forma de pagamento e status atual.
- Total gasto na plataforma (card de destaque).

---

### 6. Rastreamento do Pedido (estilo Shopee — sem mapa)

**O que o Bob's faz:**
- Notificação por e-mail ou push do status do pedido.
- Status simples: "Em preparo", "Saiu para entrega", "Entregue".

**O que o XFlow Delivery deve fazer:**

Linha do tempo vertical com todas as etapas, inspirada na Shopee:

```
✅ Pedido confirmado        — 14:32
🍳 Em preparo              — 14:35
✅ Pronto para entrega      — 15:10
🛵 Saiu para entrega        — 15:18
📦 Entregue                — 15:44
```

Regras visuais:
- Etapas concluídas: ícone colorido + texto normal + horário.
- Etapa atual: ícone laranja (`#fc6901`) + texto em destaque + animação de pulso.
- Etapas futuras: ícone cinza + texto muted.
- Linha vertical conectando todas as etapas.
- Atualização automática a cada 20 segundos.
- Sem mapa em nenhum momento.

---

### 7. Header e Navegação

**O que o Bob's faz:**
- Logo à esquerda.
- Links de navegação no centro.
- Botão de login/conta à direita.
- Ícone do carrinho com contador de itens.

**O que o XFlow Delivery deve fazer:**
- Header fixo durante o scroll.
- Logo XFlow Delivery à esquerda.
- Links centrais: Início, Cardápio, Promoções, Rastrear Pedido.
- Direita: ícone do carrinho com badge de contagem + botão Entrar / avatar do cliente logado.
- Em mobile: menu hambúrguer + carrinho.

---

### 8. Footer

**O que o Bob's faz:**
- Informações da empresa.
- Links institucionais.
- Redes sociais.

**O que o XFlow Delivery deve fazer:**
- Nome e descrição do negócio.
- Horário de funcionamento.
- Endereço e telefone de contato.
- Links: Início, Cardápio, Minha Conta, Rastrear Pedido.
- Redes sociais (ícones).
- Texto: "Powered by XFlow ERP".

---

## Diferenças entre o Bob's e o XFlow Delivery

| Item                        | Bob's                        | XFlow Delivery                         |
|-----------------------------|------------------------------|----------------------------------------|
| Tipo de negócio             | Rede de fast-food            | Qualquer negócio alimentício           |
| Integração com sistema      | Sistema próprio interno      | Integrado ao XFlow ERP em tempo real   |
| Categorias                  | Fixas (sanduíches, sobremesas)| Configuráveis por tipo de negócio      |
| Rastreamento                | Status por notificação       | Linha do tempo visual estilo Shopee    |
| Validação de entrega        | Não possui                   | Código de 4 dígitos                    |
| Geração de OP               | Não visível ao cliente       | OP exibida na confirmação              |
| Visual                      | Light mode, cores da marca   | Dark mode, paleta XFlow                |

---

## Regras Visuais do Portal (baseadas no Bob's e adaptadas ao XFlow)

- Hero de tela cheia obrigatório na página inicial.
- Foto de produto em todos os cards — sem card sem imagem.
- Preço sempre em destaque (cor laranja `#fc6901`).
- Botão de adicionar ao carrinho sempre visível no card.
- CTA principal sempre laranja (`#fc6901`).
- Dark mode em todo o portal.
- Layout responsivo: mobile primeiro.
- Nenhuma tela sem conteúdo.
- Todo texto em português brasileiro.
