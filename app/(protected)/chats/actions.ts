'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireChurch } from '@/lib/auth';

const messageSchema=z.string().trim().min(1).max(3000);

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
  if(name.length<2)return;
  const {supabase,churchId,user}=await requireChurch();
  const {data,error}=await supabase.from('chat_rooms').insert({
    church_id:churchId,
    name,
    description:description||null,
    room_type:'community',
    created_by:user.id,
  }).select('id').single();

  if(error||!data) redirect('/chats?error='+encodeURIComponent(error?.message||'Não foi possível criar o chat.'));
  revalidatePath('/chats');
  redirect('/chats/'+data.id);
}
