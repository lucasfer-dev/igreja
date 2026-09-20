'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';

const schema = z.object({
  churchName: z.string().min(2).max(100),
  adminName: z.string().min(2).max(100),
  unitName: z.string().min(2).max(100),
  phone: z.string().max(30).optional(),
  email: z.string().email(),
});

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function createChurch(formData: FormData) {
  const { supabase, user } = await requireUser();
  const parsed = schema.safeParse({
    churchName: formData.get('churchName'),
    adminName: formData.get('adminName'),
    unitName: formData.get('unitName'),
    phone: formData.get('phone') || undefined,
    email: formData.get('email'),
  });

  if (!parsed.success) redirect('/onboarding?error=' + encodeURIComponent('Revise os dados informados.'));

  const { churchName, adminName, unitName, phone, email } = parsed.data;
  const slug = `${slugify(churchName)}-${user.id.slice(0, 6)}`;

  const { data: church, error: churchError } = await supabase
    .from('churches')
    .insert({ name: churchName, slug, email, phone: phone || null, created_by: user.id })
    .select('id')
    .single();

  if (churchError || !church) redirect('/onboarding?error=' + encodeURIComponent(churchError?.message || 'Não foi possível criar a igreja.'));

  const { data: unit, error: unitError } = await supabase
    .from('church_units')
    .insert({ church_id: church.id, name: unitName, slug: 'principal', is_main: true })
    .select('id')
    .single();

  if (unitError || !unit) redirect('/onboarding?error=' + encodeURIComponent(unitError?.message || 'Não foi possível criar a unidade.'));

  const { data: role, error: roleError } = await supabase
    .from('roles')
    .insert({ church_id: church.id, key: 'church_admin', name: 'Administrador', is_system: true })
    .select('id')
    .single();

  if (roleError || !role) redirect('/onboarding?error=' + encodeURIComponent(roleError?.message || 'Não foi possível criar o perfil administrativo.'));

  const { data: permissions } = await supabase.from('permissions').select('key');
  if (permissions?.length) {
    const { error } = await supabase.from('role_permissions').insert(permissions.map((permission) => ({ role_id: role.id, permission_key: permission.key })));
    if (error) redirect('/onboarding?error=' + encodeURIComponent(error.message));
  }

  const { error: membershipError } = await supabase.from('church_users').insert({
    church_id: church.id,
    user_id: user.id,
    unit_id: unit.id,
    role_id: role.id,
    status: 'active',
  });

  if (membershipError) redirect('/onboarding?error=' + encodeURIComponent(membershipError.message));

  await supabase.from('profiles').upsert({ id: user.id, full_name: adminName, phone: phone || null });

  redirect('/admin');
}
