'use server';

import { revalidatePath } from 'next/cache';
import { requireChurch } from '@/lib/auth';

export async function addMinistryMember(ministryId:string,formData:FormData){
 const memberId=String(formData.get('member_id')||'');const role=String(formData.get('role_name')||'Integrante').trim();if(!memberId)return;
 const {supabase,churchId}=await requireChurch();
 const {data:ministry}=await supabase.from('ministries').select('id').eq('church_id',churchId).eq('id',ministryId).maybeSingle();if(!ministry)return;
 await supabase.from('ministry_members').upsert({ministry_id:ministryId,member_id:memberId,role_name:role||'Integrante',active:true},{onConflict:'ministry_id,member_id'});
 revalidatePath('/ministries/'+ministryId);
}
