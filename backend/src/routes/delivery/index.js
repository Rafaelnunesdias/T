import express from 'express';
import { supabase } from '../../config/supabase.js';
import { verifyToken } from '../../middleware/jwtAuth.js';

const router = express.Router();

// Catálogo público de produtos
router.get('/products/public', async (req, res) => {
  try {
    const { business_id } = req.query;
    
    let query = supabase
      .from('products')
      .select('*, categories(name, icon)')
      .eq('available', true)
      .order('name');

    if (business_id) {
      query = query.eq('business_id', business_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ products: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Categorias
router.get('/categories', async (req, res) => {
  try {
    const { business_id } = req.query;
    
    let query = supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order');

    if (business_id) {
      query = query.eq('business_id', business_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ categories: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar pedido do cliente
router.post('/orders/client', verifyToken, async (req, res) => { // protected route
  // JWT verification middleware will run before this handler
  try {
    const { business_id, client_id, items, delivery_address_id, delivery_zone_id, payment_method, notes, delivery_fee = 0, discount = 0 } = req.body;

    // Gerar número do pedido
    const year = new Date().getFullYear();
    const { data: lastOrder } = await supabase
      .from('orders')
      .select('order_number')
      .eq('business_id', business_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const sequence = lastOrder ? parseInt(lastOrder.order_number.split('-')[2]) + 1 : 1;
    const orderNumber = `${year}-${sequence.toString().padStart(6, '0')}`;
    const opNumber = `OP-${year}-${sequence.toString().padStart(6, '0')}`;

    // Calcular totais
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + delivery_fee - discount;

    // Gerar código de entrega (últimos 4 dígitos do telefone)
    const { data: client } = await supabase
      .from('clients')
      .select('phone')
      .eq('id', client_id)
      .single();

    const deliveryCode = client?.phone?.slice(-4) || '0000';

    // Criar pedido
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        business_id,
        client_id,
        order_number: orderNumber,
        op_number: opNumber,
        subtotal,
        delivery_fee,
        discount,
        total,
        payment_method,
        notes,
        delivery_address_id,
        delivery_zone_id,
        delivery_code,
        status: 'recebido'
      })
      .select()
      .single();

    if (error) throw error;

    // Criar itens do pedido
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity,
      notes: item.notes
    }));

    await supabase.from('order_items').insert(orderItems);

    // Criar ordem de produção
    await supabase.from('production_orders').insert({
      order_id: order.id,
      op_number: opNumber,
      status: 'recebido'
    });

    res.json({ order, op_number: opNumber, delivery_code });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rastrear pedido
router.get('/orders/client/:id/track', async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id } = req.query;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, image_url)), motoboys(name, current_latitude, current_longitude)')
      .eq('id', id)
      .eq('client_id', client_id)
      .single();

    if (error) throw error;

    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calcular frete
router.get('/delivery/estimate', async (req, res) => {
  try {
    const { business_id, latitude, longitude } = req.query;

    // Calcular distância (simulação - em produção usar API de mapas)
    const distance = 5; // km simulado

    // Buscar zona de entrega
    const { data: zone } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('business_id', business_id)
      .gte('min_distance', distance)
      .lte('max_distance', distance)
      .single();

    const price = zone?.price || 0;

    res.json({ distance, price, zone_name: zone?.name || 'Não definido' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;