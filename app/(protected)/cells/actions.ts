'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireChurch } from '@/lib/auth';

const schema = z.object({
  name: z.string().min(2).max(100),
  weekday: z.coerce.number().int().min(0).max(6),
  startsAt: z.string().optional(),
  address: z.string().max(200).optional(),
  capacity: z.string().optional(),
});

export async function createCell(formData: FormData) {
  const { supabase, churchId, unitId } = await requireChurch();
  const parsed = schema.safeParse({
    name: formData.get('name'),
    weekday: formData.get('weekday'),
    startsAt: formData.get('startsAt') || undefined,
    address: formData.get('address') || undefined,
    capacity: formData.get('capacity') || undefined,
  });
  if (!parsed.success) return;

  await supabase.from('cells').insert({
    church_id: churchId,
    unit_id: unitId,
    name: parsed.data.name,
    weekday: parsed.data.weekday,
    starts_at: parsed.data.startsAt || null,
    address: parsed.data.address || null,
    capacity: parsed.data.capacity ? Number(parsed.data.capacity) : null,
    active: true,
  });
  revalidatePath('/cells');
  revalidatePath('/admin');
}
