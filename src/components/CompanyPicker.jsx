// 공기업 다중 선택 그리드: 분야 필터 + 이름 검색 + 탭해서 선택/해제
import { useMemo, useState } from 'react';
import { COMPANIES, SECTORS } from '../data/companies.js';
import { usePicks } from '../context/PickContext.jsx';

export default function CompanyPicker() {
  const { isPicked, toggle, picks, clear } = usePicks();
  const [sector, setSector] = useState('전체');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().replace(/\s/g, '');
    return COMPANIES.filter(
      (c) =>
        (sector === '전체' || c.sector === sector) &&
        (!q || c.name.includes(q) || c.short.includes(q) || c.hq.replace(/\s/g, '').includes(q)),
    );
  }, [sector, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {['전체', ...SECTORS].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSector(s)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition ${
                sector === s
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="기업명·약칭·지역 검색 (예: 한전, 울산)"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 lg:w-72"
        />
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
          검색 결과가 없어요.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((c) => {
            const on = isPicked(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(c.id)}
                  className={`relative flex h-full w-full flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition ${
                    on
                      ? 'border-brand-500 bg-brand-50 shadow-sm'
                      : 'border-transparent bg-white shadow-sm ring-1 ring-slate-200 hover:ring-slate-400'
                  }`}
                >
                  <span
                    className={`absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                      on ? 'bg-brand-500 text-white' : 'border border-slate-300 text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <span className="text-2xl">{c.emoji}</span>
                  <span className="pr-5 text-sm font-semibold leading-snug text-slate-900">{c.name}</span>
                  <span className="text-xs text-slate-500">
                    {c.sector} · {c.hq}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          <b className="text-brand-600">{picks.length}</b>곳 선택됨
        </span>
        {picks.length > 0 && (
          <button type="button" onClick={clear} className="underline-offset-2 hover:underline">
            선택 모두 해제
          </button>
        )}
      </div>
    </div>
  );
}
