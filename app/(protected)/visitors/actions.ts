'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth';

const visitorSchema=z.object({full_name:z.string().min(2),email:z.string().email().optional().or(z.literal('')),phone:z.string().optional(),source:z.string().optional()});

export async function createVisitor(formData:FormData){
  const parsed=visitorSchema.safeParse(Object.fromEntries(formData));
  if(!parsed.success)redirect('/visitors/new?error='+encodeURIComponent('Revise os dados informados.'));
  const {supabase,churchId,unitId}=await requirePermission('visitors.manage');
  const {error}=await supabase.from('visitors').insert({...parsed.data,church_id:churchId,unit_id:unitId,email:parsed.data.email||null,stage:'new',first_visit_at:new Date().toISOString().slice(0,10)});
  if(error)redirect('/visitors/new?error='+encodeURIComponent(error.message));
  revalidatePath('/visitors'); redirect('/visitors');
}

export async function updateVisitorStage(visitorId:string,formData:FormData){
  const stage=String(formData.get('stage')||'new');
  const allowed=['new','contacted','returned','integrated','member'];
  if(!allowed.includes(stage))return;
  const {supabase,churchId,user}=await requirePermission('visitors.manage');
  const {error}=await supabase.from('visitors').update({stage,updated_at:new Date().toISOString()}).eq('church_id',churchId).eq('id',visitorId);
  if(!error){
    await supabase.from('visitor_contacts').insert({church_id:churchId,visitor_id:visitorId,contacted_by:user.id,channel:'system',notes:'Etapa atualizada para '+stage});
  }
  revalidatePath('/visitors');
}
