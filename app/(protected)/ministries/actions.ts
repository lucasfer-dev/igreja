'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireChurch } from '@/lib/auth';

const schema = z.object({ name:z.string().min(2).max(100), description:z.string().max(600).optional() });

export async function createMinistry(formData: FormData) {
  const { supabase, churchId, unitId } = await requireChurch();
  const parsed=schema.safeParse({name:formData.get('name'),description:formData.get('description')||undefined});
  if(!parsed.success)return;
  await supabase.from('ministries').insert({church_id:churchId,unit_id:unitId,name:parsed.data.name,description:parsed.data.description||null,active:true});
  revalidatePath('/ministries');
}
