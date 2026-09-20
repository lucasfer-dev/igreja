'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireChurch } from '@/lib/auth';

const memberSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  status: z.enum(['visitor', 'attendee', 'member', 'leader', 'volunteer', 'inactive']),
});

export async function createMember(formData: FormData) {
  const parsed = memberSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) redirect('/members/new?error=' + encodeURIComponent('Revise os dados informados.'));

  const { supabase, churchId } = await requireChurch();
  const { error } = await supabase.from('church_members').insert({
    ...parsed.data,
    church_id: churchId,
    email: parsed.data.email || null,
    birth_date: parsed.data.birth_date || null,
  });

  if (error) redirect('/members/new?error=' + encodeURIComponent(error.message));

  revalidatePath('/members');
  redirect('/members');
}
