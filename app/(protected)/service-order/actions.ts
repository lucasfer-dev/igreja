'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth';

const statusSchema=z.enum(['draft','ready','live','completed']);
const typeSchema=z.enum(['opening','welcome','prayer','worship','offering','announcement','sermon','communion','video','transition','closing','custom']);

export async function createServiceOrder(formData:FormData){
  const {supabase,churchId,user}=await requirePermission('service_order.manage');
  const title=String(formData.get('title')||'').trim();
  if(title.length<2) redirect('/service-order?error='+encodeURIComponent('Informe um nome para a ordem do culto.'));

  const eventId=String(formData.get('event_id')||'')||null;
  let scheduledAt=String(formData.get('scheduled_at')||'')||null;

  if(eventId&&!scheduledAt){
    const {data:event}=await supabase.from('events').select('starts_at').eq('church_id',churchId).eq('id',eventId).maybeSingle();
    scheduledAt=event?.starts_at||null;
  }

  const {data,error}=await supabase.from('service_orders').insert({
    church_id:churchId,
    event_id:eventId,
    title,
    scheduled_at:scheduledAt,
    notes:String(formData.get('notes')||'').trim()||null,
    created_by:user.id,
  }).select('id').single();

  if(error||!data) redirect('/service-order?error='+encodeURIComponent(error?.message||'Não foi possível criar a ordem.'));
  revalidatePath('/service-order');
  redirect('/service-order/'+data.id);
}

export async function addServiceOrderItem(orderId:string,formData:FormData){
  const {supabase,churchId}=await requirePermission('service_order.manage');
  const title=String(formData.get('title')||'').trim();
  const type=typeSchema.safeParse(formData.get('item_type')||'custom');
  if(title.length<2||!type.success)return;

  const {data:last}=await supabase.from('service_order_items')
    .select('position')
    .eq('church_id',churchId)
    .eq('order_id',orderId)
    .order('position',{ascending:false})
    .limit(1);

  const {error}=await supabase.from('service_order_items').insert({
    church_id:churchId,
    order_id:orderId,
    position:(last?.[0]?.position||0)+1,
    item_type:type.data,
    title,
    description:String(formData.get('description')||'').trim()||null,
    planned_minutes:Number(formData.get('planned_minutes')||0)||null,
    responsible_member_id:String(formData.get('responsible_member_id')||'')||null,
    song_id:String(formData.get('song_id')||'')||null,
  });

  if(error) redirect('/service-order/'+orderId+'?error='+encodeURIComponent(error.message));
  revalidatePath('/service-order/'+orderId);
  revalidatePath('/service-order');
}

export async function updateServiceOrderItem(orderId:string,itemId:string,formData:FormData){
  const {supabase,churchId}=await requirePermission('service_order.manage');
  const title=String(formData.get('title')||'').trim();
  const type=typeSchema.safeParse(formData.get('item_type')||'custom');
  if(title.length<2||!type.success)return;

  const {error}=await supabase.from('service_order_items').update({
    item_type:type.data,
    title,
    description:String(formData.get('description')||'').trim()||null,
    planned_minutes:Number(formData.get('planned_minutes')||0)||null,
    responsible_member_id:String(formData.get('responsible_member_id')||'')||null,
    song_id:String(formData.get('song_id')||'')||null,
  }).eq('church_id',churchId).eq('order_id',orderId).eq('id',itemId);

  if(error) redirect('/service-order/'+orderId+'?error='+encodeURIComponent(error.message));
  revalidatePath('/service-order/'+orderId);
}

export async function removeServiceOrderItem(orderId:string,itemId:string){
  const {supabase,churchId}=await requirePermission('service_order.manage');
  await supabase.from('service_order_items').delete().eq('church_id',churchId).eq('order_id',orderId).eq('id',itemId);
  const {data:remaining}=await supabase.from('service_order_items').select('id,position').eq('church_id',churchId).eq('order_id',orderId).order('position');
  for(let i=0;i<(remaining||[]).length;i++){
    if(remaining![i].position!==i+1){
      await supabase.from('service_order_items').update({position:i+1001}).eq('id',remaining![i].id);
    }
  }
  for(let i=0;i<(remaining||[]).length;i++){
    if(remaining![i].position!==i+1){
      await supabase.from('service_order_items').update({position:i+1}).eq('id',remaining![i].id);
    }
  }
  revalidatePath('/service-order/'+orderId);
  revalidatePath('/service-order');
}

export async function moveServiceOrderItem(orderId:string,itemId:string,direction:'up'|'down'){
  const {supabase,churchId}=await requirePermission('service_order.manage');
  const {data:items}=await supabase.from('service_order_items')
    .select('id,position')
    .eq('church_id',churchId)
    .eq('order_id',orderId)
    .order('position');

  const index=(items||[]).findIndex(item=>item.id===itemId);
  const swapIndex=direction==='up'?index-1:index+1;
  if(index<0||swapIndex<0||swapIndex>=(items||[]).length)return;

  const current=items![index],other=items![swapIndex];
  await supabase.from('service_order_items').update({position:1000000+current.position}).eq('id',current.id);
  await supabase.from('service_order_items').update({position:current.position}).eq('id',other.id);
  await supabase.from('service_order_items').update({position:other.position}).eq('id',current.id);
  revalidatePath('/service-order/'+orderId);
}

export async function updateServiceOrderStatus(orderId:string,formData:FormData){
  const {supabase,churchId}=await requirePermission('service_order.manage');
  const status=statusSchema.safeParse(formData.get('status'));
  if(!status.success)return;
  await supabase.from('service_orders').update({status:status.data,updated_at:new Date().toISOString()}).eq('church_id',churchId).eq('id',orderId);
  revalidatePath('/service-order');
  revalidatePath('/service-order/'+orderId);
}


export async function reorderServiceOrderItems(orderId:string,orderedIds:string[]){
  const parsed=z.array(z.string().uuid()).min(1).max(200).safeParse(orderedIds);
  if(!parsed.success)return;
  const {supabase,churchId}=await requirePermission('service_order.manage');
  const {data:items}=await supabase.from('service_order_items')
    .select('id,position')
    .eq('church_id',churchId)
    .eq('order_id',orderId)
    .order('position');

  if(!items||items.length!==parsed.data.length)return;
  const existing=new Set(items.map(item=>item.id));
  if(parsed.data.some(id=>!existing.has(id)))return;

  for(const item of items){
    await supabase.from('service_order_items').update({position:item.position+1000000})
      .eq('church_id',churchId).eq('order_id',orderId).eq('id',item.id);
  }
  for(let index=0;index<parsed.data.length;index++){
    await supabase.from('service_order_items').update({position:index+1})
      .eq('church_id',churchId).eq('order_id',orderId).eq('id',parsed.data[index]);
  }
  revalidatePath('/service-order/'+orderId);
  revalidatePath('/service-order');
}
