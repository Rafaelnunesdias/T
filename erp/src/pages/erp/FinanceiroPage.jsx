import { useEffect, useState, useMemo } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Receipt, BarChart3,
  CalendarDays, RefreshCw, Activity, TrendingUp as ChartIcon
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart as ReLineChart, Line,
  AreaChart as ReAreaChart, Area
} from 'recharts';
import './FinanceiroPage.css';

// =============================================
// Mock Data
// =============================================
const MOCK_SUMMARY = {
  week: { receitas: 8450.30, despesas: 3210.15, lucro: 5240.15, total_transacoes: 87 },
  month: { receitas: 42870.35, despesas: 18432.50, lucro: 24437.85, total_transacoes: 342 },
  year: { receitas: 512840.20, despesas: 218450.80, lucro: 294389.40, total_transacoes: 4128 },
};

const MOCK_FATURAMENTO_DIARIO = [
  { dia: '01/07', receita: 1850.40, despesa: 620.10 },
  { dia: '02/07', receita: 1920.55, despesa: 645.30 },
  { dia: '03/07', receita: 1780.25, despesa: 580.75 },
  { dia: '04/07', receita: 2050.80, despesa: 710.20 },
  { dia: '05/07', receita: 2180.60, despesa: 750.45 },
  { dia: '06/07', receita: 1350.30, despesa: 480.60 },
  { dia: '07/07', receita: 1220.15, despesa: 410.25 },
  { dia: '08/07', receita: 1890.70, despesa: 630.40 },
  { dia: '09/07', receita: 1960.45, despesa: 660.85 },
  { dia: '10/07', receita: 1750.30, despesa: 590.15 },
  { dia: '11/07', receita: 2100.55, despesa: 720.30 },
  { dia: '12/07', receita: 2200.80, despesa: 780.60 },
  { dia: '13/07', receita: 1280.20, despesa: 430.45 },
  { dia: '14/07', receita: 1250.40, despesa: 420.30 },
  { dia: '15/07', receita: 1870.65, despesa: 640.20 },
  { dia: '16/07', receita: 1940.30, despesa: 670.55 },
  { dia: '17/07', receita: 1810.45, despesa: 610.70 },
  { dia: '18/07', receita: 2080.90, despesa: 730.15 },
  { dia: '19/07', receita: 2150.25, despesa: 760.40 },
  { dia: '20/07', receita: 1310.80, despesa: 450.65 },
  { dia: '21/07', receita: 1240.55, despesa: 415.30 },
  { dia: '22/07', receita: 1900.30, despesa: 650.20 },
  { dia: '23/07', receita: 1980.75, despesa: 680.45 },
  { dia: '24/07', receita: 1790.40, despesa: 600.80 },
  { dia: '25/07', receita: 2120.60, despesa: 740.35 },
  { dia: '26/07', receita: 2190.85, despesa: 770.50 },
  { dia: '27/07', receita: 1270.20, despesa: 440.25 },
  { dia: '28/07', receita: 1230.45, despesa: 425.60 },
  { dia: '29/07', receita: 1880.35, despesa: 645.40 },
];

const MOCK_RECEITAS_POR_SEMANA = [
  { semana: 'Sem 1', receita: 12352.45, despesa: 4106.65 },
  { semana: 'Sem 2', receita: 11531.80, despesa: 3951.90 },
  { semana: 'Sem 3', receita: 11872.15, despesa: 4131.45 },
  { semana: 'Sem 4', receita: 7114.95, despesa: 2242.50 },
];

const MOCK_LUCRO_ACUMULADO = [
  { mes: 'Jan', lucro: 15200.00 },
  { mes: 'Fev', lucro: 38450.00 },
  { mes: 'Mar', lucro: 62100.00 },
  { mes: 'Abr', lucro: 89340.00 },
  { mes: 'Mai', lucro: 118750.00 },
  { mes: 'Jun', lucro: 145230.00 },
  { mes: 'Jul', lucro: 172840.00 },
  { mes: 'Ago', lucro: 198560.00 },
  { mes: 'Set', lucro: 224180.00 },
  { mes: 'Out', lucro: 248970.00 },
  { mes: 'Nov', lucro: 271640.00 },
  { mes: 'Dez', lucro: 294389.40 },
];

