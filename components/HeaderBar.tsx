"use client";
import Link from "next/link";
export default function HeaderBar(){
  return (<header><div style={{fontWeight:700}}>🏠 Rental Pro <span className="badge">Private</span></div><nav>
    <Link href="/">Dashboard</Link><Link href="/properties">Properties</Link><Link href="/tenants">Tenants</Link><Link href="/add">Adding</Link></nav></header>);
}
