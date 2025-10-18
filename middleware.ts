import { NextResponse, type NextRequest } from "next/server";
const PUBLIC = ["/gate", "/api/auth/login", "/api/auth/status", "/api/store", "/_next", "/favicon.ico"];
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some(p => pathname.startsWith(p))) return NextResponse.next();
  const authed = req.cookies.get("rm_auth")?.value === "ok";
  if (authed) return NextResponse.next();
  const url = req.nextUrl.clone(); url.pathname = "/gate"; url.searchParams.set("next", pathname); return NextResponse.redirect(url);
}
