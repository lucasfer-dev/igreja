'use server';

import { revalidatePath } from 'next/cache';
import { requireChurch } from '@/lib/auth';

export async function updateChurch(formData: FormData) {
  const { supabase, churchId } = await requireChurch();
  const name = String(formData.get('name') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const whatsapp = String(formData.get('whatsapp') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const primaryColor = String(formData.get('primaryColor') || '#0f766e').trim();
  if (!name) return;

  await supabase.from('churches').update({ name, phone: phone || null, whatsapp: whatsapp || null, email: email || null, primary_color: primaryColor }).eq('id', churchId);
  revalidatePath('/settings');
  revalidatePath('/admin');
}
