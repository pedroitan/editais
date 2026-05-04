# Editais Culturais - Frontend

Frontend Next.js para o centralizador de editais culturais.

## Setup

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.local.example .env.local
```

3. Edite o `.env.local` com suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Rodar Localmente

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Estrutura

```
src/
├── app/
│   ├── page.tsx              # Página principal com listagem
│   └── editais/
│       └── [id]/
│           └── page.tsx      # Página de detalhes
├── components/
│   ├── edital-card.tsx      # Card de edital
│   └── filter-bar.tsx        # Barra de filtros
└── lib/
    ├── supabase.ts           # Cliente Supabase
    └── utils.ts              # Utilitários
```

## Funcionalidades

- Listagem de editais com filtros por área cultural
- Filtro por prazo (7 dias, 30 dias)
- Busca por texto
- Badge de "Prazo Crítico" (< 7 dias)
- Página de detalhes com informações completas
- Link direto para edital oficial

## Deploy no Vercel

1. Push para GitHub
2. Importe o projeto no Vercel
3. Configure as variáveis de ambiente no Vercel
4. Deploy automático

## Notas

- Usa Supabase para dados
- Tailwind CSS para estilização
- Lucide React para ícones
- React Server Components para performance
