import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import './CupomFiscalPage.css';
import Modal from '../../components/ui/Modal';
import {
  Search, Receipt, Eye, Download, Printer, Plus, Trash2,
  CalendarDays, RefreshCw, XCircle, DollarSign, X, Ban, FileText
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// =============================================
// Mock Products for creation form
// =============================================
const MOCK_PRODUCTS = [
  { name: 'Hambúrguer Artesanal', price: 28.90 },
  { name: 'Pizza Margherita', price: 32.00 },
  { name: 'Batata Frita', price: 15.90 },
  { name: 'Coca-Cola 2L', price: 12.99 },
  { name: 'Combo Família', price: 69.90 },
  { name: 'Açaí 500ml', price: 18.90 },
  { name: 'Pastel de Carne', price: 7.50 },
  { name: 'Hot Dog', price: 14.90 },
  { name: 'Nuggets 10un', price: 16.90 },
  { name: 'Milkshake', price: 19.90 },
];

// =============================================
// Mock Coupons Data (20 coupons)
// =============================================
function generateMockCoupons() {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const coupons = [
    {
      id: 1,
      number: 'CF-2025-000001',
      client_name: 'João Silva',
      client_document: '123.456.789-00',
      client_phone: '(31) 99876-5432',
      payment_method: 'PIX',
      items: [
        { name: 'Hambúrguer Artesanal', quantity: 2, price: 28.90, discount: 0 },
        { name: 'Coca-Cola 2L', quantity: 1, price: 12.99, discount: 0 },
      ],
      subtotal: 70.79,
      discount: 0,
      total: 70.79,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 1 * dayMs).toISOString(),
    },
    {
      id: 2,
      number: 'CF-2025-000002',
      client_name: 'Maria Oliveira',
      client_document: '987.654.321-00',
      client_phone: '(21) 99876-1234',
      payment_method: 'Cartão de Crédito',
      items: [
        { name: 'Pizza Margherita', quantity: 1, price: 32.00, discount: 0 },
        { name: 'Batata Frita', quantity: 1, price: 15.90, discount: 0 },
      ],
      subtotal: 47.90,
      discount: 0,
      total: 47.90,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 2 * dayMs).toISOString(),
    },
    {
      id: 3,
      number: 'CF-2025-000003',
      client_name: 'Pedro Henrique',
      client_document: '456.789.123-00',
      client_phone: '(11) 99876-5678',
      payment_method: 'Dinheiro',
      items: [
        { name: 'Combo Família', quantity: 1, price: 69.90, discount: 0 },
      ],
      subtotal: 69.90,
      discount: 0,
      total: 69.90,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 3 * dayMs).toISOString(),
    },
    {
      id: 4,
      number: 'CF-2025-000004',
      client_name: 'Ana Paula',
      client_document: '321.654.987-00',
      client_phone: '(41) 99876-9012',
      payment_method: 'PIX',
      items: [
        { name: 'Açaí 500ml', quantity: 2, price: 18.90, discount: 0 },
        { name: 'Suco Natural', quantity: 1, price: 8.90, discount: 0 },
      ],
      subtotal: 46.70,
      discount: 0,
      total: 46.70,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 4 * dayMs).toISOString(),
    },
    {
      id: 5,
      number: 'CF-2025-000005',
      client_name: 'Carlos Eduardo',
      client_document: '654.321.789-00',
      client_phone: '(51) 99876-3456',
      payment_method: 'Cartão de Débito',
      items: [
        { name: 'Hambúrguer Artesanal', quantity: 1, price: 28.90, discount: 0 },
        { name: 'Pizza Margherita', quantity: 1, price: 32.00, discount: 0 },
      ],
      subtotal: 60.90,
      discount: 0,
      total: 60.90,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 5 * dayMs).toISOString(),
    },
    {
      id: 6,
      number: 'CF-2025-000006',
      client_name: 'Fernanda Souza',
      client_document: '789.123.456-00',
      client_phone: '(71) 99876-7890',
      payment_method: 'PIX',
      items: [
        { name: 'Pastel de Carne', quantity: 3, price: 7.50, discount: 0 },
        { name: 'Batata Frita', quantity: 1, price: 15.90, discount: 0 },
      ],
      subtotal: 38.40,
      discount: 0,
      total: 38.40,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 6 * dayMs).toISOString(),
    },
    {
      id: 7,
      number: 'CF-2025-000007',
      client_name: 'Lucas Ferreira',
      client_document: '147.258.369-00',
      client_phone: '(61) 99876-2345',
      payment_method: 'Dinheiro',
      items: [
        { name: 'Combo Família', quantity: 1, price: 69.90, discount: 0 },
        { name: 'Coca-Cola 2L', quantity: 2, price: 12.99, discount: 0 },
      ],
      subtotal: 95.88,
      discount: 0,
      total: 95.88,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 7 * dayMs).toISOString(),
    },
    {
      id: 8,
      number: 'CF-2025-000008',
      client_name: 'Juliana Costa',
      client_document: '258.369.147-00',
      client_phone: '(85) 99876-6789',
      payment_method: 'Cartão de Crédito',
      items: [
        { name: 'Hot Dog', quantity: 2, price: 14.90, discount: 0 },
        { name: 'Nuggets 10un', quantity: 1, price: 16.90, discount: 0 },
      ],
      subtotal: 46.70,
      discount: 0,
      total: 46.70,
      notes: null,
      status: 'cancelado',
      issued_at: new Date(now.getTime() - 8 * dayMs).toISOString(),
    },
    {
      id: 9,
      number: 'CF-2025-000009',
      client_name: 'Rafael Santos',
      client_document: '369.147.258-00',
      client_phone: '(92) 99876-0123',
      payment_method: 'PIX',
      items: [
        { name: 'Milkshake', quantity: 1, price: 19.90, discount: 0 },
        { name: 'Batata Frita', quantity: 1, price: 15.90, discount: 0 },
        { name: 'Coca-Cola 2L', quantity: 1, price: 12.99, discount: 0 },
      ],
      subtotal: 48.79,
      discount: 0,
      total: 48.79,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 9 * dayMs).toISOString(),
    },
    {
      id: 10,
      number: 'CF-2025-000010',
      client_name: 'Beatriz Lima',
      client_document: '741.852.963-00',
      client_phone: '(81) 99876-4567',
      payment_method: 'Dinheiro',
      items: [
        { name: 'Açaí 500ml', quantity: 1, price: 18.90, discount: 0 },
        { name: 'Suco Natural', quantity: 2, price: 8.90, discount: 0 },
      ],
      subtotal: 36.70,
      discount: 0,
      total: 36.70,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 10 * dayMs).toISOString(),
    },
    {
      id: 11,
      number: 'CF-2025-000011',
      client_name: 'Thiago Almeida',
      client_document: '852.963.741-00',
      client_phone: '(62) 99876-8901',
      payment_method: 'Cartão de Débito',
      items: [
        { name: 'Hambúrguer Artesanal', quantity: 3, price: 28.90, discount: 0 },
      ],
      subtotal: 86.70,
      discount: 0,
      total: 86.70,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 11 * dayMs).toISOString(),
    },
    {
      id: 12,
      number: 'CF-2025-000012',
      client_name: 'Camila Ribeiro',
      client_document: '963.741.852-00',
      client_phone: '(91) 99876-2345',
      payment_method: 'PIX',
      items: [
        { name: 'Pizza Margherita', quantity: 2, price: 32.00, discount: 0 },
        { name: 'Refrigerante Lata', quantity: 2, price: 5.99, discount: 0 },
      ],
      subtotal: 75.98,
      discount: 0,
      total: 75.98,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 12 * dayMs).toISOString(),
    },
    {
      id: 13,
      number: 'CF-2025-000013',
      client_name: 'Felipe Martins',
      client_document: '159.753.486-00',
      client_phone: '(27) 99876-6789',
      payment_method: 'Dinheiro',
      items: [
        { name: 'Croquete 6un', quantity: 2, price: 13.90, discount: 0 },
      ],
      subtotal: 27.80,
      discount: 0,
      total: 27.80,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 13 * dayMs).toISOString(),
    },
    {
      id: 14,
      number: 'CF-2025-000014',
      client_name: 'Larissa Pereira',
      client_document: '753.486.159-00',
      client_phone: '(48) 99876-0123',
      payment_method: 'Cartão de Crédito',
      items: [
        { name: 'Empadão', quantity: 1, price: 18.50, discount: 0 },
        { name: 'Tortilha', quantity: 1, price: 9.00, discount: 0 },
        { name: 'Molho Especial', quantity: 1, price: 7.90, discount: 0 },
      ],
      subtotal: 35.40,
      discount: 0,
      total: 35.40,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 14 * dayMs).toISOString(),
    },
    {
      id: 15,
      number: 'CF-2025-000015',
      client_name: 'Gabriel Rodrigues',
      client_document: '486.159.753-00',
      client_phone: '(34) 99876-4567',
      payment_method: 'PIX',
      items: [
        { name: 'Açaí 500ml', quantity: 3, price: 18.90, discount: 0 },
      ],
      subtotal: 56.70,
      discount: 0,
      total: 56.70,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 15 * dayMs).toISOString(),
    },
    {
      id: 16,
      number: 'CF-2025-000016',
      client_name: 'Mariana Nascimento',
      client_document: '321.789.654-00',
      client_phone: '(11) 99876-8901',
      payment_method: 'Dinheiro',
      items: [
        { name: 'Combo Família', quantity: 1, price: 69.90, discount: 0 },
        { name: 'Batata Frita', quantity: 2, price: 15.90, discount: 0 },
      ],
      subtotal: 101.70,
      discount: 0,
      total: 101.70,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 16 * dayMs).toISOString(),
    },
    {
      id: 17,
      number: 'CF-2025-000017',
      client_name: 'Igor Costa',
      client_document: '654.987.321-00',
      client_phone: '(19) 99876-2345',
      payment_method: 'Cartão de Débito',
      items: [
        { name: 'Hambúrguer Artesanal', quantity: 1, price: 28.90, discount: 0 },
        { name: 'Hot Dog', quantity: 1, price: 14.90, discount: 0 },
      ],
      subtotal: 43.80,
      discount: 0,
      total: 43.80,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 17 * dayMs).toISOString(),
    },
    {
      id: 18,
      number: 'CF-2025-000018',
      client_name: 'Patrícia Santos',
      client_document: '987.321.654-00',
      client_phone: '(12) 99876-6789',
      payment_method: 'PIX',
      items: [
        { name: 'Pizza Margherita', quantity: 1, price: 32.00, discount: 0 },
        { name: 'Milkshake', quantity: 1, price: 19.90, discount: 0 },
      ],
      subtotal: 51.90,
      discount: 0,
      total: 51.90,
      notes: null,
      status: 'cancelado',
      issued_at: new Date(now.getTime() - 18 * dayMs).toISOString(),
    },
    {
      id: 19,
      number: 'CF-2025-000019',
      client_name: 'André Oliveira',
      client_document: '123.789.456-00',
      client_phone: '(21) 99876-0123',
      payment_method: 'Cartão de Crédito',
      items: [
        { name: 'Combo Família', quantity: 2, price: 69.90, discount: 0 },
      ],
      subtotal: 139.80,
      discount: 0,
      total: 139.80,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 19 * dayMs).toISOString(),
    },
    {
      id: 20,
      number: 'CF-2025-000020',
      client_name: 'Isabela Fernandes',
      client_document: '789.456.123-00',
      client_phone: '(16) 99876-4567',
      payment_method: 'Dinheiro',
      items: [
        { name: 'Hambúrguer Artesanal', quantity: 1, price: 28.90, discount: 0 },
        { name: 'Batata Frita', quantity: 1, price: 15.90, discount: 0 },
        { name: 'Coca-Cola 2L', quantity: 1, price: 12.99, discount: 0 },
      ],
      subtotal: 57.79,
      discount: 0,
      total: 57.79,
      notes: null,
      status: 'emitido',
      issued_at: new Date(now.getTime() - 20 * dayMs).toISOString(),
    },
  ];

  return coupons;
}

