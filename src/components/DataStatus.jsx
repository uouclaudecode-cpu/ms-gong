// 지금 보이는 데이터가 실데이터인지 예시인지 알려 주는 작은 표시
export default function DataStatus({ result, source }) {
  if (!result) return null;
  if (result.live) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        {source} 실시간
      </span>
    );
  }
  return (
    <span
      title={result.reason === 'no_key' ? 'API 키를 연결하면 실데이터로 바뀌어요' : '불러오기에 실패해서 예시를 보여 줘요'}
      className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30"
    >
      예시 데이터{result.reason === 'error' ? ' · 불러오기 실패' : ''}
    </span>
  );
}
