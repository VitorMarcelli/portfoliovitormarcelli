export type Locale = 'pt' | 'en';

export type ProjectStatus = 'live' | 'mvp' | 'in_progress' | 'completed';

export interface GalleryItem {
  url: string;
  caption_pt?: string | null;
  caption_en?: string | null;
}

export interface ProjectRow {
  id: string;
  slug: string;
  title_pt: string;
  title_en: string | null;
  summary_pt: string;
  summary_en: string | null;
  body_pt: string | null;
  body_en: string | null;
  category_pt: string | null;
  category_en: string | null;
  technologies: string[];
  cover_url: string | null;
  live_url: string | null;
  /** The live address opens on a login screen (demo access on request). */
  live_login: boolean;
  repo_url: string | null;
  year: number | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  status: ProjectStatus;
  repo_private: boolean;
  for_sale: boolean;
  price_label: string | null;
  sale_note_pt: string | null;
  sale_note_en: string | null;
  challenge_pt: string | null;
  challenge_en: string | null;
  solution_pt: string | null;
  solution_en: string | null;
  results_pt: string | null;
  results_en: string | null;
  highlights_pt: string[];
  highlights_en: string[];
  flow_pt: string[];
  flow_en: string[];
  gallery: GalleryItem[];
  created_at: string;
  updated_at: string;
}

/** Admin-only data of a project (private repository address, internal notes). */
export interface ProjectPrivateRow {
  project_id: string;
  repo_url: string | null;
  github_full_name: string | null;
  internal_price: string | null;
  notes: string | null;
}

export interface ExperienceRow {
  id: string;
  kind: 'work' | 'education';
  title_pt: string;
  title_en: string | null;
  organization: string;
  description_pt: string | null;
  description_en: string | null;
  start_date: string;
  end_date: string | null;
  published: boolean;
}

export interface SettingsRow {
  id: 1;
  available: boolean;
  whatsapp_number: string | null;
  cv_url: string | null;
  ai_enabled: boolean;
  ai_instructions: string | null;
  updated_at: string;
}

export type LeadStatus = 'novo' | 'em_contato' | 'proposta' | 'fechado' | 'perdido';

export type LeadIntent = 'contato' | 'compra' | 'demonstracao';

export interface LeadRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  message: string | null;
  source: 'site' | 'whatsapp';
  status: LeadStatus;
  notes: string | null;
  project_slug: string | null;
  intent: LeadIntent;
  created_at: string;
}

export type ConversationMode = 'ai' | 'human' | 'closed';

export interface ConversationRow {
  id: string;
  wa_jid: string;
  phone: string | null;
  contact_name: string | null;
  mode: ConversationMode;
  needs_attention: boolean;
  handoff_reason: string | null;
  unread_count: number;
  last_message_at: string;
  last_message_preview: string | null;
  lead_id: string | null;
  created_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  direction: 'in' | 'out';
  author: 'contact' | 'ai' | 'admin' | 'system';
  body: string;
  wa_message_id: string | null;
  status: 'received' | 'sent' | 'failed';
  created_at: string;
}

/** A project already resolved to one language, ready for rendering. */
export interface Project {
  slug: string;
  title: string;
  summary: string;
  body: string | null;
  category: string | null;
  technologies: string[];
  coverUrl: string | null;
  liveUrl: string | null;
  liveLogin: boolean;
  repoUrl: string | null;
  year: number | null;
  featured: boolean;
  status: ProjectStatus;
  repoPrivate: boolean;
  forSale: boolean;
  priceLabel: string | null;
  saleNote: string | null;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  highlights: string[];
  /** "How it works" steps, input to output. */
  flow: string[];
  gallery: { url: string; caption: string | null }[];
}

export interface Experience {
  id: string;
  kind: 'work' | 'education';
  title: string;
  organization: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
}

export interface PublicSettings {
  available: boolean;
  whatsappNumber: string | null;
  cvUrl: string | null;
}
