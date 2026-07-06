import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function seed() {
  console.log('🌱 Iniciando seed...\n');

  // 1. Pega o primeiro negócio
  const { data: bizs } = await supabase.from('businesses').select('*').limit(1);
  const biz = bizs?.[0];
  if (!biz) { console.log('❌ Sem negócios'); return; }
  console.log(`📦 Negócio: ${biz.name}\n`);

  // 2. Usuários (se não existirem)
  const { data: existing } = await supabase.from('users').select('email');
  const existingEmails = new Set(existing?.map(u => u.email) || []);

  const users = [
    { business_id: biz.id, email: 'admin@xsalgados.com', password_hash: 'admin123', role: 'admin' },
    { business_id: biz.id, email: 'producao@xsalgados.com', password_hash: 'producao123', role: 'producao' },
    { business_id: biz.id, email: 'financeiro@xsalgados.com', password_hash: 'financeiro123', role: 'financeiro' },
    { business_id: biz.id, email: 'atendente@xsalgados.com', password_hash: 'atendente123', role: 'atendente' },
    { business_id: biz.id, email: 'motoboy@xsalgados.com', password_hash: 'motoboy123', role: 'motoboy' }
  ];

  for (const u of users) {
    if (!existingEmails.has(u.email)) {
      await supabase.from('users').insert(u);
    }
  }
  console.log('✅ Usuários');

  // 3. Produtos (se não existirem)
  const { data: existingProducts } = await supabase.from('products').select('id');
  if (!existingProducts?.length) {
    const { data: cats } = await supabase.from('categories').select('*');
    const catMap = {};
    for (const c of cats || []) catMap[c.name] = c.id;

    const prods = [
      { name: 'Coxinha Frango', price: 6.50, cat: 'Coxinhas' },
      { name: 'Coxinha Carne', price: 7.00, cat: 'Coxinhas' },
      { name: 'Kibe Frito', price: 5.50, cat: 'Kibes' },
      { name: 'Empada Palmito', price: 8.00, cat: 'Empadas' },
      { name: 'Bolinha Queijo', price: 4.50, cat: 'Bolinhas' },
      { name: 'Combo Família', price: 45.00, cat: 'Combos' },
      { name: 'Coca-Cola 2L', price: 12.00, cat: 'Bebidas' },
    ];
    for (const p of prods) {
      await supabase.from('products').insert({
        business_id: biz.id, category_id: catMap[p.cat] || null,
        name: p.name, price: p.price, description: ''
      });
    }
    console.log('✅ Produtos');
  } else {
    console.log('✅ Produtos (já existem)');
  }

  // 4. Clientes (se não existirem)
  const { data: existingClients } = await supabase.from('clients').select('id');
  if (!existingClients?.length) {
    const names = ['Escola Aprender', 'Festa Infantil Ana', 'Tech Solutions', 'Carlos Eduardo', 'Mariana Costa', 'João Pedro', 'Ana Beatriz'];
    for (const name of names) {
      await supabase.from('clients').insert({
        business_id: biz.id, name, phone: String(31000000000 + Math.floor(Math.random() * 90000000))
      });
    }
    console.log('✅ Clientes');
  } else {
    console.log('✅ Clientes (já existem)');
  }

  // 5. Pedidos + Order Items + Transações (se não existirem)
  const { data: existingOrders } = await supabase.from('orders').select('id').limit(1);
  if (!existingOrders?.length) {
    const { data: clis } = await supabase.from('clients').select('id');
    const { data: prods } = await supabase.from('products').select('id, price');
    const now = new Date();
    const statuses = ['entregue', 'entregue', 'entregue', 'entregue', 'em_producao', 'recebido', 'saindo_entrega', 'entregue', 'entregue', 'cancelado'];

    for (let i = 0; i < 25; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - Math.floor(Math.random() * 30));
      d.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));

      const total = Math.floor(Math.random() * 200 + 30);
      const status = statuses[i % statuses.length];

      const { data: order } = await supabase.from('orders').insert({
        business_id: biz.id, client_id: clis?.[i % (clis?.length || 1)]?.id || null,
        total, status, created_at: d.toISOString()
      }).select().single();

      if (order) {
        // Order item
        const prod = prods?.[i % (prods?.length || 1)];
        if (prod) {
          await supabase.from('order_items').insert({
            order_id: order.id, product_id: prod.id,
            quantity: Math.floor(Math.random() * 15 + 3), unit_price: prod.price || 5,
            subtotal: total
          });
        }

        // Transaction
        if (status !== 'cancelado') {
          await supabase.from('transactions').insert({
            business_id: biz.id, type: 'receita', category: 'venda',
            amount: total, description: 'Venda de produtos', created_at: d.toISOString()
          });
        }

        // Production order
        if (['em_producao', 'recebido', 'saindo_entrega', 'entregue'].includes(status)) {
          await supabase.from('production_orders').insert({
            order_id: order.id, status: status === 'entregue' ? 'finalizado' : status,
            op_number: `OP-${d.getFullYear()}-${String(i + 1).padStart(6, '0')}`
          });
        }
      }
    }

    // Despesas
    for (let i = 0; i < 10; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - Math.floor(Math.random() * 30));
      await supabase.from('transactions').insert({
        business_id: biz.id, type: 'despesa', category: 'insumos',
        amount: Math.floor(Math.random() * 200 + 50),
        description: 'Compra de ingredientes', created_at: d.toISOString()
      });
    }

    console.log('✅ Pedidos + Transações + Order Items + Production Orders');
  } else {
    console.log('⚠️ Pedidos já existem, pulando...');
  }

  console.log('\n🎉 Seed concluído!');
  console.log('🔐 admin@xsalgados.com / admin123');
}

seed();