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
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {['전체', ...SECTORS].map((s) => (
            <button key={s} type="button" onClick={() => setSector(s)} className={`chip ${sector === s ? 'chip-on' : ''}`}>
              {s}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔎 기업명·약칭·지역 (예: 한전, 울산)"
          className="input w-full lg:w-72"
        />
      </div>

      {visible.length === 0 ? (
        <p className="card muted py-10 text-center text-sm">검색 결과가 없어요.</p>
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
                  className={`relative flex h-full w-full flex-col items-start gap-1 rounded-2xl p-3.5 text-left transition ${
                    on
                      ? 'bg-brand-50 shadow-card ring-2 ring-brand-500 dark:bg-brand-900/30'
                      : 'card hover:ring-slate-400 dark:hover:ring-slate-600'
                  }`}
                >
                  <span
                    className={`absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold transition ${
                      on ? 'scale-110 bg-pick-500 text-white' : 'border border-slate-300 text-transparent dark:border-slate-600'
                    }`}
                  >
                    ✓
                  </span>
                  <span className="text-2xl">{c.emoji}</span>
                  <span className="pr-5 text-sm font-bold leading-snug">{c.name}</span>
                  <span className="muted text-xs">
                    {c.sector} · {c.hq}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="muted flex items-center justify-between text-sm">
        <span>
          <b className="text-brand-600 dark:text-brand-300">{picks.length}</b>곳 PICK
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
