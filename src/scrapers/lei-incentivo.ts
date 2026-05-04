import * as cheerio from 'cheerio';
import { Edital } from '../types';
import { runScraper, parseDate, normalizeAreaCultural, extractExternalId } from './base';

const BASE_URL = 'https://cultura.ba.gov.br/lei-de-incentivo';

export async function runLeiIncentivoScraper() {
  return runScraper('lei-incentivo', scrapeLeiIncentivo);
}

async function scrapeLeiIncentivo(): Promise<Edital[]> {
  const editais: Edital[] = [];
  
  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    console.log(`🌐 Fetching ${BASE_URL}...`);
    const response = await fetch(BASE_URL);
    console.log(`📊 Status: ${response.status}`);
    
    const html = await response.text();
    console.log(`📄 HTML length: ${html.length} chars`);
    
    const $ = cheerio.load(html);
    console.log(`🔍 Document loaded with Cheerio`);

    // Buscar links que contenham "edital" no href
    const items = $('a[href*="edital"], a[href*="editais"]');
    console.log(`📦 Found ${items.length} potential edital links`);

    items.each((_, element) => {
      const $el = $(element);
      
      const titulo = $el.text().trim();
      const link = $el.attr('href') || '';
      const linkCompleto = link.startsWith('http') ? link : `https://cultura.ba.gov.br${link}`;
      
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
          instituicao: 'Lei de Incentivo à Cultura - BA',
          area_cultural: areaCultural,
          prazo_inscricao: prazoInscricao,
          valor_disponivel: undefined,
          requisitos: undefined,
          link_oficial: linkCompleto,
          data_publicacao: new Date(),
          fonte: 'lei-incentivo',
          external_id: extractExternalId(linkCompleto, 'lei-incentivo'),
          is_active: true
        });
      }
    });

    console.log(`✅ Extracted ${editais.length} editais`);

  } catch (error) {
    console.error('Erro ao fazer scraping da Lei de Incentivo:', error);
    throw error;
  }

  return editais;
}
