export function SkeletonCards({ count = 4, className = 'grid gap-3 sm:grid-cols-2' }) {
  return (
    <ul className={className} aria-busy="true" aria-label="불러오는 중">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="card space-y-3 p-4">
          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800/60" />
        </li>
      ))}
    </ul>
  );
}
