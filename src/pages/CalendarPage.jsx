// 채용 캘린더: My 픽 기업 공고(선택한 필터) + 찜한 공고의 마감일, 찜한 공고에 적은 전형 일정(필기·면접 등)
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JobCard from '../components/JobCard.jsx';
import { schedulesOf } from '../lib/apply.js';
import { SkeletonCards } from '../components/Skeleton.jsx';
import { usePicks } from '../context/PickContext.jsx';
import { getCompany } from '../data/registry.js';
import { useJobs } from '../hooks/useJobs.js';
import { formatKoreanDate, todayKST } from '../lib/dday.js';

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const pad = (n) => String(n).padStart(2, '0');
const ymd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

/** 해당 달을 일요일 시작 6주(42칸) 격자로 */
function monthGrid(year, month) {
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay();
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(Date.UTC(year, month, i - first + 1));
    return { date: d.toISOString().slice(0, 10), day: d.getUTCDate(), inMonth: d.getUTCMonth() === month, dow: i % 7 };
  });
}

export default function CalendarPage() {
  const { picks, hireTypes, saved, isSaved, passesFilters } = usePicks();
  const today = todayKST();
  const [cursor, setCursor] = useState(() => ({ y: +today.slice(0, 4), m: +today.slice(5, 7) - 1 }));
  const [selected, setSelected] = useState(today);
  const jobs = useJobs();

  // 날짜 → 그날 마감하는 공고들. 찜한 공고는 My 픽 밖이어도 포함합니다.
  const byDate = useMemo(() => {
    const list = (jobs.data?.items ?? []).filter((j) => picks.includes(j.companyId) && passesFilters(j));
    const all = [...list, ...saved.filter((s) => !list.some((j) => j.id === s.id))];
    const map = {};
    for (const j of all) if (j.deadline) (map[j.deadline] ??= []).push(j);
    return map;
  }, [jobs.data, picks, passesFilters, saved]);

  // 날짜 → 그날의 전형 일정 [{ job, kind }]
  const eventsByDate = useMemo(() => {
    const map = {};
    for (const e of schedulesOf(saved)) (map[e.date] ??= []).push(e);
    return map;
  }, [saved]);

  const cells = monthGrid(cursor.y, cursor.m);
  const move = (delta) =>
    setCursor(({ y, m }) => {
      const d = new Date(Date.UTC(y, m + delta, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    });
  const dayJobs = byDate[selected] ?? [];
  const dayEvents = eventsByDate[selected] ?? [];
  const monthCount = cells.filter((c) => c.inMonth).reduce((n, c) => n + (byDate[c.date]?.length ?? 0), 0);
  const monthEvents = cells.filter((c) => c.inMonth).reduce((n, c) => n + (eventsByDate[c.date]?.length ?? 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight">📅 채용 캘린더</h1>
        <p className="muted mt-1 text-sm">
          My 픽 기업의 {hireTypes.join('·') || '–'} 공고와 찜한 공고의 마감일, 찜 목록에 적은 필기·면접 일정이에요.
          {picks.length === 0 && (
            <>
              {' '}
              <Link to="/pick" className="text-brand-600 underline dark:text-brand-300">
                먼저 기업을 PICK 하세요
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <button type="button" onClick={() => move(-1)} className="btn-ghost !px-2.5 !py-1" aria-label="이전 달">
            ‹
          </button>
          <div className="text-center">
            <p className="text-lg font-black tabular-nums">
              {cursor.y}년 {cursor.m + 1}월
            </p>
            <p className="muted text-xs">
              마감 {monthCount}건{monthEvents > 0 && ` · 내 일정 ${monthEvents}건`}
            </p>
          </div>
          <button type="button" onClick={() => move(1)} className="btn-ghost !px-2.5 !py-1" aria-label="다음 달">
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-semibold">
          {WEEK.map((w, i) => (
            <div key={w} className={`py-2 ${i === 0 ? 'text-rose-500' : i === 6 ? 'text-brand-500' : 'muted'}`}>
              {w}
            </div>
          ))}
        </div>

        {jobs.loading ? (
          <div className="p-4">
            <SkeletonCards count={2} />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-800">
            {cells.map((c) => {
              const list = byDate[c.date] ?? [];
              const events = eventsByDate[c.date] ?? [];
              const isToday = c.date === today;
              const isSel = c.date === selected;
              return (
                <button
                  key={c.date}
                  type="button"
                  onClick={() => setSelected(c.date)}
                  className={`flex min-h-[64px] flex-col items-stretch gap-0.5 p-1 text-left transition sm:min-h-[92px] sm:p-1.5 ${
                    isSel ? 'bg-brand-50 dark:bg-brand-900/30' : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/70'
                  } ${c.inMonth ? '' : 'opacity-40'}`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center self-start rounded-full text-xs font-bold tabular-nums ${
                      isToday
                        ? 'bg-brand-500 text-white'
                        : c.dow === 0
                          ? 'text-rose-500'
                          : c.dow === 6
                            ? 'text-brand-500'
                            : ''
                    }`}
                  >
                    {c.day}
                  </span>
                  {/* 모바일: 점, PC: 기업 약칭 */}
                  <span className="flex flex-wrap gap-0.5 sm:hidden">
                    {events.map((e) => (
                      <span key={e.job.id + e.kind.key} className="h-1.5 w-1.5 rounded-full bg-pick-500" />
                    ))}
                    {list.slice(0, 4).map((j) => (
                      <span key={j.id} className={`h-1.5 w-1.5 rounded-full ${isSaved(j.id) ? 'bg-amber-400' : 'bg-brand-500'}`} />
                    ))}
                  </span>
                  <span className="hidden flex-col gap-0.5 sm:flex">
                    {events.map((e) => (
                      <span
                        key={e.job.id + e.kind.key}
                        className="truncate rounded bg-pick-500/15 px-1 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300"
                      >
                        {e.kind.icon}
                        {getCompany(e.job.companyId)?.short} {e.kind.label}
                      </span>
                    ))}
                    {list.slice(0, 2).map((j) => (
                      <span
                        key={j.id}
                        className={`truncate rounded px-1 py-0.5 text-[10px] font-semibold ${
                          isSaved(j.id)
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                            : 'bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200'
                        }`}
                      >
                        {isSaved(j.id) && '★'}
                        {getCompany(j.companyId).short}
                      </span>
                    ))}
                    {list.length > 2 && <span className="muted px-1 text-[10px]">+{list.length - 2}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {dayEvents.length > 0 && (
        <section className="space-y-2">
          <h2 className="section-title">{formatKoreanDate(selected)} 내 전형 일정</h2>
          <ul className="space-y-1.5">
            {dayEvents.map(({ job, kind }) => (
              <li key={job.id + kind.key} className="card flex items-center gap-2 p-3 text-sm">
                <span className="text-lg">{kind.icon}</span>
                <b className="shrink-0">{kind.label}</b>
                <span className="muted truncate">
                  {getCompany(job.companyId)?.name} · {job.title}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="section-title">
          {formatKoreanDate(selected)} 마감 <span className="text-brand-500">{dayJobs.length}</span>
        </h2>
        {dayJobs.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dayJobs.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </ul>
        ) : (
          <p className="muted text-sm">이 날 마감하는 공고가 없어요. 달력에서 점(●)이 있는 날을 눌러 보세요.</p>
        )}
      </section>
    </div>
  );
}
