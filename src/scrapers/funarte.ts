import * as cheerio from 'cheerio';
import { Edital } from '../types';
import { runScraper, parseDate, normalizeAreaCultural, extractExternalId } from './base';
import { extractEditalInfo } from '../ai-service';

const BASE_URL = 'https://www.gov.br/funarte/pt-br/editais-1';

export async function runFunarteScraper() {
  return runScraper('funarte', scrapeFunarte);
}

async function scrapeFunarte(): Promise<Edital[]> {
  const editais: Edital[] = [];
  
  try {
    // Listar modelos disponíveis se ANTHROPIC_API_KEY estiver configurada
    if (process.env.ANTHROPIC_API_KEY) {
      const { listAvailableModels } = await import('../ai-service');
      await listAvailableModels();
    }
  
    // Desabilitar verificação SSL para ambientes de desenvolvimento
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    console.log(`🌐 Fetching ${BASE_URL}...`);
    // Fetch da página de editais
    const response = await fetch(BASE_URL);
    console.log(`📊 Status: ${response.status}`);
    
    const html = await response.text();
    console.log(`📄 HTML length: ${html.length} chars`);
    
    const $ = cheerio.load(html);
    
    // Encontrar links de editais
    const links = $('a[href*="editais"], a[href*="edital"]').map((_, el) => {
      const href = $(el).attr('href');
      const texto = $(el).text().trim();
      return { href, texto };
    }).get();
    
    console.log(`📦 Found ${links.length} potential edital links`);
    
    for (const { href, texto } of links) {
      if (!href || !texto) continue;
      
      // Filtrar links que não são editais
      if (!href.includes('editais') && !href.includes('edital')) continue;
      
      // Construir URL completa
      const linkCompleto = href.startsWith('http') ? href : `https://www.gov.br${href}`;
      
      // Extrair ano do título para filtrar editais antigos
      const anoMatch = texto.match(/\b(20\d{2})\b/);
      const ano = anoMatch ? parseInt(anoMatch[1]) : 2025;
      
      if (ano < 2025) {
        continue;
      }
      
      // Navegar para a página do edital para extrair conteúdo completo
      let conteudoCompleto = texto;
      try {
        console.log(`📖 Fetching página do edital: ${linkCompleto}`);
        const editalResponse = await fetch(linkCompleto);
        if (editalResponse.ok) {
          const editalHtml = await editalResponse.text();
          const $edital = cheerio.load(editalHtml);
          
          // Extrair texto principal do edital
          const mainContent = $edital('main, article, .content, .document-description, .document-text').text();
          if (mainContent && mainContent.length > 100) {
            conteudoCompleto = `${texto}\n\n${mainContent}`;
            console.log(`  📄 Conteúdo extraído: ${mainContent.length} caracteres`);
          }
        }
      } catch (error) {
        console.log(`  ⚠️ Não foi possível buscar conteúdo completo, usando apenas título`);
      }
      
      // Prazo padrão de 30 dias a partir de hoje
      let prazoInscricao = new Date();
      prazoInscricao.setDate(prazoInscricao.getDate() + 30);
      
      let areaCultural: Edital['area_cultural'] = 'outros';
      let valorDisponivel: string | undefined;
      let requisitos: string | undefined;
      let resumo: string | undefined;
      let palavrasChave: string[] = [];
      
      // Usar IA para extrair informações detalhadas
      if (process.env.ANTHROPIC_API_KEY) {
        try {
          console.log(`🤖 Analisando edital com IA: ${texto.substring(0, 50)}...`);
          const extracted = await extractEditalInfo(conteudoCompleto);
          
          if (extracted.prazo_inscricao) {
            const data = new Date(extracted.prazo_inscricao);
            if (!isNaN(data.getTime())) {
              prazoInscricao = data;
              console.log(`  📅 Prazo extraído: ${extracted.prazo_inscricao}`);
            }
          }
          if (extracted.valor_disponivel) {
            valorDisponivel = extracted.valor_disponivel;
            console.log(`  💰 Valor extraído: ${extracted.valor_disponivel}`);
          }
          if (extracted.requisitos) {
            requisitos = extracted.requisitos;
            console.log(`  📋 Requisitos extraídos`);
          }
          if (extracted.area_cultural && extracted.area_cultural !== 'outros') {
            areaCultural = extracted.area_cultural as Edital['area_cultural'];
            console.log(`  🎭 Área cultural: ${extracted.area_cultural}`);
          }
          if (extracted.resumo) {
            resumo = extracted.resumo;
            console.log(`  📝 Resumo criado`);
          }
          if (extracted.palavras_chave) {
            palavrasChave = extracted.palavras_chave;
            console.log(`  🔑 Palavras-chave: ${extracted.palavras_chave.join(', ')}`);
          }
        } catch (error) {
          console.error('  ❌ Erro ao extrair com IA:', error);
        }
      }
      
      if (texto && linkCompleto) {
        editais.push({
          titulo: texto,
          instituicao: 'Funarte',
          area_cultural: 'outros',
          prazo_inscricao: prazoInscricao,
          valor_disponivel: valorDisponivel,
          requisitos: requisitos,
          documentos: palavrasChave.length > 0 ? palavrasChave : undefined,
          link_oficial: linkCompleto,
          data_publicacao: new Date(),
          fonte: 'funarte',
          external_id: extractExternalId(linkCompleto, 'funarte'),
          is_active: true
        });
      }
    }

    console.log(`✅ Extracted ${editais.length} editais`);
    return editais;
  } catch (error) {
    console.error('Erro ao fazer scraping da Funarte:', error);
    return [];
  }
}
