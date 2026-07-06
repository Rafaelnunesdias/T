import { supabase } from '../config/supabase.js';

async function fix() {
  console.log('=== LIMPEZA DE DUPLICATAS ===\n');

  // ============ 1. FIX BUSINESS DUPLICATES ============
  const { data: bizs } = await supabase.from('businesses').select('id, name').order('name');
  console.log('Negocios:', bizs?.length || 0);

  // Keep the real ones, delete "Restaurante Sabor & Arte" duplicates (keep first one)
  const bizByName = {};
  const bizToDelete = [];
  for (const b of bizs || []) {
    if (bizByName[b.name]) {
      bizToDelete.push(b.id);
    } else {
      bizByName[b.name] = b.id;
    }
  }

  // Find the real business to use (Fábrica de Salgados)
  const fabricaBiz = bizs.find(b => b.name === 'Fábrica de Salgados');
  const mainBizId = fabricaBiz?.id || bizs?.[0]?.id;
  console.log('Negocio principal:', mainBizId);

  if (bizToDelete.length > 0) {
    console.log('\nDeletando negocios duplicados:', bizToDelete.length);
    for (const id of bizToDelete) {
      // Reassign orphan data to main business
      await supabase.from('users').update({ business_id: mainBizId }).eq('business_id', id);
      await supabase.from('clients').update({ business_id: mainBizId }).eq('business_id', id);
      await supabase.from('products').update({ business_id: mainBizId }).eq('business_id', id);
      await supabase.from('orders').update({ business_id: mainBizId }).eq('business_id', id);
      await supabase.from('transactions').update({ business_id: mainBizId }).eq('business_id', id);
      await supabase.from('motoboys').update({ business_id: mainBizId }).eq('business_id', id);
      await supabase.from('stock').update({ business_id: mainBizId }).eq('business_id', id);
      await supabase.from('delivery_zones').update({ business_id: mainBizId }).eq('business_id', id);

      // Delete from production_orders via orders
      const { data: ords } = await supabase.from('orders').select('id').eq('business_id', id);
      for (const o of ords || []) {
        await supabase.from('production_orders').delete().eq('order_id', o.id);
        await supabase.from('order_items').delete().eq('order_id', o.id);
        await supabase.from('deliveries').delete().eq('order_id', o.id);
      }
      await supabase.from('orders').delete().eq('business_id', id);
      await supabase.from('products').delete().eq('business_id', id);
      await supabase.from('clients').delete().eq('business_id', id);
      await supabase.from('transactions').delete().eq('business_id', id);
      await supabase.from('motoboys').delete().eq('business_id', id);
      await supabase.from('stock').delete().eq('business_id', id);

      await supabase.from('businesses').delete().eq('id', id);
      console.log('  Deletado business:', id);
    }
    console.log('Negocios duplicados removidos');
  } else {
    console.log('Nenhum negocio duplicado');
  }

  // ============ 2. FIX CLIENT DUPLICATES ============
  const { data: clients } = await supabase.from('clients').select('id, name, phone, business_id').order('name');
  console.log('\nTotal clientes:', clients?.length || 0);

  // Group by name, keep first occurrence with most data, delete rest
  const seen = {};
  const clientToDelete = [];

  for (const c of clients || []) {
    if (seen[c.name]) {
      clientToDelete.push(c.id);
    } else {
      seen[c.name] = c.id;
    }
  }

  if (clientToDelete.length > 0) {
    console.log('Deletando clientes duplicados:', clientToDelete.length);

    // Reassign orders from duplicate clients to kept ones
    for (const dupId of clientToDelete) {
      const origName = clients.find(c => c.id === dupId)?.name;
      const keepId = seen[origName];

      if (keepId && keepId !== dupId) {
        await supabase.from('orders').update({ client_id: keepId }).eq('client_id', dupId);
      }

      await supabase.from('clients').delete().eq('id', dupId);
    }
    console.log('Clientes duplicados removidos');
  } else {
    console.log('Nenhum cliente duplicado');
  }

  // ============ 3. ENSURE MOTOBOYS ============
  const { data: motoboys } = await supabase.from('motoboys').select('id');
  console.log('\nMotoboys atuais:', motoboys?.length || 0);

  if ((motoboys?.length || 0) < 3) {
    const newMotos = [
      { business_id: mainBizId, name: 'Marcos Oliveira', phone: '(31) 99111-2222' },
      { business_id: mainBizId, name: 'Rafael Mendes', phone: '(31) 99222-3333' },
      { business_id: mainBizId, name: 'Tiago Alves', phone: '(31) 99333-4444' },
      { business_id: mainBizId, name: 'Pedro Santos', phone: '(31) 99444-5555' },
      { business_id: mainBizId, name: 'Lucas Costa', phone: '(31) 99555-6666' },
    ];
    for (const m of newMotos) {
      await supabase.from('motoboys').insert(m);
    }
    console.log('Motoboys adicionados');
  }

  // ============ 4. FIX USERS (add default admin user) ============
  const { data: users } = await supabase.from('users').select('id');
  console.log('\nUsuarios atuais:', users?.length || 0);

  if ((users?.length || 0) === 0) {
    const defaultUsers = [
      { business_id: mainBizId, name: 'Admin', email: 'admin@xflow.com', password: 'admin123', role: 'admin' },
      { business_id: mainBizId, name: 'Producao', email: 'producao@xflow.com', password: 'producao123', role: 'producao' },
      { business_id: mainBizId, name: 'Financeiro', email: 'financeiro@xflow.com', password: 'financeiro123', role: 'financeiro' },
      { business_id: mainBizId, name: 'Atendente', email: 'atendente@xflow.com', password: 'atendente123', role: 'atendente' },
      { business_id: mainBizId, name: 'Motoboy', email: 'motoboy@xflow.com', password: 'motoboy123', role: 'motoboy' },
    ];
    for (const u of defaultUsers) {
      await supabase.from('users').insert(u);
    }
    console.log('Usuarios padrao criados: admin@xflow.com / admin123');
  }

  // ============ 5. SUMMARY ============
  const { data: finalClients } = await supabase.from('clients').select('id');
  const { data: finalMotoboys } = await supabase.from('motoboys').select('id');
  const { data: finalUsers } = await supabase.from('users').select('id');
  const { data: finalOrders } = await supabase.from('orders').select('id');

  console.log('\n=== RESUMO FINAL ===');
  console.log('Negocios:', (await supabase.from('businesses').select('id')).data?.length || 0);
  console.log('Usuarios:', finalUsers?.length || 0);
  console.log('Clientes:', finalClients?.length || 0);
  console.log('Motoboys:', finalMotoboys?.length || 0);
  console.log('Pedidos:', finalOrders?.length || 0);
  console.log('\nLogin: admin@xflow.com / admin123');
  console.log('=== FIM ===');
}

fix().catch(console.error);