// =============================================
// Animated Counter Component
// =============================================
function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!value || value === 0) { setDisplay(0); return; }
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const formatted = Number(display).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return <>{prefix}{formatted}{suffix}</>;
}

// =============================================
// Period filter config
// =============================================
const PERIODS = [
  { key: 'today', label: 'Hoje' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mês' },
  { key: 'year', label: 'Ano' },
];

const PAYMENT_METHODS = [
  'Dinheiro',
  'PIX',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Boleto',
  'Transferência',
];

const EMPTY_ITEM = { name: '', quantity: 1, price: 0, discount: 0 };

const EMPTY_FORM = {
  client_name: '',
  client_document: '',
  client_phone: '',
  payment_method: 'Dinheiro',
  items: [{ ...EMPTY_ITEM }],
  discount: 0,
  notes: '',
};

// =============================================
// Skeleton
// =============================================
function CupomSkeleton() {
  return (
    <div className="cupom-page">
      <div className="cupom-header">
        <div>
          <div className="skeleton skeleton-h1" />
          <div className="skeleton skeleton-p" />
        </div>
      </div>
      <div className="cupom-metrics">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="metric-card skeleton-card">
            <div className="skeleton skeleton-icon" />
            <div className="metric-content">
              <div className="skeleton skeleton-value" />
              <div className="skeleton skeleton-title" />
            </div>
          </div>
        ))}
      </div>
      <div className="skeleton skeleton-chart" style={{ height: 400 }} />
    </div>
  );
}

