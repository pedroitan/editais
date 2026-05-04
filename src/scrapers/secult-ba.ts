import * as cheerio from 'cheerio';
import { Edital } from '../types';
import { runScraper, parseDate, normalizeAreaCultural, extractExternalId } from './base';

const SOURCES = [
  'https://fgm.salvador.ba.gov.br/editais-abertos/',
  'https://www.ba.gov.br/cultura/62646/editais',
  'https://cultura.ba.gov.br',
];

const BASE_URL = SOURCES[1];

export async function runSecultBaScraper() {
  return runScraper('secult-ba', scrapeSecultBa);
}

async function scrapeSecultBa(): Promise<Edital[]> {
  const editais: Edital[] = [];
  const seenLinks = new Set<string>();
  
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    for (const source of SOURCES) {
      try {
        console.log(`🌐 Fetching ${source}...`);
        const response = await fetch(source);
        console.log(`📊 Status: ${response.status}`);
        
        if (!response.ok) {
          console.log(`⚠️  Skip ${source} - status ${response.status}`);
          continue;
        }
        
        const html = await response.text();
        console.log(`📄 HTML length: ${html.length} chars`);
        
        const $ = cheerio.load(html);
        console.log(`🔍 Document loaded with Cheerio`);

        // Buscar links que contenham "edital" no href
        const items = $('a[href*="edital"], a[href*="editais"], a[href*="edital"]');
        console.log(`📦 Found ${items.length} potential edital links from ${source}`);

        items.each((_, element) => {
          const $el = $(element);
          
          const titulo = $el.text().trim();
          const link = $el.attr('href') || '';
          const linkCompleto = link.startsWith('http') ? link : `${source}${link}`;
          
          // Evitar duplicatas
          if (seenLinks.has(linkCompleto)) {
            return;
          }
          seenLinks.add(linkCompleto);
          
          // Filtrar apenas editais relevantes
          if (titulo.length > 10 && linkCompleto.includes('edital')) {
            // Tentar extrair ano do título para filtrar editais antigos
            const anoMatch = titulo.match(/\b(20\d{2})\b/);
            const ano = anoMatch ? parseInt(anoMatch[1]) : 2026;
            
            // Se o ano for 2023 ou anterior, ignorar (editais antigos)
            if (ano < 2025) {
              return;
            }
            
            const areaTexto = titulo.toLowerCase();
            let areaCultural: Edital['area_cultural'] = 'outros';
            
            if (areaTexto.includes('música') || areaTexto.includes('musica')) {
              areaCultural = 'musica';
            } else if (areaTexto.includes('teatro')) {
              areaCultural = 'teatro';
            } else if (areaTexto.includes('dança') || areaTexto.includes('danca')) {
              areaCultural = 'danca';
            } else if (areaTexto.includes('artes visuais') || areaTexto.includes('artes plasticas')) {
              areaCultural = 'artes-visuais';
            } else if (areaTexto.includes('literatura')) {
              areaCultural = 'literatura';
            } else if (areaTexto.includes('audiovisual') || areaTexto.includes('cinema')) {
              areaCultural = 'audiovisual';
            }
            
            const prazoInscricao = new Date();
            prazoInscricao.setDate(prazoInscricao.getDate() + 30);
            
            editais.push({
              titulo,
              instituicao: 'SECULT-BA',
              area_cultural: areaCultural,
              prazo_inscricao: prazoInscricao,
              valor_disponivel: undefined,
              requisitos: undefined,
              link_oficial: linkCompleto,
              data_publicacao: new Date(),
              fonte: 'secult-ba',
              external_id: extractExternalId(linkCompleto, 'secult-ba'),
              is_active: true
            });
          }
        });
        
      } catch (error) {
        console.log(`⚠️  Error fetching ${source}:`, error instanceof Error ? error.message : String(error));
        continue;
      }
    }

    console.log(`✅ Extracted ${editais.length} editais from all sources`);

  } catch (error) {
    console.error('Erro ao fazer scraping da SECULT-BA:', error);
    throw error;
  }

  return editais;
}
