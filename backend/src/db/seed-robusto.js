import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('🌱 Seed Robusto - XFlow ERP\n');

  // ============ GET BUSINESS ============
  const { data: bizs } = await supabase.from('businesses').select('*').limit(1);
  const biz = bizs?.[0];
  if (!biz) return console.log('❌ Nenhum negócio encontrado');
  console.log(`📦 Negócio: ${biz.name} (${biz.id})\n`);

  // ============ PRODUCTS (35 variedades) ============
  const { data: existingProds } = await supabase.from('products').select('id').limit(1);
  let prodList = [];
  if (!existingProds?.length) {
    const categories = [
      'Salgados Fritos', 'Salgados Assados', 'Doces', 'Bebidas', 'Combos'
    ];
    // Get or create categories
    const { data: cats } = await supabase.from('categories').select('*');
    let catMap = {};
    for (const c of cats || []) catMap[c.name] = c.id;

    if (Object.keys(catMap).length < 5) {
      for (const name of categories) {
        if (!catMap[name]) {
          const { data } = await supabase.from('categories').insert({ business_id: biz.id, name }).select().single();
          if (data) catMap[name] = data.id;
        }
      }
    }

    const products = [
      // Salgados Fritos
      { name: 'Coxinha de Frango', price: 6.50, category: 'Salgados Fritos' },
      { name: 'Coxinha de Catupiry', price: 7.00, category: 'Salgados Fritos' },
      { name: 'Kibe Frito', price: 5.50, category: 'Salgados Fritos' },
      { name: 'Bolinha de Queijo', price: 6.00, category: 'Salgados Fritos' },
      { name: 'Risólis de Carne', price: 5.50, category: 'Salgados Fritos' },
      { name: 'Pastel de Carne', price: 7.00, category: 'Salgados Fritos' },
      { name: 'Pastel de Frango', price: 7.00, category: 'Salgados Fritos' },
      { name: 'Bolinho de Bacalhau', price: 8.00, category: 'Salgados Fritos' },
      // Salgados Assados
      { name: 'Empada de Frango', price: 7.50, category: 'Salgados Assados' },
      { name: 'Empada de Palmito', price: 8.00, category: 'Salgados Assados' },
      { name: 'Esfirra de Carne', price: 6.50, category: 'Salgados Assados' },
      { name: 'Esfirra de Frango', price: 6.50, category: 'Salgados Assados' },
      { name: 'Enroladinho de Salsicha', price: 5.00, category: 'Salgados Assados' },
      { name: 'Pão de Queijo', price: 4.50, category: 'Salgados Assados' },
      { name: 'Folhado de Frango', price: 8.50, category: 'Salgados Assados' },
      { name: 'Folhado de Palmito', price: 9.00, category: 'Salgados Assados' },
      // Doces
      { name: 'Brigadeiro', price: 4.00, category: 'Doces' },
      { name: 'Beijinho', price: 4.00, category: 'Doces' },
      { name: 'Cajuzinho', price: 4.00, category: 'Doces' },
      { name: 'Torta de Limão (fatia)', price: 10.00, category: 'Doces' },
      { name: 'Pudim (fatia)', price: 9.00, category: 'Doces' },
      { name: 'Brownie', price: 7.00, category: 'Doces' },
      { name: 'Pastel de Nata', price: 6.00, category: 'Doces' },
      { name: 'Quindim', price: 5.00, category: 'Doces' },
      // Bebidas
      { name: 'Refrigerante Lata', price: 5.00, category: 'Bebidas' },
      { name: 'Suco Natural (copo)', price: 7.00, category: 'Bebidas' },
      { name: 'Água Mineral', price: 3.00, category: 'Bebidas' },
      { name: 'Café Expresso', price: 4.00, category: 'Bebidas' },
      { name: 'Café com Leite', price: 5.50, category: 'Bebidas' },
      { name: 'Chá Gelado', price: 6.00, category: 'Bebidas' },
      // Combos
      { name: 'Combo Coxinha + Refri', price: 10.00, category: 'Combos' },
      { name: 'Combo Empada + Suco', price: 13.00, category: 'Combos' },
      { name: 'Kit Festa (30 salgados)', price: 89.90, category: 'Combos' },
      { name: 'Kit Festa (50 salgados)', price: 139.90, category: 'Combos' },
      { name: 'Combo Família (100 salgados)', price: 259.90, category: 'Combos' },
    ];

    for (const p of products) {
      const { data } = await supabase.from('products').insert({
        business_id: biz.id,
        category_id: catMap[p.category] || null,
        name: p.name,
        price: p.price,
        description: p.category,
      }).select().single();
      if (data) prodList.push(data);
      console.log(`  ✅ ${p.name} - R$ ${p.price.toFixed(2)}`);
      await sleep(50);
    }
  } else {
    const { data: allProds } = await supabase.from('products').select('*');
    prodList = allProds || [];
  }
  console.log(`\n📦 ${prodList.length} produtos disponíveis\n`);

  // ============ CLIENTS (55+) ============
  const { data: existingClients } = await supabase.from('clients').select('id').limit(1);
  let clientList = [];
  if (!existingClients?.length) {
    const names = [
      'Escola Municipal Aprender', 'Tech Solutions Ltda', 'Restaurante Bom Paladar',
      'Padaria Pão Quente', 'Mercado São José', 'Escola Infantil Criança Feliz',
      'Carlos Eduardo Silva', 'Mariana Costa Santos', 'João Pedro Oliveira',
      'Ana Beatriz Lima', 'Lucas Almeida Neto', 'Juliana Ferreira Rocha',
      'Rafael Souza Martins', 'Fernanda Costa Pereira', 'Gabriel Santos Nunes',
      'Amanda Oliveira Dias', 'Bruno Henrique Lopes', 'Larissa Teixeira Melo',
      'Thiago Barbosa Reis', 'Vanessa Cardoso Araújo', 'Diego Ribeiro Campos',
      'Patrícia Monteiro Silva', 'Eduardo Correia Lima', 'Camila Rocha Nunes',
      'Felipe Azevedo Castro', 'Renata Moraes Pinto', 'André Luiz Teixeira',
      'Tatiane Oliveira Souza', 'Rodrigo Costa Alves', 'Priscila Santos Dias',
      'Marcelo Correia Neto', 'Luciana Martins Silva', 'Fernando Rocha Barbosa',
      'Érica Lima Teixeira', 'Gustavo Henrique Reis', 'Aline Pereira Monteiro',
      'Ricardo Souza Campos', 'Natália Oliveira Lopes', 'Leandro Costa Nunes',
      'Bruna Teixeira Rocha', 'Vinicius Santos Melo', 'Cristiane Dias Pinto',
      'Alexandre Barbosa Lima', 'Raquel Monteiro Alves', 'Daniel Rocha Castro',
      'Isabela Correia Santos', 'Hugo Martins Pereira', 'Tais Oliveira Souza',
      'Fábio Henrique Lopes', 'Lorena Teixeira Dias', 'Wagner Costa Reis',
      'Sabrina Santos Campos', 'Leonardo Rocha Monteiro', 'Michele Alves Nunes',
      'Caio Henrique Barbosa', 'Débora Lima Martins',
    ];

    for (const name of names) {
      const phone = `(31) 9${String(Math.floor(1000 + Math.random() * 9000))}-${String(Math.floor(1000 + Math.random() * 9000))}`;
      const { data } = await supabase.from('clients').insert({
        business_id: biz.id,
        name,
        phone,
        email: name.toLowerCase().replace(/[^a-z0-9]/g, '.') + '@email.com',
      }).select().single();
      if (data) clientList.push(data);
      await sleep(30);
    }
  } else {
    const { data: allClients } = await supabase.from('clients').select('*');
    clientList = allClients || [];
  }
  console.log(`👥 ${clientList.length} clientes disponíveis\n`);

  // ============ ORDERS (120+) ============
  const { data: existingOrders } = await supabase.from('orders').select('id').limit(1);
  if (!existingOrders?.length) {
    const statuses = ['recebido', 'em_producao', 'saindo_entrega', 'entregue', 'cancelado'];
    const now = new Date();

    for (let i = 0; i < 120; i++) {
      // Distribute over 90 days
      const created = new Date(now);
      created.setDate(created.getDate() - Math.floor(Math.random() * 90));
      created.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60));

      const status = i < 10 ? statuses[Math.floor(Math.random() * 2)] // recent = recebido/em_producao
        : statuses[Math.floor(Math.random() * 5)];

      const client = clientList[Math.floor(Math.random() * clientList.length)];
      const numItems = Math.floor(Math.random() * 4) + 1;
      let total = 0;
      const items = [];

      for (let j = 0; j < numItems; j++) {
        const prod = prodList[Math.floor(Math.random() * prodList.length)];
        const qty = Math.floor(Math.random() * 20) + 5;
        const price = prod?.price || 5;
        total += price * qty;
        items.push({ product_id: prod?.id, quantity: qty, price });
      }

      // Add delivery fee for orders over R$ 20
      if (total > 20) total += 5;

      const { data: order } = await supabase.from('orders').insert({
        business_id: biz.id,
        client_id: client?.id || clientList[0]?.id,
        total: Math.round(total * 100) / 100,
        status,
        notes: Math.random() > 0.7 ? 'Sem cebola' : null,
        created_at: created.toISOString(),
      }).select().single();

      if (order) {
        for (const item of items) {
          await supabase.from('order_items').insert({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          });
        }

        // Create production order
        await supabase.from('production_orders').insert({
          business_id: biz.id,
          order_id: order.id,
          op_number: `OP-${String(order.id).padStart(3, '0')}`,
          status: status === 'cancelado' ? 'cancelado' :
                  status === 'entregue' ? 'finalizado' :
                  status === 'saindo_entrega' ? 'finalizado' : status,
          created_at: created.toISOString(),
        });

        // Create transactions for non-canceled orders
        if (status !== 'cancelado') {
          await supabase.from('transactions').insert({
            business_id: biz.id,
            type: 'receita',
            amount: order.total,
            description: `Venda #${order.id}`,
            created_at: created.toISOString(),
          });
        }

        // Create deliveries for entregue/saindo_entrega
        if (status === 'entregue' || status === 'saindo_entrega') {
          await supabase.from('deliveries').insert({
            business_id: biz.id,
            order_id: order.id,
            status: status === 'entregue' ? 'entregue' : 'em_rota',
            created_at: created.toISOString(),
          });
        }

        if ((i + 1) % 20 === 0) console.log(`  📋 ${i + 1}/120 pedidos criados`);
      }
      await sleep(80);
    }
  }
  console.log('\n✅ Pedidos, itens, produção, transações e entregas criados\n');

  // ============ EXPENSE TRANSACTIONS ============
  const { data: existingExp } = await supabase.from('transactions').select('id').gt('amount', 0).eq('type', 'despesa').limit(1);
  if (!existingExp?.length) {
    const expenses = [
      'Compra de farinha e trigo', 'Compra de óleo de cozinha',
      'Compra de frango', 'Compra de carne moída',
      'Compra de queijo e catupiry', 'Compra de palmito',
      'Compra de açúcar e chocolate', 'Compra de embalagens',
      'Conta de luz', 'Conta de água', 'Gás de cozinha',
      'Manutenção equipamentos', 'Salário equipe', 'Aluguel',
      'Compra de refrigerantes', 'Compra de descartáveis',
      'Uniforme funcionários', 'Produtos de limpeza',
    ];
    const now = new Date();
    for (let i = 0; i < 40; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - Math.floor(Math.random() * 90));
      await supabase.from('transactions').insert({
        business_id: biz.id,
        type: 'despesa',
        amount: Math.floor(Math.random() * 500 + 50),
        description: expenses[Math.floor(Math.random() * expenses.length)],
        created_at: d.toISOString(),
      });
      await sleep(30);
    }
    console.log('✅ Despesas criadas\n');
  }

  // ============ STOCK ============
  const { data: existingStock } = await supabase.from('stock').select('id').limit(1);
  if (!existingStock?.length) {
    for (const prod of prodList.slice(0, 25)) {
      await supabase.from('stock').insert({
        business_id: biz.id,
        product_id: prod.id,
        quantity: Math.floor(Math.random() * 80) + 5,
      });
      await sleep(20);
    }
    console.log('✅ Estoque inicial criado\n');
  }

  // ============ MOTOBOYS ============
  const { data: existingMB } = await supabase.from('motoboys').select('id').limit(1);
  if (!existingMB?.length) {
    const motoboys = [
      { business_id: biz.id, name: 'Marcos Oliveira', phone: '(31) 99111-2222' },
      { business_id: biz.id, name: 'Rafael Mendes', phone: '(31) 99222-3333' },
      { business_id: biz.id, name: 'Tiago Alves', phone: '(31) 99333-4444' },
      { business_id: biz.id, name: 'Pedro Santos', phone: '(31) 99444-5555' },
      { business_id: biz.id, name: 'Lucas Costa', phone: '(31) 99555-6666' },
    ];
    for (const m of motoboys) {
      await supabase.from('motoboys').insert(m);
      await sleep(30);
    }
    console.log('✅ Motoboys criados');
  }

  console.log('\n🎉 Seed Robusto concluído com sucesso!');
}

run().catch(console.error);
