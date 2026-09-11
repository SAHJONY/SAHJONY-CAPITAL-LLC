import {notFound} from 'next/navigation';
import {Shell} from '@/components/Shell';
import {createClient} from '@/lib/supabase/server';
import {getDictionary,isLocale} from '@/lib/i18n';

export const dynamic = 'force-dynamic';

type ModuleKey='transactions'|'screening'|'alerts'|'cases'|'sar'|'audit';
const validModules: ModuleKey[]=['transactions','screening','alerts','cases','sar','audit'];

export default async function ModulePage({params}:{params:Promise<{locale:string;module:string}>}){
  const {locale,module}=await params;
  if(!isLocale(locale)||!validModules.includes(module as ModuleKey)) notFound();
  const key=module as ModuleKey; const t=getDictionary(locale); const supabase=await createClient();
  let rows:Record<string,unknown>[]=[]; let title='';
  if(key==='transactions'){title=t.transactions; const {data}=await supabase.from('aml_transactions').select('transaction_ref,amount,currency,origin_country,destination_country,status,sanctions_state,aml_risk_band,final_decision,occurred_at').order('occurred_at',{ascending:false}).limit(100); rows=(data??[]) as Record<string,unknown>[];}
  if(key==='screening'){title=t.screening; const {data}=await supabase.from('compliance_screenings').select('screening_id,party_role,party_name,source,result,screened_at,screened_by').order('screened_at',{ascending:false}).limit(100); rows=(data??[]) as Record<string,unknown>[];}
  if(key==='alerts'){title=t.alerts; const {data}=await supabase.from('aml_alerts').select('alert_ref,alert_type,severity,score,status,rationale,created_at').order('created_at',{ascending:false}).limit(100); rows=(data??[]) as Record<string,unknown>[];}
  if(key==='cases'){title=t.cases; const {data}=await supabase.from('trade_compliance_cases').select('compliance_id,trade_case_id,direction,origin_country,destination_country,sanctions_status,export_control_status,release_status,updated_at').order('updated_at',{ascending:false}).limit(100); rows=(data??[]) as Record<string,unknown>[];}
  if(key==='sar'){title=t.sar; const {data}=await supabase.from('sar_str_cases').select('case_ref,jurisdiction,filing_type,status,filing_deadline,filing_reference,created_at').order('created_at',{ascending:false}).limit(100); rows=(data??[]) as Record<string,unknown>[];}
  if(key==='audit'){title=t.audit; const {data}=await supabase.from('aml_decision_events').select('event_ref,actor_role,action,rationale,rule_version,model_version,created_at').order('created_at',{ascending:false}).limit(100); rows=(data??[]) as Record<string,unknown>[];}
  const columns=rows[0]?Object.keys(rows[0]):[];
  return <Shell locale={locale}><div className="eyebrow">SAHJONY · Compliance Operations</div><h1>{title}</h1>{key==='screening'&&<div className="notice">{t.liveProviderNotice}</div>}<div className="tablewrap"><table><thead><tr>{columns.map(c=><th key={c}>{c.replaceAll('_',' ')}</th>)}</tr></thead><tbody>{rows.length?rows.map((r,i)=><tr key={i}>{columns.map(c=><td key={c}>{String(r[c]??'—')}</td>)}</tr>):<tr><td>{t.noData}</td></tr>}</tbody></table></div></Shell>;
}
