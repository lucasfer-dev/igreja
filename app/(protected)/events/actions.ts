'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireChurch } from '@/lib/auth';

const schema = z.object({
  title: z.string().min(2).max(120),
  startsAt: z.string().min(1),
  endsAt: z.string().optional(),
  address: z.string().max(180).optional(),
  capacity: z.string().optional(),
});

export async function createEvent(formData: FormData) {
  const { supabase, churchId, unitId } = await requireChurch();
  const parsed = schema.safeParse({
    title: formData.get('title'),
    startsAt: formData.get('startsAt'),
    endsAt: formData.get('endsAt') || undefined,
    address: formData.get('address') || undefined,
    capacity: formData.get('capacity') || undefined,
  });
  if (!parsed.success) return;

  await supabase.from('events').insert({
    church_id: churchId,
    unit_id: unitId,
    title: parsed.data.title,
    starts_at: new Date(parsed.data.startsAt).toISOString(),
    ends_at: parsed.data.endsAt ? new Date(parsed.data.endsAt).toISOString() : null,
    address: parsed.data.address || null,
    capacity: parsed.data.capacity ? Number(parsed.data.capacity) : null,
    status: 'published',
  });

  revalidatePath('/events');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
}
