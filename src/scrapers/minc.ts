import { chromium } from 'playwright';
import { Edital } from '../types';
import { runScraper, parseDate, normalizeAreaCultural, extractExternalId } from './base';

const BASE_URL = 'https://www.gov.br/cultura/pt-br/editais';

export async function runMincScraper() {
  return runScraper('minc', scrapeMinc);
}

async function scrapeMinc(): Promise<Edital[]> {
  const editais: Edital[] = [];
  let browser;

  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Esperar o conteúdo carregar
    await page.waitForSelector('.editais, .news-item, article', { timeout: 10000 });
    
    const items = await page.$$('.editais-item, .news-item, article');
    
    for (const item of items) {
      const titulo = await item.$eval('h2, h3, .title', el => el.textContent?.trim() || '').catch(() => '');
      const link = await item.$eval('a', el => el.getAttribute('href')).catch(() => '');
      const linkCompleto = link?.startsWith('http') ? link : `${BASE_URL}${link}`;
      
      const areaTexto = await item.$eval('.area, .category, .tag', el => el.textContent?.trim() || '').catch(() => '');
      const areaCultural = normalizeAreaCultural(areaTexto || 'outros');
      
      const prazoTexto = await item.$eval('.deadline, .prazo, .data-limite', el => el.textContent?.trim() || '').catch(() => '');
      const prazoInscricao = prazoTexto ? parseDate(prazoTexto) : new Date();
      
      const valor = await item.$eval('.valor, .value', el => el.textContent?.trim() || '').catch(() => '');
      const requisitos = await item.$eval('.requisitos, .description', el => el.textContent?.trim() || '').catch(() => '');
      
      if (titulo && linkCompleto) {
        editais.push({
          titulo,
          instituicao: 'Ministério da Cultura',
          area_cultural: areaCultural,
          prazo_inscricao: prazoInscricao,
          valor_disponivel: valor || undefined,
          requisitos: requisitos || undefined,
          link_oficial: linkCompleto,
          data_publicacao: new Date(),
          fonte: 'minc',
          external_id: extractExternalId(linkCompleto, 'minc'),
          is_active: true
        });
      }
    }
    
  } catch (error) {
    console.error('Erro ao fazer scraping do MinC:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return editais;
}
