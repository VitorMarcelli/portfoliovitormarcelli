import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import GalleryManager from '@/components/admin/GalleryManager';
import ProjectForm from '@/components/admin/ProjectForm';
import { PageHeader } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import type { ProjectPrivateRow, ProjectRow } from '@/lib/types';

export const metadata: Metadata = { title: 'Editar projeto' };

export default async function EditProjectPage({ params, searchParams }: PageProps<'/admin/projetos/[id]'>) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data }, { data: privateData }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).maybeSingle(),
    supabase.from('project_private').select('*').eq('project_id', id).maybeSingle(),
  ]);
  if (!data) notFound();
  const project = data as ProjectRow;

  const notice = query.importado
    ? 'Projeto importado do GitHub como rascunho. Revise os textos, adicione imagens e marque "Publicado" quando estiver pronto.'
    : query.criado
      ? 'Projeto criado. Agora adicione imagens na galeria.'
      : null;

  return (
    <>
      <Link href="/admin/projetos" className="text-sm text-muted hover:text-foreground">
        ← Projetos
      </Link>
      <div className="mt-3">
        <PageHeader
          title={project.title_pt}
          actions={
            project.published ? (
              <Link href={`/projetos/${project.slug}`} target="_blank" className="text-sm font-medium underline underline-offset-4">
                Ver no site
              </Link>
            ) : (
              <span className="text-sm text-muted">Rascunho (não aparece no site)</span>
            )
          }
        />
      </div>
      {notice && (
        <p role="status" className="mb-6 rounded-md border border-success/40 bg-success/10 px-4 py-3 text-sm">
          {notice}
        </p>
      )}
      <ProjectForm project={project} privateData={privateData as ProjectPrivateRow | null} />
      <div className="mt-6">
        <GalleryManager
          projectId={project.id}
          initialGallery={project.gallery ?? []}
          initialCover={project.cover_url}
          liveUrl={project.live_url}
        />
      </div>
    </>
  );
}
