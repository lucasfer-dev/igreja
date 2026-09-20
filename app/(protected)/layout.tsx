import { AppShell } from '@/components/app-shell';
import { requireChurch } from '@/lib/auth';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const context = await requireChurch();
  const { count: unreadCount } = await context.supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('church_id', context.churchId)
    .eq('user_id', context.user.id)
    .is('read_at', null)
    .is('archived_at', null);

  return (
    <AppShell
      churchName={context.churchName}
      profileName={context.profileName}
      roleName={context.roleName}
      roleKey={context.roleKey}
      unreadCount={unreadCount || 0}
    >
      {children}
    </AppShell>
  );
}
