import { getEditais } from '@/lib/supabase';
import { formatarData, diasRestantes, formatarArea, formatarFonte } from '@/lib/utils';
import { Calendar, DollarSign, TrendingUp, BarChart3, Filter, Search, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

export default async function AdminDashboard() {
  const editais = await getEditais();
  
  // Métricas
  const totalEditais = editais.length;
  const editaisAbertos = editais.filter(e => diasRestantes(e.prazo_inscricao) > 0).length;
  const editaisComResumo = editais.filter(e => e.resumo).length;
  const editaisComValor = editais.filter(e => e.valor_disponivel).length;
  const editaisComArea = editais.filter(e => e.area_cultural !== 'outros').length;
  
  // Distribuição por área
  const porArea = editais.reduce((acc, edital) => {
    acc[edital.area_cultural] = (acc[edital.area_cultural] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Distribuição por fonte
  const porFonte = editais.reduce((acc, edital) => {
    acc[edital.fonte] = (acc[edital.fonte] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Qualidade da IA
  const qualidadeIA = {
    resumos: Math.round((editaisComResumo / totalEditais) * 100),
    valores: Math.round((editaisComValor / totalEditais) * 100),
    areas: Math.round((editaisComArea / totalEditais) * 100),
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard de Editais</h1>
              <p className="text-slate-600 mt-1">Monitoramento e análise de oportunidades culturais</p>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">IA Ativa</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<BarChart3 className="w-6 h-6" />}
            label="Total de Editais"
            value={totalEditais}
            color="blue"
          />
          <MetricCard
            icon={<Calendar className="w-6 h-6" />}
            label="Editais Abertos"
            value={editaisAbertos}
            color="green"
          />
          <MetricCard
            icon={<DollarSign className="w-6 h-6" />}
            label="Com Valor Informado"
            value={editaisComValor}
            color="yellow"
          />
          <MetricCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Com Resumo IA"
            value={editaisComResumo}
            color="purple"
          />
        </div>

        {/* Qualidade da IA */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Qualidade da Extração IA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QualityMetric
              label="Resumos Gerados"
              value={qualidadeIA.resumos}
              icon={<CheckCircle className="w-4 h-4" />}
            />
            <QualityMetric
              label="Valores Extraídos"
              value={qualidadeIA.valores}
              icon={<DollarSign className="w-4 h-4" />}
            />
            <QualityMetric
              label="Áreas Classificadas"
              value={qualidadeIA.areas}
              icon={<TrendingUp className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Distribuição por área e fonte */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Por Área Cultural</h2>
            <div className="space-y-3">
              {Object.entries(porArea).map(([area, count]) => (
                <DistributionBar
                  key={area}
                  label={formatarArea(area as any)}
                  count={count}
                  total={totalEditais}
                  color="blue"
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Por Fonte</h2>
            <div className="space-y-3">
              {Object.entries(porFonte).map(([fonte, count]) => (
                <DistributionBar
                  key={fonte}
                  label={formatarFonte(fonte as any)}
                  count={count}
                  total={totalEditais}
                  color="green"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Lista de editais recentes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Editais Recentes</h2>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar editais..."
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                <Filter className="w-4 h-4" />
                Filtros
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {editais.slice(0, 10).map((edital) => {
              const dias = diasRestantes(edital.prazo_inscricao);
              const critico = dias <= 7 && dias > 0;
              
              return (
                <div
                  key={edital.id}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{edital.titulo}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {formatarArea(edital.area_cultural)}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span>{formatarFonte(edital.fonte)}</span>
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${critico ? 'text-red-600' : dias > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                      {dias > 0 ? `${dias} dias` : 'Encerrado'}
                    </div>
                  </div>
                  
                  {edital.resumo && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{edital.resumo}</p>
                  )}
                  
                  {edital.valor_disponivel && (
                    <div className="flex items-center gap-1 text-sm text-slate-600 mt-2">
                      <DollarSign className="w-4 h-4" />
                      {edital.valor_disponivel}
                    </div>
                  )}
                  
                  {edital.documentos && edital.documentos.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {edital.documentos.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {edital.documentos.length > 3 && (
                        <span className="text-xs text-slate-500">+{edital.documentos.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: 'blue' | 'green' | 'yellow' | 'purple' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className={`p-6 rounded-xl border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={colors[color]}>{icon}</div>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="text-sm font-medium text-slate-700">{label}</p>
    </div>
  );
}

function QualityMetric({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const getColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-slate-600">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={`text-2xl font-bold ${getColor(value)}`}>{value}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            value >= 80 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function DistributionBar({ label, count, total, color }: { label: string; count: number; total: number; color: 'blue' | 'green' }) {
  const percentage = Math.round((count / total) * 100);
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-500">{count} ({percentage}%)</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div className={`${colors[color]} h-2 rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
