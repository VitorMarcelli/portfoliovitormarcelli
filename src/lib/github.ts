import 'server-only';

/**
 * Lists repositories for the import screen. With GITHUB_TOKEN (fine-grained, read-only) it includes
 * private repositories of the token owner; without it, only the public ones of GITHUB_USERNAME.
 * The token is only used here, on the server.
 */

export interface GithubRepo {
  fullName: string;
  name: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  isPrivate: boolean;
  pushedAt: string;
  fork: boolean;
  archived: boolean;
}

interface ApiRepo {
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  private: boolean;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
}

export function hasGithubToken() {
  return Boolean(process.env.GITHUB_TOKEN);
}

export async function listRepos(): Promise<GithubRepo[]> {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME || 'VitorMarcelli';
  const url = token
    ? 'https://api.github.com/user/repos?per_page=100&sort=pushed&affiliation=owner'
    : `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'portfolio-admin',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status === 401) throw new Error('O GITHUB_TOKEN é inválido ou expirou. Gere um novo e atualize na Vercel.');
  if (!res.ok) throw new Error(`GitHub respondeu ${res.status}.`);

  const data = (await res.json()) as ApiRepo[];
  return data
    .filter((r) => !r.fork && !r.archived)
    .map((r) => ({
      fullName: r.full_name,
      name: r.name,
      description: r.description,
      htmlUrl: r.html_url,
      homepage: r.homepage || null,
      language: r.language,
      topics: r.topics ?? [],
      isPrivate: r.private,
      pushedAt: r.pushed_at,
      fork: r.fork,
      archived: r.archived,
    }));
}

/** "emiss-oNF_autom-tica" → "Emiss oNF autom tica": a readable starting title the user edits later. */
export function titleFromRepoName(name: string) {
  const spaced = name.replace(/[-_]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
