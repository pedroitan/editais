require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testando conexão do frontend com Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Configurada' : 'Não configurada');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenciais não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('editais')
      .select('*')
      .limit(3);
    
    if (error) {
      console.error('❌ Erro ao buscar dados:', error);
      console.error('Código:', error.code);
      console.error('Mensagem:', error.message);
    } else {
      console.log(`✅ Conexão funcionando! Encontrados ${data.length} editais`);
      if (data.length > 0) {
        console.log('\n📋 Primeiro edital:');
        console.log('Título:', data[0].titulo);
        console.log('Fonte:', data[0].fonte);
      }
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testConnection();
