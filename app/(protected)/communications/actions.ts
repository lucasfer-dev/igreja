'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth';

const announcementSchema=z.object({title:z.string().min(3).max(120),body:z.string().min(3).max(2000),audience:z.string().min(1)});
const newsSchema=z.object({title:z.string().min(3).max(140),summary:z.string().max(240).optional(),body:z.string().min(10).max(6000),cover_url:z.string().url().optional().or(z.literal('')),featured:z.boolean()});
const ruleSchema=z.object({name:z.string().min(3).max(100),trigger_stage:z.enum(['new','contacted','returned','integrated','member']),delay_hours:z.coerce.number().int().min(0).max(720),template_name:z.string().min(2).max(120),language_code:z.string().min(2).max(20),preview_text:z.string().max(500).optional()});

type AudienceType='church'|'unit'|'cell'|'ministry'|'event'|'person';
function parseAudience(value:string):{type:AudienceType;refId:string|null}|null{
  if(value==='church') return {type:'church',refId:null};
  const [type,refId]=value.split(':',2);
  if(!refId||!['unit','cell','ministry','event','person'].includes(type)) return null;
  return {type:type as AudienceType,refId};
}

export async function publishAnnouncement(formData:FormData){
  const {supabase,churchId,user}=await requirePermission('communications.manage');
  const parsed=announcementSchema.safeParse({title:formData.get('title'),body:formData.get('body'),audience:formData.get('audience')});
  if(!parsed.success) return;
  const audience=parseAudience(parsed.data.audience); if(!audience) return;
  const {data:announcement,error}=await supabase.from('announcements').insert({
    church_id:churchId,title:parsed.data.title,body:parsed.data.body,created_by:user.id,published:true,
    audience_type:audience.type,audience_ref_id:audience.refId
  }).select('id').single();
  if(error||!announcement) return;

  let recipientIds:string[]=[];
  if(audience.type==='church'){
    const {data}=await supabase.from('church_users').select('user_id').eq('church_id',churchId).eq('status','active');
    recipientIds=(data||[]).map(r=>r.user_id);
  }else if(audience.type==='unit'&&audience.refId){
    const {data}=await supabase.from('church_users').select('user_id').eq('church_id',churchId).eq('unit_id',audience.refId).eq('status','active');
    recipientIds=(data||[]).map(r=>r.user_id);
  }else if(audience.type==='person'&&audience.refId){
    const {data}=await supabase.from('church_members').select('auth_user_id').eq('church_id',churchId).eq('id',audience.refId).maybeSingle();
    if(data?.auth_user_id) recipientIds=[data.auth_user_id];
  }else if(audience.type==='cell'&&audience.refId){
    const {data}=await supabase.from('cell_members').select('church_members!inner(auth_user_id,church_id)').eq('cell_id',audience.refId).eq('church_members.church_id',churchId).eq('active',true);
    recipientIds=(data||[]).map((r:any)=>r.church_members?.auth_user_id).filter(Boolean);
  }else if(audience.type==='ministry'&&audience.refId){
    const {data}=await supabase.from('ministry_members').select('church_members!inner(auth_user_id,church_id)').eq('ministry_id',audience.refId).eq('church_members.church_id',churchId).eq('active',true);
    recipientIds=(data||[]).map((r:any)=>r.church_members?.auth_user_id).filter(Boolean);
  }else if(audience.type==='event'&&audience.refId){
    const {data}=await supabase.from('event_registrations').select('church_members!inner(auth_user_id,church_id)').eq('church_id',churchId).eq('event_id',audience.refId);
    recipientIds=(data||[]).map((r:any)=>r.church_members?.auth_user_id).filter(Boolean);
  }

  recipientIds=[...new Set(recipientIds)];
  if(recipientIds.length) await supabase.from('notifications').insert(recipientIds.map(userId=>({
    church_id:churchId,user_id:userId,type:'announcement',title:parsed.data.title,body:parsed.data.body,
    data:{href:'/feed',announcement_id:announcement.id}
  })));
  revalidatePath('/communications'); revalidatePath('/dashboard'); revalidatePath('/notifications'); revalidatePath('/feed');
}

export async function publishNews(formData:FormData){
  const {supabase,churchId,user}=await requirePermission('communications.manage');
  const parsed=newsSchema.safeParse({
    title:formData.get('title'),summary:formData.get('summary')||undefined,body:formData.get('body'),
    cover_url:formData.get('cover_url')||'',featured:formData.get('featured')==='on'
  });
  if(!parsed.success) return;
  await supabase.from('news_posts').insert({
    church_id:churchId,title:parsed.data.title,summary:parsed.data.summary||null,body:parsed.data.body,
    cover_url:parsed.data.cover_url||null,featured:parsed.data.featured,published:true,created_by:user.id
  });
  revalidatePath('/communications'); revalidatePath('/news'); revalidatePath('/dashboard');
}

export async function createFollowupRule(formData:FormData){
  const {supabase,churchId,user}=await requirePermission('communications.manage');
  const parsed=ruleSchema.safeParse({
    name:formData.get('name'),trigger_stage:formData.get('trigger_stage'),delay_hours:formData.get('delay_hours'),
    template_name:formData.get('template_name'),language_code:formData.get('language_code')||'pt_BR',
    preview_text:formData.get('preview_text')||undefined
  });
  if(!parsed.success) return;
  await supabase.from('whatsapp_followup_rules').insert({...parsed.data,preview_text:parsed.data.preview_text||null,church_id:churchId,created_by:user.id,active:true});
  revalidatePath('/communications'); revalidatePath('/visitors');
}
