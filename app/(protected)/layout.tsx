import { AppShell } from '@/components/app-shell';
import { requireChurch } from '@/lib/auth';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const context = await requireChurch();

  return (
    <AppShell
      churchName={context.churchName}
      profileName={context.profileName}
      roleName={context.roleName}
      roleKey={context.roleKey}
    >
      {children}
    </AppShell>
  );
}
