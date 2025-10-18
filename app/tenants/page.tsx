export const dynamic='force-dynamic'; export const revalidate=0;
import kv from "../../lib/kv"; import type { Store } from "../../lib/types";
const STORE_KEY='rental:store:v1'; const fmt=(n:number,c:string)=> new Intl.NumberFormat(undefined,{style:'currency',currency:c}).format(n);
const sum=(arr:any[],p:(x:any)=>boolean)=> arr.filter(p).reduce((a,b)=>a+Number(b.amount||0),0);
export default async function Tenants(){
  const store:Store=(await kv.get(STORE_KEY)) ?? {currency:'USD', apartments:[], tenants:[], ledger:[]};
  const rows=store.tenants.map(t=>{ const dep=sum(store.ledger,l=>l.tenantId===t.id&&l.type==='DEPOSIT'); const ref=sum(store.ledger,l=>l.tenantId===t.id&&l.type==='REFUND'); const rent=sum(store.ledger,l=>l.tenantId===t.id&&l.type==='RENT'); return {id:t.id,name:t.name,bal:dep-ref,rent}; });
  return (<main className="card"><h3>Tenants</h3><table className="table"><thead><tr><th>Name</th><th>Deposit Balance</th><th>Total Rent Paid</th></tr></thead>
    <tbody>{rows.map(r=>(<tr key={r.id}><td>{r.name}</td><td>{fmt(r.bal,store.currency)}</td><td>{fmt(r.rent,store.currency)}</td></tr>))}{rows.length===0&&<tr><td colSpan={3}>No tenants yet.</td></tr>}</tbody></table></main>);
}
