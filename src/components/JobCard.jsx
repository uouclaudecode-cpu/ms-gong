// 공고 카드 한 장: 기업·D-Day·NEW·제목·고용형태·나와 맞는 이유 + 찜·캘린더 추가 버튼
// (+ 찜 목록에서는 지원 단계 선택, 전형 일정·메모)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePicks } from '../context/PickContext.jsx';
import { getCompany } from '../data/registry.js';
import { SCHEDULE_KINDS, STAGES, isNewJob, stageOf } from '../lib/apply.js';
import { formatKoreanDate, getDday } from '../lib/dday.js';
import { googleCalendarUrl, jobLink } from '../lib/links.js';
import { matchJob } from '../lib/profile.js';
import DdayBadge from './DdayBadge.jsx';

export const TYPE_COLOR = {
  정규직: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
  인턴: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200',
  무기계약직: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-200',
  비정규직: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

/** 찜 목록 카드 아래: 서류 발표·필기·면접·최종 발표 날짜와 메모 */
function ScheduleEditor({ job }) {
  const { updateSaved } = usePicks();
  const filled = SCHEDULE_KINDS.filter((k) => job[k.key]);
  const [open, setOpen] = useState(filled.length > 0 || Boolean(job.memo));

  return (
    <div className="space-y-2 border-t border-slate-100 pt-2 dark:border-slate-800">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-2 text-xs">
        <span className="muted font-semibold">📅 일정·메모</span>
        {!open &&
          filled.map((k) => (
            <span key={k.key} className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
              {k.icon} {k.label} {getDday(job[k.key]).label}
            </span>
          ))}
        <span className="muted ml-auto">{open ? '접기' : '열기'}</span>
      </button>
      {open && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {SCHEDULE_KINDS.map((k) => (
              <label key={k.key} className="space-y-0.5 text-[11px]">
                <span className="muted flex items-center justify-between">
                  <span>
                    {k.icon} {k.label}
                  </span>
                  {job[k.key] && getDday(job[k.key]).tone !== 'closed' && (
                    <b className="text-brand-600 dark:text-brand-300">{getDday(job[k.key]).label}</b>
                  )}
                </span>
                <input
                  type="date"
                  value={job[k.key] ?? ''}
                  onChange={(e) => updateSaved(job.id, { [k.key]: e.target.value || undefined })}
                  className="input w-full !px-2 !py-1 text-xs"
                />
              </label>
            ))}
          </div>
          <textarea
            value={job.memo ?? ''}
            onChange={(e) => updateSaved(job.id, { memo: e.target.value })}
            placeholder="메모 (예: 필기 과목, 준비할 것, 면접 질문)"
            rows={2}
            maxLength={1000}
            className="input w-full resize-y text-xs"
          />
        </>
      )}
    </div>
  );
}

export default function JobCard({ job, showCompany = true, withStatus = false }) {
  const { saved: savedJobs, toggleSaved, setSavedStatus, profile } = usePicks();
  const match = matchJob(job, profile);
  const c = getCompany(job.companyId);
  const savedJob = savedJobs.find((j) => j.id === job.id);
  const saved = Boolean(savedJob);
  const stage = savedJob && stageOf(savedJob);
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
          {isNewJob(job) && (
            <span className="rounded-lg bg-pick-500 px-1.5 py-0.5 text-[10px] font-black tracking-wide text-white">NEW</span>
          )}
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
      {match.reasons.length > 0 && match.blockers.length === 0 && (
        <p className="flex flex-wrap gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
          {match.reasons.map((r) => (
            <span key={r} className="rounded bg-emerald-50 px-1.5 py-0.5 dark:bg-emerald-500/10">
              ✓ {r}
            </span>
          ))}
        </p>
      )}

      <div className="muted mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-xs">
        <span className={`rounded-md px-1.5 py-0.5 font-semibold ${TYPE_COLOR[job.type] ?? TYPE_COLOR.비정규직}`}>{job.type}</span>
        {showCompany && job.career && <span>{job.career}</span>}
        {job.headcount && <span>{job.headcount}</span>}
        {job.replacement && <span className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">대체인력</span>}
        {saved && !withStatus && stage.key !== 'planned' && (
          <span className={`rounded-md px-1.5 py-0.5 font-semibold ${stage.color}`}>
            {stage.icon} {stage.label}
          </span>
        )}
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

      {withStatus && saved && (
        <label className="flex items-center gap-2 border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
          <span className="muted shrink-0 font-semibold">지원 현황</span>
          <select
            value={stage.key}
            onChange={(e) => setSavedStatus(job.id, e.target.value)}
            className={`flex-1 cursor-pointer rounded-lg border-0 px-2 py-1.5 text-xs font-semibold outline-none ring-1 ring-inset ring-black/5 ${stage.color}`}
          >
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.icon} {s.label}
              </option>
            ))}
          </select>
        </label>
      )}
      {withStatus && saved && <ScheduleEditor job={savedJob} />}
    </li>
  );
}
