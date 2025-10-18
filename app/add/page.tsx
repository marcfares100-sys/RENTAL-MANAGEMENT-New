"use client";
import { useEffect, useMemo, useState } from "react";
import type { Store } from "../../lib/types";
import { loadStore, saveStore } from "../../lib/serverStore";
const uid=(p='id')=>`${p}_${Math.random().toString(36).slice(2,10)}`; const iso=(d:Date)=>d.toISOString().slice(0,10);
function addDur(fromISO:string,dur:string){ const m=(dur||'').trim().toLowerCase().match(/^(\d+)\s*([md])$/); if(!m) return fromISO; const v=parseInt(m[1],10); const u=m[2]; const d=new Date(fromISO); if(u==='m') d.setMonth(d.getMonth()+v); else d.setDate(d.getDate()+v); return iso(d); }
export default function Adding(){
  const [store,setStore]=useState<Store|null>(null); const [aptName,setAptName]=useState(''); const [aptLoc,setAptLoc]=useState(''); const [aptBuy,setAptBuy]=useState(''); const [aptReqDep,setAptReqDep]=useState('');
  const [tenantName,setTenantName]=useState(''); const [entry,setEntry]=useState<any>({type:'RENT',date:iso(new Date())}); const [dur,setDur]=useState('');
  useEffect(()=>{ loadStore().then(setStore); },[]); if(!store) return <main className="row"><div className="card">Loading…</div></main>;
  async function persist(next:Store){ await saveStore(next).catch(e=>alert(e.message||'Save failed')); setStore(next); }
  async function addApartment(){ if(!aptName.trim()) return; const id=uid('apt'); const next:Store={...store, apartments:[...store.apartments,{id,name:aptName.trim(),location:aptLoc.trim()||undefined,purchasePrice:aptBuy?Number(aptBuy):undefined,requiredDeposit:aptReqDep?Number(aptReqDep):undefined,createdAt:iso(new Date())}]}; await persist(next); setAptName(''); setAptLoc(''); setAptBuy(''); setAptReqDep(''); setEntry((e:any)=>({...e,apartmentId:id})); }
  async function addTenant(){ if(!tenantName.trim()) return; const id=uid('ten'); const next:Store={...store, tenants:[...store.tenants,{id,name:tenantName.trim()}]}; await persist(next); setTenantName(''); setEntry((e:any)=>({...e,tenantId:id})); }
  function applyDur(){ if(entry.type!=='RENT') return; const from=entry.from||iso(new Date()); setEntry((e:any)=>({...e,from,to:addDur(from,dur)})); }
  async function addEntry(){ if(!entry.type||!entry.date||!entry.amount) return; if((entry.type==='RENT'||entry.type==='EXPENSE')&&!entry.apartmentId) return;
    const rec={id:uid('led'), apartmentId:entry.apartmentId, tenantId:entry.tenantId||undefined, type:entry.type, amount:Number(entry.amount), date:entry.date, from:entry.type==='RENT'?entry.from||undefined:undefined, to:entry.type==='RENT'?entry.to||undefined:undefined, notes:entry.notes||undefined};
    const next:Store={...store, ledger:[rec, ...store.ledger]}; await persist(next); setEntry({type:entry.type, date:iso(new Date())}); setDur(''); }
  const latest=useMemo(()=>store.ledger.slice(0,10),[store.ledger]); const fmt=(n:number)=> new Intl.NumberFormat(undefined,{style:'currency',currency:store.currency}).format(n);
  return (<main className="row">
    <section className="card" style={{flex:'1 1 360px'}}><h3>Add Apartment</h3>
      <input className="input" placeholder="Name (e.g., Dorm 1)" value={aptName} onChange={e=>setAptName(e.target.value)}/>
      <div style={{height:8}}/><input className="input" placeholder="Location (optional)" value={aptLoc} onChange={e=>setAptLoc(e.target.value)}/>
      <div style={{height:8}}/><input className="input" placeholder="Purchase Price (optional)" value={aptBuy} onChange={e=>setAptBuy(e.target.value)}/>
      <div style={{height:8}}/><input className="input" placeholder="Required Deposit (optional)" value={aptReqDep} onChange={e=>setAptReqDep(e.target.value)}/>
      <div style={{marginTop:10}}><button className="btn" onClick={addApartment}>Add Apartment</button></div>
    </section>
    <section className="card" style={{flex:'2 1 520px'}}><h3>Add Income / Expense</h3>
      <div className="row"><div style={{flex:'1 1 160px'}}><label className="small">Type</label>
        <select className="input" value={entry.type} onChange={e=>setEntry({...entry,type:e.target.value})}><option value="RENT">Income: Rent</option><option value="DEPOSIT">Income: Deposit</option><option value="EXPENSE">Expense</option><option value="REFUND">Expense: Refund</option></select></div>
        <div style={{flex:'1 1 160px'}}><label className="small">Date</label><input className="input" type="date" value={entry.date||''} onChange={e=>setEntry({...entry,date:e.target.value})}/></div>
        <div style={{flex:'1 1 160px'}}><label className="small">Amount</label><input className="input" type="number" step="0.01" value={entry.amount??''} onChange={e=>setEntry({...entry,amount:Number(e.target.value)})}/></div></div>
      <div className="row" style={{marginTop:8}}>
        <div style={{flex:'1 1 160px'}}><label className="small">Apartment</label><select className="input" value={entry.apartmentId||''} onChange={e=>setEntry({...entry,apartmentId:e.target.value})}><option value="">—</option>{store.apartments.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
        <div style={{flex:'1 1 160px'}}><label className="small">Tenant (optional)</label><select className="input" value={entry.tenantId||''} onChange={e=>setEntry({...entry,tenantId:e.target.value})}><option value="">—</option>{store.tenants.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select>
          <div className="small" style={{marginTop:6}}>or add new:</div><div className="row"><div style={{flex:'1 1 160px'}}><input className="input" placeholder="New tenant" value={tenantName} onChange={e=>setTenantName(e.target.value)}/></div><div><button className="btn secondary" onClick={addTenant}>Add</button></div></div></div>
        <div style={{flex:'1 1 200px'}}><label className="small">Notes</label><input className="input" placeholder="Optional note" value={entry.notes||''} onChange={e=>setEntry({...entry,notes:e.target.value})}/></div></div>
      {entry.type==='RENT' && (<><div className="row" style={{marginTop:8}}><div style={{flex:'1 1 160px'}}><label className="small">From</label><input className="input" type="date" value={entry.from||''} onChange={e=>setEntry({...entry,from:e.target.value})}/></div>
        <div style={{flex:'1 1 160px'}}><label className="small">To</label><input className="input" type="date" value={entry.to||''} onChange={e=>setEntry({...entry,to:e.target.value})}/></div>
        <div style={{flex:'1 1 160px'}}><label className="small">or Duration</label><input className="input" placeholder="e.g., 1m or 30d" value={dur} onChange={e=>setDur(e.target.value)}/></div></div>
        <div style={{marginTop:8}}><button className="btn secondary" onClick={applyDur}>Apply Duration</button></div></>)}
      <div style={{marginTop:12}}><button className="btn" onClick={addEntry}>Add Entry</button></div>
    </section>
    <section className="card" style={{flex:'1 1 420px'}}><h3>Latest Activity</h3>
      <table className="table"><thead><tr><th>Date</th><th>Type</th><th>Apartment</th><th>Amount</th></tr></thead>
      <tbody>{latest.length===0&&<tr><td colSpan={4}>No entries yet.</td></tr>}{latest.map(l=>{ const apt=store.apartments.find(a=>a.id===l.apartmentId)?.name||'—'; return <tr key={l.id}><td>{l.date}</td><td>{l.type}</td><td>{apt}</td><td>{fmt(l.amount)}</td></tr>; })}</tbody></table>
    </section>
  </main>);
}
