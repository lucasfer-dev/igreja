import { AppShell } from '@/components/app-shell';
import { requireChurch } from '@/lib/auth';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireChurch();
  return <AppShell>{children}</AppShell>;
}
