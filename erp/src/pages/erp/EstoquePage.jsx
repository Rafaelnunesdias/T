import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, X, Search, ArrowUpDown, History } from 'lucide-react';
import './EstoquePage.css';

const mockStock = [
  { id: 1, product_id: 1, products: { name: 'Coca-Cola 2L', price: '12.99' }, quantity: 45, min_stock: 10 },
  { id: 2, product_id: 2, products: { name: 'Água 500ml', price: '3.50' }, quantity: 120, min_stock: 20 },
  { id: 3, product_id: 3, products: { name: 'Hambúrguer Artesanal', price: '28.90' }, quantity: 8, min_stock: 10 },
  { id: 4, product_id: 4, products: { name: 'Batata Frita', price: '15.90' }, quantity: 3, min_stock: 10 },
  { id: 5, product_id: 5, products: { name: 'Pizza Congelada', price: '35.00' }, quantity: 25, min_stock: 8 },
  { id: 6, product_id: 6, products: { name: 'Suco Natural 500ml', price: '8.90' }, quantity: 2, min_stock: 10 },
  { id: 7, product_id: 7, products: { name: 'Combo Família', price: '69.90' }, quantity: 15, min_stock: 5 },
  { id: 8, product_id: 8, products: { name: 'Pastel de Carne', price: '7.50' }, quantity: 6, min_stock: 10 },
  { id: 9, product_id: 9, products: { name: 'Açaí 500ml', price: '18.90' }, quantity: 30, min_stock: 10 },
  { id: 10, product_id: 10, products: { name: 'Porção de Feijão', price: '12.00' }, quantity: 0, min_stock: 5 },
  { id: 11, product_id: 11, products: { name: 'Refrigerante Lata', price: '5.99' }, quantity: 60, min_stock: 15 },
  { id: 12, product_id: 12, products: { name: 'Água Coconut', price: '6.00' }, quantity: 40, min_stock: 10 },
  { id: 13, product_id: 13, products: { name: 'Hot Dog', price: '14.90' }, quantity: 18, min_stock: 8 },
  { id: 14, product_id: 14, products: { name: 'Nuggets 10un', price: '16.90' }, quantity: 22, min_stock: 10 },
  { id: 15, product_id: 15, products: { name: 'Milkshake', price: '19.90' }, quantity: 12, min_stock: 5 },
  { id: 16, product_id: 16, products: { name: 'Croquete 6un', price: '13.90' }, quantity: 4, min_stock: 8 },
  { id: 17, product_id: 17, products: { name: 'Empadão', price: '22.00' }, quantity: 35, min_stock: 10 },
  { id: 18, product_id: 18, products: { name: 'Tortilha', price: '9.90' }, quantity: 28, min_stock: 10 },
  { id: 19, product_id: 19, products: { name: 'Molho Especial', price: '4.50' }, quantity: 1, min_stock: 10 },
  { id: 20, product_id: 20, products: { name: 'Cobertura Chocolate', price: '7.90' }, quantity: 50, min_stock: 15 },
];

const now = Date.now();
const day = 86400000;

