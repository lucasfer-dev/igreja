'use server';
import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth';

async function getYouthMinistry(supabase:any,churchId:string,unitId:string|null){
 let {data}=await supabase.from('ministries').select('id').eq('church_id',churchId).eq('name','Jovens').maybeSingle();
 if(!data){const created=await supabase.from('ministries').insert({church_id:churchId,unit_id:unitId,name:'Jovens',description:'Ministério de jovens',active:true}).select('id').single();data=created.data}
 return data?.id as string|undefined;
}
export async function addYouthMember(formData:FormData){
 const {supabase,churchId,unitId}=await requirePermission('ministries.manage');const memberId=String(formData.get('member_id')||'');if(!memberId)return;const ministryId=await getYouthMinistry(supabase,churchId,unitId);if(!ministryId)return;
 await supabase.from('ministry_members').upsert({ministry_id:ministryId,member_id:memberId,role_name:String(formData.get('role_name')||'Jovem'),active:true},{onConflict:'ministry_id,member_id'});
 revalidatePath('/youth');
}
