// 홈 하단 'My 픽 기업' 카드: 진행 중 공고 수, 가장 가까운 마감, 블로그 후기 바로가기
import { Link } from 'react-router-dom';
import { byDeadline, getDday } from '../lib/dday.js';
import DdayBadge from './DdayBadge.jsx';

export default function CompanyCard({ company, jobs }) {
  const open = jobs.filter((j) => getDday(j.deadline).tone !== 'closed').sort(byDeadline);
  const next = open[0];

  return (
    <article className="card flex flex-col gap-3 p-4">
      <Link to={`/company/${company.id}`} className="group flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl dark:bg-slate-800">
          {company.emoji}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-bold group-hover:text-brand-600 dark:group-hover:text-brand-300">{company.name}</h3>
          <p className="muted text-xs">
            {company.sector} · {company.hq}
          </p>
        </div>
        <span className="ml-auto text-slate-300 group-hover:text-brand-500">›</span>
      </Link>

      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60">
        <span className="muted">
          진행 중 공고 <b className="text-slate-900 dark:text-white">{open.length}</b>건
        </span>
        {next ? <DdayBadge deadline={next.deadline} /> : <span className="text-xs text-slate-400">공고 없음</span>}
      </div>

      <Link
        to={`/company/${company.id}#blog`}
        className="btn bg-[#03c75a] text-white hover:bg-[#02b350]"
      >
        <span className="rounded bg-white px-1 text-xs font-black text-[#03c75a]">N</span>
        블로그 합격 후기·공부법
      </Link>
    </article>
  );
}
