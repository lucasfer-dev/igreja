'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth';

const color=z.string().regex(/^#[0-9A-Fa-f]{6}$/);
const schema=z.object({
  name:z.string().trim().min(2).max(160),
  shortName:z.string().trim().min(2).max(40),
  email:z.string().email().optional().or(z.literal('')),
  phone:z.string().trim().max(30).optional(),
  whatsapp:z.string().trim().max(30).optional(),
  logoUrl:z.string().url().optional().or(z.literal('')),
  instagramUrl:z.string().url().optional().or(z.literal('')),
  youtubeUrl:z.string().url().optional().or(z.literal('')),
  address:z.string().trim().max(240).optional(),
  primaryColor:color,
  secondaryColor:color,
  accentColor:color,
  backgroundColor:color,
});

export async function updateChurch(formData: FormData) {
  const parsed=schema.safeParse({
    name:formData.get('name'),shortName:formData.get('shortName'),email:formData.get('email')||'',
    phone:formData.get('phone')||'',whatsapp:formData.get('whatsapp')||'',logoUrl:formData.get('logoUrl')||'',
    instagramUrl:formData.get('instagramUrl')||'',youtubeUrl:formData.get('youtubeUrl')||'',address:formData.get('address')||'',
    primaryColor:formData.get('primaryColor')||'#FF7100',secondaryColor:formData.get('secondaryColor')||'#522402',
    accentColor:formData.get('accentColor')||'#FDA83C',backgroundColor:formData.get('backgroundColor')||'#F2E6D7',
  });
  if(!parsed.success) return;

  const { supabase, churchId } = await requirePermission('church.manage');
  const {data:current}=await supabase.from('churches').select('settings').eq('id',churchId).single();
  const currentSettings=(current?.settings&&typeof current.settings==='object')?current.settings:{};

  await supabase.from('churches').update({
    name:parsed.data.name,
    phone:parsed.data.phone||null,
    whatsapp:parsed.data.whatsapp||null,
    email:parsed.data.email||null,
    logo_url:parsed.data.logoUrl||null,
    primary_color:parsed.data.primaryColor,
    secondary_color:parsed.data.secondaryColor,
    settings:{
      ...currentSettings,
      short_name:parsed.data.shortName,
      accent_color:parsed.data.accentColor,
      background_color:parsed.data.backgroundColor,
      instagram_url:parsed.data.instagramUrl||null,
      youtube_url:parsed.data.youtubeUrl||null,
      address:parsed.data.address||null,
    },
    updated_at:new Date().toISOString(),
  }).eq('id', churchId);

  revalidatePath('/settings');
  revalidatePath('/admin');
  revalidatePath('/dashboard');
  revalidatePath('/news');
}
