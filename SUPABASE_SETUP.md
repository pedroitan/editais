# Configuração do Supabase

## Passo 1: Criar Projeto Supabase

1. Acesse https://supabase.com
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Escolha uma organização
5. Configure o projeto:
   - Name: `edital-cultural-scraper`
   - Database Password: (escolha uma senha forte)
   - Region: `South America (São Paulo)` recomendado
6. Aguarde a criação do projeto (2-3 minutos)

## Passo 2: Obter Credenciais

1. No dashboard do Supabase, vá em Settings → API
2. Copie:
   - `Project URL` → adicione ao `.env` como `SUPABASE_URL`
   - `service_role` (secret) → adicione ao `.env` como `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Importante**: Use a `service_role key`, não a `anon key`, pois os scrapers precisam de permissões completas.

## Passo 3: Aplicar Migrations

### Opção 1: Via SQL Editor (Recomendado)

1. No dashboard do Supabase, vá em SQL Editor
2. Crie um novo query
3. Copie o conteúdo de `supabase/migrations/001_initial_schema.sql`
4. Execute o script SQL
5. Verifique se as tabelas foram criadas:
   - `editais`
   - `scrape_runs`
   - `user_subscriptions`

### Opção 2: Via Script (Alternativo)

```bash
npm run build
npx tsx scripts/apply-migration.ts
```

## Passo 3.5: Configurar Políticas RLS

Para que o frontend possa ler os dados, execute no SQL Editor do Supabase:

```sql
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
```

Ou copie o conteúdo de `supabase/migrations/002_rls_policies.sql` e execute no SQL Editor.

## Passo 4: Configurar Variáveis de Ambiente

1. No projeto local, copie o `.env.example`:
```bash
cp .env.example .env
```

2. Edite o `.env` com suas credenciais:
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Passo 5: Configurar GitHub Secrets

Para o GitHub Actions funcionar:

1. No seu repositório GitHub, vá em Settings → Secrets and variables → Actions
2. Adicione os seguintes secrets:
   - `SUPABASE_URL`: (mesmo valor do .env)
   - `SUPABASE_SERVICE_ROLE_KEY`: (mesmo valor do .env)

## Passo 6: Testar Localmente

```bash
# Instalar dependências (se ainda não fez)
npm install

# Build
npm run build

# Testar um scraper específico
npm run scrape:funarte

# Ou rodar todos
npm start
```

## Verificação

Após executar os scrapers, verifique no Supabase:
1. Vá em Table Editor
2. Abra a tabela `editais` - deve ter registros
3. Abra a tabela `scrape_runs` - deve ter logs das execuções

## Troubleshooting

**Erro: "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios"**
- Verifique se o arquivo `.env` existe e tem as variáveis configuradas

**Erro: "relation "editais" does not exist"**
- Execute a migration SQL no SQL Editor do Supabase

**Scrapers não encontram dados**
- Os seletores CSS podem precisar de ajustes após inspecionar os sites reais
- Verifique o console para erros específicos
