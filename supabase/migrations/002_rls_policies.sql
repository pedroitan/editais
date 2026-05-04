-- Habilitar RLS na tabela editais
ALTER TABLE editais ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública de editais ativos
CREATE POLICY "Public read active editais"
ON editais FOR SELECT
TO anon
USING (is_active = true);

-- Política para permitir leitura pública de editais ativos para usuários autenticados
CREATE POLICY "Authenticated read active editais"
ON editais FOR SELECT
TO authenticated
USING (is_active = true);
