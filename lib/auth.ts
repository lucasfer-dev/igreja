import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type ChurchSettings = {
  short_name?: string;
  accent_color?: string;
  background_color?: string;
  favicon_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  radio_url?: string;
  radio_name?: string;
  address?: string;
  schedule?: unknown;
};

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
    supabase.from('churches').select('name,logo_url,primary_color,secondary_color,settings').eq('id', membership.church_id).maybeSingle(),
    supabase.from('profiles').select('full_name,avatar_url').eq('id', user.id).maybeSingle(),
  ]);

  const settings = ((church?.settings && typeof church.settings === 'object') ? church.settings : {}) as ChurchSettings;

  return {
    supabase,
    user,
    churchId: membership.church_id as string,
    unitId: membership.unit_id as string | null,
    roleId: membership.role_id as string,
    roleKey: (role?.key as string | undefined) || 'member',
    roleName: (role?.name as string | undefined) || 'Membro',
    churchName: (church?.name as string | undefined) || 'Minha igreja',
    churchShortName: settings.short_name || (church?.name as string | undefined) || 'Igreja',
    churchLogo: church?.logo_url as string | null | undefined,
    churchColor: (church?.primary_color as string | undefined) || '#FF7100',
    churchSecondaryColor: (church?.secondary_color as string | undefined) || '#522402',
    churchAccentColor: settings.accent_color || '#FDA83C',
    churchBackgroundColor: settings.background_color || '#F2E6D7',
    churchSettings: settings,
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
