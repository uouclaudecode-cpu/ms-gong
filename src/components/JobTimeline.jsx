// 채용 공고 목록 (마감 임박 순) + 고용형태·지역·검색 필터. 마감 지난 공고는 기본으로 숨깁니다.
import { useMemo, useState } from 'react';
import { HIRE_TYPES, usePicks } from '../context/PickContext.jsx';
import { COMPANY_BY_ID } from '../data/companies.js';
import { byDeadline, getDday } from '../lib/dday.js';
import { JOB_ALIO_URL } from '../lib/links.js';
import DataStatus from './DataStatus.jsx';
import JobCard from './JobCard.jsx';

const isOpen = (j) => getDday(j.deadline).tone !== 'closed';
const regionsOf = (j) => (j.region ?? '').split(',').map((r) => r.trim()).filter(Boolean);

function HireTypeFilter({ counts }) {
  const { hireTypes, toggleHireType } = usePicks();
  return (
    <>
      {HIRE_TYPES.map((t) => {
        const on = hireTypes.includes(t);
        return (
          <button
            key={t}
            type="button"
            aria-pressed={on}
            onClick={() => toggleHireType(t)}
            className={`chip flex items-center gap-1 !py-1 text-xs ${on ? 'chip-on' : ''}`}
          >
            {on ? '✓' : '+'} {t}
            <span className="opacity-60">{counts[t] ?? 0}</span>
          </button>
        );
      })}
    </>
  );
}

export default function JobTimeline({ result, companyIds, showCompany = true, title = '📅 채용 공고' }) {
  const { hireTypes } = usePicks();
  const [showClosed, setShowClosed] = useState(false);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');

  const mine = useMemo(
    () => (result?.items ?? []).filter((j) => companyIds.includes(j.companyId)),
    [result, companyIds],
  );
  const regions = useMemo(() => [...new Set(mine.flatMap(regionsOf))].sort(), [mine]);

  const counts = {};
  for (const j of mine) if (isOpen(j)) counts[j.type] = (counts[j.type] ?? 0) + 1;

  const q = query.trim().replace(/\s/g, '');
  const filtered = mine
    .filter((j) => hireTypes.includes(j.type))
    .filter((j) => !region || regionsOf(j).includes(region))
    .filter((j) => {
      if (!q) return true;
      const hay = `${j.title}${j.fields ?? ''}${j.region ?? ''}${COMPANY_BY_ID[j.companyId].name}`.replace(/\s/g, '');
      return hay.includes(q);
    })
    .sort(byDeadline);
  const closedCount = filtered.filter((j) => !isOpen(j)).length;
  const list = showClosed ? filtered : filtered.filter(isOpen);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="section-title">{title}</h2>
        <DataStatus result={result} source="잡알리오" />
        {closedCount > 0 && (
          <label className="muted ml-auto flex cursor-pointer items-center gap-1.5 text-xs">
            <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />
            마감 {closedCount}건 보기
          </label>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔎 공고 검색 (예: 전기, 사무, 인턴)"
          className="input flex-1"
        />
        {regions.length > 1 && (
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="input sm:w-40" aria-label="근무 지역">
            <option value="">📍 전체 지역</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
        <HireTypeFilter counts={counts} />
      </div>

      {list.length === 0 ? (
        <div className="card muted border border-dashed border-slate-300 py-10 text-center text-sm shadow-none dark:border-slate-700">
          <p>
            {!hireTypes.length
              ? '위에서 고용형태를 하나 이상 골라 주세요.'
              : q || region
                ? '조건에 맞는 공고가 없어요.'
                : '선택한 고용형태로 진행 중인 공고가 없어요.'}
          </p>
          <a href={JOB_ALIO_URL} target="_blank" rel="noreferrer" className="mt-2 inline-block text-brand-600 hover:underline dark:text-brand-300">
            잡알리오에서 전체 공고 보기 ↗
          </a>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((j) => (
            <JobCard key={j.id} job={j} showCompany={showCompany} />
          ))}
        </ul>
      )}
    </section>
  );
}
