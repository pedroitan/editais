import { Edital } from '../types';
import { runScraper, parseDate, normalizeAreaCultural, extractExternalId } from './base';
import { ApifyClient } from 'apify';

const INSTAGRAM_USERNAME = 'editais_culturais';

export async function runInstagramScraper() {
  return runScraper('instagram', scrapeInstagram);
}

async function scrapeInstagram(): Promise<Edital[]> {
  const editais: Edital[] = [];
  
  try {
    const apifyClient = new ApifyClient({
      token: process.env.APIFY_TOKEN,
    });

    console.log(`📸 Fetching Instagram posts from @${INSTAGRAM_USERNAME}...`);

    // Usar o Instagram Scraper do Apify
    const input = {
      directUrls: [`https://www.instagram.com/${INSTAGRAM_USERNAME}/`],
      resultsLimit: 30,
      addParentData: false,
    };

    const run = await apifyClient.actor('apify/instagram-scraper').call(input);
    
    console.log(`📊 Apify run ID: ${run.id}`);
    
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    console.log(`📦 Found ${items.length} Instagram posts`);

    for (const item of items as any) {
      const caption = item.caption || '';
      const url = item.url || '';
      
      // Filtrar posts que mencionam "edital" ou "editais"
      if (!caption.toLowerCase().includes('edital')) {
        continue;
      }
      
      // Extrair título do caption (primeira linha)
      const titulo = caption.split('\n')[0].trim();
      
      if (titulo.length < 10) {
        continue;
      }
      
      // Tentar extrair ano do caption para filtrar editais antigos
      const anoMatch = caption.match(/\b(20\d{2})\b/);
      const ano = anoMatch ? parseInt(anoMatch[1]) : 2026;
      
      if (ano < 2025) {
        continue;
      }
      
      // Classificar área cultural
      const areaTexto = caption.toLowerCase();
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
      
      // Prazo padrão de 30 dias
      const prazoInscricao = new Date();
      prazoInscricao.setDate(prazoInscricao.getDate() + 30);
      
      editais.push({
        titulo,
        instituicao: 'Instagram',
        area_cultural: areaCultural,
        prazo_inscricao: prazoInscricao,
        valor_disponivel: undefined,
        requisitos: undefined,
        link_oficial: url,
        data_publicacao: new Date(item.timestamp || Date.now()),
        fonte: 'instagram',
        external_id: extractExternalId(url, 'instagram'),
        is_active: true
      });
    }

    console.log(`✅ Extracted ${editais.length} editais from Instagram`);

  } catch (error) {
    console.error('Erro ao fazer scraping do Instagram:', error);
    throw error;
  }

  return editais;
}
