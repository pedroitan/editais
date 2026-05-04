import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Edital, ScrapeRun, FonteEdital } from './types';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export async function upsertEdital(edital: Edital): Promise<Edital> {
  const { data, error } = await supabase
    .from('editais')
    .upsert({
      titulo: edital.titulo,
      instituicao: edital.instituicao,
      area_cultural: edital.area_cultural,
      prazo_inscricao: edital.prazo_inscricao.toISOString(),
      valor_disponivel: edital.valor_disponivel,
      requisitos: edital.requisitos,
      documentos: edital.documentos,
      link_oficial: edital.link_oficial,
      data_publicacao: edital.data_publicacao.toISOString(),
      fonte: edital.fonte,
      external_id: edital.external_id,
      is_active: edital.is_active,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'fonte,external_id'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao upsert edital: ${error.message}`);
  }

  return data as Edital;
}

export async function logScrapeRun(run: ScrapeRun): Promise<void> {
  const { error } = await supabase
    .from('scrape_runs')
    .insert({
      fonte: run.fonte,
      status: run.status,
      editais_encontrados: run.editais_encontrados,
      editais_novos: run.editais_novos,
      editais_atualizados: run.editais_atualizados,
      erro: run.erro,
      duracao_segundos: run.duracao_segundos,
      executado_em: run.executado_em.toISOString()
    });

  if (error) {
    console.error(`Erro ao logar scrape run: ${error.message}`);
  }
}

export async function getExistingExternalIds(fonte: FonteEdital): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('editais')
    .select('external_id')
    .eq('fonte', fonte);

  if (error) {
    throw new Error(`Erro ao buscar external_ids: ${error.message}`);
  }

  return new Set(data?.map(e => e.external_id) || []);
}
