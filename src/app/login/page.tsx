export const metadata = { title: "Sign in" };

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; next?: string }>;
}) {
  const { e, next = "/" } = await searchParams;
  return (
    <div className="mx-auto mt-16 max-w-sm rounded-2xl border border-line bg-surface p-7">
      <h1 className="text-[20px] font-semibold text-ink">Sales Hub</h1>
      <p className="mt-1 text-[14px] text-ink-2">Enter the password to continue.</p>
      <form action="/api/login" method="post" className="mt-6 space-y-3">
        <input type="hidden" name="next" value={next} />
        <input
          type="password"
          name="password"
          autoFocus
          autoComplete="current-password"
          className="h-11 w-full rounded-xl border border-line px-3.5 text-[14px]"
          aria-label="Password"
        />
        {e && <p className="text-[13px] text-red-600">That password isn&apos;t right.</p>}
        <button type="submit" className="h-11 w-full rounded-xl bg-ink text-[14px] font-medium text-white">
          Continue
        </button>
      </form>
    </div>
  );
}
