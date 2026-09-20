'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth';

const schema = z.object({
  direction: z.enum(['income','expense']),
  category: z.string().min(2).max(80),
  amount: z.coerce.number().positive(),
  occurredAt: z.string().min(1),
  description: z.string().max(250).optional(),
});

export async function createTransaction(formData: FormData) {
  const { supabase, churchId, unitId, user } = await requirePermission('finance.manage');
  const parsed = schema.safeParse({
    direction: formData.get('direction'),
    category: formData.get('category'),
    amount: formData.get('amount'),
    occurredAt: formData.get('occurredAt'),
    description: formData.get('description') || undefined,
  });
  if (!parsed.success) return;

  await supabase.from('transactions').insert({
    church_id: churchId,
    unit_id: unitId,
    direction: parsed.data.direction,
    category: parsed.data.category,
    amount: parsed.data.amount,
    occurred_at: parsed.data.occurredAt,
    description: parsed.data.description || null,
    created_by: user.id,
  });

  revalidatePath('/finance');
  revalidatePath('/admin');
  revalidatePath('/reports');
}
