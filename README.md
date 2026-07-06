# XFlow ERP + Delivery

**Sistema de gestão multi-segmento para indústria alimentícia**  
TCC - SENAI | Fábrica de Salgados Sabor & Cia

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## Sobre o Projeto

O XFlow é um sistema completo de gestão empresarial (ERP) com módulo de delivery integrado, desenvolvido para negócios do ramo alimentício — fábricas de salgados, restaurantes, pizzarias, hamburguerias, etc.

### Funcionalidades

- **Dashboard Administrativo** — Métricas em tempo real, gráficos de faturamento, produtos mais vendidos, horários de pico
- **Gestão de Pedidos** — Listagem completa com filtros por status, busca por cliente, modal de detalhes
- **Kanban de Produção** — Drag & drop entre colunas (Recebido → Em Produção → Finalizado), polling automático
- **Controle de Estoque** — Cards com alerta de estoque baixo, integração com produtos
- **Cadastro de Clientes** — Grid com busca, perfil com total gasto e pedidos recentes
- **Módulo Financeiro** — Resumo receita/despesa/lucro, filtro por período, gráfico de evolução
- **Logística com Mapa** — Visualização de entregas em mapa interativo (Mapbox GL), zonas de entrega (Verde/Azul/Roxa), rotas simuladas
- **Painel Motoboy** — Entregas do dia, ganhos, validação com código OTP de 4 dígitos
- **Relatórios** — Indicadores de desempenho, top produtos, eficiência logística, horários de pico
- **Configurações** — Dados do negócio, taxas de entrega, personalização de cores
- **Autenticação** — Login por papel (admin, produção, financeiro, atendente, motoboy)
- **Tema Dark/Light** — Alternância suave entre temas com animação
- **Design Responsivo** — Funciona em desktop, tablet e mobile

---

## Stack Tecnológica

### Frontend (ERP)
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 18.3 | Framework SPA |
| Vite | 5.4 | Bundler e dev server |
| React Router | 7.18 | Roteamento SPA |
| Axios | 1.18 | HTTP client |
| Recharts | 3.9 | Gráficos (linha, barra, pizza, área) |
| Lucide React | 1.21 | Ícones |
| Mapbox GL | 3.x | Mapas interativos |

### Backend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Node.js | 22 | Runtime |
| Express | 4.x | API REST |
| Supabase JS | 2.108 | ORM / Banco |

### Banco de Dados
| Tecnologia | Uso |
|------------|-----|
| PostgreSQL (Supabase) | Banco relacional |
| RLS (Row Level Security) | Segurança multi-tenant |

---

## Estrutura do Projeto

```
xflow/
├── backend/                  # API REST (Express)
│   ├── src/
│   │   ├── config/          # Conexão Supabase
│   │   ├── db/              # Seeds
│   │   └── routes/          # Endpoints
│   │       ├── auth/        # Login, refresh, logout
│   │       ├── erp/         # Dashboard, pedidos, financeiro, logística
│   │       └── delivery/    # Catálogo, checkout, rastreamento
│   └── .env
├── erp/                     # Frontend ERP (React + Vite)
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   │   ├── MapaRotas.jsx    # Mapa Mapbox com rotas
│   │   │   └── AnimatedCounter.jsx  # Contador animado
│   │   ├── contexts/        # Contextos (AuthContext)
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   └── erp/         # Todas as páginas do sistema
│   │   └── services/        # API client (axios)
│   └── .env
├── delivery/                # Frontend Delivery (esboço)
├── logo/                    # Assets da marca
├── iniciar.bat              # Script para iniciar servidores
└── parar.bat               # Script para parar servidores
```

---

## Instalação e Execução

### Pré-requisitos

