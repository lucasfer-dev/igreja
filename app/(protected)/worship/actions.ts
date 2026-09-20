'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireChurch } from '@/lib/auth';

export async function addSong(formData:FormData){
  const {supabase,churchId}=await requireChurch();
  const title=String(formData.get('title')||'').trim();
  if(!title) redirect('/worship/songs/new?error='+encodeURIComponent('Informe o título da música.'));

  const {error}=await supabase.from('songs').insert({
    church_id:churchId,
    title,
    artist:String(formData.get('artist')||'')||null,
    key:String(formData.get('key')||'')||null,
    bpm:Number(formData.get('bpm')||0)||null,
    meter:String(formData.get('meter')||'')||null,
    category:String(formData.get('category')||'')||null,
    duration_seconds:Number(formData.get('duration_seconds')||0)||null,
    lyrics:String(formData.get('lyrics')||'')||null,
    chords:String(formData.get('chords')||'')||null,
    link_url:String(formData.get('link_url')||'')||null,
  });
  if(error) redirect('/worship/songs/new?error='+encodeURIComponent(error.message));
  revalidatePath('/worship');
  redirect('/worship');
}

export async function createSet(formData:FormData){
  const {supabase,churchId}=await requireChurch();
  const title=String(formData.get('title')||'').trim();
  if(!title) redirect('/worship/sets/new?error='+encodeURIComponent('Informe o nome do plano.'));

  const {data,error}=await supabase.from('worship_sets').insert({
    church_id:churchId,
    title,
    event_id:String(formData.get('event_id')||'')||null,
    leader_member_id:String(formData.get('leader_member_id')||'')||null,
    scheduled_at:String(formData.get('scheduled_at')||'')||null,
    rehearsal_at:String(formData.get('rehearsal_at')||'')||null,
    status:String(formData.get('status')||'draft'),
    notes:String(formData.get('notes')||'')||null,
  }).select('id').single();

  if(error||!data) redirect('/worship/sets/new?error='+encodeURIComponent(error?.message||'Não foi possível criar o plano.'));
  revalidatePath('/worship');
  revalidatePath('/projection');
  redirect('/worship/sets/'+data.id);
}

export async function addSongToSet(setId:string,formData:FormData){
  const songId=String(formData.get('song_id')||'');
  if(!songId)return;
  const {supabase}=await requireChurch();
  const {data:rows}=await supabase.from('worship_set_songs').select('position').eq('set_id',setId).order('position',{ascending:false}).limit(1);
  await supabase.from('worship_set_songs').upsert({
    set_id:setId,
    song_id:songId,
    position:(rows?.[0]?.position||0)+1,
    transpose_to:String(formData.get('transpose_to')||'')||null,
    notes:String(formData.get('notes')||'')||null,
  },{onConflict:'set_id,song_id'});
  revalidatePath('/worship/sets/'+setId);
  revalidatePath('/worship');
  revalidatePath('/projection');
}

export async function updateSetStatus(setId:string,formData:FormData){
  const {supabase,churchId}=await requireChurch();
  await supabase.from('worship_sets').update({status:String(formData.get('status')||'draft')}).eq('church_id',churchId).eq('id',setId);
  revalidatePath('/worship');
  revalidatePath('/worship/sets/'+setId);
}
