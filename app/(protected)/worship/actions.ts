'use server';
import { revalidatePath } from 'next/cache';
import { requireChurch } from '@/lib/auth';

export async function addSong(formData:FormData){
 const {supabase,churchId}=await requireChurch();
 const title=String(formData.get('title')||'').trim(); if(!title)return;
 await supabase.from('songs').insert({church_id:churchId,title,artist:String(formData.get('artist')||'')||null,key:String(formData.get('key')||'')||null,lyrics:String(formData.get('lyrics')||'')||null,chords:String(formData.get('chords')||'')||null,link_url:String(formData.get('link_url')||'')||null});
 revalidatePath('/worship');
}

export async function createSet(formData:FormData){
 const {supabase,churchId}=await requireChurch();
 const title=String(formData.get('title')||'').trim(); if(!title)return;
 await supabase.from('worship_sets').insert({church_id:churchId,title,scheduled_at:String(formData.get('scheduled_at')||'')||null,notes:String(formData.get('notes')||'')||null});
 revalidatePath('/worship'); revalidatePath('/projection');
}

export async function addSongToSet(formData:FormData){
 const setId=String(formData.get('set_id')||''); const songId=String(formData.get('song_id')||''); if(!setId||!songId)return;
 const {supabase}=await requireChurch();
 const {data:rows}=await supabase.from('worship_set_songs').select('position').eq('set_id',setId).order('position',{ascending:false}).limit(1);
 await supabase.from('worship_set_songs').upsert({set_id:setId,song_id:songId,position:(rows?.[0]?.position||0)+1,transpose_to:String(formData.get('transpose_to')||'')||null},{onConflict:'set_id,song_id'});
 revalidatePath('/worship'); revalidatePath('/projection');
}
