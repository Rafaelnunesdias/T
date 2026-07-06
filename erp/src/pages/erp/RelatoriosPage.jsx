import { useState, useEffect } from 'react';
import { FileBarChart, TrendingUp, Users, ShoppingCart, Truck, Percent, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import './RelatoriosPage.css';

const COLORS = ['#fc6901', '#7b4b34', '#54240d', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];


export default function RelatoriosPage() {
  const [period, setPeriod] = useState('30d');
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cancellations, setCancellations] = useState(null);
  const [logistics, setLogistics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryRes, topProductsRes, peakHoursRes, topClientsRes, regionsRes, cancellationsRes, logisticsRes] = await Promise.all([
          api.get('/erp/reports/summary', { params: { period } }),
          api.get('/erp/reports/top-products', { params: { period } }),
          api.get('/erp/reports/peak-hours', { params: { period } }),
          api.get('/erp/reports/top-clients', { params: { period } }),
          api.get('/erp/reports/regions', { params: { period } }),
          api.get('/erp/reports/cancellations', { params: { period } }),
          api.get('/erp/reports/logistics', { params: { period } }),
        ]);
        setSummary(summaryRes.data.metrics);
        setTopProducts(topProductsRes.data.data);
        setPeakHours(peakHoursRes.data.data);
        setTopClients(topClientsRes.data.data);
        setRegions(regionsRes.data.data);
        setCancellations(cancellationsRes.data);
        setLogistics(logisticsRes.data.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  // Extract summary fields
  const { vendas_dia, vendas_mes, pedidos_andamento, entregas_concluidas, entregas_pendentes, total_clientes, receita, despesa, lucro } = summary || {};

  return (
    <div className="relatorios-page">
      <div className="relatorios-header">
        <div>
          <h1>Relatórios</h1>
          <p>Indicadores de desempenho do negócio</p>
        </div>
        <div className="period-filters">
          {['today', '7d', '30d', 'month', 'custom'].map(p => (
            <button key={p} className={`period-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {{ today: 'Hoje', '7d': '7 Dias', '30d': '30 Dias', month: 'Mês', custom: 'Personalizar' }[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card"><TrendingUp size={20} color="#10b981" /><div><strong>R$ {vendas_dia?.toFixed(2) || 0}</strong><span>Vendas Hoje</span></div></div>
        <div className="kpi-card"><Percent size={20} color="#ef4444" /><div><strong>{cancellations?.taxa_percentual?.toFixed(1) || 0}%</strong><span>Taxa Cancelamento</span></div></div>
        <div className="kpi-card"><Clock size={20} color="#3b82f6" /><div><strong>{logistics?.[0]?.tempo_medio?.toFixed(1) || 0} min</strong><span>Tempo Médio Entrega</span></div></div>
        <div className="kpi-card"><Users size={20} color="#8b5cf6" /><div><strong>{total_clientes || 0}</strong><span>Clientes Ativos</span></div></div>
      </div>

      <div className="relatorios-grid">
        <div className="report-card">
          <h3>Top 5 Produtos Mais Vendidos</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} stroke="var(--border)" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} stroke="var(--border)" width={100} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="report-card">
          <h3>Horários de Pico</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} stroke="var(--border)" />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} stroke="var(--border)" />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#fc6901" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="report-card">
          <h3>Regiões com Mais Pedidos</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={[{ name: 'Centro', value: 35 }, { name: 'Savassi', value: 25 }, { name: 'Pampulha', value: 18 }, { name: 'Lourdes', value: 12 }, { name: 'Outros', value: 10 }]} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {[0,1,2,3,4].map(i => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="report-card">
          <h3>Top Clientes por Faturamento</h3>
          <div className="top-clients-table">
            {topClients.map((c, i) => (
              <div key={i} className="top-client-row">
                <span className="client-rank">{i + 1}</span>
                <span className="client-name">{c.name}</span>
                <span className="client-orders">{c.pedidos} pedidos</span>
                <span className="client-total">R$ {c.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-card full-width">
          <h3>Eficiência Logística</h3>
          <table className="eficiencia-table">
            <thead><tr><th>Motoboy</th><th>Tempo Médio</th><th>Entregas</th></tr></thead>
            <tbody>
              {logistics.map((m, i) => (
                <tr key={i}><td>{m.name}</td><td>{m.tempo_medio} min</td><td>{m.entregas}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}