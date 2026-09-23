'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/auth';

export async function createSchedule(formData:FormData){
  const {supabase,churchId}=await requirePermission('ministries.manage');
  const eventId=String(formData.get('event_id')||''); const memberId=String(formData.get('member_id')||'');
  const ministryId=String(formData.get('ministry_id')||''); const functionName=String(formData.get('function_name')||'').trim();
  if(!eventId||!memberId||!functionName)return;
  const {data:event}=await supabase.from('events').select('starts_at,ends_at').eq('church_id',churchId).eq('id',eventId).single();
  if(!event)return;
  const {data:existing}=await supabase.from('volunteer_schedules').select('starts_at,ends_at').eq('church_id',churchId).eq('member_id',memberId);
  const start=new Date(event.starts_at).getTime(); const end=new Date(event.ends_at||new Date(start+2*60*60*1000).toISOString()).getTime();
  const conflict=(existing||[]).some(s=>{const a=new Date(s.starts_at).getTime();const b=new Date(s.ends_at||new Date(a+2*60*60*1000).toISOString()).getTime();return start<b&&end>a;});
  if(conflict)redirect('/volunteers?error='+encodeURIComponent('Esse voluntário já possui uma escala em horário conflitante.'));
  const {error}=await supabase.from('volunteer_schedules').insert({church_id:churchId,event_id:eventId,ministry_id:ministryId||null,member_id:memberId,function_name:functionName,starts_at:event.starts_at,ends_at:event.ends_at,status:'pending'});
  if(error)redirect('/volunteers?error='+encodeURIComponent(error.message));
  revalidatePath('/volunteers');
}

export async function updateScheduleStatus(id:string,formData:FormData){
  const status=String(formData.get('status')||'pending'); if(!['pending','confirmed','declined','replacement_requested'].includes(status))return;
  const {supabase,churchId}=await requirePermission('ministries.manage');
  await supabase.from('volunteer_schedules').update({status}).eq('church_id',churchId).eq('id',id);
  revalidatePath('/volunteers'); revalidatePath('/dashboard');
}
