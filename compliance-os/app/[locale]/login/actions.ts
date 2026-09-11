'use server';

import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {isLocale} from '@/lib/i18n';

export async function login(formData: FormData) {
  const localeValue = String(formData.get('locale') || 'es');
  const locale = isLocale(localeValue) ? localeValue : 'es';
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  if (!email || password.length < 8) redirect(`/${locale}/login?error=invalid`);
  const supabase = await createClient();
  const {error} = await supabase.auth.signInWithPassword({email,password});
  if (error) redirect(`/${locale}/login?error=auth`);
  redirect(`/${locale}`);
}
