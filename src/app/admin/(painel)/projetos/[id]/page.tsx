import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProjectForm from '@/components/admin/ProjectForm';
import { PageHeader } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import type { ProjectRow } from '@/lib/types';

export const metadata: Metadata = { title: 'Editar projeto' };

export default async function EditProjectPage({ params }: PageProps<'/admin/projetos/[id]'>) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  const project = data as ProjectRow;

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
            ) : undefined
          }
        />
      </div>
      <ProjectForm project={project} />
    </>
  );
}
