import { NextResponse, type NextRequest } from "next/server";
import { HUB_COOKIE, hubToken } from "@/lib/hub-token";

/* Optional password gate. Does nothing unless HUB_PASSWORD is set in the
   environment — set it in Vercel to lock the hub, remove it to open it again. */
export async function proxy(req: NextRequest) {
  const password = process.env.HUB_PASSWORD;
  if (!password) return NextResponse.next();

  if (req.cookies.get(HUB_COOKIE)?.value === (await hubToken(password))) {
    return NextResponse.next();
  }
  const login = new URL("/login", req.url);
  login.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!login|api/login|_next/|robots.txt|favicon.ico|icon).*)"],
};
