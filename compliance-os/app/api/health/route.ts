import {NextResponse} from 'next/server';

export async function GET(){
  return NextResponse.json({ok:true,service:'sahjony-compliance-os',timestamp:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
}
