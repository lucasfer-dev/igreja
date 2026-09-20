'use server';

import { randomInt } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireChurch } from '@/lib/auth';

const schema=z.object({fullName:z.string().min(2).max(120),guardianName:z.string().min(2).max(120),guardianPhone:z.string().max(30).optional(),birthDate:z.string().optional(),allergies:z.string().max(300).optional(),medications:z.string().max(300).optional(),restrictions:z.string().max(300).optional()});

export async function createChild(formData:FormData){
 const {supabase,churchId,unitId}=await requireChurch();const parsed=schema.safeParse({fullName:formData.get('fullName'),guardianName:formData.get('guardianName'),guardianPhone:formData.get('guardianPhone')||undefined,birthDate:formData.get('birthDate')||undefined,allergies:formData.get('allergies')||undefined,medications:formData.get('medications')||undefined,restrictions:formData.get('restrictions')||undefined});if(!parsed.success)return;
 const {data:child,error}=await supabase.from('kids_children').insert({church_id:churchId,unit_id:unitId,full_name:parsed.data.fullName,guardian_name:parsed.data.guardianName,guardian_phone:parsed.data.guardianPhone||null,birth_date:parsed.data.birthDate||null,allergies:parsed.data.allergies||null,medications:parsed.data.medications||null,restrictions:parsed.data.restrictions||null,active:true}).select('id').single();
 if(!error&&child)await supabase.from('kids_guardians').insert({church_id:churchId,child_id:child.id,full_name:parsed.data.guardianName,phone:parsed.data.guardianPhone||null,relationship:'Responsável',can_pickup:true});
 revalidatePath('/kids');
}

export async function addGuardian(childId:string,formData:FormData){
 const fullName=String(formData.get('full_name')||'').trim();if(!fullName)return;const {supabase,churchId}=await requireChurch();
 await supabase.from('kids_guardians').insert({church_id:churchId,child_id:childId,full_name:fullName,phone:String(formData.get('phone')||'')||null,relationship:String(formData.get('relationship')||'Responsável'),can_pickup:formData.get('can_pickup')==='on'});
 revalidatePath('/kids');
}

export async function checkInChild(childId:string,formData:FormData){
 const {supabase,churchId,user}=await requireChurch();const securityCode=String(randomInt(100000,1000000));
 const {error}=await supabase.from('kids_checkins').insert({church_id:churchId,child_id:childId,security_code:securityCode,room:String(formData.get('room')||'')||null,teacher_name:String(formData.get('teacher_name')||'')||null,checked_in_by:user.id});
 if(error)redirect('/kids?error='+encodeURIComponent(error.message));
 revalidatePath('/kids');
 redirect('/kids?code='+securityCode);
}

export async function checkOutChild(checkinId:string,formData:FormData){
 const code=String(formData.get('security_code')||'').trim();const guardianId=String(formData.get('guardian_id')||'');const {supabase,churchId}=await requireChurch();
 const {data:guardian}=await supabase.from('kids_guardians').select('id,can_pickup').eq('church_id',churchId).eq('id',guardianId).maybeSingle();
 if(!guardian?.can_pickup)redirect('/kids?error='+encodeURIComponent('Responsável não autorizado para retirada.'));
 const {data:checkin}=await supabase.from('kids_checkins').select('id,security_code').eq('church_id',churchId).eq('id',checkinId).is('checked_out_at',null).maybeSingle();
 if(!checkin||checkin.security_code!==code)redirect('/kids?error='+encodeURIComponent('Código de segurança inválido.'));
 await supabase.from('kids_checkins').update({checked_out_at:new Date().toISOString(),checkout_guardian_id:guardianId}).eq('id',checkinId).eq('church_id',churchId);
 revalidatePath('/kids');
}
