-- Adicionar instagram como fonte válida
ALTER TABLE editais DROP CONSTRAINT IF EXISTS editais_fonte_check;
ALTER TABLE editais ADD CONSTRAINT editais_fonte_check CHECK (fonte IN ('funarte', 'minc', 'secult-ba', 'lei-incentivo', 'manual', 'instagram'));

-- Atualizar scrape_runs também
ALTER TABLE scrape_runs DROP CONSTRAINT IF EXISTS scrape_runs_fonte_check;
ALTER TABLE scrape_runs ADD CONSTRAINT scrape_runs_fonte_check CHECK (fonte IN ('funarte', 'minc', 'secult-ba', 'lei-incentivo', 'instagram'));
