require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verificando dados no Supabase...');
console.log('URL:', supabaseUrl ? 'Configurada' : 'Não configurada');
console.log('Key:', supabaseKey ? 'Configurada' : 'Não configurada');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  try {
    const { data, error } = await supabase
      .from('editais')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Erro ao buscar dados:', error);
    } else {
      console.log(`✅ Encontrados ${data.length} editais no banco`);
      if (data.length > 0) {
        console.log('\n📋 Primeiro edital:');
        console.log(JSON.stringify(data[0], null, 2));
      }
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkData();
