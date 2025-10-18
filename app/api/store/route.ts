import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import kv from "../../../lib/kv"; import type { Store } from "../../../lib/types";
const STORE_KEY='rental:store:v1';
export async function GET(){ const data:Store=(await kv.get(STORE_KEY)) ?? {currency:'USD', apartments:[], tenants:[], ledger:[]}; return NextResponse.json(data); }
export async function POST(req:Request){ const authed=(await cookies()).get('rm_auth')?.value==='ok'; if(!authed) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await req.json().catch(()=>null); if(!body||!body.store) return NextResponse.json({error:'Bad request'},{status:400}); await kv.set(STORE_KEY, body.store); return NextResponse.json({ok:true}); }
