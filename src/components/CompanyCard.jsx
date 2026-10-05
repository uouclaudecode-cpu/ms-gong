// 대시보드 하단 'My 픽 기업' 카드: 진행 중 공고 수, 가장 가까운 마감, 블로그 후기 바로가기
import { Link } from 'react-router-dom';
import { byDeadline, getDday } from '../lib/dday.js';
import DdayBadge from './DdayBadge.jsx';

export default function CompanyCard({ company, jobs }) {
  const open = jobs.filter((j) => getDday(j.deadline).tone !== 'closed').sort(byDeadline);
  const next = open[0];

  return (
    <article className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <Link to={`/company/${company.id}`} className="group flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-2xl">
          {company.emoji}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-bold group-hover:text-brand-600">{company.name}</h3>
          <p className="text-xs text-slate-500">
            {company.sector} · {company.hq}
          </p>
        </div>
        <span className="ml-auto text-slate-300 group-hover:text-brand-500">›</span>
      </Link>

      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
        <span className="text-slate-600">
          진행 중 공고 <b className="text-slate-900">{open.length}</b>건
        </span>
        {next ? <DdayBadge deadline={next.deadline} /> : <span className="text-xs text-slate-400">공고 없음</span>}
      </div>

      <Link
        to={`/company/${company.id}#blog`}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-[#03c75a] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#02b350]"
      >
        <span className="rounded bg-white px-1 text-xs font-black text-[#03c75a]">N</span>
        블로그 합격 후기·공부법 보기
      </Link>
    </article>
  );
}
