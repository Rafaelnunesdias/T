import { supabase } from '../config/supabase.js';

// Função para criar um usuário de teste
async function createTestUser() {
  // Dados do usuário de teste
  const email = 'teste@example.com';
  const password = 'Teste1234'; // Em produção deveria ser hash
  const role = 'admin'; // pode ser admin, producao, financeiro, atendente, motoboy
  const business_id = 'test-business-id';

  // Verifica se já existe
  const { data: existing, error: errExist } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (errExist && errExist.code !== 'PGRST116') {
    console.error('Erro ao buscar usuário:', errExist.message);
    return;
  }

  if (existing) {
    console.log('Usuário já exists:', existing.id);
    return;
  }

  const { data, error } = await supabase.from('users').insert({
    email,
    password, // Atenção: armazenar senha em texto puro apenas para teste
    role,
    business_id,
  }).select().single();

  if (error) {
    console.error('Erro ao inserir usuário:', error.message);
  } else {
    console.log('Usuário criado com ID:', data.id);
  }
}

createTestUser();
