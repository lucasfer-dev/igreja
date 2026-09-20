'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth';

const schema = z.object({
  title: z.string().min(3).max(120),
  body: z.string().min(3).max(2000),
  audience: z.string().min(1),
});

type AudienceType = 'church' | 'unit' | 'cell' | 'ministry' | 'event' | 'person';

function parseAudience(value: string): { type: AudienceType; refId: string | null } | null {
  if (value === 'church') return { type: 'church', refId: null };
  const [type, refId] = value.split(':', 2);
  if (!refId || !['unit','cell','ministry','event','person'].includes(type)) return null;
  return { type: type as AudienceType, refId };
}

export async function publishAnnouncement(formData: FormData) {
  const { supabase, churchId, user } = await requirePermission('communications.manage');
  const parsed = schema.safeParse({
    title: formData.get('title'),
    body: formData.get('body'),
    audience: formData.get('audience'),
  });
  if (!parsed.success) return;

  const audience = parseAudience(parsed.data.audience);
  if (!audience) return;

  const { data: announcement, error } = await supabase.from('announcements').insert({
    church_id: churchId,
    title: parsed.data.title,
    body: parsed.data.body,
    created_by: user.id,
    published: true,
    audience_type: audience.type,
    audience_ref_id: audience.refId,
  }).select('id').single();

  if (error || !announcement) return;

  let recipientIds: string[] = [];

  if (audience.type === 'church') {
    const { data } = await supabase
      .from('church_users')
      .select('user_id')
      .eq('church_id', churchId)
      .eq('status', 'active');
    recipientIds = (data || []).map(row => row.user_id);
  }

  if (audience.type === 'unit' && audience.refId) {
    const { data } = await supabase
      .from('church_users')
      .select('user_id')
      .eq('church_id', churchId)
      .eq('unit_id', audience.refId)
      .eq('status', 'active');
    recipientIds = (data || []).map(row => row.user_id);
  }

  if (audience.type === 'cell' && audience.refId) {
    const { data } = await supabase
      .from('cell_members')
      .select('church_members!inner(auth_user_id,church_id)')
      .eq('cell_id', audience.refId)
      .eq('church_members.church_id', churchId)
      .eq('active', true);
    recipientIds = (data || [])
      .map((row:any) => row.church_members?.auth_user_id)
      .filter(Boolean);
  }

  if (audience.type === 'ministry' && audience.refId) {
    const { data } = await supabase
      .from('ministry_members')
      .select('church_members!inner(auth_user_id,church_id)')
      .eq('ministry_id', audience.refId)
      .eq('church_members.church_id', churchId)
      .eq('active', true);
    recipientIds = (data || [])
      .map((row:any) => row.church_members?.auth_user_id)
      .filter(Boolean);
  }

  if (audience.type === 'event' && audience.refId) {
    const { data } = await supabase
      .from('event_registrations')
      .select('church_members!inner(auth_user_id,church_id)')
      .eq('church_id', churchId)
      .eq('event_id', audience.refId);
    recipientIds = (data || [])
      .map((row:any) => row.church_members?.auth_user_id)
      .filter(Boolean);
  }

  if (audience.type === 'person' && audience.refId) {
    const { data } = await supabase
      .from('church_members')
      .select('auth_user_id')
      .eq('church_id', churchId)
      .eq('id', audience.refId)
      .maybeSingle();
    if (data?.auth_user_id) recipientIds = [data.auth_user_id];
  }

  recipientIds = [...new Set(recipientIds)];

  if (recipientIds.length) {
    await supabase.from('notifications').insert(recipientIds.map(userId => ({
      church_id: churchId,
      user_id: userId,
      type: 'announcement',
      title: parsed.data.title,
      body: parsed.data.body,
      data: { href: '/feed', announcement_id: announcement.id },
    })));
  }

  revalidatePath('/communications');
  revalidatePath('/dashboard');
  revalidatePath('/notifications');
  revalidatePath('/feed');
}
