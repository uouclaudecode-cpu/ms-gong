// 채용 공고 목록 (마감 임박 순) + 신입/경력·고용형태·새 공고·지역·검색 필터. 마감 지난 공고는 기본으로 숨깁니다.
import { useMemo, useState } from 'react';
import { HIRE_TYPES, usePicks } from '../context/PickContext.jsx';
import { getCompany } from '../data/registry.js';
import { CAREERS, isNewJob } from '../lib/apply.js';
import { hasProfile, isGoodMatch, matchJob } from '../lib/profile.js';
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

function CareerFilter({ counts }) {
  const { career, setCareer } = usePicks();
  return (
    <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/70" role="tablist" aria-label="신입·경력">
      {CAREERS.map((c) => (
        <button
          key={c.key}
          type="button"
          role="tab"
          aria-selected={career === c.key}
          onClick={() => setCareer(c.key)}
          className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            career === c.key
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          {c.label} <span className="opacity-60">{counts[c.key] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

export default function JobTimeline({ result, companyIds, showCompany = true, title = '📅 채용 공고' }) {
  const { hireTypes, career, hideReplacement, setHideReplacement, profile } = usePicks();
  const [showClosed, setShowClosed] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [onlyMatch, setOnlyMatch] = useState(false);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');

  const mine = useMemo(
    () => (result?.items ?? []).filter((j) => companyIds.includes(j.companyId)),
    [result, companyIds],
  );
  const regions = useMemo(() => [...new Set(mine.flatMap(regionsOf))].sort(), [mine]);

  // 숫자는 진행 중 공고 기준. 고용형태 수는 신입/경력 필터를, 신입/경력 수는 고용형태 필터를 따릅니다
  const careerTest = CAREERS.find((c) => c.key === career).test;
  const replacementCount = mine.filter((j) => isOpen(j) && j.replacement).length;
  const replacementOk = (j) => !(hideReplacement && j.replacement);
  const open = mine.filter((j) => isOpen(j) && replacementOk(j));
  const matchOk = (j) => isGoodMatch(matchJob(j, profile));
  const counts = {};
  for (const j of open.filter(careerTest)) counts[j.type] = (counts[j.type] ?? 0) + 1;
  const careerCounts = Object.fromEntries(
    CAREERS.map((c) => [c.key, open.filter((j) => hireTypes.includes(j.type) && c.test(j)).length]),
  );
  const newCount = open.filter((j) => hireTypes.includes(j.type) && careerTest(j) && isNewJob(j)).length;
  const matchCount = hasProfile(profile) ? open.filter((j) => hireTypes.includes(j.type) && careerTest(j) && matchOk(j)).length : 0;

  const q = query.trim().replace(/\s/g, '');
  const filtered = mine
    .filter((j) => hireTypes.includes(j.type))
    .filter(careerTest)
    .filter(replacementOk)
    .filter((j) => !onlyNew || isNewJob(j))
    .filter((j) => !onlyMatch || matchOk(j))
    .filter((j) => !region || regionsOf(j).includes(region))
    .filter((j) => {
      if (!q) return true;
      const hay = `${j.title}${j.fields ?? ''}${j.region ?? ''}${getCompany(j.companyId).name}`.replace(/\s/g, '');
      return hay.includes(q);
    })
    .sort(byDeadline);
  const closedCount = filtered.filter((j) => !isOpen(j)).length;
  const list = showClosed ? filtered : filtered.filter(isOpen);

  return (
    <section id="jobs" className="scroll-mt-20 space-y-3">
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

      <CareerFilter counts={careerCounts} />

      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
        <button
          type="button"
          aria-pressed={onlyNew}
          onClick={() => setOnlyNew((v) => !v)}
          className={`chip flex items-center gap-1 !py-1 text-xs ${onlyNew ? '!bg-pick-500 !text-white !ring-pick-500' : ''}`}
        >
          🆕 새 공고 <span className="opacity-70">{newCount}</span>
        </button>
        {hasProfile(profile) && (
          <button
            type="button"
            aria-pressed={onlyMatch}
            onClick={() => setOnlyMatch((v) => !v)}
            className={`chip flex items-center gap-1 !py-1 text-xs ${onlyMatch ? 'chip-brand' : ''}`}
          >
            🎯 내 조건 <span className="opacity-70">{matchCount}</span>
          </button>
        )}
        <button
          type="button"
          aria-pressed={hideReplacement}
          onClick={() => setHideReplacement((v) => !v)}
          title="육아휴직 대체 같은 단기 대체인력 공고"
          className={`chip flex items-center gap-1 !py-1 text-xs ${hideReplacement ? 'chip-on' : ''}`}
        >
          {hideReplacement ? '✓ 대체인력 빼기' : '+ 대체인력 포함'} <span className="opacity-60">{replacementCount}</span>
        </button>
        <span className="w-px shrink-0 bg-slate-200 dark:bg-slate-700" aria-hidden />
        <HireTypeFilter counts={counts} />
      </div>

      {list.length === 0 ? (
        <div className="card muted border border-dashed border-slate-300 py-10 text-center text-sm shadow-none dark:border-slate-700">
          <p>
            {!hireTypes.length
              ? '위에서 고용형태를 하나 이상 골라 주세요.'
              : q || region || onlyNew || onlyMatch
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
