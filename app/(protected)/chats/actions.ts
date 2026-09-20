'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireChurch, requirePermission } from '@/lib/auth';

const messageSchema=z.string().trim().min(1).max(3000);
const roomTypeSchema=z.enum(['community','cell','ministry','event']);

export async function sendChatMessage(roomId:string,formData:FormData){
  const body=messageSchema.safeParse(formData.get('body'));
  if(!body.success)return;
  const {supabase,churchId,user}=await requireChurch();
  const {data:room}=await supabase.from('chat_rooms').select('id').eq('church_id',churchId).eq('id',roomId).maybeSingle();
  if(!room)return;

  const {error}=await supabase.from('chat_messages').insert({
    church_id:churchId,
    room_id:roomId,
    sender_user_id:user.id,
    body:body.data,
  });

  if(error) redirect('/chats/'+roomId+'?error='+encodeURIComponent(error.message));
  revalidatePath('/chats');
  revalidatePath('/chats/'+roomId);
  revalidatePath('/dashboard');
}

export async function createChatRoom(formData:FormData){
  const name=String(formData.get('name')||'').trim();
  const description=String(formData.get('description')||'').trim();
  const roomType=roomTypeSchema.safeParse(formData.get('room_type')||'community');
  if(name.length<2||!roomType.success)return;

  const {supabase,churchId,user}=await requirePermission('communications.manage');
  const {data,error}=await supabase.from('chat_rooms').insert({
    church_id:churchId,
    name,
    description:description||null,
    room_type:roomType.data,
    created_by:user.id,
  }).select('id').single();

  if(error||!data) redirect('/chats?error='+encodeURIComponent(error?.message||'Não foi possível criar o chat.'));

  if(roomType.data!=='community'){
    const selectedMemberIds=formData.getAll('member_ids').map(String).filter(Boolean);
    const {data:selectedMembers}=selectedMemberIds.length
      ? await supabase.from('church_members').select('auth_user_id').eq('church_id',churchId).in('id',selectedMemberIds).not('auth_user_id','is',null)
      : {data:[] as {auth_user_id:string|null}[]};

    const participantIds=[
      user.id,
      ...(selectedMembers||[]).map(member=>member.auth_user_id).filter((id):id is string=>Boolean(id)),
    ];

    await supabase.from('chat_room_members').upsert(
      [...new Set(participantIds)].map(userId=>({
        church_id:churchId,
        room_id:data.id,
        user_id:userId,
        added_by:user.id,
      })),
      {onConflict:'room_id,user_id'},
    );
  }

  revalidatePath('/chats');
  redirect('/chats/'+data.id);
}

export async function addChatParticipant(roomId:string,formData:FormData){
  const {supabase,churchId,user}=await requirePermission('communications.manage');
  const memberId=String(formData.get('member_id')||'');
  if(!memberId)return;

  const [{data:room},{data:member}]=await Promise.all([
    supabase.from('chat_rooms').select('id,room_type').eq('church_id',churchId).eq('id',roomId).maybeSingle(),
    supabase.from('church_members').select('auth_user_id').eq('church_id',churchId).eq('id',memberId).maybeSingle(),
  ]);

  if(!room||room.room_type==='community'||!member?.auth_user_id)return;

  await supabase.from('chat_room_members').upsert({
    church_id:churchId,
    room_id:roomId,
    user_id:member.auth_user_id,
    added_by:user.id,
  },{onConflict:'room_id,user_id'});

  revalidatePath('/chats/'+roomId);
}

export async function removeChatParticipant(roomId:string,userId:string){
  const {supabase,churchId}=await requirePermission('communications.manage');
  const {data:room}=await supabase.from('chat_rooms').select('id,room_type').eq('church_id',churchId).eq('id',roomId).maybeSingle();
  if(!room||room.room_type==='community')return;

  await supabase.from('chat_room_members')
    .delete()
    .eq('church_id',churchId)
    .eq('room_id',roomId)
    .eq('user_id',userId);

  revalidatePath('/chats/'+roomId);
}
