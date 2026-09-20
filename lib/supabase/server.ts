import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { CookieOptions } from '@supabase/ssr';

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://cfptuifbkurupvuxojkd.supabase.co';

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_AvvUsr6Y2Ro7j6KuDIAlBA_UjNDOd7Q';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot always mutate cookies.
            // Middleware/Server Actions can handle refresh writes when needed.
          }
        },
      },
    },
  );
}
