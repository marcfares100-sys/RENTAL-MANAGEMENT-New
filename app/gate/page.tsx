"use client";
import { useState } from "react";
export default function GatePage({ searchParams }:{ searchParams:{ next?:string } }){
  const [code,setCode]=useState(""); const [err,setErr]=useState("");
  async function submit(){ setErr(""); const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code})}); if(r.ok){ window.location.href=searchParams?.next||'/'; } else { const j=await r.json().catch(()=>({})); setErr(j?.error||'Invalid code'); } }
  return (<main className="center"><div className="card" style={{width:360}}><h3 style={{marginTop:0}}>Enter Access Code</h3><p className="small">Use the key you set in Vercel.</p>
    <input className="input" placeholder="Access code" value={code} onChange={e=>setCode(e.target.value)}/>
    <div style={{marginTop:12}}><button className="btn" onClick={submit}>Continue</button></div>
    {err && <div className="small warn" style={{marginTop:8}}>{err}</div>}
  </div></main>);
}
