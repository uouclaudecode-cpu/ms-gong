// 공기업 다중 선택 그리드: 분야 필터 + 이름 검색 + 탭해서 선택/해제.
// '전체 공공기관' 탭에서는 잡알리오에 최근 공고를 낸 다른 공공기관(250여 곳)도 고를 수 있습니다.
import { useEffect, useMemo, useState } from 'react';
import { usePicks } from '../context/PickContext.jsx';
import { fetchInstitutions } from '../data/api.js';
import { COMPANIES, SECTORS } from '../data/companies.js';
import { otherInstitutions } from '../data/registry.js';
import { useAsync } from '../hooks/useAsync.js';

const OTHERS = '전체 공공기관';
const OTHERS_LIMIT = 60; // 검색 전에는 이만큼만 그립니다

function CompanyTile({ c, on, onToggle }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onToggle(c.id)}
      className={`relative flex h-full w-full flex-col items-start gap-1 rounded-2xl p-3.5 text-left transition ${
        on ? 'bg-brand-50 shadow-card ring-2 ring-brand-500 dark:bg-brand-900/30' : 'card hover:ring-slate-400 dark:hover:ring-slate-600'
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
        {c.dynamic ? (c.open ? `진행 중 공고 ${c.open}건` : '최근 공고 있음') : `${c.sector} · ${c.hq}`}
      </span>
    </button>
  );
}

export default function CompanyPicker() {
  const { isPicked, toggle, picks, clear, addInstitutions, institutionsVersion } = usePicks();
  const [sector, setSector] = useState('전체');
  const [query, setQuery] = useState('');
  const inst = useAsync(fetchInstitutions, []);

  useEffect(() => {
    if (inst.data?.live) addInstitutions(inst.data.items);
  }, [inst.data, addInstitutions]);

  // institutionsVersion: 새 기관 이름을 알게 되면 목록을 다시 계산
  const others = useMemo(() => otherInstitutions(), [institutionsVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = query.trim().replace(/\s/g, '');
  const match = (c) => !q || c.name.replace(/\s/g, '').includes(q) || c.short.includes(q) || (c.hq ?? '').replace(/\s/g, '').includes(q);

  const curated = COMPANIES.filter((c) => (sector === '전체' || c.sector === sector) && match(c));
  // 검색어가 있으면 어느 탭에서든 다른 공공기관도 같이 찾아 줍니다
  const showOthers = sector === OTHERS || (q && sector === '전체');
  const otherHits = showOthers ? others.filter(match) : [];
  const otherShown = q ? otherHits : otherHits.slice(0, OTHERS_LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {['전체', ...SECTORS, OTHERS].map((s) => (
            <button key={s} type="button" onClick={() => setSector(s)} className={`chip ${sector === s ? 'chip-on' : ''}`}>
              {s}
              {s === OTHERS && others.length > 0 && <span className="ml-1 opacity-60">{others.length}</span>}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔎 기관명·약칭·지역 (예: 한전, 국립공원)"
          className="input w-full lg:w-72"
        />
      </div>

      {sector !== OTHERS && (
        <>
          {curated.length === 0 && !q && <p className="card muted py-10 text-center text-sm">검색 결과가 없어요.</p>}
          {curated.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {curated.map((c) => (
                <li key={c.id}>
                  <CompanyTile c={c} on={isPicked(c.id)} onToggle={toggle} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {showOthers && (
        <section className="space-y-3">
          {sector !== OTHERS && <h3 className="muted text-sm font-semibold">다른 공공기관에서 찾은 결과</h3>}
          {sector === OTHERS && (
            <p className="muted text-sm">
              잡알리오에 최근 채용 공고를 낸 공공기관이에요. 고르면 공고·뉴스·블로그 후기·채용 트렌드를 똑같이 볼 수 있어요.
            </p>
          )}
          {inst.loading && others.length === 0 ? (
            <p className="card muted py-8 text-center text-sm">공공기관 목록을 불러오는 중… (처음엔 조금 걸려요)</p>
          ) : otherShown.length === 0 ? (
            <p className="card muted py-8 text-center text-sm">
              {q ? `'${query}'와 맞는 공공기관이 없어요.` : '공공기관 목록을 불러오지 못했어요.'}
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {otherShown.map((c) => (
                <li key={c.id}>
                  <CompanyTile c={c} on={isPicked(c.id)} onToggle={toggle} />
                </li>
              ))}
            </ul>
          )}
          {!q && otherHits.length > OTHERS_LIMIT && (
            <p className="muted text-center text-xs">
              {otherHits.length - OTHERS_LIMIT}곳 더 있어요. 위에서 기관명을 검색해 보세요.
            </p>
          )}
        </section>
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
