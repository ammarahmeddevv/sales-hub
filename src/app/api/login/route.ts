import { NextResponse } from "next/server";
import { HUB_COOKIE, hubToken } from "@/lib/hub-token";

export async function POST(req: Request) {
  const form = await req.formData();
  const given = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const password = process.env.HUB_PASSWORD;

  if (!password || given !== password) {
    return NextResponse.redirect(new URL(`/login?e=1&next=${encodeURIComponent(safeNext)}`, req.url), 303);
  }
  const res = NextResponse.redirect(new URL(safeNext, req.url), 303);
  res.cookies.set(HUB_COOKIE, await hubToken(password), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
  return res;
}
