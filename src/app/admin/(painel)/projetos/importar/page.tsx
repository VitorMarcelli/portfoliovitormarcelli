import type { Metadata } from 'next';
import Link from 'next/link';
import { importFromGithub } from '@/actions/admin/projects';
import { buttonSecondary, EmptyState, PageHeader, timeAgo } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import { hasGithubToken, listRepos, type GithubRepo } from '@/lib/github';

export const metadata: Metadata = { title: 'Importar do GitHub' };

const ERRORS: Record<string, string> = {
  repo: 'Repositório não encontrado. Ele pode ter sido renomeado ou o token não tem acesso a ele.',
  salvar: 'Não foi possível criar o projeto. Tente de novo.',
};

export default async function ImportPage({ searchParams }: PageProps<'/admin/projetos/importar'>) {
  const { supabase } = await requireAdmin();
  const query = await searchParams;
  const tokenOk = hasGithubToken();

  let repos: GithubRepo[] = [];
  let loadError: string | null = null;
  try {
    repos = await listRepos();
  } catch (e) {
    loadError = (e as Error).message;
  }

  const [{ data: privateRows }, { data: projectRows }] = await Promise.all([
    supabase.from('project_private').select('project_id, github_full_name, repo_url'),
    supabase.from('projects').select('id, repo_url'),
  ]);
  // Repos already in the portfolio, matched by full name or by repository address (public or private).
  const imported = new Map<string, string>();
  for (const r of privateRows ?? []) {
    if (r.github_full_name) imported.set(r.github_full_name.toLowerCase(), r.project_id);
    if (r.repo_url) imported.set(r.repo_url.toLowerCase().replace(/\/$/, ''), r.project_id);
  }
  for (const p of projectRows ?? []) if (p.repo_url) imported.set(p.repo_url.toLowerCase().replace(/\/$/, ''), p.id);
  const existingId = (r: GithubRepo) => imported.get(r.fullName.toLowerCase()) ?? imported.get(r.htmlUrl.toLowerCase());

  const errorKey = typeof query.erro === 'string' ? query.erro : null;

  return (
    <>
      <Link href="/admin/projetos" className="text-sm text-muted hover:text-foreground">
        ← Projetos
      </Link>
      <div className="mt-3">
        <PageHeader
          title="Importar do GitHub"
          description="Escolha um repositório para criar um rascunho já preenchido com nome, descrição, tecnologias e link do site. Repositórios privados continuam privados: o endereço fica só no painel."
        />
      </div>

      {!tokenOk && (
        <p className="mb-6 rounded-md border border-border bg-surface px-4 py-3 text-sm">
          Mostrando só os repositórios públicos. Para listar os privados, crie um token em GitHub → Settings → Developer settings → Fine-grained
          tokens, com acesso a todos os repositórios e permissão <strong>Metadata: leitura</strong>, e salve como{' '}
          <code className="rounded bg-surface-2 px-1">GITHUB_TOKEN</code> nas variáveis da Vercel.
        </p>
      )}
      {tokenOk && !loadError && repos.length > 0 && !repos.some((r) => r.isPrivate) && (
        <div role="alert" className="mb-6 rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm leading-relaxed">
          <p className="font-medium">O token está configurado, mas o GitHub não liberou nenhum repositório privado para ele.</p>
          <p className="mt-1">
            Em GitHub → Settings → Developer settings → Personal access tokens, abra o token e confira: em{' '}
            <strong>Repository access</strong> escolha <strong>All repositories</strong> (assim os projetos novos também entram) e em{' '}
            <strong>Repository permissions</strong> deixe <strong>Metadata: Read-only</strong>. Se for um token clássico, marque o escopo{' '}
            <code className="rounded bg-surface-2 px-1">repo</code>. Editando o mesmo token não precisa mexer na Vercel; se gerar um novo, troque o{' '}
            <code className="rounded bg-surface-2 px-1">GITHUB_TOKEN</code> lá e faça um novo deploy.
          </p>
        </div>
      )}
      {errorKey && ERRORS[errorKey] && (
        <p role="alert" className="mb-6 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm">
          {ERRORS[errorKey]}
        </p>
      )}

      {loadError ? (
        <EmptyState title="Não foi possível falar com o GitHub">{loadError}</EmptyState>
      ) : repos.length === 0 ? (
        <EmptyState title="Nenhum repositório encontrado">Forks e repositórios arquivados ficam de fora.</EmptyState>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {repos.map((repo) => {
            const existing = existingId(repo);
            return (
              <li key={repo.fullName} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{repo.name}</p>
                    <p className="text-xs text-muted">
                      {[repo.language, `atualizado ${timeAgo(repo.pushedAt)}`].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${
                      repo.isPrivate ? 'border-accent/50 bg-accent/10' : 'border-border text-muted'
                    }`}
                  >
                    {repo.isPrivate ? 'Privado' : 'Público'}
                  </span>
                </div>
                {repo.description && <p className="text-sm text-muted">{repo.description}</p>}
                {repo.homepage && <p className="truncate text-xs text-muted">No ar: {repo.homepage}</p>}
                <div className="mt-auto">
                  {existing ? (
                    <Link href={`/admin/projetos/${existing}`} className="text-sm font-medium underline underline-offset-4">
                      Já está no portfólio, editar
                    </Link>
                  ) : (
                    <form action={importFromGithub.bind(null, repo.fullName)}>
                      <button type="submit" className={buttonSecondary}>
                        Importar como rascunho
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
