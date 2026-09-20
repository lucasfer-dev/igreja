'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireChurch } from '@/lib/auth';

const memberSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  birth_date: z.string().optional(),
  cpf: z.string().optional(),
  status: z.enum(['visitor','attendee','member','leader','volunteer','inactive']),
  address: z.string().optional(),
  marital_status: z.string().optional(),
  profession: z.string().optional(),
  gender: z.string().optional(),
  joined_at: z.string().optional(),
  conversion_date: z.string().optional(),
  baptism_date: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  notes: z.string().optional(),
});

function nullable(value?: string) { return value?.trim() ? value.trim() : null; }

export async function createMember(formData: FormData) {
  const parsed = memberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect('/members/new?error=' + encodeURIComponent('Revise os dados informados.'));

  const { supabase, churchId, unitId, user } = await requireChurch();
  const data = parsed.data;
  const { data: member, error } = await supabase.from('church_members').insert({
    church_id: churchId, unit_id: unitId, full_name: data.full_name,
    email: nullable(data.email), phone: nullable(data.phone), whatsapp: nullable(data.whatsapp),
    birth_date: nullable(data.birth_date), cpf: nullable(data.cpf), status: data.status,
    address: nullable(data.address), marital_status: nullable(data.marital_status),
    profession: nullable(data.profession), gender: nullable(data.gender),
    joined_at: nullable(data.joined_at), conversion_date: nullable(data.conversion_date),
    baptism_date: nullable(data.baptism_date), emergency_contact_name: nullable(data.emergency_contact_name),
    emergency_contact_phone: nullable(data.emergency_contact_phone), notes: nullable(data.notes),
  }).select('id').single();

  if (error || !member) redirect('/members/new?error=' + encodeURIComponent(error?.message || 'Não foi possível cadastrar.'));

  await supabase.from('member_history').insert({
    church_id: churchId, member_id: member.id, type: 'registration',
    title: 'Membro cadastrado', description: 'Cadastro criado no ChurchOS.', created_by: user.id,
  });

  revalidatePath('/members');
  redirect('/members/' + member.id);
}

export async function updateMember(memberId: string, formData: FormData) {
  const parsed = memberSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect('/members/' + memberId + '?error=' + encodeURIComponent('Revise os dados informados.'));

  const { supabase, churchId, user } = await requireChurch();
  const data = parsed.data;
  const { error } = await supabase.from('church_members').update({
    full_name: data.full_name, email: nullable(data.email), phone: nullable(data.phone),
    whatsapp: nullable(data.whatsapp), birth_date: nullable(data.birth_date), cpf: nullable(data.cpf),
    status: data.status, address: nullable(data.address), marital_status: nullable(data.marital_status),
    profession: nullable(data.profession), gender: nullable(data.gender), joined_at: nullable(data.joined_at),
    conversion_date: nullable(data.conversion_date), baptism_date: nullable(data.baptism_date),
    emergency_contact_name: nullable(data.emergency_contact_name), emergency_contact_phone: nullable(data.emergency_contact_phone),
    notes: nullable(data.notes), updated_at: new Date().toISOString(),
  }).eq('church_id', churchId).eq('id', memberId);

  if (error) redirect('/members/' + memberId + '?error=' + encodeURIComponent(error.message));

  await supabase.from('member_history').insert({
    church_id: churchId, member_id: memberId, type: 'profile_update',
    title: 'Cadastro atualizado', description: 'Dados pessoais ou ministeriais foram atualizados.', created_by: user.id,
  });
  revalidatePath('/members/' + memberId);
  revalidatePath('/members');
}

export async function addMemberHistory(memberId: string, formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const type = String(formData.get('type') || 'note').trim();
  if (!title) return;
  const { supabase, churchId, user } = await requireChurch();
  await supabase.from('member_history').insert({church_id:churchId,member_id:memberId,type,title,description:description||null,created_by:user.id});
  revalidatePath('/members/' + memberId);
}
