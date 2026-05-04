import { notFound } from 'next/navigation';
import { getEditalById } from '@/lib/supabase';
import { formatarData, diasRestantes, isPrazoCritico, formatarArea, formatarFonte } from '@/lib/utils';
import { Calendar, DollarSign, Building2, ExternalLink, AlertTriangle, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function EditalDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const edital = await getEditalById(id);

  if (!edital) {
    notFound();
  }

  const dias = diasRestantes(edital.prazo_inscricao);
  const critico = isPrazoCritico(edital.prazo_inscricao);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{edital.titulo}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          {/* Badges */}
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {formatarArea(edital.area_cultural)}
            </span>
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {formatarFonte(edital.fonte)}
            </span>
            {critico && (
              <span className="flex items-center gap-1 text-sm font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
                <AlertTriangle className="w-4 h-4" />
                Prazo Crítico
              </span>
            )}
          </div>

          {/* Informações principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className={`flex items-center gap-3 ${critico ? 'text-red-600' : 'text-gray-700'}`}>
              <Calendar className="w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Prazo de Inscrição</p>
                <p className="font-semibold">
                  {formatarData(edital.prazo_inscricao)}
                  {dias > 0 && ` (${dias} dias restantes)`}
                  {dias <= 0 && ' (Encerrado)'}
                </p>
              </div>
            </div>

            {edital.valor_disponivel && (
              <div className="flex items-center gap-3 text-gray-700">
                <DollarSign className="w-5 h-5" />
                <div>
                  <p className="text-sm text-gray-500">Valor Disponível</p>
                  <p className="font-semibold">{edital.valor_disponivel}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-gray-700">
              <Building2 className="w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Instituição</p>
                <p className="font-semibold">{formatarFonte(edital.fonte)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <FileText className="w-5 h-5" />
              <div>
                <p className="text-sm text-gray-500">Data de Publicação</p>
                <p className="font-semibold">{formatarData(edital.data_publicacao)}</p>
              </div>
            </div>
          </div>

          {/* Resumo IA */}
          {edital.resumo && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Resumo
              </h2>
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <p className="text-gray-700">{edital.resumo}</p>
              </div>
            </div>
          )}

          {/* Requisitos */}
          {edital.requisitos && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Requisitos</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 whitespace-pre-wrap">{edital.requisitos}</p>
              </div>
            </div>
          )}

          {/* Palavras-chave */}
          {edital.documentos && edital.documentos.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Palavras-chave</h2>
              <div className="flex flex-wrap gap-2">
                {edital.documentos.map((keyword, index) => (
                  <span
                    key={index}
                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Botão de inscrição */}
          <a
            href={edital.link_oficial}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Acessar Edital Oficial
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </main>
    </div>
  );
}
