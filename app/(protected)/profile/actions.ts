'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';

export async function updateProfile(formData: FormData) {
  const { supabase, user } = await requireUser();
  const fullName = String(formData.get('fullName') || '').trim();
  const phone = String(formData.get('phone') || '').trim();

  if (!fullName) return;
  await supabase.from('profiles').upsert({ id: user.id, full_name: fullName, phone: phone || null, updated_at: new Date().toISOString() });
  revalidatePath('/profile');
  revalidatePath('/dashboard');
}
