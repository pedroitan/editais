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
  id?: string;
  titulo: string;
  instituicao: string;
  area_cultural: AreaCultural;
  prazo_inscricao: Date;
  valor_disponivel?: string;
  requisitos?: string;
  documentos?: string[];
  link_oficial: string;
  data_publicacao: Date;
  fonte: FonteEdital;
  external_id: string; // ID único na fonte original
  is_active: boolean;
}

export interface ScrapeRun {
  id?: string;
  fonte: FonteEdital;
  status: 'success' | 'error';
  editais_encontrados: number;
  editais_novos: number;
  editais_atualizados: number;
  erro?: string;
  duracao_segundos: number;
  executado_em: Date;
}
