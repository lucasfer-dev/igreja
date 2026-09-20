'use server';

import { revalidatePath } from 'next/cache';
import { requireChurch } from '@/lib/auth';

export async function markNotificationRead(id:string) {
  const {supabase,user}=await requireChurch();
  await supabase.from('notifications').update({read_at:new Date().toISOString()}).eq('id',id).eq('user_id',user.id);
  revalidatePath('/notifications'); revalidatePath('/dashboard');
}

export async function archiveNotification(id:string) {
  const {supabase,user}=await requireChurch();
  await supabase.from('notifications').update({archived_at:new Date().toISOString()}).eq('id',id).eq('user_id',user.id);
  revalidatePath('/notifications'); revalidatePath('/dashboard');
}
