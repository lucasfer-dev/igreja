'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireChurch } from '@/lib/auth';

const schema=z.object({fullName:z.string().min(2).max(120),guardianName:z.string().min(2).max(120),guardianPhone:z.string().max(30).optional(),birthDate:z.string().optional(),allergies:z.string().max(300).optional()});

export async function createChild(formData:FormData){
  const {supabase,churchId,unitId}=await requireChurch();
  const parsed=schema.safeParse({fullName:formData.get('fullName'),guardianName:formData.get('guardianName'),guardianPhone:formData.get('guardianPhone')||undefined,birthDate:formData.get('birthDate')||undefined,allergies:formData.get('allergies')||undefined});
  if(!parsed.success)return;
  await supabase.from('kids_children').insert({church_id:churchId,unit_id:unitId,full_name:parsed.data.fullName,guardian_name:parsed.data.guardianName,guardian_phone:parsed.data.guardianPhone||null,birth_date:parsed.data.birthDate||null,allergies:parsed.data.allergies||null,active:true});
  revalidatePath('/kids');
}
