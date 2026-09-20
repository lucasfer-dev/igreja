'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth';

const schema = z.object({ name:z.string().min(2).max(100), description:z.string().max(600).optional() });

export async function createMinistry(formData: FormData) {
  const { supabase, churchId, unitId } = await requirePermission('ministries.manage');
  const parsed=schema.safeParse({name:formData.get('name'),description:formData.get('description')||undefined});
  if(!parsed.success) redirect('/ministries/new?error='+encodeURIComponent('Revise os dados informados.'));

  const {data,error}=await supabase.from('ministries').insert({
    church_id:churchId,unit_id:unitId,name:parsed.data.name,description:parsed.data.description||null,active:true
  }).select('id').single();

  if(error||!data) redirect('/ministries/new?error='+encodeURIComponent(error?.message||'Não foi possível criar o ministério.'));
  revalidatePath('/ministries');
  redirect('/ministries/'+data.id);
}
