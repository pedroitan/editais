const { spawn } = require('child_process');

console.log('🚀 Iniciando teste do scraper Funarte...\n');

const child = spawn('npx', ['tsx', 'src/scrapers/funarte.ts'], {
  cwd: __dirname,
  shell: true
});

child.stdout.on('data', (data) => {
  console.log(data.toString());
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

child.on('close', (code) => {
  console.log(`\n✨ Processo finalizado com código: ${code}`);
});
