import { useState, useMemo } from 'react';
import { Search, Plus, X, Package, AlertTriangle, Edit3, Trash2, ArrowUpDown } from 'lucide-react';
import './EstoqueInsumos.css';

const initialInsumos = [
  { id: 1, name: 'Farinha de Trigo', quantity: 25, unit: 'kg', min_stock: 10, category: 'Panificação' },
  { id: 2, name: 'Queijo Mussarela', quantity: 8, unit: 'kg', min_stock: 5, category: 'Laticínios' },
  { id: 3, name: 'Molho de Tomate', quantity: 15, unit: 'litros', min_stock: 8, category: 'Molhos' },
  { id: 4, name: 'Carne Moída', quantity: 12, unit: 'kg', min_stock: 8, category: 'Carnes' },
  { id: 5, name: 'Refrigerante Cola', quantity: 48, unit: 'litros', min_stock: 20, category: 'Bebidas' },
  { id: 6, name: 'Batata (in natura)', quantity: 30, unit: 'kg', min_stock: 15, category: 'Legumes' },
  { id: 7, name: 'Ovos', quantity: 120, unit: 'unidades', min_stock: 50, category: 'Laticínios' },
  { id: 8, name: 'Cebola', quantity: 10, unit: 'kg', min_stock: 5, category: 'Legumes' },
  { id: 9, name: 'Alho', quantity: 3, unit: 'kg', min_stock: 2, category: 'Temperos' },
  { id: 10, name: 'Sal', quantity: 5, unit: 'kg', min_stock: 2, category: 'Temperos' },
  { id: 11, name: 'Azeite', quantity: 8, unit: 'litros', min_stock: 4, category: 'Óleos' },
  { id: 12, name: 'Leite', quantity: 20, unit: 'litros', min_stock: 10, category: 'Laticínios' },
  { id: 13, name: 'Chocolate em Pó', quantity: 5, unit: 'kg', min_stock: 3, category: 'Confeitaria' },
  { id: 14, name: 'Açúcar', quantity: 10, unit: 'kg', min_stock: 5, category: 'Confeitaria' },
  { id: 15, name: 'Fermento', quantity: 2, unit: 'kg', min_stock: 1, category: 'Panificação' },
  { id: 16, name: 'Presunto', quantity: 6, unit: 'kg', min_stock: 3, category: 'Frios' },
  { id: 17, name: 'Tomate', quantity: 8, unit: 'kg', min_stock: 4, category: 'Legumes' },
  { id: 18, name: 'Pão de Hambúrguer', quantity: 50, unit: 'unidades', min_stock: 20, category: 'Panificação' },
  { id: 19, name: 'Molho Especial', quantity: 5, unit: 'litros', min_stock: 3, category: 'Molhos' },
  { id: 20, name: 'Creme de Leite', quantity: 12, unit: 'litros', min_stock: 6, category: 'Laticínios' },
];

const getUnitLabel = (unit) => {
  const labels = { kg: 'kg', g: 'g', litros: 'L', unidades: 'un' };
  return labels[unit] || unit;
};

