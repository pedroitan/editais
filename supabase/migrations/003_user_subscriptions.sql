-- Tabela de inscrições de usuários para alertas de editais
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  edital_id UUID NOT NULL REFERENCES editais(id) ON DELETE CASCADE,
  alert_days INTEGER[] DEFAULT ARRAY[7, 3, 1], -- Dias antes do prazo para alertar (padrão: 7, 3, 1 dia)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, edital_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_email ON user_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_edital_id ON user_subscriptions(edital_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Política RLS para permitir leitura/escrita pública (para MVP)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read subscriptions"
ON user_subscriptions FOR SELECT
TO anon
USING (true);

CREATE POLICY "Public insert subscriptions"
ON user_subscriptions FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Public update subscriptions"
ON user_subscriptions FOR UPDATE
TO anon
USING (true);
