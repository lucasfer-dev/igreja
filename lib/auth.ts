import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return { supabase, user };
}

export async function requireChurch() {
  const { supabase, user } = await requireUser();

  const { data: membership } = await supabase
    .from('church_users')
    .select('church_id, unit_id, role_id, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (!membership) redirect('/onboarding');

  return {
    supabase,
    user,
    churchId: membership.church_id as string,
    unitId: membership.unit_id as string | null,
    roleId: membership.role_id as string,
  };
}