export default function EstoqueInsumos() {
  const [insumos, setInsumos] = useState(initialInsumos);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', quantity: '', unit: 'kg', min_stock: '', category: '' });

  const getStatus = (item) => {
    if (item.quantity > item.min_stock * 2) return 'ok';
    if (item.quantity > item.min_stock) return 'baixo';
    return 'critico';
  };

  const getStatusLabel = (status) => {
    if (status === 'ok') return 'OK';
    if (status === 'baixo') return 'Baixo';
    return 'Crítico';
  };

  const stats = useMemo(() => {
    const total = insumos.length;
    const ok = insumos.filter(i => getStatus(i) === 'ok').length;
    const baixo = insumos.filter(i => getStatus(i) === 'baixo').length;
    const critico = insumos.filter(i => getStatus(i) === 'critico').length;
    return { total, ok, baixo, critico };
  }, [insumos]);

  const filtered = useMemo(() => {
    return insumos
      .filter(item => !search || item.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        let va, vb;
        if (sortField === 'name') { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
        else if (sortField === 'quantity') { va = a.quantity; vb = b.quantity; }
        else if (sortField === 'category') { va = a.category.toLowerCase(); vb = b.category.toLowerCase(); }
        else if (sortField === 'min_stock') { va = a.min_stock; vb = b.min_stock; }
        else { va = a.name.toLowerCase(); vb = b.name.toLowerCase(); }
        return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
      });
  }, [insumos, search, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const openCreate = () => {
    setEditingItem(null);
    setForm({ name: '', quantity: '', unit: 'kg', min_stock: '', category: '' });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({ name: item.name, quantity: String(item.quantity), unit: item.unit, min_stock: String(item.min_stock), category: item.category });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setForm({ name: '', quantity: '', unit: 'kg', min_stock: '', category: '' });
  };

  const handleSave = () => {
    if (!form.name || !form.quantity || !form.min_stock || !form.category) return;

    if (editingItem) {
      setInsumos(prev => prev.map(item =>
        item.id === editingItem.id
          ? { ...item, name: form.name, quantity: Number(form.quantity), unit: form.unit, min_stock: Number(form.min_stock), category: form.category }
          : item
      ));
    } else {
      const newId = Math.max(...insumos.map(i => i.id), 0) + 1;
      setInsumos(prev => [...prev, {
        id: newId,
        name: form.name,
        quantity: Number(form.quantity),
        unit: form.unit,
        min_stock: Number(form.min_stock),
        category: form.category,
      }]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    setInsumos(prev => prev.filter(item => item.id !== id));
    setDeleteConfirm(null);
  };

  const SortIcon = ({ field }) => (
    <ArrowUpDown size={12} className={`sort-icon${sortField === field ? ' active' : ''}`} />
  );

  return (
    <div className="insumos-page">
      <div className="insumos-header">
        <div>
          <h1>Estoque de Insumos</h1>
          <p>Controle de insumos para produção</p>
        </div>
        <button className="insumos-btn-primary" onClick={openCreate}>
          <Plus size={16} />
          Novo Insumo
        </button>
      </div>

      <div className="insumos-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Buscar insumo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <X size={16} className="clear-btn" onClick={() => setSearch('')} />}
      </div>

      <div className="insumos-stats">
        <div className="stat-card">
          <div className="stat-icon total"><Package size={20} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Insumos</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon ok"><Package size={20} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.ok}</span>
            <span className="stat-label">Estoque OK</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon baixo"><AlertTriangle size={20} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.baixo}</span>
            <span className="stat-label">Estoque Baixo</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon critico"><AlertTriangle size={20} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.critico}</span>
            <span className="stat-label">Crítico</span>
          </div>
        </div>
      </div>

      <div className="insumos-table-wrapper">
        <table className="insumos-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Insumo <SortIcon field="name" />
              </th>
              <th onClick={() => handleSort('category')} className="sortable">
                Categoria <SortIcon field="category" />
              </th>
              <th onClick={() => handleSort('quantity')} className="sortable">
                Quantidade <SortIcon field="quantity" />
              </th>
              <th onClick={() => handleSort('min_stock')} className="sortable">
                Est. Mínimo <SortIcon field="min_stock" />
              </th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="insumos-empty">
                  <Package size={32} />
                  <p>Nenhum insumo encontrado</p>
                </td>
              </tr>
            ) : (
              filtered.map(item => {
                const status = getStatus(item);
                return (
                  <tr key={item.id} className={status === 'critico' ? 'row-critical' : status === 'baixo' ? 'row-low' : ''}>
                    <td className="product-cell">
                      <div className="product-icon">
                        <Package size={16} color={status === 'critico' ? '#ef4444' : status === 'baixo' ? '#f59e0b' : '#10b981'} />
                      </div>
                      <span>{item.name}</span>
                    </td>
                    <td className="category-cell">{item.category}</td>
                    <td className="qty-cell">
                      {item.quantity} <span className="unit-label">{getUnitLabel(item.unit)}</span>
                    </td>
                    <td className="min-stock-cell">
                      {item.min_stock} <span className="unit-label">{getUnitLabel(item.unit)}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-${status}`}>
                        {getStatusLabel(status)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="action-btn edit" title="Editar" onClick={() => openEdit(item)}>
                        <Edit3 size={14} />
                      </button>
                      <button className="action-btn delete" title="Excluir" onClick={() => setDeleteConfirm(item)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="insumos-modal-overlay" onClick={closeModal}>
          <div className="insumos-modal" onClick={e => e.stopPropagation()}>
            <div className="insumos-modal-header">
              <h3>{editingItem ? 'Editar Insumo' : 'Novo Insumo'}</h3>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="insumos-modal-body">
              <div className="form-group">
                <label>Nome do Insumo</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Farinha de Trigo"
                  autoFocus
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantidade</label>
                  <input
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Unidade</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="litros">litros</option>
                    <option value="unidades">unidades</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Estoque Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={form.min_stock}
                    onChange={e => setForm({ ...form, min_stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    placeholder="Ex: Panificação"
                  />
                </div>
              </div>
            </div>
            <div className="insumos-modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancelar</button>
              <button
                className="btn-confirm"
                onClick={handleSave}
                disabled={!form.name || !form.quantity || !form.min_stock || !form.category}
              >
                {editingItem ? 'Salvar Alterações' : 'Criar Insumo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="insumos-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="insumos-modal delete-modal" onClick={e => e.stopPropagation()}>
            <div className="insumos-modal-header delete-header">
              <h3>Confirmar Exclusão</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}><X size={18} /></button>
            </div>
            <div className="insumos-modal-body">
              <p>Tem certeza que deseja excluir o insumo <strong>{deleteConfirm.name}</strong>?</p>
              <p className="delete-warning">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="insumos-modal-footer">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn-confirm btn-delete" onClick={() => handleDelete(deleteConfirm.id)}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
