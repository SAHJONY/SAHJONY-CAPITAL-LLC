import Link from 'next/link';
import {getDictionary, locales, type Locale} from '@/lib/i18n';

export function Shell({locale, children}: {locale: Locale; children: React.ReactNode}) {
  const t = getDictionary(locale);
  const items = [
    ['', t.dashboard],
    ['/transactions', t.transactions],
    ['/screening', t.screening],
    ['/alerts', t.alerts],
    ['/cases', t.cases],
    ['/sar', t.sar],
    ['/audit', t.audit]
  ];
  return <div className="shell">
    <aside className="sidebar">
      <div className="brand">SAHJONY · {t.app}</div>
      <nav className="nav">{items.map(([path,label]) => <Link key={path} href={`/${locale}${path}`}>{label}</Link>)}</nav>
    </aside>
    <main className="main">
      <div className="topbar">
        <div className="locale" aria-label={t.language}>{locales.map(code => <Link key={code} href={`/${code}`}>{code.toUpperCase()}</Link>)}</div>
      </div>
      {children}
    </main>
  </div>;
}
