import { NextResponse } from "next/server";
export async function POST(req:Request){
  const body=await req.json().catch(()=>({})); const code=String(body.code??''); const expected=process.env.ADMIN_WRITE_KEY||'';
  if(!expected) return NextResponse.json({error:'Server missing ADMIN_WRITE_KEY'},{status:500});
  if(code!==expected) return NextResponse.json({ok:false,error:'Invalid code'},{status:401});
  const isProd=process.env.VERCEL==='1'; const res=NextResponse.json({ok:true});
  res.cookies.set('rm_auth','ok',{httpOnly:true,sameSite:'lax',secure:isProd,path:'/',maxAge:60*60*24*30}); return res;
}
export async function GET(){ return NextResponse.json({ok:true}); }
