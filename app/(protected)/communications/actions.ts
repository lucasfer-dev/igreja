'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireChurch } from '@/lib/auth';

const schema = z.object({ title: z.string().min(3).max(120), body: z.string().min(3).max(2000) });

export async function publishAnnouncement(formData: FormData) {
  const { supabase, churchId, user } = await requireChurch();
  const parsed = schema.safeParse({ title: formData.get('title'), body: formData.get('body') });
  if (!parsed.success) return;

  await supabase.from('announcements').insert({ church_id: churchId, title: parsed.data.title, body: parsed.data.body, created_by: user.id, published: true });
  revalidatePath('/communications');
  revalidatePath('/dashboard');
}
