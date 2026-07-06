import { supabase } from '../config/supabase.js';

async function run() {
  console.log('=== CORRECAO COMPLETA DO BANCO ===\n');

  const mainBizId = '3e03f0c7-03b9-4ede-a84f-7b04db0fc394'; // Fábrica de Salgados

  // ============ 1. Fix users ============
  console.log('1. Corrigindo usuarios...');

  // Delete existing users first to avoid duplicates
  const { data: existingUsers } = await supabase.from('users').select('id, email');
  console.log('   Usuarios existentes:', existingUsers?.length || 0);

  // Try to add name column via data update
  const defaultUsers = [
    { business_id: mainBizId, name: 'Admin', email: 'admin@xflow.com', password_hash: 'admin123', role: 'admin' },
    { business_id: mainBizId, name: 'Produção', email: 'producao@xflow.com', password_hash: 'producao123', role: 'producao' },
    { business_id: mainBizId, name: 'Financeiro', email: 'financeiro@xflow.com', password_hash: 'financeiro123', role: 'financeiro' },
    { business_id: mainBizId, name: 'Atendente', email: 'atendente@xflow.com', password_hash: 'atendente123', role: 'atendente' },
    { business_id: mainBizId, name: 'Motoboy', email: 'motoboy@xflow.com', password_hash: 'motoboy123', role: 'motoboy' },
  ];

  // Insert using raw SQL to handle the name column
  // First check if name column exists
  try {
    const { error: nameCheck } = await supabase.from('users').select('name').limit(1);
    if (nameCheck && nameCheck.message?.includes('name')) {
      console.log('   Coluna name nao existe, inserindo usuarios sem name...');
    }
  } catch (e) {}

  // Truncate and re-insert
  // Since we can't ALTER TABLE via JS client, we insert what we can and update via the auth flow
  // The auth/login endpoint derives name from email, so it works

  // Clean old users first
  for (const u of existingUsers || []) {
    await supabase.from('users').delete().eq('id', u.id);
  }

  for (const u of defaultUsers) {
    const { data, error } = await supabase.from('users').insert({
      business_id: u.business_id,
      email: u.email,
      password_hash: u.password_hash,
      role: u.role,
    }).select().single();

    if (error) {
      console.log('   Erro ao criar', u.email, ':', error.message);
    } else {
      console.log('   Criado:', u.email, '/', u.password_hash, 'role:', u.role);
    }
  }

  // ============ 2. Ensure motoboys ============
  console.log('\n2. Verificando motoboys...');
  const { data: motos } = await supabase.from('motoboys').select('id');
  if ((motos?.length || 0) < 5) {
    // Delete existing and reinsert
    for (const m of motos || []) {
      await supabase.from('motoboys').delete().eq('id', m.id);
    }
    const newMotos = [
      { business_id: mainBizId, name: 'Marcos Oliveira', phone: '(31) 99111-2222' },
      { business_id: mainBizId, name: 'Rafael Mendes', phone: '(31) 99222-3333' },
      { business_id: mainBizId, name: 'Tiago Alves', phone: '(31) 99333-4444' },
      { business_id: mainBizId, name: 'Pedro Santos', phone: '(31) 99444-5555' },
      { business_id: mainBizId, name: 'Lucas Costa', phone: '(31) 99555-6666' },
    ];
    for (const m of newMotos) {
      const { data, error } = await supabase.from('motoboys').insert(m).select().single();
      if (data) console.log('   Motoboy:', data.name);
    }
  } else {
    console.log('   OK -', motos.length, 'motoboys');
  }

  // ============ 3. Check deliveries for active orders ============
  console.log('\n3. Verificando entregas ativas...');
  const { data: activeDels } = await supabase
    .from('deliveries')
    .select('id, order_id, status')
    .in('status', ['pendente', 'em_rota']);
  console.log('   Entregas ativas (pendente/em_rota):', activeDels?.length || 0);

  // Ensure some deliveries are in "em_rota" status for the map to show
  const { data: allDels } = await supabase.from('deliveries').select('id, status, order_id');
  console.log('   Total deliveries:', allDels?.length || 0);

  // ============ 4. Summary ============
  console.log('\n=== RESUMO ===');
  console.log('Login admin: admin@xflow.com / admin123');
  console.log('Login producao: producao@xflow.com / producao123');
  console.log('Login financeiro: financeiro@xflow.com / financeiro123');
  console.log('Login atendente: atendente@xflow.com / atendente123');
  console.log('Login motoboy: motoboy@xflow.com / motoboy123');

  const { data: finalUsers } = await supabase.from('users').select('email, role');
  console.log('\nUsuarios finais:');
  finalUsers?.forEach(u => console.log('  -', u.email, u.role));
}

run().catch(console.error);
