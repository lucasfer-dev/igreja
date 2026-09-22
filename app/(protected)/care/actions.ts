'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth';

const statusSchema = z.enum(['new','praying','following','completed']);

export async function updateVisitorCareStatus(id: string, formData: FormData) {
  const parsed = statusSchema.safeParse(formData.get('status'));
  if (!parsed.success) return;
  const { supabase, churchId } = await requirePermission('care.manage');
  await supabase.from('visitor_care_requests').update({
    status: parsed.data,
    updated_at: new Date().toISOString(),
  }).eq('church_id', churchId).eq('id', id);
  revalidatePath('/care');
}

export async function updateMemberPrayerStatus(id: string, formData: FormData) {
  const parsed = statusSchema.safeParse(formData.get('status'));
  if (!parsed.success) return;
  const { supabase, churchId } = await requirePermission('care.manage');
  await supabase.from('prayer_requests').update({ status: parsed.data })
    .eq('church_id', churchId).eq('id', id);
  revalidatePath('/care');
}
