// 찜한 공고 모아보기. 마감된 공고는 아래로 모으고 한 번에 정리할 수 있습니다.
import { Link } from 'react-router-dom';
import JobCard from '../components/JobCard.jsx';
import { usePicks } from '../context/PickContext.jsx';
import { byDeadline, getDday } from '../lib/dday.js';

export default function SavedPage() {
  const { saved, toggleSaved } = usePicks();
  const open = saved.filter((j) => getDday(j.deadline).tone !== 'closed').sort(byDeadline);
  const closed = saved.filter((j) => getDday(j.deadline).tone === 'closed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">⭐ 찜한 공고</h1>
        <p className="muted mt-1 text-sm">공고 카드의 ☆를 누르면 여기에 모여요. 🗓️로 구글 캘린더에 마감일을 넣을 수 있어요.</p>
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
          <section className="space-y-3">
            <h2 className="section-title">진행 중 {open.length}</h2>
            {open.length ? (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {open.map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
              </ul>
            ) : (
              <p className="muted text-sm">진행 중인 찜 공고가 없어요.</p>
            )}
          </section>

          {closed.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="section-title text-slate-400 dark:text-slate-500">마감됨 {closed.length}</h2>
                <button type="button" onClick={() => closed.forEach(toggleSaved)} className="muted text-sm hover:underline">
                  마감된 공고 비우기
                </button>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {closed.map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
