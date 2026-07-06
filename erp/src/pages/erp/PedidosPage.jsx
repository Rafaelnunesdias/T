import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, X, Eye, Clock, CheckCircle, XCircle, ChevronRight, Package, User, CreditCard, FileText } from 'lucide-react';
import './PedidosPage.css';

const STATUS_CONFIG = {
  recebido: { label: 'Recebido', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Clock },
  em_producao: { label: 'Em Produção', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Package },
  saindo_entrega: { label: 'Saiu para Entrega', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: ChevronRight },
  entregue: { label: 'Entregue', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle },
  finalizado: { label: 'Finalizado', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: XCircle },
};

const PAYMENT_METHODS = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'credito', label: 'Cartão de Crédito' },
  { value: 'debito', label: 'Cartão de Débito' },
];

const MOCK_PRODUCTS = [
  { id: 1, name: 'Hambúrguer Artesanal', price: 28.90 },
  { id: 2, name: 'Pizza Margherita', price: 32.00 },
  { id: 3, name: 'Batata Frita', price: 15.90 },
  { id: 4, name: 'Coca-Cola 2L', price: 12.99 },
  { id: 5, name: 'Combo Família', price: 69.90 },
  { id: 6, name: 'Açaí 500ml', price: 18.90 },
  { id: 7, name: 'Pastel de Carne', price: 7.50 },
  { id: 8, name: 'Hot Dog', price: 14.90 },
  { id: 9, name: 'Nuggets 10un', price: 16.90 },
  { id: 10, name: 'Milkshake', price: 19.90 },
];

