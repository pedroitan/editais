import { getEditais } from '@/lib/supabase';
import { EditalCard } from '@/components/edital-card';
import { FilterBar } from '@/components/filter-bar';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ area?: string; prazo?: string; busca?: string }>;
}) {
  const params = await searchParams;
  
  const editais = await getEditais({
    area: params.area as any,
    prazoDias: params.prazo ? parseInt(params.prazo) : undefined,
    busca: params.busca,
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Editais Culturais
          </h1>
          <p className="text-gray-600 mt-2">
            Encontre editais culturais de múltiplas fontes em um só lugar
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FilterBar />
        
        {editais.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum edital encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {editais.map((edital) => (
              <EditalCard key={edital.id} edital={edital} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