- Node.js 22+
- NPM
- Conta no [Supabase](https://supabase.com) (ou usar a já configurada)
- (Opcional) Token do [Mapbox](https://account.mapbox.com/access-tokens/) para mapa interativo

### 1. Clonar o repositório

```bash
git clone https://github.com/Rafaelnunesdias/XFLOW-ERP.git
cd XFLOW-ERP
```

### 2. Configurar variáveis de ambiente

O arquivo `erp/.env` já vem com as credenciais do Supabase. Para o mapa:

```
VITE_MAPBOX_TOKEN=pk.seu_token_aqui
```

Crie uma conta grátis em [mapbox.com](https://account.mapbox.com/access-tokens/) e substitua o token.

### 3. Instalar dependências

```bash
# Backend
cd backend
npm install

# Frontend ERP
cd ../erp
npm install
```

### 4. Popular o banco de dados

```bash
cd ../backend
node src/db/seed-completo.js
```

> O seed cria: 37 produtos, 55 clientes, 120+ pedidos, transações financeiras, ordens de produção, entregas e motoboys.

### 5. Iniciar o sistema

**Opção 1 — Script automático:**
```bash
iniciar.bat
```

**Opção 2 — Manual:**
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd erp
npx vite --host
```

### 6. Acessar

- **ERP:** http://localhost:5173
- **Backend:** http://localhost:3001

### Credenciais de Teste

| Papel | Email | Senha |
|-------|-------|-------|
| Admin | admin@xsalgados.com | admin123 |
| Produção | producao@xsalgados.com | admin123 |
| Financeiro | financeiro@xsalgados.com | admin123 |
| Atendente | atendente@xsalgados.com | admin123 |
| Motoboy | motoboy@xsalgados.com | admin123 |

---

## API Endpoints

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Renovar token |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Recuperar senha |

### ERP
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/erp/dashboard` | Métricas e gráficos do dashboard |
| GET | `/api/erp/orders` | Lista de pedidos (com filtros) |
| POST | `/api/erp/orders` | Criar pedido |
| GET | `/api/erp/production-orders` | Ordens de produção (kanban) |
| PATCH | `/api/erp/production-orders/:id/status` | Atualizar status produção |
| GET | `/api/erp/products` | Lista de produtos |
| GET | `/api/erp/clients` | Lista de clientes |
| GET | `/api/erp/clients/:id` | Perfil do cliente |
| GET | `/api/erp/stock` | Estoque |
| POST | `/api/erp/stock/movements` | Movimentação de estoque |
| GET | `/api/erp/financeiro/summary` | Resumo financeiro |
| GET | `/api/erp/logistics/routes` | Rotas de entrega (mapa) |

### Delivery
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/delivery/products/public` | Catálogo público |
| GET | `/api/delivery/categories` | Categorias |
| POST | `/api/delivery/orders/client` | Criar pedido delivery |
| GET | `/api/delivery/orders/client/:id/track` | Rastrear pedido |
| GET | `/api/delivery/delivery/estimate` | Calcular frete |

---

## Banco de Dados

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `businesses` | Negócios cadastrados (multi-tenant) |
| `users` | Usuários do sistema |
| `clients` | Clientes dos negócios |
| `categories` | Categorias de produtos |
| `products` | Produtos/Salgados |
| `orders` | Pedidos |
| `order_items` | Itens dos pedidos |
| `production_orders` | Ordens de produção (Kanban) |
| `transactions` | Transações financeiras |
| `motoboys` | Entregadores |
| `deliveries` | Entregas |
| `stock` | Estoque de produtos |
| `stock_movements` | Movimentações de estoque |

---

## Layout e Design

- **Paleta de Cores:** `#fc6901` (laranja), `#7b4b34` (marrom), `#54240d` (marrom escuro)
- **Design System:** Variáveis CSS customizadas (espaçamento, tipografia, sombras, bordas)
- **Animações:** fadeInUp nos cards, contagem animada nos números, skeleton loading
- **Responsivo:** 3 breakpoints (480px, 768px, 1200px+)
- **Ícones:** Lucide React

---

## Melhorias Futuras

- [ ] Módulo de Nota Fiscal eletrônica
- [ ] Integração com iFood e WhatsApp
- [ ] App mobile (React Native)
- [ ] Relatórios exportáveis (PDF/Excel)
- [ ] Gateway de pagamento
- [ ] Cardápio digital com QR code

---

## Licença

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso do SENAI.

---

**Desenvolvido por

Rafael Nunes 
Pedro Celso
Daniel Carlos
Diogo Queroz  
Caio de Souza **
