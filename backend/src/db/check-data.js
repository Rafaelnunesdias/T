import { supabase } from '../config/supabase.js';

async function check() {
  console.log('=== CHECK SUPABASE DATA ===\n');

  // Businesses
  const { data: bizs } = await supabase.from('businesses').select('id, name');
  console.log('Negocios:', bizs?.length || 0);
  bizs?.forEach(b => console.log('  -', b.id, b.name));

  // Users
  const { data: users } = await supabase.from('users').select('id, name, email, role, business_id');
  console.log('\nUsuarios:', users?.length || 0);
  users?.forEach(u => console.log('  -', u.name, u.email, 'role:', u.role, 'biz:', u.business_id));

  // Clients
  const { data: clients } = await supabase.from('clients').select('id, name, phone, business_id').order('name');
  console.log('\nClientes:', clients?.length || 0);

  const nameCount = {};
  clients?.forEach(c => { nameCount[c.name] = (nameCount[c.name] || 0) + 1; });
  const dups = Object.entries(nameCount).filter(([n, c]) => c > 1);
  if (dups.length > 0) {
    console.log('\nCLIENTES DUPLICADOS:');
    for (const [name, count] of dups) {
      const dupClients = clients.filter(c => c.name === name);
      console.log(' ', name, `(${count}x):`, dupClients.map(c => c.id).join(', '));
    }
  } else {
    console.log('\nNenhum cliente duplicado');
  }

  // Stock
  const { data: stock } = await supabase.from('stock').select('id, product_id, quantity').limit(5);
  console.log('\nEstoque:', stock?.length > 0 ? stock.length + ' registros' : 'vazio');
  stock?.forEach(s => console.log('  - product_id:', s.product_id, 'qty:', s.quantity));

  // Deliveries
  const { data: deliveries } = await supabase.from('deliveries').select('id, status, order_id').limit(10);
  console.log('\nEntregas:', deliveries?.length || 0);
  deliveries?.slice(0, 5).forEach(d => console.log('  -', d.id, d.status, 'order:', d.order_id));

  // Motoboys
  const { data: motoboys } = await supabase.from('motoboys').select('id, name');
  console.log('\nMotoboys:', motoboys?.length || 0);
  motoboys?.forEach(m => console.log('  -', m.id, m.name));

  // Orders status distribution
  const { data: orders } = await supabase.from('orders').select('id, status');
  console.log('\nPedidos:', orders?.length || 0);
  const statusCount = {};
  orders?.forEach(o => { statusCount[o.status] = (statusCount[o.status] || 0) + 1; });
  Object.entries(statusCount).forEach(([s, c]) => console.log('  ', s, ':', c));

  console.log('\n=== FIM ===');
}

check().catch(console.error);
