'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireChurch } from '@/lib/auth';

export async function createAsset(formData:FormData){
  const {supabase,churchId,unitId}=await requireChurch();
  const name=String(formData.get('name')||'').trim();
  if(!name) redirect('/assets/new?error='+encodeURIComponent('Informe o nome do bem.'));

  const {error}=await supabase.from('assets').insert({
    church_id:churchId,
    unit_id:unitId,
    name,
    category:String(formData.get('category')||'')||null,
    serial_number:String(formData.get('serial_number')||'')||null,
    location:String(formData.get('location')||'')||null,
    purchase_date:String(formData.get('purchase_date')||'')||null,
    purchase_value:Number(formData.get('purchase_value')||0)||null,
    status:String(formData.get('status')||'active'),
    notes:String(formData.get('notes')||'')||null
  });

  if(error) redirect('/assets/new?error='+encodeURIComponent(error.message));
  revalidatePath('/assets');
  redirect('/assets');
}
