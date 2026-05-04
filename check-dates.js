require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDates() {
  try {
    const { data, error } = await supabase
      .from('editais')
      .select('titulo, prazo_inscricao, data_publicacao, fonte')
      .order('prazo_inscricao', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Erro:', error);
    } else {
      console.log('📊 Editais por data de prazo (mais recentes primeiro):');
      const hoje = new Date();
      
      data.forEach((item, index) => {
        const prazo = new Date(item.prazo_inscricao);
        const dias = Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));
        const status = dias > 0 ? 'ABERTO' : 'ENCERRADO';
        
        console.log(`${index + 1}. ${item.titulo.substring(0, 50)}...`);
        console.log(`   Prazo: ${prazo.toLocaleDateString('pt-BR')} (${dias} dias) - ${status}`);
        console.log(`   Fonte: ${item.fonte}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

checkDates();
