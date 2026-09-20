import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const requireUser = cache(async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect('/login');

  return { supabase, user };
});

export const requireChurch = cache(async function requireChurch() {
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
    supabase.from('roles').select('key,name').eq('id', membership.role_id).eq('church_id', membership.church_id).maybeSingle(),
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
    churchColor: (church?.primary_color as string | undefined) || '#2563eb',
    profileName: (profile?.full_name as string | undefined) || user.email?.split('@')[0] || 'Usuário',
  };
});

export async function requirePermission(permission: string) {
  const context = await requireChurch();

  const { data: granted } = await context.supabase
    .from('role_permissions')
    .select('permission_key')
    .eq('role_id', context.roleId)
    .eq('permission_key', permission)
    .maybeSingle();

  if (!granted) redirect('/dashboard?error=' + encodeURIComponent('Você não tem permissão para acessar esta área.'));

  return context;
}

export async function requireAnyPermission(permissions: string[]) {
  const context = await requireChurch();

  const { data: granted } = await context.supabase
    .from('role_permissions')
    .select('permission_key')
    .eq('role_id', context.roleId)
    .in('permission_key', permissions)
    .limit(1);

  if (!granted?.length) redirect('/dashboard?error=' + encodeURIComponent('Você não tem permissão para acessar esta área.'));

  return context;
}
