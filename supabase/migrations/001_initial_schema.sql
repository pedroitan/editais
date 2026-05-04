-- Tabela de editais culturais
CREATE TABLE editais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  instituicao TEXT NOT NULL,
  area_cultural TEXT NOT NULL CHECK (area_cultural IN ('musica', 'teatro', 'danca', 'artes-visuais', 'literatura', 'audiovisual', 'outros')),
  prazo_inscricao TIMESTAMP WITH TIME ZONE NOT NULL,
  valor_disponivel TEXT,
  requisitos TEXT,
  documentos TEXT[],
  link_oficial TEXT NOT NULL,
  data_publicacao TIMESTAMP WITH TIME ZONE NOT NULL,
  fonte TEXT NOT NULL CHECK (fonte IN ('funarte', 'minc', 'secult-ba', 'lei-incentivo', 'manual')),
  external_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fonte, external_id)
);

-- Índices para performance
CREATE INDEX idx_editais_fonte ON editais(fonte);
CREATE INDEX idx_editais_prazo ON editais(prazo_inscricao DESC);
CREATE INDEX idx_editais_area ON editais(area_cultural);
CREATE INDEX idx_editais_active ON editais(is_active) WHERE is_active = true;

-- Tabela de histórico de execuções dos scrapers
CREATE TABLE scrape_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fonte TEXT NOT NULL CHECK (fonte IN ('funarte', 'minc', 'secult-ba', 'lei-incentivo')),
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  editais_encontrados INTEGER DEFAULT 0,
  editais_novos INTEGER DEFAULT 0,
  editais_atualizados INTEGER DEFAULT 0,
  erro TEXT,
  duracao_segundos FLOAT,
  executado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scrape_runs_fonte ON scrape_runs(fonte);
CREATE INDEX idx_scrape_runs_data ON scrape_runs(executado_em DESC);

-- Tabela de subscriptions para alertas
CREATE TABLE user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  edital_id UUID REFERENCES editais(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, edital_id)
);

CREATE INDEX idx_subscriptions_email ON user_subscriptions(email);
CREATE INDEX idx_subscriptions_edital ON user_subscriptions(edital_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_editais_updated_at BEFORE UPDATE ON editais
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
