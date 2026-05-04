'use client';

import { Edital } from '@/lib/supabase';
import { formatarData, diasRestantes, formatarArea, formatarFonte } from '@/lib/utils';
import { Search, LayoutGrid, Bell, Bookmark, ExternalLink, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

const AREA_CORES: Record<string, string> = {
  'musica': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  'teatro': 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  'danca': 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  'artes-visuais': 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  'literatura': 'bg-green-500/20 text-green-300 border border-green-500/30',
  'audiovisual': 'bg-red-500/20 text-red-300 border border-red-500/30',
  'outros': 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/30',
};

const FONTE_CORES: Record<string, string> = {
  'funarte': '#3b82f6',
  'minc': '#22c55e',
  'secult-ba': '#f97316',
  'lei-incentivo': '#a855f7',
  'instagram': '#ec4899',
  'manual': '#6b7280',
};

const FONTES = [
  { key: 'funarte', label: 'Funarte', cor: '#3b82f6' },
  { key: 'minc', label: 'MinC', cor: '#22c55e' },
  { key: 'secult-ba', label: 'Secult-BA', cor: '#f97316' },
  { key: 'lei-incentivo', label: 'Lei de Incentivo', cor: '#a855f7' },
  { key: 'instagram', label: 'Instagram', cor: '#ec4899' },
];

const AREAS = ['musica', 'teatro', 'danca', 'artes-visuais', 'literatura', 'audiovisual', 'outros'];

interface MainLayoutProps {
  editais: Edital[];
}

export function MainLayout({ editais }: MainLayoutProps) {
  const [busca, setBusca] = useState('');
  const [areaSelecionada, setAreaSelecionada] = useState<string | null>(null);
  const [fonteSelecionada, setFonteSelecionada] = useState<string | null>(null);
  const [prazoDias, setPrazoDias] = useState<number | null>(null);

  const editaisFiltrados = useMemo(() => {
    return editais.filter((e) => {
      if (busca && !e.titulo.toLowerCase().includes(busca.toLowerCase())) return false;
      if (areaSelecionada && e.area_cultural !== areaSelecionada) return false;
      if (fonteSelecionada && e.fonte !== fonteSelecionada) return false;
      if (prazoDias) {
        const dias = diasRestantes(e.prazo_inscricao);
        if (dias > prazoDias || dias <= 0) return false;
      }
      return true;
    });
  }, [editais, busca, areaSelecionada, fonteSelecionada, prazoDias]);

  const criticos = editaisFiltrados.filter(e => {
    const d = diasRestantes(e.prazo_inscricao);
    return d > 0 && d <= 7;
  }).length;

  return (
    <div className="flex h-screen bg-[#111111] text-[#f0f0f0] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="font-semibold text-[#f0f0f0] text-base">Editais Culturais</span>
          </div>
        </div>

        <nav className="p-3 flex-1">
          <p className="text-xs font-semibold text-[#555] uppercase tracking-wider px-2 mb-2">Menu</p>
          <ul className="space-y-0.5 mb-6">
            <li>
              <button
                onClick={() => { setFonteSelecionada(null); setAreaSelecionada(null); }}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm font-medium text-[#f0f0f0] bg-[#2a2a2a] hover:bg-[#333]"
              >
                <LayoutGrid className="w-4 h-4 text-[#888]" />
                Todos os editais
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-[#888] hover:bg-[#222] hover:text-[#f0f0f0]">
                <Bell className="w-4 h-4" />
                Meus alertas
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-[#888] hover:bg-[#222] hover:text-[#f0f0f0]">
                <Bookmark className="w-4 h-4" />
                Salvos
              </button>
            </li>
          </ul>

          <p className="text-xs font-semibold text-[#555] uppercase tracking-wider px-2 mb-2">Fontes</p>
          <ul className="space-y-0.5">
            {FONTES.map((fonte) => (
              <li key={fonte.key}>
                <button
                  onClick={() => setFonteSelecionada(fonteSelecionada === fonte.key ? null : fonte.key)}
                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-colors ${
                    fonteSelecionada === fonte.key
                      ? 'bg-[#2a2a2a] text-[#f0f0f0]'
                      : 'text-[#aaa] hover:bg-[#222] hover:text-[#f0f0f0]'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: fonte.cor }} />
                  {fonte.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#2a2a2a] bg-[#111111]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
            <input
              type="text"
              placeholder="Buscar editais..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg pl-9 pr-4 py-2 text-sm text-[#f0f0f0] placeholder-[#555] focus:outline-none focus:border-[#444]"
            />
          </div>
          <div className="flex gap-2 ml-auto">
            {[
              { label: 'Todos', value: null },
              { label: '7 dias', value: 7 },
              { label: '30 dias', value: 30 },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setPrazoDias(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  prazoDias === opt.value
                    ? 'bg-[#f0f0f0] text-[#111] border-transparent'
                    : 'bg-transparent text-[#aaa] border-[#2a2a2a] hover:border-[#444] hover:text-[#f0f0f0]'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button className="p-2 text-[#555] hover:text-[#f0f0f0]">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Area filters */}
        <div className="px-6 py-3 border-b border-[#2a2a2a] flex items-center gap-2 flex-wrap">
          <span className="text-sm text-[#666] mr-1">Área:</span>
          {AREAS.map((area) => (
            <button
              key={area}
              onClick={() => setAreaSelecionada(areaSelecionada === area ? null : area)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                areaSelecionada === area
                  ? 'bg-[#f0f0f0] text-[#111] border-transparent'
                  : 'bg-transparent text-[#ccc] border-[#333] hover:border-[#555] hover:text-[#f0f0f0]'
              }`}
            >
              {formatarArea(area)}
            </button>
          ))}
        </div>

        {/* Count */}
        <div className="px-6 py-3 flex items-center gap-2 text-sm">
          <span className="text-[#f0f0f0] font-medium">{editaisFiltrados.length}</span>
          <span className="text-[#666]">editais encontrados</span>
          {criticos > 0 && (
            <>
              <span className="text-[#444]">·</span>
              <span className="text-[#f0f0f0] font-medium">{criticos}</span>
              <span className="text-orange-400">com prazo crítico</span>
            </>
          )}
        </div>

        {/* Edital list */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
          {editaisFiltrados.length === 0 ? (
            <div className="text-center py-16 text-[#555]">
              <p className="text-lg">Nenhum edital encontrado.</p>
            </div>
          ) : (
            editaisFiltrados.map((edital) => (
              <EditalRow key={edital.id} edital={edital} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function EditalRow({ edital }: { edital: Edital }) {
  const dias = diasRestantes(edital.prazo_inscricao);
  const critico = dias > 0 && dias <= 7;
  const encerrado = dias <= 0;
  const fonteCor = FONTE_CORES[edital.fonte] || '#6b7280';
  const areaCor = AREA_CORES[edital.area_cultural] || AREA_CORES['outros'];

  return (
    <Link href={`/editais/${edital.id}`}>
      <div className={`relative flex items-center gap-4 bg-[#1e1e1e] rounded-xl p-4 border hover:border-[#444] transition-all cursor-pointer group ${
        critico ? 'border-l-2 border-l-orange-500 border-[#2a2a2a]' : encerrado ? 'border-[#222] opacity-60' : 'border-[#2a2a2a]'
      }`}>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#f0f0f0] text-base leading-snug mb-1.5 group-hover:text-white truncate pr-4">
            {edital.titulo}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-[#888]">{formatarFonte(edital.fonte)}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${areaCor}`}>
              {formatarArea(edital.area_cultural)}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium border"
              style={{ color: fonteCor, borderColor: `${fonteCor}40`, backgroundColor: `${fonteCor}15` }}
            >
              {edital.fonte.toUpperCase()}
            </span>
            {critico && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Prazo crítico · {dias} dia{dias !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-[#666] mb-0.5">Inscrições até</p>
          <p className={`text-sm font-semibold ${critico ? 'text-orange-400' : encerrado ? 'text-[#555]' : 'text-[#f0f0f0]'}`}>
            {encerrado ? 'Encerrado' : formatarData(edital.prazo_inscricao)}
          </p>
          {edital.valor_disponivel && (
            <p className="text-sm text-[#aaa] mt-1">{edital.valor_disponivel}</p>
          )}
          <ExternalLink className="w-3.5 h-3.5 text-[#444] group-hover:text-[#888] mt-1 ml-auto transition-colors" />
        </div>
      </div>
    </Link>
  );
}
