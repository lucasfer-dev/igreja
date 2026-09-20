'use server';
import { revalidatePath } from 'next/cache';
import { requireChurch } from '@/lib/auth';

export async function createCampaign(formData:FormData){
 const {supabase,churchId}=await requireChurch();const title=String(formData.get('title')||'').trim();if(!title)return;
 await supabase.from('donation_campaigns').insert({church_id:churchId,title,description:String(formData.get('description')||'')||null,goal_amount:Number(formData.get('goal_amount')||0)||null,starts_at:String(formData.get('starts_at')||'')||null,ends_at:String(formData.get('ends_at')||'')||null,active:true});
 revalidatePath('/donations');
}

export async function registerDonation(formData:FormData){
 const {supabase,churchId,user}=await requireChurch();const amount=Number(formData.get('amount')||0);if(amount<=0)return;
 const campaignId=String(formData.get('campaign_id')||'');const anonymous=formData.get('anonymous')==='on';
 const {data:member}=await supabase.from('church_members').select('id').eq('church_id',churchId).eq('auth_user_id',user.id).maybeSingle();
 await supabase.from('donations').insert({church_id:churchId,campaign_id:campaignId||null,member_id:anonymous?null:(member?.id||null),amount,method:String(formData.get('method')||'pix'),anonymous,status:'received'});
 revalidatePath('/donations');
}
