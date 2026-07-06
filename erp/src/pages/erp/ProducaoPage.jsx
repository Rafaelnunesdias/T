import { useState, useRef, useCallback } from 'react';
import { Clock, Package, User } from 'lucide-react';
import './ProducaoPage.css';

const COLUMNS = [
  { key: 'a_fazer', label: 'A Fazer', dotColor: '#6366f1' },
  { key: 'em_producao', label: 'Em Produção', dotColor: '#3b82f6' },
  { key: 'pronto', label: 'Pronto', dotColor: '#10b981' },
  { key: 'entregue', label: 'Entregue', dotColor: '#8b5cf6' },
];

const STATUS_LABELS = {
  a_fazer: 'A Fazer',
  em_producao: 'Em Produção',
  pronto: 'Pronto',
  entregue: 'Entregue',
  recebido: 'Recebido',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

const RESPONSIVE = ['Carlos', 'Ana', 'Pedro', 'Maria'];

function getPriority(total) {
  if (total >= 60) return 'alta';
  if (total >= 35) return 'media';
  return 'baixa';
}

function getProductNames(productionOrder) {
  const items = productionOrder.orders?.order_items;
  if (!items || items.length === 0) return [];
  return items.map(item => item.products?.name || 'Produto').filter(Boolean);
}

function formatCurrency(v) {
  return `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin}min`;
  if (diffHours < 24) return `${diffHours}h`;
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

const now = Date.now();
const h = (hoursAgo) => new Date(now - hoursAgo * 3600000).toISOString();

const MOCK_ORDERS = [
  {
    id: 1,
    op_number: 'OP-001',
    status: 'em_producao',
    created_at: h(2),
    responsible: 'Carlos',
    orders: {
      total: 44.80,
      clients: { name: 'João Silva' },
      order_items: [
        { products: { name: 'Hambúrguer Artesanal' } },
        { products: { name: 'Batata Frita' } },
      ],
    },
  },
  {
    id: 2,
    op_number: 'OP-002',
    status: 'em_producao',
    created_at: h(4),
    responsible: 'Ana',
    orders: {
      total: 47.99,
      clients: { name: 'Maria Oliveira' },
      order_items: [
        { products: { name: 'Pizza Margherita' } },
        { products: { name: 'Coca-Cola 2L' } },
      ],
    },
  },
  {
    id: 3,
    op_number: 'OP-003',
    status: 'a_fazer',
    created_at: h(1),
    responsible: 'Pedro',
    orders: {
      total: 69.90,
      clients: { name: 'Pedro Henrique' },
      order_items: [
        { products: { name: 'Combo Família' } },
      ],
    },
  },
  {
    id: 4,
    op_number: 'OP-004',
    status: 'pronto',
    created_at: h(6),
    responsible: 'Maria',
    orders: {
      total: 27.80,
      clients: { name: 'Ana Paula' },
      order_items: [
        { products: { name: 'Açaí 500ml' } },
        { products: { name: 'Suco Natural' } },
      ],
    },
  },
  {
    id: 5,
    op_number: 'OP-005',
    status: 'a_fazer',
    created_at: h(3),
    responsible: 'Carlos',
    orders: {
      total: 73.70,
      clients: { name: 'Carlos Eduardo' },
      order_items: [
        { products: { name: 'Hambúrguer Artesanal' } },
        { products: { name: 'Hambúrguer Artesanal' } },
        { products: { name: 'Batata Frita' } },
      ],
    },
  },
  {
    id: 6,
    op_number: 'OP-006',
    status: 'entregue',
    created_at: h(20),
    responsible: 'Ana',
    orders: {
      total: 22.50,
      clients: { name: 'Fernanda Souza' },
      order_items: [
        { products: { name: 'Pastel de Carne' } },
        { products: { name: 'Pastel de Carne' } },
        { products: { name: 'Pastel de Carne' } },
      ],
    },
  },
  {
    id: 7,
    op_number: 'OP-007',
    status: 'em_producao',
    created_at: h(5),
    responsible: 'Pedro',
    orders: {
      total: 81.98,
      clients: { name: 'Lucas Ferreira' },
      order_items: [
        { products: { name: 'Pizza Margherita' } },
        { products: { name: 'Pizza Margherita' } },
        { products: { name: 'Refrigerante Lata' } },
        { products: { name: 'Refrigerante Lata' } },
      ],
    },
  },
  {
    id: 8,
    op_number: 'OP-008',
    status: 'a_fazer',
    created_at: h(8),
    responsible: 'Maria',
    orders: {
      total: 46.70,
      clients: { name: 'Juliana Costa' },
      order_items: [
        { products: { name: 'Hot Dog' } },
        { products: { name: 'Hot Dog' } },
        { products: { name: 'Nuggets 10un' } },
      ],
    },
  },
  {
    id: 9,
    op_number: 'OP-009',
    status: 'pronto',
    created_at: h(10),
    responsible: 'Carlos',
    orders: {
      total: 35.80,
      clients: { name: 'Rafael Santos' },
      order_items: [
        { products: { name: 'Milkshake' } },
        { products: { name: 'Batata Frita' } },
      ],
    },
  },
  {
    id: 10,
    op_number: 'OP-010',
    status: 'a_fazer',
    created_at: h(12),
    responsible: 'Ana',
    orders: {
      total: 76.90,
      clients: { name: 'Beatriz Lima' },
      order_items: [
        { products: { name: 'Combo Família' } },
        { products: { name: 'Água 500ml' } },
        { products: { name: 'Água 500ml' } },
      ],
    },
  },
  {
    id: 11,
    op_number: 'OP-011',
    status: 'em_producao',
    created_at: h(14),
    responsible: 'Pedro',
    orders: {
      total: 37.80,
      clients: { name: 'Thiago Almeida' },
      order_items: [
        { products: { name: 'Hambúrguer Artesanal' } },
        { products: { name: 'Suco Natural' } },
      ],
    },
  },
  {
    id: 12,
    op_number: 'OP-012',
    status: 'pronto',
    created_at: h(16),
    responsible: 'Maria',
    orders: {
      total: 47.99,
      clients: { name: 'Camila Ribeiro' },
      order_items: [
        { products: { name: 'Pizza Congelada' } },
        { products: { name: 'Coca-Cola 2L' } },
      ],
    },
  },
  {
    id: 13,
    op_number: 'OP-013',
    status: 'entregue',
    created_at: h(22),
    responsible: 'Carlos',
    orders: {
      total: 27.80,
      clients: { name: 'Felipe Martins' },
      order_items: [
        { products: { name: 'Croquete 6un' } },
        { products: { name: 'Croquete 6un' } },
      ],
    },
  },
  {
    id: 14,
    op_number: 'OP-014',
    status: 'a_fazer',
    created_at: h(18),
    responsible: 'Ana',
    orders: {
      total: 35.40,
      clients: { name: 'Larissa Pereira' },
      order_items: [
        { products: { name: 'Empadão' } },
        { products: { name: 'Tortilha' } },
        { products: { name: 'Molho Especial' } },
      ],
    },
  },
  {
    id: 15,
    op_number: 'OP-015',
    status: 'em_producao',
    created_at: h(24),
    responsible: 'Pedro',
    orders: {
      total: 56.70,
      clients: { name: 'Gabriel Rodrigues' },
      order_items: [
        { products: { name: 'Açaí 500ml' } },
        { products: { name: 'Açaí 500ml' } },
        { products: { name: 'Açaí 500ml' } },
      ],
    },
  },
];

export default function ProducaoPage() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const mountedRef = useRef(true);

  const handleRefresh = useCallback(() => {
    setOrders(MOCK_ORDERS);
  }, []);

  const handleDragStart = (e, orderId) => {
    setDraggedId(orderId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(orderId));
    requestAnimationFrame(() => {
      e.target.classList.add('dragging');
    });
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedId(null);
    setDragOverColumn(null);
  };

  const handleColumnDragOver = (e, columnKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnKey);
  };

  const handleColumnDragLeave = (e, columnKey) => {
    if (dragOverColumn === columnKey) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    const productionId = e.dataTransfer.getData('text/plain');
    if (!productionId) return;

    const prodOrder = orders.find(o => String(o.id) === productionId);
    if (!prodOrder) return;
    if (prodOrder.status === targetStatus) return;

    setOrders(prev =>
      prev.map(o =>
        String(o.id) === productionId
          ? { ...o, status: targetStatus }
          : o
      )
    );
  };

  const getCardDropHandler = (status) => (e) => {
    const columnEl = e.currentTarget.closest('.kanban-column');
    if (columnEl) {
      const colKey = columnEl.dataset.column;
      if (colKey) handleDrop(e, colKey);
    }
  };

  const grouped = {};
  COLUMNS.forEach(col => { grouped[col.key] = []; });
  orders.forEach(order => {
    if (grouped[order.status]) {
      grouped[order.status].push(order);
    } else {
      grouped.a_fazer.push(order);
    }
  });

  return (
    <div className="producao-page">
      {/* Header */}
      <div className="producao-header">
        <div>
          <h1>Produção</h1>
          <p>Kanban de controle de produção — arraste os cards entre as colunas</p>
        </div>
        <div className="producao-header-right">
          <button className="btn-primary" onClick={handleRefresh} style={{ padding: '8px 16px' }}>
            Resetar
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {COLUMNS.map(col => {
          const columnOrders = grouped[col.key] || [];
          return (
            <div
              key={col.key}
              className={`kanban-column${dragOverColumn === col.key ? ' drag-over' : ''}`}
              data-column={col.key}
              onDragOver={(e) => handleColumnDragOver(e, col.key)}
              onDragLeave={(e) => handleColumnDragLeave(e, col.key)}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <div className="kanban-column-header">
                <span className="kanban-column-title">
                  <span className="kanban-column-dot" style={{ background: col.dotColor }} />
                  {col.label}
                </span>
                <span className="kanban-column-count">{columnOrders.length}</span>
              </div>
              <div className={`kanban-cards${dragOverColumn === col.key ? ' drag-over-active' : ''}`}>
                {columnOrders.length === 0 ? (
                  <div className="kanban-empty">
                    <Package size={32} className="kanban-empty-icon" />
                    <span>Nenhum pedido</span>
                  </div>
                ) : (
                  columnOrders.map((prodOrder) => {
                    const order = prodOrder.orders || {};
                    const client = order.clients || {};
                    const products = getProductNames(prodOrder);
                    const priority = getPriority(Number(order.total || 0));
                    const priorityCfg = PRIORITY_CONFIG[priority] || { label: '', className: 'padrao' };

                    return (
                      <div
                        key={prodOrder.id}
                        className={`kanban-card${String(prodOrder.id) === draggedId ? ' dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, prodOrder.id)}
                        onDragEnd={handleDragEnd}
                        onDrop={getCardDropHandler(col.key)}
                      >
                        <div className="kanban-card-header">
                          <span className="kanban-card-op">{prodOrder.op_number || '---'}</span>
                          <span className={`status-pill status-${prodOrder.status}`}>
                            {STATUS_LABELS[prodOrder.status] || prodOrder.status}
                          </span>
                        </div>
                        <div className="kanban-card-client">{client.name || 'Cliente não informado'}</div>
                        {products.length > 0 && (
                          <div className="kanban-card-products">
                            {products.slice(0, 3).map((name, i) => (
                              <span key={i} className="kanban-card-product-tag">{name}</span>
                            ))}
                            {products.length > 3 && (
                              <span className="kanban-card-product-more">+{products.length - 3}</span>
                            )}
                          </div>
                        )}
                        <div className="kanban-card-footer">
                          <span className="kanban-card-time">
                            <Clock size={11} /> {formatTime(prodOrder.created_at)}
                          </span>
                          {order.total && (
                            <span className="kanban-card-value">{formatCurrency(order.total)}</span>
                          )}
                        </div>
                        <div className="kanban-card-responsible">
                          <div className="kanban-card-avatar">{prodOrder.responsible?.charAt(0) || '?'}</div>
                          <span>{prodOrder.responsible}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
