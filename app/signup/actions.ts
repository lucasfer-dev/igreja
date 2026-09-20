'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const fullName = String(formData.get('fullName') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!fullName || !email || password.length < 8) redirect('/signup?error=' + encodeURIComponent('Preencha os dados e use uma senha com pelo menos 8 caracteres.'));

  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
  if (error) redirect('/signup?error=' + encodeURIComponent(error.message));

  if (data.session) redirect('/onboarding');
  redirect('/login?message=' + encodeURIComponent('Conta criada. Confira seu e-mail para confirmar o acesso.'));
}
