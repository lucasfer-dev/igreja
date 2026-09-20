import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const { data: membership } = await supabase.from('church_users').select('church_id').eq('user_id', user.id).eq('status', 'active').limit(1).maybeSingle();
  if (!membership) return NextResponse.redirect(new URL('/onboarding', request.url));

  const formData = await request.formData();
  const title = String(formData.get('title') || '').trim();
  const body = String(formData.get('body') || '').trim();
  if (title && body) await supabase.from('prayer_requests').insert({ church_id: membership.church_id, user_id: user.id, title, body, is_private: true });

  return NextResponse.redirect(new URL('/dashboard?prayer=sent', request.url), 303);
}