const mockMovements = [
  { id: 1, type: 'entrada', quantity: 20, description: 'Reposição semanal', products: { name: 'Coca-Cola 2L' }, created_at: new Date(now - day * 0.2).toISOString() },
  { id: 2, type: 'saida', quantity: 5, description: 'Venda no balcão', products: { name: 'Hambúrguer Artesanal' }, created_at: new Date(now - day * 0.5).toISOString() },
  { id: 3, type: 'entrada', quantity: 50, description: 'Compra de fornecedor', products: { name: 'Água 500ml' }, created_at: new Date(now - day * 1).toISOString() },
  { id: 4, type: 'saida', quantity: 8, description: 'Pedido delivery', products: { name: 'Batata Frita' }, created_at: new Date(now - day * 1.2).toISOString() },
  { id: 5, type: 'entrada', quantity: 10, description: 'Ajuste de inventário', products: { name: 'Pizza Congelada' }, created_at: new Date(now - day * 2).toISOString() },
  { id: 6, type: 'saida', quantity: 15, description: 'Evento corporativo', products: { name: 'Combo Família' }, created_at: new Date(now - day * 2.5).toISOString() },
  { id: 7, type: 'entrada', quantity: 30, description: 'Reposição estoque', products: { name: 'Refrigerante Lata' }, created_at: new Date(now - day * 3).toISOString() },
  { id: 8, type: 'saida', quantity: 3, description: 'Retirada para produção', products: { name: 'Croquete 6un' }, created_at: new Date(now - day * 3.5).toISOString() },
  { id: 9, type: 'entrada', quantity: 25, description: 'Compra semanal', products: { name: 'Açaí 500ml' }, created_at: new Date(now - day * 4).toISOString() },
  { id: 10, type: 'saida', quantity: 10, description: 'Venda online', products: { name: 'Nuggets 10un' }, created_at: new Date(now - day * 4.5).toISOString() },
  { id: 11, type: 'entrada', quantity: 40, description: 'Fornecimento mensal', products: { name: 'Água Coconut' }, created_at: new Date(now - day * 5).toISOString() },
  { id: 12, type: 'saida', quantity: 2, description: 'Ajuste de perda', products: { name: 'Molho Especial' }, created_at: new Date(now - day * 5.5).toISOString() },
  { id: 13, type: 'entrada', quantity: 15, description: 'Reposição rápida', products: { name: 'Hot Dog' }, created_at: new Date(now - day * 6).toISOString() },
  { id: 14, type: 'saida', quantity: 7, description: 'Pedido especial', products: { name: 'Empadão' }, created_at: new Date(now - day * 6.5).toISOString() },
  { id: 15, type: 'entrada', quantity: 20, description: 'Compra emergencial', products: { name: 'Molho Especial' }, created_at: new Date(now - day * 7).toISOString() },
];

