import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect('/login');

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

  const [{ data: role }, { data: church }, { data: profile }] = await Promise.all([
    supabase.from('roles').select('key,name').eq('id', membership.role_id).maybeSingle(),
    supabase.from('churches').select('name,logo_url,primary_color').eq('id', membership.church_id).maybeSingle(),
    supabase.from('profiles').select('full_name,avatar_url').eq('id', user.id).maybeSingle(),
  ]);

  return {
    supabase,
    user,
    churchId: membership.church_id as string,
    unitId: membership.unit_id as string | null,
    roleId: membership.role_id as string,
    roleKey: (role?.key as string | undefined) || 'member',
    roleName: (role?.name as string | undefined) || 'Membro',
    churchName: (church?.name as string | undefined) || 'Minha igreja',
    churchLogo: church?.logo_url as string | null | undefined,
    churchColor: (church?.primary_color as string | undefined) || '#0f766e',
    profileName: (profile?.full_name as string | undefined) || user.email?.split('@')[0] || 'Usuário',
  };
}
