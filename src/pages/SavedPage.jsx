// 찜한 공고 + 지원 현황 관리.
// 위에 단계별 현황(지원 예정 → 지원 완료 → 서류 → 필기 → 최종), 단계를 누르면 그 공고만 봅니다.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import JobCard from '../components/JobCard.jsx';
import { usePicks } from '../context/PickContext.jsx';
import { STAGES, stageOf } from '../lib/apply.js';
import { byDeadline, getDday } from '../lib/dday.js';

const isClosed = (j) => getDday(j.deadline).tone === 'closed';
// 마감이 지나도 지원한 공고는 결과를 기다리는 중이니 '마감됨'으로 치우지 않습니다
const isFinishedUnapplied = (j) => isClosed(j) && stageOf(j).key === 'planned';

function Pipeline({ saved, filter, onFilter }) {
  const count = (key) => saved.filter((j) => stageOf(j).key === key).length;
  const applied = saved.filter((j) => !['planned'].includes(stageOf(j).key)).length;
  return (
    <section className="card space-y-3 p-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="section-title">📋 지원 현황</h2>
        <p className="muted text-sm">
          지원 <b className="text-slate-900 dark:text-white">{applied}</b>곳 · 서류 합격{' '}
          <b className="text-slate-900 dark:text-white">
            {saved.filter((j) => ['docs', 'written', 'final'].includes(stageOf(j).key)).length}
          </b>
          곳 · 최종 합격 <b className="text-emerald-600 dark:text-emerald-400">{count('final')}</b>곳
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {STAGES.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-pressed={filter === s.key}
            onClick={() => onFilter(filter === s.key ? 'all' : s.key)}
            className={`rounded-xl p-2.5 text-left transition ${s.color} ${
              filter === s.key ? 'ring-2 ring-brand-500' : filter === 'all' ? '' : 'opacity-50'
            }`}
          >
            <p className="text-xs font-semibold">
              {s.icon} {s.label}
            </p>
            <p className="mt-0.5 text-xl font-black tabular-nums">{count(s.key)}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function SavedPage() {
  const { saved, toggleSaved } = usePicks();
  const [filter, setFilter] = useState('all');

  const shown = saved.filter((j) => filter === 'all' || stageOf(j).key === filter);
  const active = shown.filter((j) => !isFinishedUnapplied(j)).sort(byDeadline);
  const stale = shown.filter(isFinishedUnapplied);
  const stageLabel = STAGES.find((s) => s.key === filter)?.label;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">⭐ 찜·지원 현황</h1>
        <p className="muted mt-1 text-sm">
          공고 카드의 ☆로 찜하고, 아래에서 지원 단계를 바꿔 가며 관리하세요. 이 브라우저에만 저장돼요.
        </p>
      </div>

      {saved.length === 0 ? (
        <div className="card muted py-16 text-center">
          <p className="text-4xl">☆</p>
          <p className="mt-3 text-sm">아직 찜한 공고가 없어요.</p>
          <Link to="/" className="btn-primary mt-4">
            공고 보러 가기
          </Link>
        </div>
      ) : (
        <>
          <Pipeline saved={saved} filter={filter} onFilter={setFilter} />

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="section-title">
                {filter === 'all' ? '진행 중' : stageLabel} {active.length}
              </h2>
              {filter !== 'all' && (
                <button type="button" onClick={() => setFilter('all')} className="muted text-sm hover:underline">
                  전체 보기
                </button>
              )}
            </div>
            {active.length ? (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {active.map((j) => (
                  <JobCard key={j.id} job={j} withStatus />
                ))}
              </ul>
            ) : (
              <p className="muted text-sm">이 단계의 공고가 없어요.</p>
            )}
          </section>

          {stale.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="section-title text-slate-400 dark:text-slate-500">지원 안 하고 마감됨 {stale.length}</h2>
                <button type="button" onClick={() => stale.forEach(toggleSaved)} className="muted text-sm hover:underline">
                  모두 비우기
                </button>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stale.map((j) => (
                  <JobCard key={j.id} job={j} withStatus />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
