'use server';

import { revalidatePath } from 'next/cache';
import { requireChurch } from '@/lib/auth';

export async function addCellMember(cellId:string,formData:FormData){
  const memberId=String(formData.get('member_id')||''); if(!memberId)return;
  const {supabase,churchId}=await requireChurch();
  const {data:cell}=await supabase.from('cells').select('id').eq('church_id',churchId).eq('id',cellId).maybeSingle(); if(!cell)return;
  await supabase.from('cell_members').upsert({cell_id:cellId,member_id:memberId,active:true},{onConflict:'cell_id,member_id'});
  revalidatePath('/cells/'+cellId);
}

export async function setCellLeadership(cellId:string,formData:FormData){
  const {supabase,churchId}=await requireChurch();
  await supabase.from('cells').update({
    leader_member_id:String(formData.get('leader_member_id')||'')||null,
    co_leader_member_id:String(formData.get('co_leader_member_id')||'')||null,
    host_member_id:String(formData.get('host_member_id')||'')||null,
  }).eq('church_id',churchId).eq('id',cellId);
  revalidatePath('/cells/'+cellId); revalidatePath('/cells');
}

export async function recordCellAttendance(cellId:string,formData:FormData){
  const memberIds=formData.getAll('member_id').map(String).filter(Boolean); if(!memberIds.length)return;
  const {supabase,churchId}=await requireChurch();
  await supabase.from('attendances').insert(memberIds.map(member_id=>({church_id:churchId,cell_id:cellId,member_id,occurred_at:new Date().toISOString(),source:'cell'})));
  revalidatePath('/cells/'+cellId); revalidatePath('/admin');
}
