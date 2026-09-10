export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-40 rounded-lg bg-soft" />
        <div className="mt-2.5 h-4 w-72 max-w-full rounded bg-soft" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card rounded-2xl p-5">
            <div className="h-0.5 w-8 rounded-full bg-soft" />
            <div className="mt-3 h-3 w-16 rounded bg-soft" />
            <div className="mt-3 h-6 w-12 rounded bg-soft" />
            <div className="mt-3 h-3 w-20 rounded bg-soft" />
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-4 w-28 rounded bg-soft" />
            <div className="card rounded-2xl p-5">
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-soft" />
                <div className="h-4 w-4/5 rounded bg-soft" />
                <div className="h-4 w-2/3 rounded bg-soft" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
