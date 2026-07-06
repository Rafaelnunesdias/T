import { supabase } from '../config/supabase.js';

async function checkSchema() {
  console.log('Verificando schema do banco de dados...\n');

  try {
    // Verificar businesses
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .limit(1)
      .single();

    if (businessError) {
      console.log('❌ Tabela businesses não existe ou está vazia');
    } else {
      console.log('✅ Tabela businesses existe');
      console.log('   Colunas:', Object.keys(business));
      console.log('   Dados:', business);
    }

    // Verificar users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.log('\n❌ Tabela users não existe');
    } else {
      console.log('\n✅ Tabela users existe');
      console.log('   Colunas:', Object.keys(users[0] || {}));
      console.log('   Registros:', users.length);
    }

    // Verificar outras tabelas
    const tables = ['clients', 'products', 'categories', 'orders', 'motoboys', 'delivery_zones'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Tabela ${table} não existe`);
      } else {
        console.log(`✅ Tabela ${table} existe (${data.length} registros)`);
      }
    }

  } catch (error) {
    console.error('Erro:', error.message);
  }
}

checkSchema();