export default function EstoquePage() {
  const [stock, setStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [showMovements, setShowMovements] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('entrada');
  const [formQty, setFormQty] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStock(mockStock);
    setMovements(mockMovements);
    setLoading(false);
  }, []);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const openMovement = (item, type) => {
    setSelectedProduct(item);
    setModalType(type);
    setFormQty('');
    setFormDesc('');
    setModalOpen(true);
  };

  const handleSaveMovement = () => {
    if (!formQty || Number(formQty) <= 0) return;
    const qty = Number(formQty);
    const desc = formDesc || (modalType === 'entrada' ? 'Ajuste manual' : 'Retirada manual');

    const newMovement = {
      id: movements.length + 1,
      type: modalType,
      quantity: qty,
      description: desc,
      products: { name: selectedProduct.products?.name || 'Produto' },
      created_at: new Date().toISOString(),
    };

    setMovements(prev => [newMovement, ...prev]);

    setStock(prev =>
      prev.map(item =>
        item.id === selectedProduct.id
          ? { ...item, quantity: modalType === 'entrada' ? item.quantity + qty : Math.max(0, item.quantity - qty) }
          : item
      )
    );

    setModalOpen(false);
  };

  const filtered = stock
    .filter(item => {
      const name = (item.products?.name || '').toLowerCase();
      return name.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      let va, vb;
      if (sortField === 'name') {
        va = (a.products?.name || '').toLowerCase();
        vb = (b.products?.name || '').toLowerCase();
      } else if (sortField === 'quantity') {
        va = a.quantity;
        vb = b.quantity;
      } else if (sortField === 'price') {
        va = Number(a.products?.price || 0);
        vb = Number(b.products?.price || 0);
      }
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const SortIcon = ({ field }) => (
    <ArrowUpDown size={12} className={`sort-icon${sortField === field ? ' active' : ''}`} />
  );

  return (
    <div className="estoque-page">
      <div className="estoque-header">
        <div>
          <h1>Estoque</h1>
          <p>{loading ? 'Carregando...' : `${stock.length} produtos cadastrados`}</p>
        </div>
        <div className="estoque-header-actions">
          <button
            className={`estoque-btn ${showMovements ? 'active' : ''}`}
            onClick={() => setShowMovements(!showMovements)}
          >
            <History size={16} />
            Movimentações
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="estoque-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Buscar produto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <X size={16} className="clear-btn" onClick={() => setSearch('')} />}
      </div>

      {loading ? (
        <div className="estoque-loading">
          {Array.from({ length: 5 }, (_, i) => <div key={i} className="estoque-skeleton-row" />)}
        </div>
      ) : (
        <>
          {/* Tabela de Estoque */}
          <div className="estoque-table-wrapper">
            <table className="estoque-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} className="sortable">
                    Produto <SortIcon field="name" />
                  </th>
                  <th onClick={() => handleSort('quantity')} className="sortable">
                    Quantidade <SortIcon field="quantity" />
                  </th>
                  <th onClick={() => handleSort('price')} className="sortable">
                    Preço <SortIcon field="price" />
                  </th>
                  <th>Est. Mínimo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="estoque-empty">
                      <Package size={32} />
                      <p>Nenhum produto encontrado</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(item => {
                    const minStock = item.min_stock ?? 10;
                    const isLow = item.quantity <= minStock;
                    const isCritical = item.quantity <= 3;
                    return (
                      <tr key={item.id} className={isLow ? 'row-low' : ''}>
                        <td className="product-cell">
                          <div className="product-icon">
                            <Package size={16} color={isLow ? '#ef4444' : '#fc6901'} />
                          </div>
                          <span>{item.products?.name || 'Produto sem nome'}</span>
                        </td>
                        <td className={`qty-cell ${isLow ? 'low' : ''} ${isCritical ? 'critical' : ''}`}>
                          {item.quantity}
                        </td>
                        <td className="price-cell">
                          {item.products?.price
                            ? `R$ ${Number(item.products.price).toFixed(2)}`
                            : '—'}
                        </td>
                        <td className="min-stock-cell">{minStock}</td>
                        <td>
                          <span className={`stock-badge ${isCritical ? 'critical' : isLow ? 'low' : 'ok'}`}>
                            {isCritical ? 'Crítico' : isLow ? 'Baixo' : 'Normal'}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button
                            className="action-btn entrada"
                            title="Registrar entrada"
                            onClick={() => openMovement(item, 'entrada')}
                          >
                            + Entrada
                          </button>
                          <button
                            className="action-btn saida"
                            title="Registrar saída"
                            onClick={() => openMovement(item, 'saida')}
                          >
                            - Saída
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Movimentações recentes */}
          {showMovements && (
            <div className="estoque-movements">
              <h3>Movimentações Recentes</h3>
              <div className="movements-list">
                {movements.length === 0 ? (
                  <p className="movements-empty">Nenhuma movimentação registrada</p>
                ) : (
                  movements.map(mov => (
                    <div key={mov.id} className={`movement-item ${mov.type}`}>
                      <div className="movement-icon">
                        {mov.type === 'entrada' ? '⬆' : '⬇'}
                      </div>
                      <div className="movement-info">
                        <strong>{mov.products?.name || 'Produto'}</strong>
                        <span>{mov.description || '—'}</span>
                      </div>
                      <div className={`movement-qty ${mov.type}`}>
                        {mov.type === 'entrada' ? '+' : ''}{mov.quantity}
                      </div>
                      <div className="movement-date">
                        {new Date(mov.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de movimentação */}
      {modalOpen && (
        <div className="movement-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="movement-modal" onClick={e => e.stopPropagation()}>
            <div className="movement-modal-header">
              <h3>{modalType === 'entrada' ? 'Registrar Entrada' : 'Registrar Saída'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="movement-modal-body">
              <p className="modal-product-name">
                <strong>Produto:</strong> {selectedProduct?.products?.name || 'Produto'}
              </p>
              <p className="modal-current-qty">
                <strong>Estoque atual:</strong> {selectedProduct?.quantity || 0} unidades
              </p>
              <div className="form-group">
                <label>Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={formQty}
                  onChange={e => setFormQty(e.target.value)}
                  placeholder="0"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Descrição (opcional)</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder={modalType === 'entrada' ? 'Compra de insumos...' : 'Retirada para produção...'}
                />
              </div>
            </div>
            <div className="movement-modal-footer">
              <button className="btn-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button
                className={`btn-confirm ${modalType}`}
                onClick={handleSaveMovement}
                disabled={!formQty || Number(formQty) <= 0 || saving}
              >
                {saving ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
