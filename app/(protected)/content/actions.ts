'use server';

import { revalidatePath } from 'next/cache';
import { requireChurch } from '@/lib/auth';

export async function createContent(formData: FormData) {
  const { supabase, churchId, user } = await requireChurch();
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const category = String(formData.get('category') || '').trim();
  const contentType = String(formData.get('content_type') || 'article').trim();
  const url = String(formData.get('url') || '').trim();
  const mediaUrl = String(formData.get('media_url') || '').trim();
  if (!title) return;

  await supabase.from('content_library').insert({
    church_id: churchId, title, description: description || null, category: category || null,
    content_type: contentType || 'article', url: url || null, media_url: mediaUrl || null,
    published: true, created_by: user.id,
  });

  revalidatePath('/content');
  revalidatePath('/dashboard');
}
