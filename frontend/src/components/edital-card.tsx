'use client';

import { Edital } from '@/lib/supabase';
import { formatarData, diasRestantes, isPrazoCritico, formatarArea, formatarFonte } from '@/lib/utils';
import { Calendar, DollarSign, Building2, ExternalLink, AlertTriangle, Bell, BellOff } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface EditalCardProps {
  edital: Edital;
}

export function EditalCard({ edital }: EditalCardProps) {
  const dias = diasRestantes(edital.prazo_inscricao);
  const critico = isPrazoCritico(edital.prazo_inscricao);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleSubscribe = async () => {
    if (!email) {
      setShowEmailInput(true);
      return;
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, editalId: edital.id }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        setShowEmailInput(false);
      }
    } catch (error) {
      console.error('Erro ao inscrever:', error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const response = await fetch('/api/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, editalId: edital.id }),
      });

      if (response.ok) {
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="mb-3">
          <p className="text-sm text-gray-600 line-clamp-2">{edital.titulo}</p>
          {edital.resumo && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{edital.resumo}</p>
          )}
        </div>
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {formatarArea(edital.area_cultural)}
          </span>
          {critico && (
            <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
              <AlertTriangle className="w-3 h-3" />
              Prazo Crítico
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {edital.titulo}
        </h3>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>{formatarFonte(edital.fonte)}</span>
          </div>

          <div className={`flex items-center gap-2 ${critico ? 'text-red-600 font-medium' : ''}`}>
            <Calendar className="w-4 h-4" />
            <span>
              {dias > 0 ? `${dias} dias restantes` : 'Encerrado'} ({formatarData(edital.prazo_inscricao)})
            </span>
          </div>

          {edital.valor_disponivel && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>{edital.valor_disponivel}</span>
            </div>
          )}
        </div>

        <Link 
          href={`/editais/${edital.id}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Ver detalhes
          <ExternalLink className="w-4 h-4" />
        </Link>

        <div className="mt-4 flex items-center gap-2">
          {showEmailInput ? (
            <div className="flex gap-2 w-full">
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
              />
              <button
                onClick={handleSubscribe}
                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          ) : (
            <button
              onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {isSubscribed ? (
                <>
                  <BellOff className="w-4 h-4" />
                  Cancelar alerta
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Receber alertas
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
