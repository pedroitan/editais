import { Edital, ScrapeRun, FonteEdital } from '../types';
import { upsertEdital, logScrapeRun, getExistingExternalIds } from '../supabase';

export interface ScraperResult {
  editais_encontrados: number;
  editais_novos: number;
  editais_atualizados: number;
}

export async function runScraper(
  fonte: FonteEdital,
  scrapeFn: () => Promise<Edital[]>
): Promise<ScraperResult> {
  const startTime = Date.now();
  let result: ScraperResult;
  let error: string | undefined;

  try {
    // Buscar external_ids existentes para deduplicação
    const existingIds = await getExistingExternalIds(fonte);
    
    // Executar scraper
    const editais = await scrapeFn();
    
    // Upsert editais no banco
    let novos = 0;
    let atualizados = 0;
    
    for (const edital of editais) {
      const existed = existingIds.has(edital.external_id);
      await upsertEdital(edital);
      
      if (existed) {
        atualizados++;
      } else {
        novos++;
        existingIds.add(edital.external_id);
      }
    }

    result = {
      editais_encontrados: editais.length,
      editais_novos: novos,
      editais_atualizados: atualizados
    };

    // Log sucesso
    await logScrapeRun({
      fonte,
      status: 'success',
      ...result,
      duracao_segundos: (Date.now() - startTime) / 1000,
      executado_em: new Date()
    });

  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    
    // Log erro
    await logScrapeRun({
      fonte,
      status: 'error',
      editais_encontrados: 0,
      editais_novos: 0,
      editais_atualizados: 0,
      erro: error,
      duracao_segundos: (Date.now() - startTime) / 1000,
      executado_em: new Date()
    });

    throw err;
  }

  return result;
}

export function parseDate(dateStr: string): Date {
  // Tenta múltiplos formatos de data brasileiros
  const formats = [
    /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
    /(\d{4})-(\d{2})-(\d{2})/,  // YYYY-MM-DD
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0]) {
        // DD/MM/YYYY
        return new Date(`${match[3]}-${match[2]}-${match[1]}`);
      } else {
        // YYYY-MM-DD
        return new Date(dateStr);
      }
    }
  }

  throw new Error(`Não foi possível parsear data: ${dateStr}`);
}

export function normalizeAreaCultural(area: string): Edital['area_cultural'] {
  const normalized = area.toLowerCase().trim();
  
  const mapping: Record<string, Edital['area_cultural']> = {
    'música': 'musica',
    'musica': 'musica',
    'teatro': 'teatro',
    'dança': 'danca',
    'danca': 'danca',
    'artes visuais': 'artes-visuais',
    'artes plásticas': 'artes-visuais',
    'artes plasticas': 'artes-visuais',
    'literatura': 'literatura',
    'audiovisual': 'audiovisual',
    'cinema': 'audiovisual',
    'vídeo': 'audiovisual',
    'video': 'audiovisual',
  };

  return mapping[normalized] || 'outros';
}

export function extractExternalId(url: string, fonte: FonteEdital): string {
  // Extrai ID da URL de forma simples
  // Pode ser customizado por fonte
  const parts = url.split('/').filter(p => p);
  return parts[parts.length - 1] || url;
}
