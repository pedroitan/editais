# Editais Culturais - Scraper

Sistema de scraping para centralização de editais culturais de múltiplas fontes.

## 🚀 Setup

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite .env com suas credenciais do Supabase
```

3. Configure o Supabase:
- Crie um projeto em https://supabase.com
- Execute as migrations SQL (veja abaixo)
- Adicione as credenciais no .env

## 📊 Estrutura do Banco de Dados

### Tabela `editais`
```sql
CREATE TABLE editais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  instituicao TEXT NOT NULL,
  area_cultural TEXT NOT NULL,
  prazo_inscricao TIMESTAMP WITH TIME ZONE NOT NULL,
  valor_disponivel TEXT,
  requisitos TEXT,
  documentos TEXT[],
  link_oficial TEXT NOT NULL,
  data_publicacao TIMESTAMP WITH TIME ZONE NOT NULL,
  fonte TEXT NOT NULL,
  external_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fonte, external_id)
);

CREATE INDEX idx_editais_fonte ON editais(fonte);
CREATE INDEX idx_editais_prazo ON editais(prazo_inscricao);
CREATE INDEX idx_editais_area ON editais(area_cultural);
```

### Tabela `scrape_runs`
```sql
CREATE TABLE scrape_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fonte TEXT NOT NULL,
  status TEXT NOT NULL,
  editais_encontrados INTEGER DEFAULT 0,
  editais_novos INTEGER DEFAULT 0,
  editais_atualizados INTEGER DEFAULT 0,
  erro TEXT,
  duracao_segundos FLOAT,
  executado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scrape_runs_fonte ON scrape_runs(fonte);
CREATE INDEX idx_scrape_runs_data ON scrape_runs(executado_em);
```

### Tabela `user_subscriptions`
```sql
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  edital_id UUID REFERENCES editais(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, edital_id)
);

CREATE INDEX idx_subscriptions_email ON user_subscriptions(email);
CREATE INDEX idx_subscriptions_edital ON user_subscriptions(edital_id);
```

## 🏃 Rodar Localmente

### Todos os scrapers
```bash
npm run dev
```

### Scraper individual
```bash
npm run scrape:funarte
npm run scrape:minc
npm run scrape:secult-ba
npm run scrape:lei-incentivo
```

### Build
```bash
npm run build
npm start
```

## 📁 Estrutura

```
src/
├── index.ts              # Orquestrador principal
├── types.ts              # Tipos TypeScript
├── supabase.ts           # Cliente Supabase
└── scrapers/
    ├── base.ts           # Funções utilitárias base
    ├── funarte.ts        # Scraper Funarte
    ├── minc.ts           # Scraper Ministério da Cultura
    ├── secult-ba.ts      # Scraper SECULT-BA
    └── lei-incentivo.ts  # Scraper Lei de Incentivo
```

## 🔧 Fontes

- **Funarte**: https://funarte.gov.br/editais
- **Ministério da Cultura**: https://www.gov.br/cultura/pt-br/editais
- **SECULT-BA**: https://cultura.ba.gov.br/editais
- **Lei de Incentivo**: https://editais.leideincentivo.ba.gov.br

## ⚙️ GitHub Actions

O scraper roda automaticamente todos os dias às 03:00 BRT via GitHub Actions.

## 📝 Notas

- Scrapers usam deduplicação por (fonte, external_id)
- Métricas são registradas em `scrape_runs`
- Playwright é usado apenas para sites com JavaScript (MinC)
- BeautifulSoup/Cheerio para sites HTML estático
