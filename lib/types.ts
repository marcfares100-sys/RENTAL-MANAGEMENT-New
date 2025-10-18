export type Apartment = { id:string; name:string; location?:string; purchasePrice?:number; requiredDeposit?:number; createdAt:string };
export type Tenant = { id:string; name:string };
export type Ledger = { id:string; apartmentId?:string; tenantId?:string; type:'RENT'|'DEPOSIT'|'EXPENSE'|'REFUND'; amount:number; date:string; from?:string; to?:string; notes?:string };
export type Store = { currency:string; apartments:Apartment[]; tenants:Tenant[]; ledger:Ledger[] };
