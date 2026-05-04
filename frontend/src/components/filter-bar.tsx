'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState } from 'react';

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busca, setBusca] = useState(searchParams.get('busca') || '');

  const areas = [
    { value: '', label: 'Todas as Áreas' },
    { value: 'musica', label: 'Música' },
    { value: 'teatro', label: 'Teatro' },
    { value: 'danca', label: 'Dança' },
    { value: 'artes-visuais', label: 'Artes Visuais' },
    { value: 'literatura', label: 'Literatura' },
    { value: 'audiovisual', label: 'Audiovisual' },
    { value: 'outros', label: 'Outros' },
  ];

  const prazos = [
    { value: '', label: 'Todos os Prazos' },
    { value: '7', label: '7 dias' },
    { value: '30', label: '30 dias' },
  ];

  const handleAreaChange = (area: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (area) params.set('area', area);
    else params.delete('area');
    router.push(`/?${params.toString()}`);
  };

  const handlePrazoChange = (prazo: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (prazo) params.set('prazo', prazo);
    else params.delete('prazo');
    router.push(`/?${params.toString()}`);
  };

  const handleBuscaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (busca) params.set('busca', busca);
    else params.delete('busca');
    router.push(`/?${params.toString()}`);
  };

  const currentArea = searchParams.get('area') || '';
  const currentPrazo = searchParams.get('prazo') || '';

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Busca */}
        <form onSubmit={handleBuscaSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar editais..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Filtro por Área */}
        <select
          value={currentArea}
          onChange={(e) => handleAreaChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {areas.map((area) => (
            <option key={area.value} value={area.value}>
              {area.label}
            </option>
          ))}
        </select>

        {/* Filtro por Prazo */}
        <select
          value={currentPrazo}
          onChange={(e) => handlePrazoChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {prazos.map((prazo) => (
            <option key={prazo.value} value={prazo.value}>
              {prazo.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
