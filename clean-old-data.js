require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanOldData() {
  try {
    console.log('🧹 Limpando editais antigos do banco...');
    
    // Deletar todos os editais
    const { error } = await supabase
      .from('editais')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Hack para deletar todos
    
    if (error) {
      console.error('❌ Erro ao deletar:', error);
    } else {
      console.log('✅ Editais antigos deletados com sucesso');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

cleanOldData();
