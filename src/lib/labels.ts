import type { LeadIntent, LeadStatus, ProjectStatus } from '@/lib/types';

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo',
  em_contato: 'Em contato',
  proposta: 'Proposta enviada',
  fechado: 'Fechado',
  perdido: 'Perdido',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  live: 'No ar',
  mvp: 'MVP',
  in_progress: 'Em desenvolvimento',
  completed: 'Concluído',
};

export const STATUS_OPTIONS = (Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((value) => ({
  value,
  label: PROJECT_STATUS_LABELS[value],
}));

export const INTENT_LABELS: Record<LeadIntent, string> = {
  contato: 'Contato',
  compra: 'Quer comprar',
  demonstracao: 'Quer demonstração',
};
