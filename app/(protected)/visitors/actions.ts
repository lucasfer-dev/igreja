'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireChurch } from '@/lib/auth';

const visitorSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  source: z.string().optional(),
});

export async function createVisitor(formData: FormData) {
  const parsed = visitorSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) redirect('/visitors/new?error=' + encodeURIComponent('Revise os dados informados.'));

  const { supabase, churchId } = await requireChurch();
  const { error } = await supabase.from('visitors').insert({
    ...parsed.data,
    church_id: churchId,
    email: parsed.data.email || null,
    stage: 'new',
  });

  if (error) redirect('/visitors/new?error=' + encodeURIComponent(error.message));

  revalidatePath('/visitors');
  redirect('/visitors');
}
