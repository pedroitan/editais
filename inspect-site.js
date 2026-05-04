// Desabilitar verificação SSL para ambientes de desenvolvimento
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function inspectSite() {
  console.log('🌐 Fetching https://funarte.gov.br/...\n');
  
  try {
    const response = await fetch('https://funarte.gov.br/');
    const html = await response.text();
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 HTML length: ${html.length} chars\n`);
    
    // Mostrar primeiros 2000 caracteres do HTML
    console.log('📝 Primeiros 2000 caracteres do HTML:');
    console.log('='.repeat(80));
    console.log(html.substring(0, 2000));
    console.log('='.repeat(80));
    
    // Salvar HTML completo em arquivo para análise
    const fs = require('fs');
    fs.writeFileSync('funarte-html.html', html);
    console.log('\n💾 HTML salvo em funarte-html.html');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

inspectSite();
