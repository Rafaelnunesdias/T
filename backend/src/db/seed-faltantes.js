import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function seed() {
  console.log('🌱 Populando tabelas faltantes...\n');

  const { data: bizs } = await supabase.from('businesses').select('*').limit(1);
  const biz = bizs?.[0];
  if (!biz) return console.log('❌ Sem negócios');

  // Motoboys
  const { data: existingMB } = await supabase.from('motoboys').select('id').limit(1);
  if (!existingMB?.length) {
    const motoboys = [
      { business_id: biz.id, name: 'Marcos Oliveira', phone: '(31) 99111-2222', is_available: true },
      { business_id: biz.id, name: 'Rafael Mendes', phone: '(31) 99222-3333', is_available: true },
      { business_id: biz.id, name: 'Tiago Alves', phone: '(31) 99333-4444', is_available: false },
    ];
    for (const m of motoboys) await supabase.from('motoboys').insert(m);
    console.log('✅ Motoboys');
  } else console.log('⚠️ Motoboys já existem');

  // Stock
  const { data: existingStock } = await supabase.from('stock').select('id').limit(1);
  if (!existingStock?.length) {
    const { data: prods } = await supabase.from('products').select('id');
    for (const p of prods || []) {
      await supabase.from('stock').insert({
        business_id: biz.id, product_id: p.id, quantity: Math.floor(Math.random() * 200 + 50), min_stock: 20
      });
    }
    console.log('✅ Stock');
  } else console.log('⚠️ Stock já existe');

  // Pedidos, order_items, transactions, production_orders
  const { data: orders } = await supabase.from('orders').select('*');
  const { data: prods } = await supabase.from('products').select('id, price');

  if (orders?.length) {
    // Order items que faltam
    const { data: existingOI } = await supabase.from('order_items').select('id').limit(1);
    if (!existingOI?.length) {
      for (const o of orders) {
        const prod = prods?.[Math.floor(Math.random() * (prods?.length || 1))];
        if (prod) {
          await supabase.from('order_items').insert({
            order_id: o.id, product_id: prod.id,
            quantity: Math.floor(Math.random() * 15 + 3), unit_price: prod.price || 5,
            subtotal: o.total
          });
        }
      }
      console.log('✅ Order Items');
    } else console.log('⚠️ Order Items já existem');

    // Transactions que faltam
    const { data: existingTx } = await supabase.from('transactions').select('id').limit(1);
    if (!existingTx?.length) {
      for (const o of orders) {
        if (o.status !== 'cancelado') {
          await supabase.from('transactions').insert({
            business_id: biz.id, type: 'receita', category: 'venda',
            amount: o.total, description: 'Venda', created_at: o.created_at
          });
        }
      }
      // Despesas
      for (let i = 0; i < 10; i++) {
        const d = new Date();
        d.setDate(d.getDate() - Math.floor(Math.random() * 30));
        await supabase.from('transactions').insert({
          business_id: biz.id, type: 'despesa', category: 'insumos',
          amount: Math.floor(Math.random() * 200 + 50),
          description: 'Compra de ingredientes', created_at: d.toISOString()
        });
      }
      console.log('✅ Transactions');
    } else console.log('⚠️ Transactions já existem');

    // Production orders
    const { data: existingPO } = await supabase.from('production_orders').select('id').limit(1);
    if (!existingPO?.length) {
      for (const o of orders) {
        if (['em_producao', 'recebido', 'saindo_entrega', 'entregue'].includes(o.status)) {
          await supabase.from('production_orders').insert({
            order_id: o.id, status: o.status === 'entregue' ? 'finalizado' : o.status,
            op_number: `OP-${new Date(o.created_at).getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`
          });
        }
      }
      console.log('✅ Production Orders');
    } else console.log('⚠️ Production Orders já existem');

    // Deliveries
    const { data: existingDel } = await supabase.from('deliveries').select('id').limit(1);
    if (!existingDel?.length) {
      const entregues = orders.filter(o => o.status === 'entregue' || o.status === 'saindo_entrega');
      for (const o of entregues) {
        await supabase.from('deliveries').insert({
          order_id: o.id, status: o.status === 'entregue' ? 'entregue' : 'em_rota',
          delivery_code: String(Math.floor(1000 + Math.random() * 9000))
        });
      }
      console.log('✅ Deliveries');
    } else console.log('⚠️ Deliveries já existem');
  }

  console.log('\n🎯 Seed concluído!');
}

seed();