const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  const sql = `
    ALTER TABLE editais ADD COLUMN IF NOT EXISTS resumo TEXT;
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // Se exec_sql não existe, tenta via SQL direto
      console.log('exec_sql não disponível, tentando método alternativo...');
      console.log('Execute manualmente no Supabase SQL Editor:');
      console.log(sql);
      return;
    }
    
    console.log('✅ Migration aplicada com sucesso');
  } catch (error) {
    console.error('Erro ao aplicar migration:', error);
    console.log('Execute manualmente no Supabase SQL Editor:');
    console.log(sql);
  }
}

applyMigration();
