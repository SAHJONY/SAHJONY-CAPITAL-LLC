import Link from 'next/link';
import {login} from './actions';
import {getDictionary, isLocale, locales} from '@/lib/i18n';
import {notFound} from 'next/navigation';

export default async function Login({params}: {params: Promise<{locale:string}>}) {
  const {locale} = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return <main className="login"><section className="card">
    <div className="eyebrow">SAHJONY · {t.app}</div><h1>{t.signIn}</h1><p>{t.subtitle}</p>
    <form action={login}>
      <input type="hidden" name="locale" value={locale}/>
      <label htmlFor="email">{t.email}</label><input id="email" name="email" type="email" autoComplete="email" required/>
      <label htmlFor="password">{t.password}</label><input id="password" name="password" type="password" autoComplete="current-password" minLength={8} required/>
      <button type="submit">{t.signIn}</button>
    </form>
    <div className="locale section">{locales.map(code=><Link key={code} href={`/${code}/login`}>{code.toUpperCase()}</Link>)}</div>
  </section></main>;
}
