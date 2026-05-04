import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórios');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AreaCultural = 
  | 'musica' 
  | 'teatro' 
  | 'danca' 
  | 'artes-visuais' 
  | 'literatura' 
  | 'audiovisual' 
  | 'outros';

export type FonteEdital = 
  | 'funarte' 
  | 'minc' 
  | 'secult-ba' 
  | 'lei-incentivo' 
  | 'manual';

export interface Edital {
  id: string;
  titulo: string;
  instituicao: string;
  area_cultural: AreaCultural;
  prazo_inscricao: string;
  valor_disponivel: string | null;
  requisitos: string | null;
  documentos: string[] | null;
  link_oficial: string;
  data_publicacao: string;
  fonte: FonteEdital;
  external_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  resumo?: string | null;
}

export async function getEditais(options?: {
  area?: AreaCultural;
  prazoDias?: number;
  busca?: string;
}): Promise<Edital[]> {
  let query = supabase
    .from('editais')
    .select('*')
    .eq('is_active', true)
    .order('prazo_inscricao', { ascending: true });

  if (options?.area) {
    query = query.eq('area_cultural', options.area);
  }

  if (options?.prazoDias) {
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + options.prazoDias);
    query = query.lte('prazo_inscricao', dataLimite.toISOString());
  }

  if (options?.busca) {
    query = query.ilike('titulo', `%${options.busca}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Erro ao buscar editais: ${error.message}`);
  }

  return data || [];
}

export async function getEditalById(id: string): Promise<Edital | null> {
  const { data, error } = await supabase
    .from('editais')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Erro ao buscar edital: ${error.message}`);
  }

  return data;
}
