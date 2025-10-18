export const dynamic='force-dynamic'; export const revalidate=0;
import kv from "../lib/kv"; import type { Store } from "../lib/types";
const STORE_KEY='rental:store:v1';
const cur=(n:number,c:string)=> new Intl.NumberFormat(undefined,{style:'currency',currency:c}).format(n);
const sum=(arr:any[],p:(x:any)=>boolean)=> arr.filter(p).reduce((a,b)=>a+Number(b.amount||0),0);
const roi=(inc:number,exp:number,buy?:number)=> !buy?0: ((inc-exp)/buy)*100;

export default async function Home(){
  const store:Store=(await kv.get(STORE_KEY)) ?? {currency:'USD', apartments:[], tenants:[], ledger:[]};
  const income=sum(store.ledger,l=>l.type==='RENT'||l.type==='DEPOSIT');
  const expense=sum(store.ledger,l=>l.type==='EXPENSE'||l.type==='REFUND'); const net=income-expense;

  const now=new Date(); const start=new Date(now.getFullYear()-1, now.getMonth(), now.getDate()).toISOString().slice(0,10);
  const roiRows=store.apartments.map(a=>{ const inc=sum(store.ledger,l=>l.apartmentId===a.id&&l.type==='RENT'&&l.date>=start); const ex=sum(store.ledger,l=>l.apartmentId===a.id&&(l.type==='EXPENSE'||l.type==='REFUND')&&l.date>=start); return {name:a.name,purchase:a.purchasePrice||0,inc,ex,roi:roi(inc,ex,a.purchasePrice)}; });

  const apartments=Object.fromEntries(store.apartments.map(a=>[a.id,a])); const tenants=Object.fromEntries(store.tenants.map(t=>[t.id,t]));
  const map:Record<string,{apt:any,ten:any,to?:string}>={}; for(const l of store.ledger){ if(l.type!=='RENT'||!l.tenantId||!l.to) continue; const k=`${l.apartmentId}__${l.tenantId}`; const curto=map[k]?.to; if(!curto||l.to>curto) map[k]={apt:apartments[l.apartmentId],ten:tenants[l.tenantId],to:l.to}; }
  const todayISO=new Date().toISOString().slice(0,10); const dueLate=Object.values(map).map(r=>{ const days=Math.round((new Date(r.to||todayISO).getTime()-new Date(todayISO).getTime())/86400000); const status=days<0?'LATE':days===0?'DUE':'OK'; return {apt:r.apt?.name||'—',ten:r.ten?.name||'—',to:r.to,status,days}; }).sort((a,b)=>a.days-b.days);

  return (<main className="row">
    <section className="card" style={{flex:'3 1 520px'}}><h3>Overview</h3>
      <div className="kpis">
        <div className="kpi"><div>Total Income</div><strong>{cur(income,store.currency)}</strong></div>
        <div className="kpi"><div>Total Expense</div><strong>{cur(expense,store.currency)}</strong></div>
        <div className="kpi"><div>Profit</div><strong>{cur(net,store.currency)}</strong></div>
        <div className="kpi"><div>Apartments</div><strong>{store.apartments.length}</strong></div>
        <div className="kpi"><div>Tenants</div><strong>{store.tenants.length}</strong></div>
      </div>
      <div style={{marginTop:12}}><a className="btn" href="/add">Add entries</a></div>
    </section>
    <section className="card" style={{flex:'2 1 420px'}}><h3>Quick Links</h3><div className="row"><a className="btn secondary" href="/properties">Properties</a><a className="btn secondary" href="/tenants">Tenants</a></div></section>
    <section className="card" style={{flex:'3 1 680px'}}><h3>ROI by Property (12m)</h3>
      <table className="table"><thead><tr><th>Property</th><th>Income</th><th>Expenses</th><th>Net</th><th>Purchase</th><th>ROI</th></tr></thead>
      <tbody>{roiRows.map((r,i)=>(<tr key={i}><td>{r.name}</td><td>{cur(r.inc,store.currency)}</td><td>{cur(r.ex,store.currency)}</td><td>{cur(r.inc-r.ex,store.currency)}</td><td>{r.purchase?cur(r.purchase,store.currency):'—'}</td><td>{r.roi.toFixed(1)}%</td></tr>))}{roiRows.length===0&&<tr><td colSpan={6}>No properties yet.</td></tr>}</tbody></table></section>
    <section className="card" style={{flex:'2 1 520px'}}><h3>Due & Late</h3>
      <table className="table"><thead><tr><th>Apartment</th><th>Tenant</th><th>Paid Until</th><th>Status</th></tr></thead>
      <tbody>{dueLate.map((r,i)=>(<tr key={i}><td>{r.apt}</td><td>{r.ten}</td><td>{r.to||'—'}</td><td className={r.status!=='OK'?'warn':'ok'}>{r.status}{r.status==='OK'&&` (${r.days}d left)`}</td></tr>))}{dueLate.length===0&&<tr><td colSpan={4}>No rent records yet.</td></tr>}</tbody></table></section>
  </main>);
}
