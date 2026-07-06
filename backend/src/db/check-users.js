import { supabase } from '../config/supabase.js';

async function checkUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Erro:', error.message);
  } else {
    console.log('Colunas da tabela users:', Object.keys(data[0] || {}));
    console.log('Dados:', data[0]);
  }
}

checkUsers();