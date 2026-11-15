import type { LeadStatus } from '@/lib/types';

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  em_contato: 'Em contato',
  proposta: 'Proposta enviada',
  fechado: 'Fechado',
  perdido: 'Perdido',
};
