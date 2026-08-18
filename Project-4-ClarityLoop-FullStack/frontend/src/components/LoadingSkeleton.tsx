// Skeleton placeholders used while data is loading.
// Each export mirrors the shape of a real component so the layout
// doesn't shift once the data arrives.

export function StatCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-7 w-16" />
        </div>
        <div className="skeleton h-10 w-10 rounded-xl" />
      </div>
      <div className="skeleton h-3 w-32 mt-4" />
    </div>
  );
}

export function DecisionCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-5/6" />
        </div>
        <div className="skeleton h-12 w-12 rounded-full" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--border)]">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-7 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="skeleton h-9 w-9 rounded-lg" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-2.5 w-1/3" />
      </div>
      <div className="skeleton h-6 w-16 rounded-full" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="card p-5">
      <div className="skeleton h-4 w-32 mb-4" />
      <div className="flex items-end justify-between gap-2 h-40">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-1">
            <div
              className="skeleton w-full rounded-t-md"
              style={{ height: `${30 + ((i * 13) % 60)}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
