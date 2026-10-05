// 채용 공고 카드 목록 (마감 임박 순). 마감 지난 공고는 기본으로 숨깁니다.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HIRE_TYPES, usePicks } from '../context/PickContext.jsx';
import { COMPANY_BY_ID } from '../data/companies.js';
import { byDeadline, formatKoreanDate, getDday } from '../lib/dday.js';
import { JOB_ALIO_URL } from '../lib/links.js';
import DataStatus from './DataStatus.jsx';
import DdayBadge from './DdayBadge.jsx';

const TYPE_COLOR = {
  정규직: 'bg-brand-50 text-brand-700',
  인턴: 'bg-violet-50 text-violet-700',
  무기계약직: 'bg-teal-50 text-teal-700',
  비정규직: 'bg-slate-100 text-slate-600',
};

function HireTypeFilter({ counts }) {
  const { hireTypes, toggleHireType } = usePicks();
  return (
    <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
      {HIRE_TYPES.map((t) => {
        const on = hireTypes.includes(t);
        return (
          <button
            key={t}
            type="button"
            aria-pressed={on}
            onClick={() => toggleHireType(t)}
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition ${
              on ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:ring-slate-400'
            }`}
          >
            {on ? '✓' : '+'} {t}
            <span className={on ? 'text-slate-300' : 'text-slate-400'}>{counts[t] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function JobTimeline({ result, companyIds, showCompany = true }) {
  const { hireTypes } = usePicks();
  const [showClosed, setShowClosed] = useState(false);
  const mine = (result?.items ?? []).filter((j) => companyIds.includes(j.companyId));
  const counts = {};
  for (const j of mine) if (getDday(j.deadline).tone !== 'closed') counts[j.type] = (counts[j.type] ?? 0) + 1;
  const sorted = mine.filter((j) => hireTypes.includes(j.type)).sort(byDeadline);
  const closedCount = sorted.filter((j) => getDday(j.deadline).tone === 'closed').length;
  const list = showClosed ? sorted : sorted.filter((j) => getDday(j.deadline).tone !== 'closed');

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-bold">📅 채용 공고 타임라인</h2>
        <DataStatus result={result} source="잡알리오" />
        {closedCount > 0 && (
          <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-xs text-slate-500">
            <input type="checkbox" checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />
            마감 {closedCount}건 보기
          </label>
        )}
      </div>

      <HireTypeFilter counts={counts} />

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-500">
          <p>{hireTypes.length ? '선택한 고용형태로 진행 중인 공고가 없어요.' : '위에서 고용형태를 하나 이상 골라 주세요.'}</p>
          <a href={JOB_ALIO_URL} target="_blank" rel="noreferrer" className="mt-2 inline-block text-brand-600 hover:underline">
            잡알리오에서 전체 공고 보기 ↗
          </a>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {list.map((j) => {
            const c = COMPANY_BY_ID[j.companyId];
            const closed = getDday(j.deadline).tone === 'closed';
            return (
              <li
                key={j.id}
                className={`flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md ${
                  closed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {showCompany ? (
                    <Link to={`/company/${c.id}`} className="truncate text-xs font-semibold text-brand-600 hover:underline">
                      {c.emoji} {c.name}
                    </Link>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">{j.career ?? j.type}</span>
                  )}
                  <DdayBadge deadline={j.deadline} />
                </div>
                <a href={j.url} target="_blank" rel="noreferrer" className="line-clamp-2 font-semibold leading-snug hover:underline">
                  {j.title}
                </a>
                {(j.fields || j.region) && (
                  <p className="line-clamp-1 text-xs text-slate-500">{[j.fields, j.region].filter(Boolean).join(' · ')}</p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-xs text-slate-500">
                  <span className={`rounded px-1.5 py-0.5 font-medium ${TYPE_COLOR[j.type]}`}>{j.type}</span>
                  {showCompany && j.career && <span>{j.career}</span>}
                  {j.headcount && <span>{j.headcount}</span>}
                  <span className="ml-auto">{j.deadline ? `~ ${formatKoreanDate(j.deadline)}` : '상시 모집'}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
