import express from 'express';
import { supabase } from '../../config/supabase.js';
import logisticsRouter from './logistics.js';
import reportsRouter from './reports.js';
import fiscalCouponsRouter from './fiscal-coupons.js';

const router = express.Router();

// =============================================
// Middleware de Autenticação
// =============================================
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = Buffer.from(token, 'base64').toString().split(':');
    const userId = decoded[0];

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Permissão negada' });
    next();
  };
};

// =============================================
// DASHBOARD
// =============================================
router.get('/dashboard', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { business_id } = req.user;

    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('business_id', business_id);

    const { data: clients } = await supabase
      .from('clients')
      .select('id')
      .eq('business_id', business_id);

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*, products(name)');

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('business_id', business_id);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const vendasDia = orders?.filter(o =>
      new Date(o.created_at) >= todayStart && o.status !== 'cancelado'
    ).reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;

    const vendasMes = orders?.filter(o =>
      new Date(o.created_at) >= monthStart && o.status !== 'cancelado'
    ).reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;

    const pedidosAndamento = orders?.filter(o =>
      ['recebido', 'em_producao'].includes(o.status)
    ).length || 0;

    const entregasConcluidas = orders?.filter(o => o.status === 'entregue').length || 0;
    const entregasPendentes = orders?.filter(o => o.status === 'saindo_entrega').length || 0;
    const totalClientes = clients?.length || 0;

    // Faturamento últimos 30 dias
    const faturamento30d = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const dayOrders = orders?.filter(o => {
        const oDate = new Date(o.created_at).toISOString().split('T')[0];
        return oDate === dayStr && o.status !== 'cancelado';
      }) || [];
      faturamento30d.push({ date: dayStr, total: dayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0) });
    }

    // Pedidos por hora
    const pedidosPorHora = Array.from({ length: 24 }, (_, i) => ({
      hour: `${String(i).padStart(2, '0')}:00`,
      count: orders?.filter(o => new Date(o.created_at).getHours() === i).length || 0
    }));

    // Top produtos
    const productSales = {};
    if (orderItems) {
      orderItems.forEach(item => {
        const name = item.products?.name || 'Produto';
        productSales[name] = (productSales[name] || 0) + Number(item.quantity || 1);
      });
    }
    const topProducts = Object.entries(productSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Financeiro
    const despesasMes = transactions?.filter(t =>
      t.type === 'despesa' && new Date(t.created_at) >= monthStart
    ).reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;

    const receitaMes = vendasMes;
    const lucroMes = receitaMes - despesasMes;

    res.json({
      metrics: { vendas_dia: vendasDia, vendas_mes: vendasMes, pedidos_andamento: pedidosAndamento, entregas_concluidas: entregasConcluidas, entregas_pendentes: entregasPendentes, total_clientes: totalClientes },
      charts: { faturamento_30d: faturamento30d, pedidos_por_hora: pedidosPorHora, produtos_mais_vendidos: topProducts, lucro_vs_despesas: { lucro: lucroMes, despesas: despesasMes, receita: receitaMes } }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// PEDIDOS
// =============================================

// A tabela orders tem: id, business_id, client_id, total, status, created_at
// Os metadados extras (payment_method, notes, op_number) ficam em production_orders e transactions

router.get('/orders', authenticate, async (req, res) => {
  try {
    const { business_id } = req.user;
    const { status, search, page = 1, limit = 50 } = req.query;

    let query = supabase
      .from('orders')
      .select('*, clients(name, phone)', { count: 'exact' })
      .eq('business_id', business_id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`clients.name.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    // Enriquecer com OP number de production_orders
    const enriched = await Promise.all((data || []).map(async (order) => {
      const { data: prod } = await supabase
        .from('production_orders')
        .select('op_number, status')
        .eq('order_id', order.id)
        .single();
      return { ...order, op_number: prod?.op_number || null, production_status: prod?.status || null };
    }));

    res.json({ orders: enriched, total: count, page, totalPages: Math.ceil((count || 0) / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/erp/orders/:id — detalhe completo do pedido
router.get('/orders/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.user;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, clients(*), order_items(*, products(*))')
      .eq('id', id)
      .eq('business_id', business_id)
      .single();

    if (error) throw error;
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

    // Buscar produção
    const { data: production } = await supabase
      .from('production_orders')
      .select('*')
      .eq('order_id', id)
      .single();

    // Buscar transações
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('business_id', business_id)
      .ilike('description', `Venda #${id}%`)
      .order('created_at', { ascending: false });

    // Buscar delivery se existir
    const { data: delivery } = await supabase
      .from('deliveries')
      .select('*')
      .eq('order_id', id)
      .single();

    res.json({
      order: {
        ...order,
        op_number: production?.op_number || null,
        production: production || null,
        transactions: transactions || [],
        delivery: delivery || null
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/erp/orders/:id/status — atualizar status do pedido
router.patch('/orders/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.user;
    const { status } = req.body;

    const validStatuses = ['recebido', 'em_producao', 'finalizado', 'saindo_entrega', 'entregue', 'cancelado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .eq('business_id', business_id)
      .select()
      .single();

    if (error) throw error;

    // Sincronizar produção
    const statusMap = { recebido: 'recebido', em_producao: 'em_producao', finalizado: 'finalizado' };
    if (statusMap[status]) {
      await supabase
        .from('production_orders')
        .update({ status: statusMap[status] })
        .eq('order_id', id);
    }

    // Se cancelado, deletar transação financeira
    if (status === 'cancelado') {
      await supabase
        .from('transactions')
        .delete()
        .eq('business_id', business_id)
        .ilike('description', `Venda #${id}%`);
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/orders', authenticate, async (req, res) => {
  try {
    const { business_id } = req.user;
    const { client_id, items, payment_method, notes, total } = req.body;

    if (!client_id || !items || !items.length || !total) {
      return res.status(400).json({ error: 'Cliente, itens e total são obrigatórios' });
    }

    // Gerar número sequencial da OP
    const { data: lastProd } = await supabase
      .from('production_orders')
      .select('op_number')
      .order('created_at', { ascending: false })
      .limit(1);

    let nextSeq = 1;
    if (lastProd?.length && lastProd[0]?.op_number) {
      const parts = lastProd[0].op_number.split('-');
      const lastNum = parseInt(parts[parts.length - 1] || '0', 10);
      nextSeq = lastNum + 1;
    } else {
      // Tentar pegar o maior ID
      const { data: maxOrder } = await supabase
        .from('orders')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1);
      if (maxOrder?.length) nextSeq = parseInt(maxOrder[0].id.slice(0, 8), 16) % 1000000 || 1;
    }

    const year = new Date().getFullYear();
    const opNumber = `OP-${year}-${String(nextSeq).padStart(6, '0')}`;

    // Inserir pedido (apenas colunas que existem)
    const { data: order, error } = await supabase.from('orders').insert({
      business_id,
      client_id,
      total,
      status: 'recebido'
    }).select().single();

    if (error) throw error;

    // Criar itens do pedido
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity || 1,
      price: item.price || 0
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // Criar produção com OP number e metadados
    const { error: prodError } = await supabase.from('production_orders').insert({
      business_id,
      order_id: order.id,
      op_number: opNumber,
      status: 'recebido'
    });
    if (prodError) throw prodError;

    // Registrar transação financeira
    const { error: txError } = await supabase.from('transactions').insert({
      business_id,
      type: 'receita',
      description: `Venda #${order.id}${payment_method ? ` - ${payment_method}` : ''}${notes ? ` | ${notes}` : ''}`,
      amount: total
    });
    if (txError) throw txError;

    // Baixar estoque (opcional — não crítico)
    for (const item of items) {
      if (!item.product_id) continue;
      const { data: stock } = await supabase
        .from('stock')
        .select('*')
        .eq('business_id', business_id)
        .eq('product_id', item.product_id)
        .single();

      if (stock) {
        const newQty = Math.max(0, stock.quantity - (item.quantity || 1));
        await supabase.from('stock').update({ quantity: newQty }).eq('id', stock.id);

        await supabase.from('stock_movements').insert({
          product_id: item.product_id,
          quantity: -(item.quantity || 1),
          type: 'saida',
          description: `Baixa por venda #${order.id}`
        });
      }
    }

    res.status(201).json({
      order: { ...order, op_number: opNumber },
      op_number: opNumber
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// PRODUÇÃO / KANBAN
// =============================================
router.get('/production-orders', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from('production_orders')
      .select('*, orders!inner(*, clients(name, phone), order_items(*, products(name)))')
      .eq('orders.business_id', req.user.business_id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    res.json({ production_orders: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/production-orders/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('production_orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Atualizar status do pedido também
    const statusMap = { recebido: 'recebido', em_producao: 'em_producao', finalizado: 'finalizado' };
    if (data?.order_id && statusMap[status]) {
      await supabase.from('orders').update({ status: statusMap[status] }).eq('id', data.order_id);
    }

    res.json({ production_order: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// PRODUTOS
// =============================================
router.get('/products', authenticate, async (req, res) => {
  try {
    const { business_id } = req.user;
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('business_id', business_id)
      .order('name');
    if (error) throw error;
    res.json({ products: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// CLIENTES
// =============================================
router.get('/clients', authenticate, async (req, res) => {
  try {
    const { business_id } = req.user;
    const { search } = req.query;

    let query = supabase
      .from('clients')
      .select('*')
      .eq('business_id', business_id)
      .order('name');

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Enriquecer com total de pedidos e gastos
    const enriched = await Promise.all((data || []).map(async (client) => {
      const { data: clientOrders } = await supabase
        .from('orders')
        .select('total')
        .eq('business_id', business_id)
        .eq('client_id', client.id);
      const totalGasto = (clientOrders || []).reduce((s, o) => s + Number(o.total || 0), 0);
      return { ...client, total_pedidos: clientOrders?.length || 0, total_gasto: totalGasto };
    }));

    res.json({ clients: enriched });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/clients/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.user;

    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('business_id', business_id)
      .single();
    if (error) throw error;

    const { data: orders } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name))')
      .eq('client_id', id)
      .eq('business_id', business_id)
      .order('created_at', { ascending: false })
      .limit(10);

    const totalGasto = (orders || []).reduce((s, o) => s + Number(o.total || 0), 0);

    res.json({ client: { ...client, total_pedidos: orders?.length || 0, total_gasto: totalGasto, ultimos_pedidos: orders || [] } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/erp/clients/:id/favorites — produtos favoritos do cliente
router.get('/clients/:id/favorites', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.user;

    const { data: orders } = await supabase
      .from('orders')
      .select('*, order_items!inner(*, products(name, price))')
      .eq('client_id', id)
      .eq('business_id', business_id);

    const productCount = {};
    (orders || []).forEach(order => {
      (order.order_items || []).forEach(item => {
        const pid = item.product_id;
        if (!pid) return;
        if (!productCount[pid]) {
          productCount[pid] = { ...item.products, count: 0, total: 0 };
        }
        productCount[pid].count += Number(item.quantity || 1);
        productCount[pid].total += Number(item.price || 0) * Number(item.quantity || 1);
      });
    });

    const favorites = Object.entries(productCount)
      .map(([product_id, p]) => ({ product_id, ...p }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json({ favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/erp/clients/:id/addresses — endereços do cliente
router.get('/clients/:id/addresses', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ addresses: data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/clients/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.user;
    const { name, phone } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .eq('business_id', business_id)
      .select()
      .single();

    if (error) throw error;
    res.json({ client: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// ESTOQUE
// =============================================
router.get('/stock', authenticate, async (req, res) => {
  try {
    const { business_id } = req.user;
    const { data, error } = await supabase
      .from('stock')
      .select('*, products(name, price)')
      .eq('business_id', business_id)
      .order('products(name)');
    if (error) throw error;
    res.json({ stock: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stock/movements', authenticate, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const { data, error } = await supabase
      .from('stock_movements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Enrich with product names
    const enriched = await Promise.all((data || []).map(async (m) => {
      const { data: prod } = await supabase
        .from('products')
        .select('name')
        .eq('id', m.product_id)
        .single();
      return { ...m, products: prod || { name: 'Produto' } };
    }));

    res.json({ movements: enriched || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/stock/movements', authenticate, async (req, res) => {
  try {
    const { business_id } = req.user;
    const { product_id, quantity, type, description } = req.body;

    const qty = type === 'saida' ? -Math.abs(quantity) : Math.abs(quantity);

    // Registrar movimento
    const { data, error } = await supabase.from('stock_movements').insert({
      product_id, quantity: qty, type: type || 'entrada',
      description: description || (type === 'saida' ? 'Saída manual' : 'Entrada manual')
    }).select();
    if (error) throw error;

    // Atualizar estoque
    const { data: stock } = await supabase.from('stock')
      .select('*')
      .eq('business_id', business_id)
      .eq('product_id', product_id)
      .single();

    if (stock) {
      await supabase.from('stock')
        .update({ quantity: stock.quantity + qty })
        .eq('id', stock.id);
    } else {
      await supabase.from('stock').insert({
        business_id, product_id, quantity: qty
      });
    }

    res.json({ movement: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// FINANCEIRO
// =============================================
router.get('/financeiro/summary', authenticate, async (req, res) => {
  try {
    const { business_id } = req.user;
    const { period = 'month' } = req.query;

    const now = new Date();
    let startDate;
    if (period === 'month') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (period === 'week') { startDate = new Date(now); startDate.setDate(now.getDate() - 7); }
    else if (period === 'year') startDate = new Date(now.getFullYear(), 0, 1);
    else { startDate = new Date(0); }

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('business_id', business_id)
      .gte('created_at', startDate.toISOString());

    const receitas = transactions?.filter(t => t.type === 'receita')
      .reduce((s, t) => s + Number(t.amount || 0), 0) || 0;
    const despesas = transactions?.filter(t => t.type === 'despesa')
      .reduce((s, t) => s + Number(t.amount || 0), 0) || 0;

    // Receitas/Despesas por semana (4 semanas)
    const semanas = [];
    for (let i = 3; i >= 0; i--) {
      const wStart = new Date(now);
      wStart.setDate(wStart.getDate() - (i * 7) - 6);
      const wEnd = new Date(now);
      wEnd.setDate(wEnd.getDate() - (i * 7));

      const weekTxs = transactions?.filter(t => {
        const d = new Date(t.created_at);
        return d >= wStart && d <= wEnd;
      }) || [];

      semanas.push({
        semana: `Sem ${4 - i}`,
        receita: weekTxs.filter(t => t.type === 'receita').reduce((s, t) => s + Number(t.amount || 0), 0),
        despesa: weekTxs.filter(t => t.type === 'despesa').reduce((s, t) => s + Number(t.amount || 0), 0),
      });
    }

    // Faturamento diário do mês (para gráfico de linha)
    const faturamentoDiario = [];
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let i = 0; i < daysInMonth; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
      const dayStr = d.toISOString().split('T')[0];
      const dayTxs = transactions?.filter(t => {
        const td = new Date(t.created_at).toISOString().split('T')[0];
        return td === dayStr;
      }) || [];
      faturamentoDiario.push({
        dia: String(i + 1).padStart(2, '0'),
        receita: dayTxs.filter(t => t.type === 'receita').reduce((s, t) => s + Number(t.amount || 0), 0),
        despesa: dayTxs.filter(t => t.type === 'despesa').reduce((s, t) => s + Number(t.amount || 0), 0),
      });
    }

    // Lucro acumulado do ano (para gráfico de área)
    const lucroAcumulado = [];
    let accumulated = 0;
    for (let m = 0; m < 12; m++) {
      const mStart = new Date(now.getFullYear(), m, 1);
      const mEnd = new Date(now.getFullYear(), m + 1, 0, 23, 59, 59);
      const monthTxs = transactions?.filter(t => {
        const d = new Date(t.created_at);
        return d >= mStart && d <= mEnd;
      }) || [];
      const monthReceita = monthTxs.filter(t => t.type === 'receita').reduce((s, t) => s + Number(t.amount || 0), 0);
      const monthDespesa = monthTxs.filter(t => t.type === 'despesa').reduce((s, t) => s + Number(t.amount || 0), 0);
      accumulated += (monthReceita - monthDespesa);
      const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
      lucroAcumulado.push({ mes: months[m], lucro: accumulated });
    }

    res.json({
      receitas, despesas, lucro: receitas - despesas,
      total_transacoes: transactions?.length || 0,
      receitas_por_semana: semanas,
      faturamento_diario: faturamentoDiario,
      lucro_acumulado: lucroAcumulado
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.use('/logistics', logisticsRouter);
router.use('/reports', reportsRouter);
router.use('/fiscal', fiscalCouponsRouter);

// GET /api/erp/users/:id — obter dados do usuário (para o AuthContext)
router.get('/users/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, business_id')
      .eq('id', id)
      .single();
    if (error) throw error;
    res.json({ user });
  } catch (error) {
    res.status(404).json({ error: 'Usuário não encontrado' });
  }
});

export default router;