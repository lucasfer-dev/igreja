'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth';

const optionalUrl=z.union([z.string().url(),z.literal('')]).optional();

const schema = z.object({
  title: z.string().trim().min(2).max(120),
  category: z.string().trim().max(80).optional(),
  description: z.string().trim().max(4000).optional(),
  bannerUrl: optionalUrl,
  startsAt: z.string().min(1),
  endsAt: z.string().optional(),
  address: z.string().trim().max(180).optional(),
  capacity: z.string().optional(),
});

export async function createEvent(formData: FormData) {
  const { supabase, churchId, unitId } = await requirePermission('events.manage');
  const parsed = schema.safeParse({
    title: formData.get('title'),
    category: formData.get('category') || undefined,
    description: formData.get('description') || undefined,
    bannerUrl: formData.get('bannerUrl') || undefined,
    startsAt: formData.get('startsAt'),
    endsAt: formData.get('endsAt') || undefined,
    address: formData.get('address') || undefined,
    capacity: formData.get('capacity') || undefined,
  });
  if (!parsed.success) redirect('/events/new?error='+encodeURIComponent('Revise os dados informados.'));

  const startsAt=new Date(parsed.data.startsAt);
  const endsAt=parsed.data.endsAt?new Date(parsed.data.endsAt):null;
  const capacity=parsed.data.capacity?Number(parsed.data.capacity):null;
  if(Number.isNaN(startsAt.getTime())||(endsAt&&Number.isNaN(endsAt.getTime()))||(endsAt&&endsAt<=startsAt)||(capacity!==null&&(!Number.isInteger(capacity)||capacity<1))){
    redirect('/events/new?error='+encodeURIComponent('Confira datas, horários e capacidade do evento.'));
  }

  const {data,error}=await supabase.from('events').insert({
    church_id: churchId,
    unit_id: unitId,
    title: parsed.data.title,
    category: parsed.data.category || null,
    description: parsed.data.description || null,
    banner_url: parsed.data.bannerUrl || null,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt?.toISOString() || null,
    address: parsed.data.address || null,
    capacity,
    status: 'published',
  }).select('id').single();

  if(error||!data) redirect('/events/new?error='+encodeURIComponent(error?.message||'Não foi possível criar o evento.'));
  revalidatePath('/events');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  redirect('/events/'+data.id);
}
