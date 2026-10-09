// 공고 카드 한 장: 기업·D-Day·제목·고용형태 + 찜·캘린더 추가 버튼
import { Link } from 'react-router-dom';
import { usePicks } from '../context/PickContext.jsx';
import { COMPANY_BY_ID } from '../data/companies.js';
import { formatKoreanDate, getDday } from '../lib/dday.js';
import { googleCalendarUrl, jobLink } from '../lib/links.js';
import DdayBadge from './DdayBadge.jsx';

export const TYPE_COLOR = {
  정규직: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
  인턴: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200',
  무기계약직: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-200',
  비정규직: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export default function JobCard({ job, showCompany = true }) {
  const { isSaved, toggleSaved } = usePicks();
  const c = COMPANY_BY_ID[job.companyId];
  const saved = isSaved(job.id);
  const closed = getDday(job.deadline).tone === 'closed';

  return (
    <li className={`card card-hover flex flex-col gap-2 p-4 ${closed ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        {showCompany ? (
          <Link
            to={`/company/${c.id}`}
            className="truncate text-xs font-bold text-brand-600 hover:underline dark:text-brand-300"
          >
            {c.emoji} {c.name}
          </Link>
        ) : (
          <span className="muted text-xs font-semibold">{job.career ?? job.type}</span>
        )}
        <div className="flex shrink-0 items-center gap-1">
          <DdayBadge deadline={job.deadline} />
          <button
            type="button"
            onClick={() => toggleSaved(job)}
            aria-pressed={saved}
            aria-label={saved ? '찜 해제' : '찜하기'}
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-base transition ${
              saved ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400 dark:text-slate-600'
            }`}
          >
            {saved ? '★' : '☆'}
          </button>
        </div>
      </div>

      <a
        href={jobLink(job)}
        target="_blank"
        rel="noreferrer"
        className="line-clamp-2 font-semibold leading-snug text-slate-900 hover:underline dark:text-slate-100"
      >
        {job.title}
      </a>
      {(job.fields || job.region) && (
        <p className="muted line-clamp-1 text-xs">{[job.fields, job.region].filter(Boolean).join(' · ')}</p>
      )}

      <div className="muted mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-xs">
        <span className={`rounded-md px-1.5 py-0.5 font-semibold ${TYPE_COLOR[job.type] ?? TYPE_COLOR.비정규직}`}>{job.type}</span>
        {showCompany && job.career && <span>{job.career}</span>}
        {job.headcount && <span>{job.headcount}</span>}
        <span className="ml-auto flex items-center gap-2">
          {job.deadline ? `~ ${formatKoreanDate(job.deadline)}` : '상시 모집'}
          {job.deadline && !closed && (
            <a
              href={googleCalendarUrl({ ...job, companyName: c.name })}
              target="_blank"
              rel="noreferrer"
              title="구글 캘린더에 마감일 추가"
              className="rounded-md px-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              🗓️
            </a>
          )}
        </span>
      </div>
    </li>
  );
}
