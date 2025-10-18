export const dynamic='force-dynamic'; export const revalidate=0;
import kv from "../../lib/kv"; import type { Store } from "../../lib/types";
const STORE_KEY='rental:store:v1'; const fmt=(n:number,c:string)=> new Intl.NumberFormat(undefined,{style:'currency',currency:c}).format(n);
const sum=(arr:any[],p:(x:any)=>boolean)=> arr.filter(p).reduce((a,b)=>a+Number(b.amount||0),0);
export default async function Properties(){
  const store:Store=(await kv.get(STORE_KEY)) ?? {currency:'USD', apartments:[], tenants:[], ledger:[]};
  const rows=store.apartments.map(a=>{ const dep=sum(store.ledger,l=>l.apartmentId===a.id&&l.type==='DEPOSIT'); const ref=sum(store.ledger,l=>l.apartmentId===a.id&&l.type==='REFUND'); const bal=dep-ref; const req=a.requiredDeposit||0; const pend=Math.max(req-bal,0);
    const rent=sum(store.ledger,l=>l.apartmentId===a.id&&l.type==='RENT'); const exp=sum(store.ledger,l=>l.apartmentId===a.id&&(l.type==='EXPENSE'||l.type==='REFUND')); const profit=rent-exp; const lastTid=(store.ledger.find(l=>l.apartmentId===a.id&&l.type==='RENT'&&l.tenantId)?.tenantId) as string|undefined;
    const tenant=lastTid?(store.tenants.find(t=>t.id===lastTid)?.name||'—'):'—'; const roi=a.purchasePrice? ((rent-exp)/(a.purchasePrice))*100 : 0;
    return {id:a.id,name:a.name,location:a.location||'—',tenant,req,bal,pend,purchase:a.purchasePrice||0,rent,exp,profit,roi}; });
  return (<main className="card"><h3>Properties</h3><table className="table"><thead><tr><th>Property</th><th>Location</th><th>Tenant</th><th>Req. Deposit</th><th>Deposit Bal</th><th className="warn">Pending</th><th>Purchase</th><th>Rent</th><th>Expenses</th><th>Profit</th><th>ROI</th></tr></thead>
    <tbody>{rows.map(r=>(<tr key={r.id}><td>{r.name}</td><td>{r.location}</td><td>{r.tenant}</td><td>{fmt(r.req,store.currency)}</td><td>{fmt(r.bal,store.currency)}</td><td className={r.pend>0?'warn':''}>{fmt(r.pend,store.currency)}</td><td>{r.purchase?fmt(r.purchase,store.currency):'—'}</td><td>{fmt(r.rent,store.currency)}</td><td>{fmt(r.exp,store.currency)}</td><td>{fmt(r.profit,store.currency)}</td><td>{r.roi.toFixed(1)}%</td></tr>))}
    {rows.length===0&&<tr><td colSpan={11}>No properties yet. Add from the Adding page.</td></tr>}</tbody></table></main>);
}
