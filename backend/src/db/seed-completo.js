import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function run() {
  console.log('🌱 Populando banco de dados...\n');

  const { data: bizs } = await supabase.from('businesses').select('*').limit(1);
  const biz = bizs?.[0];
  if (!biz) return console.log('❌ Sem negócios');
  console.log(`📦 Negócio: ${biz.name} (${biz.id})\n`);

  const { data: orders } = await supabase.from('orders').select('*');
  const { data: prods } = await supabase.from('products').select('*');
  if (!orders?.length || !prods?.length) return console.log('❌ Sem pedidos ou produtos');

  // ============ TRANSACTIONS ============
  const { data: existingTx } = await supabase.from('transactions').select('id').limit(1);
  if (!existingTx?.length) {
    for (const o of orders) {
      if (o.status !== 'cancelado') {
        await supabase.from('transactions').insert({
          business_id: biz.id, type: 'receita',
          amount: o.total, description: 'Venda de produtos',
          created_at: o.created_at
        });
      }
    }
    for (let i = 0; i < 10; i++) {
      const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 30));
      await supabase.from('transactions').insert({
        business_id: biz.id, type: 'despesa',
        amount: Math.floor(Math.random() * 200 + 50),
        description: 'Compra de ingredientes',
        created_at: d.toISOString()
      });
    }
    console.log('✅ Transactions');
  } else console.log('⚠️ Transactions já existem');

  // ============ ORDER ITEMS ============
  const { data: existingOI } = await supabase.from('order_items').select('id').limit(1);
  if (!existingOI?.length) {
    for (const o of orders) {
      const prod = prods[Math.floor(Math.random() * prods.length)];
      if (prod) {
        await supabase.from('order_items').insert({
          order_id: o.id, product_id: prod.id,
          quantity: Math.floor(Math.random() * 15 + 3), price: prod.price || 5
        });
      }
    }
    console.log('✅ Order Items');
  } else console.log('⚠️ Order Items já existem');

  // ============ MOTOBOYS ============
  const { data: existingMB } = await supabase.from('motoboys').select('id').limit(1);
  if (!existingMB?.length) {
    const motoboys = [
      { business_id: biz.id, name: 'Marcos Oliveira', phone: '(31) 99111-2222' },
      { business_id: biz.id, name: 'Rafael Mendes', phone: '(31) 99222-3333' },
      { business_id: biz.id, name: 'Tiago Alves', phone: '(31) 99333-4444' },
    ];
    for (const m of motoboys) await supabase.from('motoboys').insert(m);
    console.log('✅ Motoboys');
  } else console.log('⚠️ Motoboys já existem');

  // ============ DELIVERIES ============
  const { data: existingDel } = await supabase.from('deliveries').select('id').limit(1);
  if (!existingDel?.length) {
    for (const o of orders) {
      if (o.status === 'entregue' || o.status === 'saindo_entrega') {
        await supabase.from('deliveries').insert({
          business_id: biz.id, order_id: o.id,
          status: o.status === 'entregue' ? 'entregue' : 'em_rota'
        });
      }
    }
    console.log('✅ Deliveries');
  } else console.log('⚠️ Deliveries já existem');

  console.log('\n🎉 Seed concluído!');
}

run();