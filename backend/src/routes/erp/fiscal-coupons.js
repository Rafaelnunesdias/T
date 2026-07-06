import express from 'express';
import { supabase } from '../../config/supabase.js';

const router = express.Router();

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

// GET /api/erp/fiscal — listar cupons com filtros
router.get('/', authenticate, async (req, res) => {
  try {
    const { business_id } = req.user;
    const { search, period } = req.query;

    let query = supabase
      .from('fiscal_coupons')
      .select('*')
      .eq('business_id', business_id)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`number.ilike.%${search}%,client_name.ilike.%${search}%,client_document.ilike.%${search}%`);
    }

    if (period) {
      const now = new Date();
      let startDate;
      if (period === 'today') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (period === 'week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
      }
      if (startDate) {
        query = query.gte('issued_at', startDate.toISOString());
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ coupons: data || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/erp/fiscal/:id — detalhe do cupom
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.user;

    const { data, error } = await supabase
      .from('fiscal_coupons')
      .select('*')
      .eq('id', id)
      .eq('business_id', business_id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Cupom não encontrado' });
    res.json({ coupon: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/erp/fiscal — criar cupom
router.post('/', authenticate, async (req, res) => {
  try {
    const { business_id } = req.user;
    const { client_name, client_document, client_phone, payment_method, items, discount, notes } = req.body;

    if (!client_name || !items || !items.length) {
      return res.status(400).json({ error: 'Cliente e itens são obrigatórios' });
    }

    // Gerar número sequencial
    const year = new Date().getFullYear();
    const { data: lastCoupon } = await supabase
      .from('fiscal_coupons')
      .select('number')
      .eq('business_id', business_id)
      .order('created_at', { ascending: false })
      .limit(1);

    let nextSeq = 1;
    if (lastCoupon?.length && lastCoupon[0]?.number) {
      const parts = lastCoupon[0].number.split('-');
      const lastNum = parseInt(parts[parts.length - 1] || '0', 10);
      nextSeq = lastNum + 1;
    }
    const number = `CF-${year}-${String(nextSeq).padStart(6, '0')}`;

    // Calcular totais
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const total = subtotal - Number(discount || 0);

    const { data: coupon, error } = await supabase.from('fiscal_coupons').insert({
      business_id,
      number,
      client_name,
      client_document: client_document || null,
      client_phone: client_phone || null,
      payment_method: payment_method || 'Dinheiro',
      items,
      subtotal,
      discount: Number(discount || 0),
      total,
      notes: notes || null,
      status: 'emitido',
      issued_at: new Date().toISOString(),
    }).select().single();

    if (error) throw error;

    // Registrar receita no financeiro
    await supabase.from('transactions').insert({
      business_id,
      type: 'receita',
      description: `Cupom ${number} - ${client_name}${payment_method ? ` - ${payment_method}` : ''}`,
      amount: total,
    });

    res.status(201).json({ coupon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/erp/fiscal/:id/cancel — cancelar cupom
router.patch('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.user;

    const { data: existing } = await supabase
      .from('fiscal_coupons')
      .select('*')
      .eq('id', id)
      .eq('business_id', business_id)
      .single();

    if (!existing) return res.status(404).json({ error: 'Cupom não encontrado' });
    if (existing.status === 'cancelado') return res.status(400).json({ error: 'Cupom já cancelado' });

    const { data: coupon, error } = await supabase
      .from('fiscal_coupons')
      .update({ status: 'cancelado' })
      .eq('id', id)
      .eq('business_id', business_id)
      .select()
      .single();

    if (error) throw error;

    // Estornar transação financeira
    await supabase.from('transactions').insert({
      business_id,
      type: 'despesa',
      description: `Estorno cupom ${existing.number} - ${existing.client_name}`,
      amount: existing.total,
    });

    res.json({ coupon });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
