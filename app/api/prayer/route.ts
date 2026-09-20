import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const prayerSchema = z.object({
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().min(2).max(4000),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const { data: membership } = await supabase
    .from('church_users')
    .select('church_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (!membership) return NextResponse.redirect(new URL('/onboarding', request.url));

  const formData = await request.formData();
  const parsed = prayerSchema.safeParse({
    title: formData.get('title'),
    body: formData.get('body'),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL('/dashboard?prayer=invalid', request.url), 303);
  }

  const { error } = await supabase.from('prayer_requests').insert({
    church_id: membership.church_id,
    user_id: user.id,
    title: parsed.data.title,
    body: parsed.data.body,
    is_private: true,
  });

  return NextResponse.redirect(
    new URL(error ? '/dashboard?prayer=error' : '/dashboard?prayer=sent', request.url),
    303,
  );
}
