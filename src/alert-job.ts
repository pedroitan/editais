import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Subscription {
  id: string;
  email: string;
  edital_id: string;
  alert_days: number[];
  is_active: boolean;
}

interface Edital {
  id: string;
  titulo: string;
  prazo_inscricao: string;
  link_oficial: string;
}

async function checkDeadlinesAndSendAlerts() {
  console.log('🔔 Verificando prazos e enviando alertas...');

  // Buscar inscrições ativas
  const { data: subscriptions, error: subError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('is_active', true);

  if (subError) {
    console.error('Erro ao buscar inscrições:', subError);
    return;
  }

  console.log(`📧 Encontradas ${subscriptions.length} inscrições ativas`);

  const hoje = new Date();
  const alertasEnviados: string[] = [];

  for (const sub of subscriptions as Subscription[]) {
    // Buscar informações do edital
    const { data: edital, error: edError } = await supabase
      .from('editais')
      .select('*')
      .eq('id', sub.edital_id)
      .single();

    if (edError || !edital) {
      console.error(`Erro ao buscar edital ${sub.edital_id}:`, edError);
      continue;
    }

    const prazo = new Date(edital.prazo_inscricao);
    const diasRestantes = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    // Verificar se deve enviar alerta
    const deveEnviar = sub.alert_days.some(d => diasRestantes === d);

    if (deveEnviar && diasRestantes > 0) {
      console.log(`📨 Enviando alerta para ${sub.email}: ${edital.titulo} (${diasRestantes} dias restantes)`);
      
      // Simular envio de email (na prática, usar Resend, SendGrid, etc.)
      console.log(`   To: ${sub.email}`);
      console.log(`   Subject: Lembrete: ${edital.titulo}`);
      console.log(`   Body: O edital "${edital.titulo}" encerra em ${diasRestantes} dias. Acesse: ${edital.link_oficial}`);
      
      alertasEnviados.push(`${sub.email} - ${edital.titulo}`);
    }
  }

  console.log(`✅ Alertas enviados: ${alertasEnviados.length}`);
  console.log(`📋 Detalhes:`, alertasEnviados);
}

// Executar se chamado diretamente
if (require.main === module) {
  checkDeadlinesAndSendAlerts()
    .then(() => {
      console.log('Job concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro no job:', error);
      process.exit(1);
    });
}

export { checkDeadlinesAndSendAlerts };
