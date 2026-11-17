import type { Metadata } from 'next';
import Link from 'next/link';
import ProjectForm from '@/components/admin/ProjectForm';
import { PageHeader } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import { categoryList } from '@/lib/projectQuality';

export const metadata: Metadata = { title: 'Novo projeto' };

export default async function NewProjectPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('projects').select('category_pt, category_en').not('category_pt', 'is', null);
  return (
    <>
      <Link href="/admin/projetos" className="text-sm text-muted hover:text-foreground">
        ← Projetos
      </Link>
      <div className="mt-3">
        <PageHeader title="Novo projeto" />
      </div>
      <ProjectForm categories={categoryList(data ?? [])} />
    </>
  );
}
