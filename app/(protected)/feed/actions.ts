'use server';

import { revalidatePath } from 'next/cache';
import { requireChurch } from '@/lib/auth';

export async function createPost(formData: FormData) {
  const { supabase, churchId, user } = await requireChurch();
  const body = String(formData.get('body') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const postType = String(formData.get('post_type') || 'post').trim();
  const mediaUrl = String(formData.get('media_url') || '').trim();
  if (!body) return;

  await supabase.from('posts').insert({
    church_id: churchId,
    author_user_id: user.id,
    title: title || null,
    body,
    post_type: postType || 'post',
    media_url: mediaUrl || null,
    published: true,
  });

  revalidatePath('/feed');
  revalidatePath('/dashboard');
}
