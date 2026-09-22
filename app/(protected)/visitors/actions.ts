'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth';

const interests=['small_group','baptism','pastoral_visit','ministry','just_visiting'] as const;
const visitorSchema=z.object({
  full_name:z.string().trim().min(2).max(120),
  email:z.string().email().optional().or(z.literal('')),
  phone:z.string().trim().optional(),
  source:z.string().trim().optional(),
  birth_date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  visit_status:z.enum(['first_time','returning']).optional(),
  location_status:z.enum(['local','other_city']).optional(),
  interests:z.array(z.enum(interests)).max(5),
  prayer_request:z.string().trim().max(2000).optional().or(z.literal('')),
  whatsapp_opt_in:z.boolean(),
  lgpd_consent:z.literal(true),
});

async function queueRules(supabase:any,churchId:string,visitor:{id:string;phone:string|null;whatsapp_opt_in:boolean},stage:string){
  if(!visitor.phone||!visitor.whatsapp_opt_in) return;
  const {data:rules}=await supabase.from('whatsapp_followup_rules').select('id,delay_hours,template_name,language_code')
    .eq('church_id',churchId).eq('trigger_stage',stage).eq('active',true);
  if(!rules?.length) return;
  const now=Date.now();
  await supabase.from('whatsapp_outbox').insert(rules.map((rule:any)=>({
    church_id:churchId,visitor_id:visitor.id,rule_id:rule.id,to_phone:visitor.phone,
    template_name:rule.template_name,language_code:rule.language_code,
    scheduled_for:new Date(now+rule.delay_hours*60*60*1000).toISOString(),status:'pending'
  })));
}

export async function createVisitor(formData:FormData){
  const parsed=visitorSchema.safeParse({
    full_name:formData.get('full_name'),
    email:formData.get('email')||'',
    phone:formData.get('phone')||'',
    source:formData.get('source')||'',
    birth_date:formData.get('birth_date')||'',
    visit_status:formData.get('visit_status')||undefined,
    location_status:formData.get('location_status')||undefined,
    interests:formData.getAll('interests').map(String),
    prayer_request:formData.get('prayer_request')||'',
    whatsapp_opt_in:formData.get('whatsapp_opt_in')==='on',
    lgpd_consent:formData.get('lgpd_consent')==='on',
  });
  if(!parsed.success) redirect('/visitors/new?error='+encodeURIComponent('Revise os dados e confirme o consentimento LGPD.'));
  const {supabase,churchId,unitId}=await requirePermission('visitors.manage');
  const now=new Date();
  const {data,error}=await supabase.from('visitors').insert({
    full_name:parsed.data.full_name,email:parsed.data.email||null,phone:parsed.data.phone||null,source:parsed.data.source||'cadastro_interno',
    church_id:churchId,unit_id:unitId,stage:'new',first_visit_at:now.toISOString().slice(0,10),
    birth_date:parsed.data.birth_date||null,visit_status:parsed.data.visit_status||null,location_status:parsed.data.location_status||null,
    interests:parsed.data.interests,prayer_request:parsed.data.prayer_request||null,
    whatsapp_opt_in:parsed.data.whatsapp_opt_in,whatsapp_opt_in_at:parsed.data.whatsapp_opt_in?now.toISOString():null,
    lgpd_consent:true,lgpd_consent_at:now.toISOString()
  }).select('id,phone,whatsapp_opt_in').single();
  if(error||!data) redirect('/visitors/new?error='+encodeURIComponent(error?.message||'Não foi possível salvar.'));

  if(parsed.data.prayer_request){
    await supabase.from('visitor_care_requests').insert({
      church_id:churchId,visitor_id:data.id,body:parsed.data.prayer_request,status:'new',confidential:true
    });
  }
  await queueRules(supabase,churchId,data,'new');
  revalidatePath('/visitors'); revalidatePath('/communications'); revalidatePath('/care'); redirect('/visitors');
}

export async function updateVisitorStage(visitorId:string,formData:FormData){
  const stage=String(formData.get('stage')||'new');
  const allowed=['new','contacted','returned','integrated','member'];
  if(!allowed.includes(stage)) return;
  const {supabase,churchId,user}=await requirePermission('visitors.manage');
  const {data:visitor,error}=await supabase.from('visitors').update({stage,updated_at:new Date().toISOString()})
    .eq('church_id',churchId).eq('id',visitorId).select('id,phone,whatsapp_opt_in').single();
  if(!error&&visitor){
    await supabase.from('visitor_contacts').insert({church_id:churchId,visitor_id:visitorId,contacted_by:user.id,channel:'system',notes:'Etapa atualizada para '+stage});
    await queueRules(supabase,churchId,visitor,stage);
  }
  revalidatePath('/visitors'); revalidatePath('/communications');
}