// =============================================
// QR Code Placeholder Component
// =============================================
function QRCodePlaceholder() {
  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,1,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0],
    [1,0,1,0,1,1,1,1,0,0,1,0,0,1,1,0,1,0,1,1,0],
    [0,1,0,1,0,0,0,1,1,1,0,1,1,0,0,1,0,1,0,0,1],
    [1,1,1,0,1,0,1,0,1,0,1,0,1,1,0,0,1,1,1,0,1],
    [0,0,0,1,0,1,0,1,0,1,0,1,0,0,1,1,0,0,0,1,0],
    [1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1],
    [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,0,0,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,0,1,0,1,0,1,1,0,0,1,0],
    [1,0,1,1,1,0,1,0,1,1,0,0,1,0,1,0,1,0,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,1,0,1,0,1,0,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,0,1,1,0,1,1,0],
    [1,0,0,0,0,0,1,0,0,1,0,1,0,1,1,0,0,1,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1],
  ];

  return (
    <div style={{
      width: 60,
      height: 60,
      display: 'grid',
      gridTemplateColumns: 'repeat(21, 1fr)',
      gridTemplateRows: 'repeat(21, 1fr)',
      border: '2px solid #333',
      borderRadius: 4,
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {pattern.flat().map((cell, i) => (
        <div
          key={i}
          style={{
            background: cell ? '#000' : '#fff',
          }}
        />
      ))}
    </div>
  );
}

// =============================================
// Main Cupom Fiscal Page Component
// =============================================
export default function CupomFiscalPage() {
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('month');
  const [coupons, setCoupons] = useState(() => generateMockCoupons());
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const receiptRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const perPage = 10;

  // Debounced search
  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1);
    }, 300);
  }, []);

  // Client-side filtering
  const filteredCoupons = useMemo(() => {
    let result = [...coupons];
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (period === 'today') {
      result = result.filter(c => c.issued_at?.slice(0, 10) === todayStr);
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(c => new Date(c.issued_at) >= weekAgo);
    } else if (period === 'year') {
      const yearStart = `${now.getFullYear()}-01-01`;
      result = result.filter(c => c.issued_at?.slice(0, 10) >= yearStart);
    }

    if (search.trim()) {
      const term = search.toLowerCase().trim();
      result = result.filter(c =>
        c.number.toLowerCase().includes(term) ||
        c.client_name.toLowerCase().includes(term) ||
        (c.client_document && c.client_document.toLowerCase().includes(term))
      );
    }

    return result;
  }, [coupons, period, search]);

  useEffect(() => {
    setPage(1);
  }, [search, period]);

  // =============================================
  // Form: Create New Coupon
  // =============================================
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const handleProductSelect = (index, productName) => {
    const product = MOCK_PRODUCTS.find(p => p.name === productName);
    if (product) {
      setFormData(prev => {
        const items = [...prev.items];
        items[index] = {
          ...items[index],
          name: product.name,
          price: product.price,
        };
        return { ...prev, items };
      });
    } else {
      handleItemChange(index, 'name', productName);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...EMPTY_ITEM }],
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => {
      const items = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: items.length ? items : [{ ...EMPTY_ITEM }] };
    });
  };

  const formSubtotal = useMemo(() => {
    return formData.items.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const disc = Number(item.discount) || 0;
      return sum + (price * qty) - disc;
    }, 0);
  }, [formData.items]);

  const formTotal = useMemo(() => {
    return formSubtotal - (Number(formData.discount) || 0);
  }, [formSubtotal, formData.discount]);

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM });
  };

  const handleCreateCoupon = () => {
    if (!formData.client_name.trim()) {
      alert('Informe o nome do cliente.');
      return;
    }
    const validItems = formData.items.filter(item => item.name.trim());
    if (validItems.length === 0) {
      alert('Adicione pelo menos um item.');
      return;
    }

    const nextNumber = coupons.length + 1;
    const newCoupon = {
      id: Date.now(),
      number: `CF-2025-${String(nextNumber).padStart(6, '0')}`,
      client_name: formData.client_name.trim(),
      client_document: formData.client_document.trim() || null,
      client_phone: formData.client_phone.trim() || null,
      payment_method: formData.payment_method,
      items: validItems.map(item => ({
        name: item.name.trim(),
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        discount: Number(item.discount) || 0,
      })),
      subtotal: formSubtotal,
      discount: Number(formData.discount) || 0,
      total: formTotal,
      notes: formData.notes.trim() || null,
      status: 'emitido',
      issued_at: new Date().toISOString(),
    };

    setCoupons(prev => [newCoupon, ...prev]);
    setShowCreateModal(false);
    resetForm();
  };

  // =============================================
  // Cancel Coupon
  // =============================================
  const handleCancel = (coupon) => {
    if (!window.confirm(`Deseja cancelar o cupom ${coupon.number}? Esta ação irá estornar a transação financeira.`)) return;
    setCoupons(prev => prev.map(c =>
      c.id === coupon.id ? { ...c, status: 'cancelado' } : c
    ));
    if (selected?.id === coupon.id) {
      setSelected(prev => ({ ...prev, status: 'cancelado' }));
    }
  };

  // =============================================
  // Print Receipt (only receipt content)
  // =============================================
  const handlePrint = (coupon) => {
    setSelected(coupon);
    setTimeout(() => {
      const receiptEl = document.querySelector('.cupom-receipt-print');
      if (!receiptEl) return;
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      printWindow.document.write(`
        <html>
          <head>
            <title>Cupom ${coupon.number}</title>
            <style>
              body { font-family: 'Courier New', monospace; margin: 0; padding: 16px; color: #000; background: #fff; }
              .header { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 12px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
              .row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; }
              .divider { border-top: 1px dashed #000; margin: 8px 0; }
              .item { display: flex; justify-content: space-between; font-size: 12px; padding: 2px 0; }
              .total-row { font-weight: bold; font-size: 14px; border-top: 1px dashed #000; margin-top: 8px; padding-top: 8px; }
              .status { text-align: center; font-weight: bold; margin-top: 12px; padding: 6px; border: 1px dashed #000; }
              h4 { margin: 8px 0 4px; font-size: 12px; }
              .qr-placeholder { text-align: center; margin: 12px 0; padding: 8px; border: 1px dashed #000; font-size: 10px; }
              .access-key { text-align: center; font-size: 9px; word-break: break-all; margin: 8px 0; padding: 4px; border: 1px dashed #000; }
            </style>
          </head>
          <body>
            <div class="header">XFlow ERP — Cupom Fiscal</div>
            <div class="row"><span>Número:</span><span>${coupon.number}</span></div>
            <div class="row"><span>Data:</span><span>${new Date(coupon.issued_at).toLocaleString('pt-BR')}</span></div>
            <div class="divider"></div>
            <div class="row"><span>Cliente:</span><span>${coupon.client_name}</span></div>
            <div class="row"><span>Documento:</span><span>${coupon.client_document || '—'}</span></div>
            <div class="row"><span>Telefone:</span><span>${coupon.client_phone || '—'}</span></div>
            <div class="divider"></div>
            <h4>ITENS</h4>
            ${(coupon.items || []).map(item => `
              <div class="item"><span>${item.quantity}x ${item.name}</span><span>R$ ${Number(item.total || item.price * item.quantity).toFixed(2).replace('.', ',')}</span></div>
            `).join('')}
            <div class="divider"></div>
            <div class="row"><span>Subtotal:</span><span>R$ ${Number(coupon.subtotal).toFixed(2).replace('.', ',')}</span></div>
            <div class="row"><span>Desconto:</span><span>- R$ ${Number(coupon.discount).toFixed(2).replace('.', ',')}</span></div>
            <div class="row total-row"><span>TOTAL:</span><span>R$ ${Number(coupon.total).toFixed(2).replace('.', ',')}</span></div>
            <div class="row"><span>Pagamento:</span><span>${coupon.payment_method}</span></div>
            <div class="divider"></div>
            <div class="access-key"><strong>Chave de Acesso:</strong><br/>1234 5678 9012 3456 7890 1234 5678 9012 3456 7890 1234 5678</div>
            <div class="qr-placeholder">[QR CODE]</div>
            <div class="divider"></div>
            <div style="text-align:center;font-size:12px;font-weight:bold;">Obrigado pela preferência!</div>
            <div class="status">${coupon.status === 'emitido' ? '✓ EMITIDO' : '✗ CANCELADO'}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }, 200);
  };

  // =============================================
  // Export Individual Receipt as PDF
  // =============================================
  const exportCouponPDF = async (coupon) => {
    setSelected(coupon);
    await new Promise(r => setTimeout(r, 300));
    try {
      const element = document.querySelector('.cupom-receipt');
      if (!element) return;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`cupom-${coupon.number}.pdf`);
    } catch (e) {
      console.error('Erro ao gerar PDF do cupom:', e);
    }
  };

  const formatCurrency = (value) =>
    `R$ ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const openModal = (c) => setSelected(c);
  const closeModal = () => setSelected(null);

  // Metrics
  const totalCoupons = coupons.length;
  const totalValue = coupons.reduce((sum, c) => sum + Number(c.total || 0), 0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const issuedToday = coupons.filter(c => c.issued_at?.slice(0, 10) === todayStr).length;
  const cancelled = coupons.filter(c => c.status === 'cancelado').length;

  const metricCards = useMemo(() => [
    {
      title: 'Total de Cupons',
      value: totalCoupons,
      icon: Receipt,
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      subtitle: 'cupons emitidos',
      prefix: '',
      decimals: 0,
    },
    {
      title: 'Valor Total Emitido',
      value: totalValue,
      icon: DollarSign,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      subtitle: 'faturamento via cupons',
      prefix: 'R$ ',
      decimals: 2,
    },
    {
      title: 'Emitidos Hoje',
      value: issuedToday,
      icon: CalendarDays,
      gradient: 'linear-gradient(135deg, #fc6901, #e55a00)',
      subtitle: 'cupons de hoje',
      prefix: '',
      decimals: 0,
    },
    {
      title: 'Cupons Cancelados',
      value: cancelled,
      icon: XCircle,
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      subtitle: 'cancelamentos',
      prefix: '',
      decimals: 0,
    },
  ], [totalCoupons, totalValue, issuedToday, cancelled]);

  // Pagination
  const totalPages = Math.ceil(filteredCoupons.length / perPage);
  const paginatedCoupons = filteredCoupons.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="cupom-page">
      {/* Header */}
      <div className="cupom-header">
        <div>
          <h1>Cupom Fiscal</h1>
          <p>Gerenciamento e emissão de cupons fiscais</p>
        </div>
        <div className="cupom-header-actions">
          <div className="cupom-search">
            <Search size={16} />
            <input
              placeholder="Pesquisar por número, cliente..."
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => handleSearchChange('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <div className="period-filter">
            {PERIODS.map(p => (
              <button
                key={p.key}
                className={`period-btn ${period === p.key ? 'active' : ''}`}
                onClick={() => setPeriod(p.key)}
              >
                {p.key === 'today' && <CalendarDays size={14} />}
                {p.key === 'week' && <CalendarDays size={14} />}
                {p.key === 'month' && <Receipt size={14} />}
                {p.key === 'year' && <DollarSign size={14} />}
                {p.label}
              </button>
            ))}
          </div>
          <button className="refresh-btn" onClick={() => setCoupons(generateMockCoupons())} title="Atualizar dados">
            <RefreshCw size={16} />
            Atualizar
          </button>
          <button className="cupom-new-btn" onClick={() => { resetForm(); setShowCreateModal(true); }}>
            <Plus size={16} />
            Novo Cupom
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="cupom-metrics">
        {metricCards.map((metric, index) => (
          <div
            key={index}
            className="metric-card"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="metric-icon" style={{ background: metric.gradient }}>
              <metric.icon size={20} color="#fff" />
            </div>
            <div className="metric-content">
              <div className="metric-value">
                <AnimatedCounter
                  value={metric.value}
                  prefix={metric.prefix}
                  decimals={metric.decimals}
                />
              </div>
              <div className="metric-title">{metric.title}</div>
              <div className="metric-subtitle">{metric.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="cupom-table-container">
        <table className="cupom-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Data</th>
              <th>Valor</th>
              <th>Pagamento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="table-empty">Carregando...</td></tr>
            ) : paginatedCoupons.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty">
                  <Receipt size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <div>Nenhum cupom encontrado</div>
                </td>
              </tr>
            ) : paginatedCoupons.map((c, i) => (
              <tr key={c.id} className={i % 2 === 1 ? 'zebra' : ''}>
                <td className="td-op">{c.number}</td>
                <td className="td-client">{c.client_name}</td>
                <td className="td-date">{new Date(c.issued_at).toLocaleDateString('pt-BR')}</td>
                <td className="td-value">{formatCurrency(c.total)}</td>
                <td>{c.payment_method}</td>
                <td>
                  <span className={`status-badge status-${c.status}`}>
                    {c.status === 'emitido' ? 'Emitido' : 'Cancelado'}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="btn-icon" onClick={() => openModal(c)} title="Visualizar">
                    <Eye size={16} />
                  </button>
                  <button className="btn-icon" title="Imprimir" onClick={() => handlePrint(c)}>
                    <Printer size={16} />
                  </button>
                  <button className="btn-icon" title="Exportar PDF" onClick={() => exportCouponPDF(c)}>
                    <Download size={16} />
                  </button>
                  {c.status === 'emitido' && (
                    <button className="btn-icon btn-icon-danger" title="Cancelar cupom" onClick={() => handleCancel(c)}>
                      <Ban size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Próximo
            </button>
          </div>
        )}
      </div>

      {/* ============================================= */}
      {/* View Coupon Modal — NFC-e Style Receipt */}
      {/* ============================================= */}
      {selected && (
        <Modal open={true} onClose={closeModal} title={`Cupom ${selected.number}`} size="lg">
          <div className="cupom-modal-content">
            <div className="cupom-receipt" ref={receiptRef}>
              <div className="cupom-receipt-nfce">
                {/* Header */}
                <div className="cupom-receipt-header">
                  <div className="cupom-receipt-logo">
                    <FileText size={28} color="#3b82f6" />
                    <h3>XFlow ERP</h3>
                  </div>
                  <span className="cupom-receipt-nfce-label">NFC-e</span>
                </div>
                <div className="cupom-receipt-divider" />

                {/* Coupon Number & Date */}
                <div className="cupom-receipt-center">
                  <span className="cupom-receipt-number">{selected.number}</span>
                  <span className="cupom-receipt-date">
                    {new Date(selected.issued_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
                <div className="cupom-receipt-divider" />

                {/* Client Info */}
                <div className="cupom-receipt-section">
                  <div className="cupom-receipt-row">
                    <span className="cupom-receipt-label">Cliente</span>
                    <span className="cupom-receipt-value">{selected.client_name}</span>
                  </div>
                  <div className="cupom-receipt-row">
                    <span className="cupom-receipt-label">CPF/CNPJ</span>
                    <span className="cupom-receipt-value">{selected.client_document || '—'}</span>
                  </div>
                  <div className="cupom-receipt-row">
                    <span className="cupom-receipt-label">Telefone</span>
                    <span className="cupom-receipt-value">{selected.client_phone || '—'}</span>
                  </div>
                </div>
                <div className="cupom-receipt-divider" />

                {/* Products List */}
                <div className="cupom-receipt-section">
                  <h4 className="cupom-receipt-section-title">PRODUTOS</h4>
                  <div className="cupom-receipt-products">
                    {(selected.items || []).map((item, idx) => (
                      <div key={idx} className="cupom-receipt-product">
                        <div className="cupom-receipt-product-info">
                          <span className="cupom-receipt-product-name">{item.quantity}x {item.name}</span>
                          <span className="cupom-receipt-product-unit">
                            {formatCurrency(item.price)} un.
                          </span>
                        </div>
                        <span className="cupom-receipt-product-total">
                          {formatCurrency(item.total || item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="cupom-receipt-divider" />

                {/* Totals */}
                <div className="cupom-receipt-section">
                  <div className="cupom-receipt-row">
                    <span className="cupom-receipt-label">Subtotal</span>
                    <span className="cupom-receipt-value">{formatCurrency(selected.subtotal)}</span>
                  </div>
                  <div className="cupom-receipt-row">
                    <span className="cupom-receipt-label">Desconto</span>
                    <span className="cupom-receipt-value discount-negative">- {formatCurrency(selected.discount)}</span>
                  </div>
                  <div className="cupom-receipt-row cupom-receipt-total-row">
                    <span className="cupom-receipt-label">TOTAL</span>
                    <span className="cupom-receipt-total-value">{formatCurrency(selected.total)}</span>
                  </div>
                </div>
                <div className="cupom-receipt-divider" />

                {/* Payment Method */}
                <div className="cupom-receipt-section">
                  <div className="cupom-receipt-row">
                    <span className="cupom-receipt-label">Pagamento</span>
                    <span className="cupom-receipt-value payment-method">{selected.payment_method}</span>
                  </div>
                </div>

                {selected.notes && (
                  <div className="cupom-receipt-section">
                    <div className="cupom-receipt-row">
                      <span className="cupom-receipt-label">Obs:</span>
                      <span className="cupom-receipt-value">{selected.notes}</span>
                    </div>
                  </div>
                )}

                <div className="cupom-receipt-divider" />

                {/* Access Key */}
                <div className="cupom-receipt-access-key">
                  <span className="cupom-receipt-access-key-label">Chave de Acesso</span>
                  <span className="cupom-receipt-access-key-value">
                    1234 5678 9012 3456 7890 1234 5678 9012 3456 7890 1234 5678
                  </span>
                </div>

                {/* QR Code */}
                <div className="cupom-receipt-qr">
                  <QRCodePlaceholder />
                  <span className="cupom-receipt-qr-text">Consulte pelo site da SEFAZ</span>
                </div>

                <div className="cupom-receipt-divider" />

                {/* Footer */}
                <div className="cupom-receipt-footer">
                  <span>Obrigado pela preferência!</span>
                </div>

                {/* Status Badge */}
                <div className={`cupom-receipt-status status-${selected.status}`}>
                  {selected.status === 'emitido' ? '✔ Emitido' : '✘ Cancelado'}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="cupom-modal-actions">
              <button className="btn-icon" onClick={() => handlePrint(selected)} title="Imprimir">
                <Printer size={16} /> Imprimir
              </button>
              <button className="btn-icon" onClick={() => exportCouponPDF(selected)} title="Exportar PDF">
                <Download size={16} /> PDF
              </button>
              {selected.status === 'emitido' && (
                <button className="btn-icon btn-icon-danger" onClick={() => handleCancel(selected)} title="Cancelar cupom">
                  <Ban size={16} /> Cancelar
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================= */}
      {/* Create Coupon Modal */}
      {/* ============================================= */}
      {showCreateModal && (
        <Modal open={true} onClose={() => setShowCreateModal(false)} title="Novo Cupom Fiscal" size="lg">
          <div className="cupom-create-form">
            {/* Client Info */}
            <div className="form-section">
              <h3>Dados do Cliente</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome do Cliente *</label>
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={formData.client_name}
                    onChange={e => handleFormChange('client_name', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row form-row-2">
                <div className="form-group">
                  <label>CPF / CNPJ</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.client_document}
                    onChange={e => handleFormChange('client_document', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={formData.client_phone}
                    onChange={e => handleFormChange('client_phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="form-section">
              <h3>Pagamento</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Forma de Pagamento</label>
                  <select
                    className="form-select"
                    value={formData.payment_method}
                    onChange={e => handleFormChange('payment_method', e.target.value)}
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="form-section">
              <div className="form-section-header">
                <h3>Itens</h3>
                <button className="cupom-add-item-btn" onClick={addItem} type="button">
                  <Plus size={14} /> Adicionar Item
                </button>
              </div>
              <div className="cupom-items-list">
                {formData.items.map((item, idx) => (
                  <div key={idx} className="cupom-item-row">
                    <div className="cupom-item-fields">
                      <div className="form-group cupom-item-name">
                        <label>Item</label>
                        <select
                          className="form-select"
                          value={MOCK_PRODUCTS.find(p => p.name === item.name) ? item.name : ''}
                          onChange={e => handleProductSelect(idx, e.target.value)}
                        >
                          <option value="">Selecione um produto...</option>
                          {MOCK_PRODUCTS.map(p => (
                            <option key={p.name} value={p.name}>
                              {p.name} — {formatCurrency(p.price)}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Ou digite manualmente"
                          value={MOCK_PRODUCTS.find(p => p.name === item.name) ? '' : item.name}
                          onChange={e => handleItemChange(idx, 'name', e.target.value)}
                          style={{ marginTop: 4 }}
                        />
                      </div>
                      <div className="form-group cupom-item-qty">
                        <label>Qtd</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="form-group cupom-item-price">
                        <label>Preço</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={e => handleItemChange(idx, 'price', e.target.value)}
                        />
                      </div>
                      <div className="form-group cupom-item-discount">
                        <label>Desc.</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.discount}
                          onChange={e => handleItemChange(idx, 'discount', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="cupom-item-total">
                      {formatCurrency((Number(item.price) * Number(item.quantity)) - Number(item.discount || 0))}
                    </div>
                    {formData.items.length > 1 && (
                      <button className="cupom-item-remove" onClick={() => removeItem(idx)} type="button">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="form-section">
              <h3>Resumo</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Desconto Geral</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={e => handleFormChange('discount', e.target.value)}
                  />
                </div>
              </div>
              <div className="cupom-totals-summary">
                <div className="cupom-totals-row">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(formSubtotal)}</span>
                </div>
                <div className="cupom-totals-row">
                  <span>Desconto:</span>
                  <span>- {formatCurrency(formData.discount)}</span>
                </div>
                <div className="cupom-totals-row cupom-totals-total">
                  <span>Total:</span>
                  <span>{formatCurrency(formTotal)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="form-section">
              <div className="form-group">
                <label>Observações</label>
                <textarea
                  className="form-textarea"
                  placeholder="Observações adicionais..."
                  rows={3}
                  value={formData.notes}
                  onChange={e => handleFormChange('notes', e.target.value)}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="cupom-form-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowCreateModal(false)}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                className="btn-primary btn-submit"
                onClick={handleCreateCoupon}
                disabled={submitting || !formData.client_name.trim()}
              >
                {submitting ? 'Criando...' : 'Criar Cupom'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
