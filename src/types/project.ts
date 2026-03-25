export type ProjectCategory =
  | 'web'
  | 'system'
  | 'automation'
  | 'api'
  | 'ai'
  | 'mobile'
  | 'landing'
  | 'other';

export type ProjectStatus = 'active' | 'completed' | 'archived' | 'in-progress';

export interface ProjectLinks {
  live?: string;
  repository?: string;
  demo?: string;
  caseStudy?: string;
}

export interface ExternalSource {
  provider: 'github' | 'gitlab' | 'bitbucket';
  url: string;
  repoName: string;
  lastSynced?: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: ProjectCategory;
  technologies: string[];
  coverImage: string;
  links: ProjectLinks;
  featured: boolean;
  status: ProjectStatus;
  source?: ExternalSource;
  updatedAt: string;
}
