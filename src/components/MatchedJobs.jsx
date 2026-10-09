// 홈 '🎯 나에게 맞는 공고': 내 프로필(직무·지역·학력·우대)과 맞는 진행 중 공고.
// 기본은 모든 공공기관에서 찾고, 'My 픽 기업만'으로 좁힐 수 있습니다. 프로필이 없으면 보이지 않습니다.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePicks } from '../context/PickContext.jsx';
import { byDeadline, getDday } from '../lib/dday.js';
import { hasProfile, isGoodMatch, matchJob } from '../lib/profile.js';
import JobCard from './JobCard.jsx';

const SHOW = 6;

export default function MatchedJobs({ jobs }) {
  const { profile, picks, passesFilters } = usePicks();
  const [onlyPicks, setOnlyPicks] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // 프로필이 없으면 홈에 아무것도 띄우지 않습니다 (오른쪽 위 '🎯 맞춤 공고' 버튼으로 만들 수 있어요)
  if (!hasProfile(profile)) return null;

  const matched = jobs
    .filter((j) => getDday(j.deadline).tone !== 'closed' && passesFilters(j) && (!onlyPicks || picks.includes(j.companyId)))
    .map((j) => ({ j, m: matchJob(j, profile) }))
    .filter(({ m }) => isGoodMatch(m))
    // 더 잘 맞는 공고 먼저, 같으면 마감 임박 순
    .sort((a, b) => b.m.score - a.m.score || byDeadline(a.j, b.j));
  const list = expanded ? matched : matched.slice(0, SHOW);

  return (
    <section id="matched" className="scroll-mt-20 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="section-title">🎯 나에게 맞는 공고</h2>
        <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">{matched.length}</span>
        <Link to="/profile" className="muted ml-auto text-sm hover:text-slate-800 dark:hover:text-white">
          프로필 수정 ›
        </Link>
      </div>
      <div className="flex gap-1.5">
        <button type="button" onClick={() => setOnlyPicks(false)} className={`chip !py-1 text-xs ${!onlyPicks ? 'chip-on' : ''}`}>
          전체 공공기관
        </button>
        <button type="button" onClick={() => setOnlyPicks(true)} className={`chip !py-1 text-xs ${onlyPicks ? 'chip-on' : ''}`}>
          My 픽 기업만
        </button>
      </div>

      {matched.length === 0 ? (
        <p className="card muted p-6 text-center text-sm">
          지금은 조건에 맞는 진행 중 공고가 없어요. 프로필의 직무·지역을 넓히거나 고용형태 필터를 바꿔 보세요.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(({ j }) => (
            <JobCard key={j.id} job={j} />
          ))}
        </ul>
      )}
      {matched.length > SHOW && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="btn-ghost w-full">
          {expanded ? '접기' : `맞는 공고 ${matched.length - SHOW}개 더 보기`}
        </button>
      )}
    </section>
  );
}
