import type { Store } from "./types";
export async function loadStore(): Promise<Store> { const r=await fetch('/api/store',{cache:'no-store'}); if(!r.ok) throw new Error('load failed'); return r.json(); }
export async function saveStore(store: Store) { const r=await fetch('/api/store',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({store})}); if(!r.ok){ const j=await r.json().catch(()=>({})); throw new Error(j?.error||'Save failed'); } }
