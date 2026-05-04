import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR');
}

export function diasRestantes(data: string): number {
  const prazo = new Date(data);
  const hoje = new Date();
  const diff = prazo.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isPrazoCritico(data: string): boolean {
  return diasRestantes(data) <= 7;
}

export function formatarArea(area: string): string {
  const mapping: Record<string, string> = {
    'musica': 'Música',
    'teatro': 'Teatro',
    'danca': 'Dança',
    'artes-visuais': 'Artes Visuais',
    'literatura': 'Literatura',
    'audiovisual': 'Audiovisual',
    'outros': 'Outros'
  };
  return mapping[area] || area;
}

export function formatarFonte(fonte: string): string {
  const mapping: Record<string, string> = {
    'funarte': 'Funarte',
    'minc': 'Ministério da Cultura',
    'secult-ba': 'SECULT-BA',
    'lei-incentivo': 'Lei de Incentivo',
    'manual': 'Manual'
  };
  return mapping[fonte] || fonte;
}
