import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';

export async function POST(req:NextRequest){
  const supabase=await createClient();
  const {data:claims}=await supabase.auth.getClaims();
  if(!claims?.claims) return NextResponse.json({error:'unauthorized'},{status:401});
  const {data:membership}=await supabase.from('app_memberships').select('role,status').eq('user_id',claims.claims.sub).eq('status','active').maybeSingle();
  if(!membership||!['platform_owner','platform_admin','owner'].includes(membership.role)) return NextResponse.json({error:'forbidden'},{status:403});
  const body=await req.json();
  const amount=Number(body.amount||0);
  const sanctionsState=String(body.sanctionsState||'pending');
  const stableCorridor=Boolean(body.stableCorridor);
  const stableRecipient=Boolean(body.stableRecipient);
  const expectedCadence=Boolean(body.expectedCadence);
  const kycVerified=Boolean(body.kycVerified);
  const structuringIndicator=Boolean(body.structuringIndicator);
  const rapidMovement=Boolean(body.rapidMovement);
  let score=35; const reasons:string[]=[];
  if(kycVerified){score-=10;reasons.push('verified KYC -10');}else{score+=15;reasons.push('KYC incomplete +15');}
  if(stableCorridor&&stableRecipient&&expectedCadence){score-=15;reasons.push('stable remittance behavior -15');}
  if(amount>=10000){score+=10;reasons.push('high-value transaction +10');}
  if(structuringIndicator){score+=35;reasons.push('structuring indicator +35');}
  if(rapidMovement){score+=20;reasons.push('rapid movement +20');}
  score=Math.max(0,Math.min(100,score));
  let band=score>=75?'high':score>=40?'medium':'low';
  let decision=band==='low'?'allow':'review';
  if(sanctionsState==='review'){band='high';decision='hold';reasons.push('sanctions review hard override');}
  if(sanctionsState==='blocked'){band='prohibited';decision='block';score=100;reasons.push('sanctions block hard override');}
  if(sanctionsState==='pending'||sanctionsState==='error'){decision='hold';reasons.push('sanctions unresolved: no automatic clear');}
  return NextResponse.json({score,band,decision,reasons,policyVersion:'aml-risk-v1',advisory:true});
}
