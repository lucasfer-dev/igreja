'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth';

const visitorSchema=z.object({
  full_name:z.string().min(2),
  email:z.string().email().optional().or(z.literal('')),
  phone:z.string().optional(),
  source:z.string().optional(),
  whatsapp_opt_in:z.string().optional()
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
  const parsed=visitorSchema.safeParse(Object.fromEntries(formData));
  if(!parsed.success) redirect('/visitors/new?error='+encodeURIComponent('Revise os dados informados.'));
  const {supabase,churchId,unitId}=await requirePermission('visitors.manage');
  const consent=parsed.data.whatsapp_opt_in==='on';
  const {data,error}=await supabase.from('visitors').insert({
    full_name:parsed.data.full_name,email:parsed.data.email||null,phone:parsed.data.phone||null,source:parsed.data.source||null,
    church_id:churchId,unit_id:unitId,stage:'new',first_visit_at:new Date().toISOString().slice(0,10),
    whatsapp_opt_in:consent,whatsapp_opt_in_at:consent?new Date().toISOString():null
  }).select('id,phone,whatsapp_opt_in').single();
  if(error||!data) redirect('/visitors/new?error='+encodeURIComponent(error?.message||'Não foi possível salvar.'));
  await queueRules(supabase,churchId,data,'new');
  revalidatePath('/visitors'); revalidatePath('/communications'); redirect('/visitors');
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
