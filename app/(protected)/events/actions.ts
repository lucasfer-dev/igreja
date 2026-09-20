'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth';

const schema = z.object({
  title: z.string().min(2).max(120),
  startsAt: z.string().min(1),
  endsAt: z.string().optional(),
  address: z.string().max(180).optional(),
  capacity: z.string().optional(),
});

export async function createEvent(formData: FormData) {
  const { supabase, churchId, unitId } = await requirePermission('events.manage');
  const parsed = schema.safeParse({
    title: formData.get('title'),
    startsAt: formData.get('startsAt'),
    endsAt: formData.get('endsAt') || undefined,
    address: formData.get('address') || undefined,
    capacity: formData.get('capacity') || undefined,
  });
  if (!parsed.success) redirect('/events/new?error='+encodeURIComponent('Revise os dados informados.'));

  const {data,error}=await supabase.from('events').insert({
    church_id: churchId,
    unit_id: unitId,
    title: parsed.data.title,
    starts_at: new Date(parsed.data.startsAt).toISOString(),
    ends_at: parsed.data.endsAt ? new Date(parsed.data.endsAt).toISOString() : null,
    address: parsed.data.address || null,
    capacity: parsed.data.capacity ? Number(parsed.data.capacity) : null,
    status: 'published',
  }).select('id').single();

  if(error||!data) redirect('/events/new?error='+encodeURIComponent(error?.message||'Não foi possível criar o evento.'));
  revalidatePath('/events');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  redirect('/events/'+data.id);
}
