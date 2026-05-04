require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSources() {
  try {
    const { data, error } = await supabase
      .from('editais')
      .select('fonte');
    
    if (error) {
      console.error('Erro:', error);
    } else {
      console.log('📊 Editais por fonte:');
      
      // Contar por fonte manualmente
      const counts = {};
      data.forEach(item => {
        counts[item.fonte] = (counts[item.fonte] || 0) + 1;
      });
      
      Object.entries(counts).forEach(([fonte, count]) => {
        console.log(`  ${fonte}: ${count} editais`);
      });
      
      console.log(`\nTotal: ${data.length} editais`);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

checkSources();