// =============================================
// Animated Counter Component
// =============================================
function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 2 }) {
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
// ChartTooltip
// =============================================
const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="chart-tooltip-value" style={{ color: p.color }}>
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

// =============================================
// Skeleton
// =============================================
function FinanceiroSkeleton() {
  return (
    <div className="financeiro-page">
      <div className="financeiro-header">
        <div>
          <div className="skeleton skeleton-h1" />
          <div className="skeleton skeleton-p" />
        </div>
      </div>
      <div className="financeiro-metrics">
        {[1, 2, 3].map((i) => (
          <div key={i} className="metric-card skeleton-card">
            <div className="skeleton skeleton-icon" />
            <div className="metric-content">
              <div className="skeleton skeleton-value" />
              <div className="skeleton skeleton-title" />
            </div>
          </div>
        ))}
      </div>
      <div className="financeiro-chart-section">
        <div className="skeleton skeleton-chart-title" style={{ marginBottom: '16px' }} />
        <div className="skeleton skeleton-chart" />
      </div>
    </div>
  );
}

// =============================================
// Period filter button config
// =============================================
const PERIODS = [
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mês' },
  { key: 'year', label: 'Ano' },
];

// =============================================
// Main Financeiro Page Component
// =============================================
export default function FinanceiroPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [period]);

  const formatCurrency = (value) =>
    `R$ ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const summary = MOCK_SUMMARY[period] || MOCK_SUMMARY.month;
  const receitas = summary.receitas || 0;
  const despesas = summary.despesas || 0;
  const lucro = summary.lucro || 0;
  const totalTransacoes = summary.total_transacoes || 0;

  const barData = MOCK_RECEITAS_POR_SEMANA;
  const lineData = MOCK_FATURAMENTO_DIARIO;
  const areaData = MOCK_LUCRO_ACUMULADO;

  const tickInterval = barData.length > 6 ? 1 : 0;

  const metricCards = useMemo(() => [
    {
      title: 'Receita Total',
      value: receitas,
      icon: TrendingUp,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      subtitle: 'total de receitas do período',
      prefix: 'R$ ',
      decimals: 2,
    },
    {
      title: 'Despesas Totais',
      value: despesas,
      icon: TrendingDown,
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      subtitle: 'total de despesas do período',
      prefix: 'R$ ',
      decimals: 2,
    },
    {
      title: 'Lucro Líquido',
      value: lucro,
      icon: DollarSign,
      color: '#fc6901',
      gradient: 'linear-gradient(135deg, #fc6901, #e55a00)',
      subtitle: 'receitas - despesas',
      prefix: 'R$ ',
      decimals: 2,
    },
  ], [receitas, despesas, lucro]);

  if (loading) return <FinanceiroSkeleton />;

  return (
    <div className="financeiro-page">
      {/* Header */}
      <div className="financeiro-header">
        <div>
          <h1>Financeiro</h1>
          <p>Resumo financeiro da operação</p>
        </div>
        <div className="financeiro-header-actions">
          <div className="period-filter">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                className={`period-btn ${period === p.key ? 'active' : ''}`}
                onClick={() => {
                  setLoading(true);
                  setPeriod(p.key);
                }}
              >
                {p.key === 'week' && <CalendarDays size={14} />}
                {p.key === 'month' && <BarChart3 size={14} />}
                {p.key === 'year' && <TrendingUp size={14} />}
                {p.label}
              </button>
            ))}
          </div>
          <button className="refresh-btn" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 400); }} title="Atualizar dados">
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Summary line */}
      <div className="financeiro-summary-bar">
        <Receipt size={16} />
        <span>
          <strong>{totalTransacoes}</strong> transações no período
        </span>
      </div>

      {/* Metrics Cards */}
      <div className="financeiro-metrics">
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

      {/* Gráfico de Linha — Faturamento Diário do Mês */}
      <div className="financeiro-chart-section">
        <div className="chart-section-header">
          <h3><Activity size={18} /> Faturamento Diário</h3>
          <div className="chart-legend-inline">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#10b981' }} />
              Receitas
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#ef4444' }} />
              Despesas
            </span>
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={280}>
            <ReLineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} stroke="var(--border)" axisLine={{ stroke: 'var(--border)', strokeOpacity: 0.5 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} stroke="var(--border)" tickFormatter={(v) => `R$${v}`} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v)} />} cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.5 }} />
              <Line type="monotone" dataKey="receita" name="Receitas" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="despesa" name="Despesas" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} activeDot={{ r: 5 }} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Barras — Receitas vs Despesas por Semana */}
      <div className="financeiro-chart-section">
        <div className="chart-section-header">
          <h3><ChartIcon size={18} /> Receitas vs Despesas por Semana</h3>
          <div className="chart-legend-inline">
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#10b981' }} />
              Receitas
            </span>
            <span className="legend-item">
              <span className="legend-dot" style={{ background: '#ef4444' }} />
              Despesas
            </span>
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} barGap={4} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="semana" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} stroke="var(--border)" interval={tickInterval} axisLine={{ stroke: 'var(--border)', strokeOpacity: 0.5 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} stroke="var(--border)" tickFormatter={(v) => `R$${v}`} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v)} />} cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.5 }} />
              <Bar dataKey="receita" name="Receitas" radius={[4, 4, 0, 0]} fill="#10b981" maxBarSize={48} />
              <Bar dataKey="despesa" name="Despesas" radius={[4, 4, 0, 0]} fill="#ef4444" maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Área — Lucro Acumulado do Ano */}
      <div className="financeiro-chart-section">
        <div className="chart-section-header">
          <h3><Activity size={18} /> Lucro Acumulado do Ano</h3>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={280}>
            <ReAreaChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }} stroke="var(--border)" axisLine={{ stroke: 'var(--border)', strokeOpacity: 0.5 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} stroke="var(--border)" tickFormatter={(v) => `R$${v}`} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip formatter={(v) => formatCurrency(v)} />} cursor={{ fill: 'var(--bg-tertiary)', opacity: 0.5 }} />
              <defs>
                <linearGradient id="lucroGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fc6901" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#fc6901" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="lucro" name="Lucro Acumulado" stroke="#fc6901" strokeWidth={2} fill="url(#lucroGradient)" dot={{ r: 3, fill: '#fc6901' }} activeDot={{ r: 5 }} />
            </ReAreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
