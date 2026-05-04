import { runFunarteScraper } from './scrapers/funarte';
import { runMincScraper } from './scrapers/minc';
import { runSecultBaScraper } from './scrapers/secult-ba';
import { runLeiIncentivoScraper } from './scrapers/lei-incentivo';
import { runInstagramScraper } from './scrapers/instagram';

async function main() {
  console.log('🚀 Iniciando scraping de editais culturais...');
  const startTime = Date.now();

  const scrapers = [
    { name: 'Funarte', fn: runFunarteScraper },
    { name: 'MinC', fn: runMincScraper },
    { name: 'SECULT-BA', fn: runSecultBaScraper },
    { name: 'Lei de Incentivo', fn: runLeiIncentivoScraper },
    { name: 'Instagram', fn: runInstagramScraper }
  ];

  const results: Array<{ name: string; editais_novos?: number; editais_atualizados?: number; error?: string }> = [];
  
  for (const scraper of scrapers) {
    try {
      console.log(`\n📊 Executando scraper: ${scraper.name}`);
      const result = await scraper.fn();
      results.push({ name: scraper.name, ...result });
      console.log(`✅ ${scraper.name}: ${result.editais_novos} novos, ${result.editais_atualizados} atualizados`);
    } catch (error) {
      console.error(`❌ ${scraper.name} falhou:`, error);
      results.push({ name: scraper.name, error: String(error) });
    }
  }

  const duration = (Date.now() - startTime) / 1000;
  console.log(`\n✨ Scraping concluído em ${duration.toFixed(2)}s`);
  console.log('\n📋 Resumo:');
  results.forEach(r => {
    if (r.error) {
      console.log(`  ❌ ${r.name}: ${r.error}`);
    } else {
      console.log(`  ✅ ${r.name}: ${r.editais_novos} novos, ${r.editais_atualizados} atualizados`);
    }
  });
}

main().catch(console.error);
