import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  const migrationPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('🚀 Aplicando migration...');
  
  try {
    // Executar a migration SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // Se exec_sql não existir, tentar via SQL direto
      console.log('⚠️ exec_sql não disponível, tentando método alternativo...');
      
      // Dividir o SQL em statements individuais
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
        if (stmtError) {
          console.error(`❌ Erro no statement: ${statement.substring(0, 50)}...`);
          console.error(stmtError);
        }
      }
    } else {
      console.log('✅ Migration aplicada com sucesso!');
    }
  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error);
    console.log('\n⚠️ Por favor, aplique a migration manualmente via SQL Editor do Supabase:');
    console.log('1. Acesse https://supabase.com/dashboard');
    console.log('2. Vá em SQL Editor');
    console.log('3. Copie o conteúdo de supabase/migrations/001_initial_schema.sql');
    console.log('4. Execute o script');
  }
}

applyMigration().catch(console.error);
