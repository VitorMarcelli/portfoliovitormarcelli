import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import GalleryManager from '@/components/admin/GalleryManager';
import ProjectForm from '@/components/admin/ProjectForm';
import QualityPanel from '@/components/admin/QualityPanel';
import { PageHeader } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import { categoryList, projectQuality } from '@/lib/projectQuality';
import type { ProjectPrivateRow, ProjectRow } from '@/lib/types';

export const metadata: Metadata = { title: 'Editar projeto' };

export default async function EditProjectPage({ params, searchParams }: PageProps<'/admin/projetos/[id]'>) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data }, { data: privateData }, { data: categoryRows }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).maybeSingle(),
    supabase.from('project_private').select('*').eq('project_id', id).maybeSingle(),
    supabase.from('projects').select('category_pt, category_en').not('category_pt', 'is', null),
  ]);
  if (!data) notFound();
  const project = data as ProjectRow;
  const categories = categoryList(categoryRows ?? []);
  const quality = projectQuality(
    project,
    categories.map((c) => c.pt),
  );

  const notice = query.importado
    ? 'Projeto importado do GitHub como rascunho. Siga a lista de qualidade abaixo, use "Pré-visualizar" para conferir e publique quando estiver completo.'
    : query.criado
      ? 'Projeto criado. Agora adicione a capa e as imagens na galeria, mais abaixo.'
      : query.salvo
        ? project.published
          ? 'Salvo. O site já mostra a versão nova.'
          : 'Salvo. O projeto continua como rascunho, só você vê na pré-visualização.'
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
            <span className={`text-sm ${project.published ? 'text-success' : 'text-muted'}`}>
              {project.published ? 'Publicado' : 'Rascunho (não aparece no site)'}
            </span>
          }
        />
      </div>
      {notice && (
        <p role="status" className="mb-6 rounded-md border border-success/40 bg-success/10 px-4 py-3 text-sm">
          {notice}
        </p>
      )}
      <QualityPanel {...quality} slug={project.slug} published={project.published} />
      <ProjectForm project={project} privateData={privateData as ProjectPrivateRow | null} categories={categories} />
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

