'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireChurch } from '@/lib/auth';

const schema = z.object({ title: z.string().min(3).max(120), body: z.string().min(3).max(2000) });

export async function publishAnnouncement(formData: FormData) {
  const { supabase, churchId, user } = await requireChurch();
  const parsed = schema.safeParse({ title: formData.get('title'), body: formData.get('body') });
  if (!parsed.success) return;

  const { error } = await supabase.from('announcements').insert({ church_id: churchId, title: parsed.data.title, body: parsed.data.body, created_by: user.id, published: true });
  if (!error) {
    const { data: users } = await supabase.from('church_users').select('user_id').eq('church_id', churchId).eq('status','active');
    if (users?.length) await supabase.from('notifications').insert(users.map(row => ({
      church_id: churchId, user_id: row.user_id, type: 'announcement', title: parsed.data.title, body: parsed.data.body, data: {},
    })));
  }
  revalidatePath('/communications'); revalidatePath('/dashboard'); revalidatePath('/notifications');
}
