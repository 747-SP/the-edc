import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const session = req.cookies.get("edc-session");

  // Allow API requests through (we check auth inside routes)
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Redirect to home if not authenticated (home will show login)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