const MOCK_CLIENTS = [
  { id: 1, name: 'João Silva', phone: '(11) 98765-4321', email: 'joao.silva@email.com' },
  { id: 2, name: 'Maria Oliveira', phone: '(11) 97654-3210', email: 'maria.oliveira@email.com' },
  { id: 3, name: 'Pedro Henrique', phone: '(11) 96543-2109', email: 'pedro.henrique@email.com' },
  { id: 4, name: 'Ana Paula', phone: '(11) 95432-1098', email: 'ana.paula@email.com' },
  { id: 5, name: 'Carlos Eduardo', phone: '(11) 94321-0987', email: 'carlos.eduardo@email.com' },
  { id: 6, name: 'Fernanda Souza', phone: '(11) 93210-9876', email: 'fernanda.souza@email.com' },
  { id: 7, name: 'Lucas Ferreira', phone: '(11) 92109-8765', email: 'lucas.ferreira@email.com' },
  { id: 8, name: 'Juliana Costa', phone: '(11) 91098-7654', email: 'juliana.costa@email.com' },
  { id: 9, name: 'Rafael Santos', phone: '(11) 90987-6543', email: 'rafael.santos@email.com' },
  { id: 10, name: 'Beatriz Lima', phone: '(11) 90876-5432', email: 'beatriz.lima@email.com' },
  { id: 11, name: 'Thiago Almeida', phone: '(11) 90765-4321', email: 'thiago.almeida@email.com' },
  { id: 12, name: 'Camila Ribeiro', phone: '(11) 90654-3210', email: 'camila.ribeiro@email.com' },
  { id: 13, name: 'Felipe Martins', phone: '(11) 90543-2109', email: 'felipe.martins@email.com' },
  { id: 14, name: 'Larissa Pereira', phone: '(11) 90432-1098', email: 'larissa.pereira@email.com' },
  { id: 15, name: 'Gabriel Rodrigues', phone: '(11) 90321-0987', email: 'gabriel.rodrigues@email.com' },
  { id: 16, name: 'Mariana Nascimento', phone: '(11) 90210-9876', email: 'mariana.nascimento@email.com' },
  { id: 17, name: 'Igor Costa', phone: '(11) 90109-8765', email: 'igor.costa@email.com' },
  { id: 18, name: 'Patrícia Santos', phone: '(11) 90098-7654', email: 'patricia.santos@email.com' },
  { id: 19, name: 'André Oliveira', phone: '(11) 90087-6543', email: 'andre.oliveira@email.com' },
  { id: 20, name: 'Isabela Fernandes', phone: '(11) 90076-5432', email: 'isabela.fernandes@email.com' },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

function buildOrderItems(productIds) {
  return productIds.map(([pid, qty]) => {
    const prod = MOCK_PRODUCTS.find(p => p.id === pid);
    return { products: { name: prod.name }, quantity: qty, price: prod.price };
  });
}

function calcTotal(items) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

const MOCK_ORDERS = [
  { id: 1, op_number: 'OP-0001', created_at: daysAgo(0), status: 'recebido', payment_method: 'pix', notes: '', clients: MOCK_CLIENTS[0], order_items: buildOrderItems([[1, 2], [4, 1]]) },
  { id: 2, op_number: 'OP-0002', created_at: daysAgo(1), status: 'recebido', payment_method: 'dinheiro', notes: 'Sem cebola', clients: MOCK_CLIENTS[1], order_items: buildOrderItems([[2, 1], [3, 1]]) },
  { id: 3, op_number: 'OP-0003', created_at: daysAgo(2), status: 'recebido', payment_method: 'cartao', notes: '', clients: MOCK_CLIENTS[2], order_items: buildOrderItems([[5, 1]]) },
  { id: 4, op_number: 'OP-0004', created_at: daysAgo(3), status: 'recebido', payment_method: 'pix', notes: '', clients: MOCK_CLIENTS[3], order_items: buildOrderItems([[7, 3], [4, 2]]) },
  { id: 5, op_number: 'OP-0005', created_at: daysAgo(4), status: 'recebido', payment_method: 'dinheiro', notes: 'Bebida bem gelada', clients: MOCK_CLIENTS[4], order_items: buildOrderItems([[10, 2]]) },

  { id: 6, op_number: 'OP-0006', created_at: daysAgo(5), status: 'em_producao', payment_method: 'cartao', notes: '', clients: MOCK_CLIENTS[5], order_items: buildOrderItems([[1, 1], [3, 2], [4, 1]]) },
  { id: 7, op_number: 'OP-0007', created_at: daysAgo(6), status: 'em_producao', payment_method: 'pix', notes: '', clients: MOCK_CLIENTS[6], order_items: buildOrderItems([[9, 2], [10, 1]]) },
  { id: 8, op_number: 'OP-0008', created_at: daysAgo(7), status: 'em_producao', payment_method: 'dinheiro', notes: 'Extra molho', clients: MOCK_CLIENTS[7], order_items: buildOrderItems([[8, 2], [3, 1]]) },
  { id: 9, op_number: 'OP-0009', created_at: daysAgo(8), status: 'em_producao', payment_method: 'cartao', notes: '', clients: MOCK_CLIENTS[8], order_items: buildOrderItems([[2, 1], [5, 1]]) },
  { id: 10, op_number: 'OP-0010', created_at: daysAgo(9), status: 'em_producao', payment_method: 'pix', notes: '', clients: MOCK_CLIENTS[9], order_items: buildOrderItems([[1, 3], [6, 2]]) },

  { id: 11, op_number: 'OP-0011', created_at: daysAgo(10), status: 'saindo_entrega', payment_method: 'dinheiro', notes: '', clients: MOCK_CLIENTS[10], order_items: buildOrderItems([[5, 1], [4, 3]]) },
  { id: 12, op_number: 'OP-0012', created_at: daysAgo(11), status: 'saindo_entrega', payment_method: 'pix', notes: 'Apartamento 302', clients: MOCK_CLIENTS[11], order_items: buildOrderItems([[1, 1], [6, 1], [10, 1]]) },
  { id: 13, op_number: 'OP-0013', created_at: daysAgo(13), status: 'saindo_entrega', payment_method: 'cartao', notes: '', clients: MOCK_CLIENTS[12], order_items: buildOrderItems([[2, 2]]) },
  { id: 14, op_number: 'OP-0014', created_at: daysAgo(14), status: 'saindo_entrega', payment_method: 'dinheiro', notes: '', clients: MOCK_CLIENTS[13], order_items: buildOrderItems([[8, 3], [9, 1], [4, 1]]) },

  { id: 15, op_number: 'OP-0015', created_at: daysAgo(15), status: 'finalizado', payment_method: 'pix', notes: '', clients: MOCK_CLIENTS[14], order_items: buildOrderItems([[1, 1]]) },
  { id: 16, op_number: 'OP-0016', created_at: daysAgo(16), status: 'finalizado', payment_method: 'cartao', notes: '', clients: MOCK_CLIENTS[15], order_items: buildOrderItems([[5, 1], [3, 2]]) },
  { id: 17, op_number: 'OP-0017', created_at: daysAgo(17), status: 'finalizado', payment_method: 'dinheiro', notes: 'Bom atendimento', clients: MOCK_CLIENTS[16], order_items: buildOrderItems([[7, 4], [4, 2]]) },
  { id: 18, op_number: 'OP-0018', created_at: daysAgo(18), status: 'finalizado', payment_method: 'pix', notes: '', clients: MOCK_CLIENTS[17], order_items: buildOrderItems([[2, 1], [6, 2]]) },
  { id: 19, op_number: 'OP-0019', created_at: daysAgo(19), status: 'finalizado', payment_method: 'cartao', notes: '', clients: MOCK_CLIENTS[18], order_items: buildOrderItems([[1, 2], [10, 2]]) },
  { id: 20, op_number: 'OP-0020', created_at: daysAgo(20), status: 'finalizado', payment_method: 'dinheiro', notes: '', clients: MOCK_CLIENTS[19], order_items: buildOrderItems([[5, 1]]) },
  { id: 21, op_number: 'OP-0021', created_at: daysAgo(21), status: 'finalizado', payment_method: 'pix', notes: '', clients: MOCK_CLIENTS[0], order_items: buildOrderItems([[9, 3], [4, 1]]) },
  { id: 22, op_number: 'OP-0022', created_at: daysAgo(22), status: 'finalizado', payment_method: 'cartao', notes: '', clients: MOCK_CLIENTS[1], order_items: buildOrderItems([[8, 2], [6, 1]]) },

  { id: 23, op_number: 'OP-0023', created_at: daysAgo(23), status: 'entregue', payment_method: 'pix', notes: '', clients: MOCK_CLIENTS[2], order_items: buildOrderItems([[1, 1], [3, 1]]) },
  { id: 24, op_number: 'OP-0024', created_at: daysAgo(24), status: 'entregue', payment_method: 'dinheiro', notes: '', clients: MOCK_CLIENTS[3], order_items: buildOrderItems([[5, 1], [4, 2]]) },
  { id: 25, op_number: 'OP-0025', created_at: daysAgo(25), status: 'entregue', payment_method: 'cartao', notes: '', clients: MOCK_CLIENTS[4], order_items: buildOrderItems([[2, 1]]) },
  { id: 26, op_number: 'OP-0026', created_at: daysAgo(26), status: 'entregue', payment_method: 'pix', notes: '', clients: MOCK_CLIENTS[5], order_items: buildOrderItems([[7, 2], [10, 1]]) },
  { id: 27, op_number: 'OP-0027', created_at: daysAgo(27), status: 'entregue', payment_method: 'dinheiro', notes: '', clients: MOCK_CLIENTS[6], order_items: buildOrderItems([[1, 1], [8, 1], [6, 1]]) },

  { id: 28, op_number: 'OP-0028', created_at: daysAgo(28), status: 'cancelado', payment_method: 'cartao', notes: 'Cliente desistiu', clients: MOCK_CLIENTS[7], order_items: buildOrderItems([[5, 1]]) },
  { id: 29, op_number: 'OP-0029', created_at: daysAgo(29), status: 'cancelado', payment_method: 'pix', notes: 'Fora da área de entrega', clients: MOCK_CLIENTS[8], order_items: buildOrderItems([[1, 2], [4, 3]]) },
  { id: 30, op_number: 'OP-0030', created_at: daysAgo(30), status: 'cancelado', payment_method: 'dinheiro', notes: 'Pedido duplicado', clients: MOCK_CLIENTS[9], order_items: buildOrderItems([[3, 1]]) },
].map(o => ({ ...o, total: calcTotal(o.order_items) }));

const ITEMS_PER_PAGE = 10;

export default function PedidosPage() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [loading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    client_id: '',
    payment_method: 'pix',
    notes: '',
  });
  const [cartItems, setCartItems] = useState([]);
  const [searchClient, setSearchClient] = useState('');
  const [showClientList, setShowClientList] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let filtered = [...MOCK_ORDERS];
    if (statusFilter) {
      filtered = filtered.filter(o => o.status === statusFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.clients?.name?.toLowerCase().includes(term) ||
        o.op_number?.toLowerCase().includes(term)
      );
    }
    const total = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setTotalPages(total);
    if (page > total) setPage(1);
    const start = (page - 1) * ITEMS_PER_PAGE;
    setOrders(filtered.slice(start, start + ITEMS_PER_PAGE));
  }, [statusFilter, searchTerm, page]);

  const openDetail = (order) => {
    setSelectedOrder(order);
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchClient.toLowerCase()) ||
    (c.phone || '').includes(searchClient)
  );

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product_id: product.id, name: product.name, price: Number(product.price), quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(i => i.product_id !== productId));
  };

  const updateCartQty = (productId, delta) => {
    setCartItems(prev => prev.map(i =>
      i.product_id === productId
        ? { ...i, quantity: Math.max(1, i.quantity + delta) }
        : i
    ));
  };

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSubmitOrder = () => {
    if (!formData.client_id || cartItems.length === 0) return;
    setSubmitting(true);
    setTimeout(() => {
      const client = MOCK_CLIENTS.find(c => c.id === Number(formData.client_id));
      const maxId = MOCK_ORDERS.reduce((m, o) => Math.max(m, o.id), 0);
      const newOrder = {
        id: maxId + 1,
        op_number: `OP-${String(maxId + 1).padStart(4, '0')}`,
        created_at: new Date().toISOString(),
        total: cartTotal,
        status: 'recebido',
        payment_method: formData.payment_method,
        notes: formData.notes || '',
        clients: client,
        order_items: cartItems.map(i => ({
          products: { name: i.name },
          quantity: i.quantity,
          price: i.price,
        })),
      };
      MOCK_ORDERS.unshift(newOrder);
      setShowNewOrder(false);
      resetForm();
      setPage(1);
      setStatusFilter('');
      setSearchTerm('');
      setSubmitting(false);
    }, 400);
  };

  const resetForm = () => {
    setFormData({ client_id: '', payment_method: 'pix', notes: '' });
    setCartItems([]);
    setSearchClient('');
    setShowClientList(false);
  };

  const formatDate = (d) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  const formatCurrency = (v) => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`;

  const selectedClientName = clients.find(c => c.id === Number(formData.client_id))?.name || '';

  return (
    <div className="pedidos-page">
      <div className="pedidos-header">
        <div>
          <h1>Pedidos</h1>
          <p>Gerenciamento de pedidos</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNewOrder(true)}>
          <Plus size={18} /> Novo Pedido
        </button>
      </div>

      <div className="pedidos-filters">
        <div className="search-input">
          <Search size={16} />
          <input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setPage(1)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => { setSearchTerm(''); setPage(1); }}>
              <X size={14} />
            </button>
          )}
        </div>
        <select className="status-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Todos os status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="pedidos-table-container">
        <table className="pedidos-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>OP</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="table-empty">Carregando...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="6" className="table-empty">Nenhum pedido encontrado</td></tr>
            ) : orders.map(order => {
              const st = STATUS_CONFIG[order.status] || { label: order.status, color: '#666', bg: 'rgba(0,0,0,0.05)' };
              return (
                <tr key={order.id}>
                  <td className="td-date">{formatDate(order.created_at)}</td>
                  <td className="td-op">{order.op_number || '—'}</td>
                  <td className="td-client">{order.clients?.name || '—'}<br /><span className="td-phone">{order.clients?.phone || ''}</span></td>
                  <td className="td-value">{formatCurrency(order.total)}</td>
                  <td>
                    <span className="status-badge" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => openDetail(order)} title="Ver detalhes"><Eye size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Anterior</button>
            <span>{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Próximo</button>
          </div>
        )}
      </div>

      {/* Modal de Detalhe do Pedido */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalhes do Pedido</h3>
              <button className="btn-icon" onClick={() => setSelectedOrder(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="order-detail-grid">
                <div className="detail-section">
                  <h4><FileText size={14} /> Informações</h4>
                  <div className="detail-row"><span>Data</span><span>{formatDate(selectedOrder.created_at)}</span></div>
                  <div className="detail-row"><span>OP</span><span className="op-highlight">{selectedOrder.op_number || '—'}</span></div>
                  <div className="detail-row"><span>Pagamento</span><span>{selectedOrder.payment_method || '—'}</span></div>
                  {selectedOrder.notes && <div className="detail-row"><span>Obs</span><span>{selectedOrder.notes}</span></div>}
                </div>
                <div className="detail-section">
                  <h4><User size={14} /> Cliente</h4>
                  <div className="detail-row"><span>Nome</span><span>{selectedOrder.clients?.name || '—'}</span></div>
                  <div className="detail-row"><span>Telefone</span><span>{selectedOrder.clients?.phone || '—'}</span></div>
                  <div className="detail-row"><span>Email</span><span>{selectedOrder.clients?.email || '—'}</span></div>
                </div>
              </div>

              {selectedOrder.order_items?.length > 0 && (
                <div className="detail-section" style={{ marginTop: 16 }}>
                  <h4><Package size={14} /> Itens do Pedido</h4>
                  <table className="items-table">
                    <thead>
                      <tr><th>Produto</th><th>Qtd</th><th>Preço</th><th>Subtotal</th></tr>
                    </thead>
                    <tbody>
                      {selectedOrder.order_items.map((item, i) => (
                        <tr key={i}>
                          <td>{item.products?.name || 'Produto'}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>{formatCurrency((item.price || 0) * (item.quantity || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr><td colSpan="3" style={{ textAlign: 'right', fontWeight: 600 }}>Total</td><td style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(selectedOrder.total)}</td></tr>
                    </tfoot>
                  </table>
                </div>
              )}

              <div className="detail-section" style={{ marginTop: 16 }}>
                <h4><Clock size={14} /> Timeline do Pedido</h4>
                <div className="status-timeline">
                  {['recebido', 'em_producao', 'finalizado', 'saindo_entrega', 'entregue'].map((s, i) => {
                    const cfg = STATUS_CONFIG[s];
                    const isActive = selectedOrder.status === s;
                    const isPast = ['recebido', 'em_producao', 'finalizado', 'saindo_entrega', 'entregue'].indexOf(selectedOrder.status) >= i;
                    return (
                      <div key={s} className={`timeline-step ${isPast ? 'past' : ''} ${isActive ? 'active' : ''}`}>
                        <div className="timeline-dot" style={{ background: isPast ? cfg.color : 'var(--border)' }}>
                          {isPast && <cfg.icon size={12} />}
                        </div>
                        <div className="timeline-content">
                          <span className="timeline-label">{cfg.label}</span>
                        </div>
                        {i < 4 && <div className={`timeline-line ${isPast ? 'past' : ''}`} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Novo Pedido */}
      {showNewOrder && (
        <div className="modal-overlay" onClick={() => { setShowNewOrder(false); resetForm(); }}>
          <div className="modal-content modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Plus size={16} /> Novo Pedido</h3>
              <button className="btn-icon" onClick={() => { setShowNewOrder(false); resetForm(); }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="new-order-grid">
                <div className="new-order-left">
                  <div className="form-group">
                    <label>Cliente</label>
                    <div className="client-search-wrapper">
                      <input
                        placeholder="Buscar cliente por nome ou telefone..."
                        value={formData.client_id ? selectedClientName : searchClient}
                        onChange={e => {
                          setSearchClient(e.target.value);
                          setFormData(prev => ({ ...prev, client_id: '' }));
                          setShowClientList(true);
                        }}
                        onFocus={() => setShowClientList(true)}
                        className="client-search-input"
                      />
                      {showClientList && searchClient && !formData.client_id && (
                        <div className="client-dropdown">
                          {filteredClients.length === 0 ? (
                            <div className="client-dropdown-empty">Nenhum cliente encontrado</div>
                          ) : filteredClients.map(c => (
                            <div
                              key={c.id}
                              className="client-dropdown-item"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, client_id: c.id }));
                                setSearchClient(c.name);
                                setShowClientList(false);
                              }}
                            >
                              <span className="client-dropdown-name">{c.name}</span>
                              <span className="client-dropdown-phone">{c.phone}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {formData.client_id && (
                        <button className="client-clear" onClick={() => { setFormData(prev => ({ ...prev, client_id: '' })); setSearchClient(''); }}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Forma de Pagamento</label>
                    <select
                      value={formData.payment_method}
                      onChange={e => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                      className="form-select"
                    >
                      {PAYMENT_METHODS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Observações</label>
                    <textarea
                      placeholder="Observações do pedido..."
                      value={formData.notes}
                      onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="form-textarea"
                      rows={2}
                    />
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Produtos</label>
                    <div className="product-catalog">
                      {products.length === 0 ? (
                        <div className="catalog-empty">Nenhum produto disponível</div>
                      ) : products.map(prod => {
                        const inCart = cartItems.find(i => i.product_id === prod.id);
                        return (
                          <div key={prod.id} className={`product-card ${inCart ? 'in-cart' : ''}`}>
                            <div className="product-card-info">
                              <span className="product-card-name">{prod.name}</span>
                              <span className="product-card-price">{formatCurrency(prod.price)}</span>
                            </div>
                            <button className="product-card-add" onClick={() => addToCart(prod)}>
                              {inCart ? `${inCart.quantity}x` : '+'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="new-order-right">
                  <div className="cart-section">
                    <h4><CreditCard size={14} /> Carrinho</h4>
                    {cartItems.length === 0 ? (
                      <div className="cart-empty">
                        <Package size={32} />
                        <span>Carrinho vazio</span>
                        <p>Selecione produtos ao lado</p>
                      </div>
                    ) : (
                      <>
                        <div className="cart-items">
                          {cartItems.map(item => (
                            <div key={item.product_id} className="cart-item">
                              <div className="cart-item-info">
                                <span className="cart-item-name">{item.name}</span>
                                <span className="cart-item-price">{formatCurrency(item.price)}</span>
                              </div>
                              <div className="cart-item-qty">
                                <button className="qty-btn" onClick={() => updateCartQty(item.product_id, -1)}>−</button>
                                <span className="qty-value">{item.quantity}</span>
                                <button className="qty-btn" onClick={() => updateCartQty(item.product_id, 1)}>+</button>
                              </div>
                              <div className="cart-item-subtotal">
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                              <button className="cart-item-remove" onClick={() => removeFromCart(item.product_id)}>
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="cart-total">
                          <span>Total</span>
                          <span className="cart-total-value">{formatCurrency(cartTotal)}</span>
                        </div>
                      </>
                    )}
                    <button
                      className="btn-primary btn-submit"
                      onClick={handleSubmitOrder}
                      disabled={!formData.client_id || cartItems.length === 0 || submitting}
                    >
                      {submitting ? 'Criando...' : 'Finalizar Pedido'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
