'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireChurch } from '@/lib/auth';

export async function createCampaign(formData:FormData){
  const {supabase,churchId}=await requireChurch();
  const title=String(formData.get('title')||'').trim();
  if(!title) redirect('/donations/campaigns/new?error='+encodeURIComponent('Informe o nome da campanha.'));

  const {data,error}=await supabase.from('donation_campaigns').insert({
    church_id:churchId,
    title,
    description:String(formData.get('description')||'')||null,
    goal_amount:Number(formData.get('goal_amount')||0)||null,
    starts_at:String(formData.get('starts_at')||'')||null,
    ends_at:String(formData.get('ends_at')||'')||null,
    active:true,
  }).select('id').single();

  if(error||!data) redirect('/donations/campaigns/new?error='+encodeURIComponent(error?.message||'Não foi possível criar a campanha.'));
  revalidatePath('/donations');
  redirect('/donations/campaigns/'+data.id);
}

export async function registerDonation(formData:FormData){
  const {supabase,churchId,user}=await requireChurch();
  const amount=Number(formData.get('amount')||0);
  if(amount<=0) redirect('/donations/new?error='+encodeURIComponent('Informe um valor válido.'));

  const suppliedMemberId=String(formData.get('member_id')||'');
  const campaignId=String(formData.get('campaign_id')||'');
  const {data:ownMember}=await supabase.from('church_members').select('id').eq('church_id',churchId).eq('auth_user_id',user.id).maybeSingle();
  const memberId=suppliedMemberId||ownMember?.id||'';

  if(!memberId) redirect('/donations/new?error='+encodeURIComponent('Nenhum membro foi associado à contribuição.'));

  const {error}=await supabase.from('donations').insert({
    church_id:churchId,
    campaign_id:campaignId||null,
    member_id:memberId,
    amount,
    fund:String(formData.get('fund')||'Geral').trim()||'Geral',
    method:String(formData.get('method')||'pix'),
    anonymous:formData.get('anonymous')==='on',
    notes:String(formData.get('notes')||'')||null,
    status:'received',
    occurred_at:String(formData.get('occurred_at')||'')?new Date(String(formData.get('occurred_at'))).toISOString():new Date().toISOString(),
  });

  if(error) redirect('/donations/new?error='+encodeURIComponent(error.message));
  revalidatePath('/donations');
  revalidatePath('/dashboard');
  redirect('/donations?message='+encodeURIComponent('Contribuição registrada.'));
}
