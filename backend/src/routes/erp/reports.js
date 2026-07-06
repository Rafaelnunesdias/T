import express from 'express';
import { supabase } from '../../config/supabase.js';
// Replicar middleware de autenticação/autorização (mesmo código de index.js)
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });
    const token = authHeader.split(' ')[1];
    const decoded = Buffer.from(token, 'base64').toString().split(':');
    const userId = decoded[0];
    const { data: user, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (error || !user) return res.status(401).json({ error: 'Usuário não autenticado' });
    req.user = user;
    next();
  } catch (e) { res.status(401).json({ error: 'Token inválido' }); }
};
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Permissão negada' });
    next();
  };
};
import { getDateRange, aggregate } from './reports/helpers.js';

const router = express.Router();

// Helper to parse period query
const parsePeriod = (req) => {
  const { period = '30d', start, end } = req.query;
  return getDateRange(period, start, end);
};

// Summary endpoint – reuse logic from dashboard
router.get('/summary', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { business_id } = req.user;
    const { from, to } = parsePeriod(req);
    // Orders within period
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('business_id', business_id)
      .gte('created_at', from)
      .lte('created_at', to);

    const vendasDia = orders?.filter(o => {
      const d = new Date(o.created_at);
      const today = new Date();
      return d.toDateString() === today.toDateString() && o.status !== 'cancelado';
    }).reduce((s, o) => s + Number(o.total || 0), 0) || 0;

    const vendasMes = orders?.filter(o => {
      const d = new Date(o.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && o.status !== 'cancelado';
    }).reduce((s, o) => s + Number(o.total || 0), 0) || 0;

    const pedidosAndamento = orders?.filter(o => ['recebido', 'em_producao'].includes(o.status)).length || 0;
    const entregasConcluidas = orders?.filter(o => o.status === 'entregue').length || 0;
    const entregasPendentes = orders?.filter(o => o.status === 'saindo_entrega').length || 0;
    const totalClientes = (await supabase.from('clients').select('id', { count: 'exact' }).eq('business_id', business_id)).count || 0;

    // Financial summary
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('business_id', business_id)
      .gte('created_at', from)
      .lte('created_at', to);
    const receita = transactions?.filter(t => t.type === 'receita').reduce((s, t) => s + Number(t.amount || 0), 0) || 0;
    const despesa = transactions?.filter(t => t.type === 'despesa').reduce((s, t) => s + Number(t.amount || 0), 0) || 0;
    const lucro = receita - despesa;

    res.json({
      metrics: {
        vendas_dia: vendasDia,
        vendas_mes: vendasMes,
        pedidos_andamento: pedidosAndamento,
        entregas_concluidas: entregasConcluidas,
        entregas_pendentes: entregasPendentes,
        total_clientes: totalClientes,
        receita,
        despesa,
        lucro,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Top products
router.get('/top-products', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { business_id } = req.user;
    const { from, to } = parsePeriod(req);
    const { data: items } = await supabase
      .from('order_items')
      .select('quantity, product_id, products(name)')
      .eq('business_id', business_id)
      .gte('created_at', from)
      .lte('created_at', to);
    const agg = {};
    (items || []).forEach(i => {
      const name = i.products?.name || 'Produto';
      agg[name] = (agg[name] || 0) + Number(i.quantity || 0);
    });
    const top = Object.entries(agg)
      .map(([name, qty]) => ({ name, value: qty }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    res.json({ data: top });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Peak hours
router.get('/peak-hours', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { business_id } = req.user;
    const { from, to } = parsePeriod(req);
    const { data: orders } = await supabase
      .from('orders')
      .select('created_at')
      .eq('business_id', business_id)
      .gte('created_at', from)
      .lte('created_at', to);
    const hourMap = {};
    (orders || []).forEach(o => {
      const d = new Date(o.created_at);
      const hour = d.getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });
    const result = Object.entries(hourMap)
      .map(([h, count]) => ({ hour: `${String(h).padStart(2, '0')}h`, value: count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
    res.json({ data: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Top clients
router.get('/top-clients', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { business_id } = req.user;
    const { from, to } = parsePeriod(req);
    const { data: orders } = await supabase
      .from('orders')
      .select('client_id, total')
      .eq('business_id', business_id)
      .gte('created_at', from)
      .lte('created_at', to);
    const clientAgg = {};
    (orders || []).forEach(o => {
      const id = o.client_id;
      if (!clientAgg[id]) clientAgg[id] = { total: 0, pedidos: 0 };
      clientAgg[id].total += Number(o.total || 0);
      clientAgg[id].pedidos += 1;
    });
    // Fetch client names
    const clientIds = Object.keys(clientAgg);
    const { data: clients } = await supabase.from('clients').select('id, name').in('id', clientIds);
    const mapName = {};
    (clients || []).forEach(c => { mapName[c.id] = c.name; });
    const top = clientIds.map(id => ({ name: mapName[id] || 'Cliente', total: clientAgg[id].total, pedidos: clientAgg[id].pedidos }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
    res.json({ data: top });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Regions (assume address table has region column)
router.get('/regions', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { business_id } = req.user;
    const { from, to } = parsePeriod(req);
    const { data: orders } = await supabase
      .from('orders')
      .select('client_id')
      .eq('business_id', business_id)
      .gte('created_at', from)
      .lte('created_at', to);
    const clientIds = [...new Set((orders || []).map(o => o.client_id))];
    const { data: clients } = await supabase.from('clients').select('id, address_id').in('id', clientIds);
    const addressIds = (clients || []).map(c => c.address_id).filter(Boolean);
    const { data: addresses } = await supabase.from('addresses').select('id, region').in('id', addressIds);
    const regionMap = {};
    addresses?.forEach(a => {
      const reg = a.region || 'Outros';
      regionMap[reg] = (regionMap[reg] || 0) + 1;
    });
    const result = Object.entries(regionMap).map(([region, count]) => ({ region, count }));
    res.json({ data: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Cancellations
router.get('/cancellations', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { business_id } = req.user;
    const { from, to } = parsePeriod(req);
    const { data: orders } = await supabase
      .from('orders')
      .select('status')
      .eq('business_id', business_id)
      .gte('created_at', from)
      .lte('created_at', to);
    const total = orders?.length || 0;
    const cancelados = orders?.filter(o => o.status === 'cancelado').length || 0;
    const taxa = total > 0 ? (cancelados / total) * 100 : 0;
    res.json({ total, cancelados, taxa_percentual: Number(taxa.toFixed(1)) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Logistics efficiency (tempo médio entrega por motoboy)
router.get('/logistics', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { business_id } = req.user;
    const { from, to } = parsePeriod(req);
    const { data: orders } = await supabase
      .from('orders')
      .select('motoboy_id, delivery_started_at, delivered_at')
      .eq('business_id', business_id)
      .gte('created_at', from)
      .lte('created_at', to);
    const byMotoboy = {};
    orders?.forEach(o => {
      if (!o.motoboy_id) return;
      const start = o.delivery_started_at ? new Date(o.delivery_started_at) : null;
      const end = o.delivered_at ? new Date(o.delivered_at) : null;
      if (start && end) {
        const mins = (end - start) / 60000;
        if (!byMotoboy[o.motoboy_id]) byMotoboy[o.motoboy_id] = { totalTempo: 0, entregas: 0 };
        byMotoboy[o.motoboy_id].totalTempo += mins;
        byMotoboy[o.motoboy_id].entregas += 1;
      }
    });
    const result = [];
    const motoboyIds = Object.keys(byMotoboy);
    if (motoboyIds.length) {
      const { data: mts } = await supabase.from('motoboys').select('id, name').in('id', motoboyIds);
      const nameMap = {};
      (mts || []).forEach(m => { nameMap[m.id] = m.name; });
      motoboyIds.forEach(id => {
        const { totalTempo, entregas } = byMotoboy[id];
        result.push({ name: nameMap[id] || 'Motoboy', tempo_medio: Number((totalTempo / entregas).toFixed(1)), entregas });
      });
    }
    res.json({ data: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
