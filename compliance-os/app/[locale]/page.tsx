import {Shell} from '@/components/Shell';
import {createClient} from '@/lib/supabase/server';
import {getDictionary, isLocale} from '@/lib/i18n';
import {notFound} from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Dashboard({params}: {params: Promise<{locale:string}>}) {
  const {locale} = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const supabase = await createClient();
  const [tx, alerts, cases, sar] = await Promise.all([
    supabase.from('aml_transactions').select('*',{count:'exact',head:true}),
    supabase.from('aml_alerts').select('*',{count:'exact',head:true}).in('status',['open','triaged','investigating','escalated']),
    supabase.from('trade_compliance_cases').select('*',{count:'exact',head:true}),
    supabase.from('sar_str_cases').select('*',{count:'exact',head:true}).in('status',['review','draft','approved_to_file'])
  ]);
  return <Shell locale={locale}>
    <div className="eyebrow">SAHJONY · Control Plane</div>
    <h1>{t.title}</h1><p>{t.subtitle}</p>
    <div className="notice">{t.liveProviderNotice}</div>
    <section className="grid">
      <div className="card"><div className="small">{t.transactions}</div><div className="metric">{tx.count ?? 0}</div></div>
      <div className="card"><div className="small">{t.alerts}</div><div className="metric">{alerts.count ?? 0}</div></div>
      <div className="card"><div className="small">{t.cases}</div><div className="metric">{cases.count ?? 0}</div></div>
      <div className="card"><div className="small">{t.sar}</div><div className="metric">{sar.count ?? 0}</div></div>
    </section>
    <section className="section card"><strong>Decision policy</strong><p>Sanctions BLOCK/REVIEW overrides behavioral low-risk signals. Stable remittance corridors may reduce anomaly scores, but never bypass sanctions, KYC, fraud, or mandatory review controls.</p></section>
  </Shell>;
}
