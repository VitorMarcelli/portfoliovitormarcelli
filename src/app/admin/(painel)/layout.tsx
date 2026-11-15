import AdminNav from '@/components/admin/AdminNav';
import { requireAdmin } from '@/lib/auth';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdmin();

  const [{ count: attention }, { count: newLeads }] = await Promise.all([
    supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('needs_attention', true),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'novo'),
  ]);

  return (
    <div className="lg:flex">
      <AdminNav email={user.email ?? ''} attention={attention ?? 0} newLeads={newLeads ?? 0} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
