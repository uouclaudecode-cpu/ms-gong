// 메인 대시보드. My 픽이 비어 있으면 온보딩(기업 고르기)부터 보여 줍니다.
import { Link, useSearchParams } from 'react-router-dom';
import CompanyCard from '../components/CompanyCard.jsx';
import CompanyPicker from '../components/CompanyPicker.jsx';
import DdayBadge from '../components/DdayBadge.jsx';
import JobTimeline from '../components/JobTimeline.jsx';
import NewsList from '../components/NewsList.jsx';
import PickFilterBar from '../components/PickFilterBar.jsx';
import { SkeletonCards } from '../components/Skeleton.jsx';
import { usePicks } from '../context/PickContext.jsx';
import { fetchJobs, fetchNews } from '../data/api.js';
import { COMPANY_BY_ID } from '../data/companies.js';
import { useAsync } from '../hooks/useAsync.js';
import { byDeadline, formatKoreanDate, getDday, todayKST } from '../lib/dday.js';

function Onboarding() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 px-6 py-9 text-white sm:px-10">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" aria-hidden />
        <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/5" aria-hidden />
        <p className="relative text-sm font-medium text-brand-100">공기업 취준생을 위한 맞춤 큐레이션</p>
        <h1 className="relative mt-2 text-2xl font-bold leading-snug sm:text-3xl">
          관심 있는 공기업만 골라서
          <br />
          공고·뉴스·합격 후기를 한눈에
        </h1>
        <ul className="relative mt-5 flex flex-wrap gap-2 text-xs font-medium">
          {['📅 잡알리오 채용 공고 D-Day', '📰 기업별 최신 뉴스', '📝 네이버 블로그 합격 후기'].map((t) => (
            <li key={t} className="rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
              {t}
            </li>
          ))}
        </ul>
      </section>
      <div>
        <h2 className="mb-3 text-lg font-bold">관심 있는 공기업을 골라 주세요</h2>
        <CompanyPicker />
      </div>
    </div>
  );
}

function Stat({ label, value, tone = 'text-slate-900' }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 sm:p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold tabular-nums sm:text-2xl ${tone}`}>{value}</p>
    </div>
  );
}

export default function HomePage() {
  const { picks, hireTypes } = usePicks();
  const [params, setParams] = useSearchParams();
  const jobsState = useAsync(fetchJobs, []);
  const newsState = useAsync(() => (picks.length ? fetchNews(picks) : Promise.resolve(null)), [picks.join(',')]);

  if (picks.length === 0) return <Onboarding />;

  // ?c=kepco 처럼 주소에 필터를 담아 새로고침·공유해도 유지되게 합니다.
  const active = picks.includes(params.get('c')) ? params.get('c') : 'all';
  const scope = active === 'all' ? picks : [active];
  const setActive = (id) => setParams(id === 'all' ? {} : { c: id }, { replace: true });

  // 통계·카드도 공고 목록과 같은 고용형태 필터를 따릅니다
  const allJobs = (jobsState.data?.items ?? []).filter((j) => hireTypes.includes(j.type));
  const openJobs = allJobs
    .filter((j) => scope.includes(j.companyId) && getDday(j.deadline).tone !== 'closed')
    .sort(byDeadline);
  const urgent = openJobs.filter((j) => ['urgent', 'soon'].includes(getDday(j.deadline).tone));
  const next = openJobs.find((j) => j.deadline);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm text-slate-500">{formatKoreanDate(todayKST())}</p>
          <h1 className="text-2xl font-bold">오늘의 공기업 브리핑</h1>
        </div>
      </div>

      <PickFilterBar picks={picks} active={active} onChange={setActive} />

      <div className="grid grid-cols-3 gap-3">
        <Stat label={active === 'all' ? '관심 기업' : '선택한 기업'} value={`${scope.length}곳`} />
        <Stat label="진행 중 공고" value={jobsState.loading ? '–' : `${openJobs.length}건`} tone="text-brand-600" />
        <Stat
          label="7일 내 마감"
          value={jobsState.loading ? '–' : `${urgent.length}건`}
          tone={urgent.length ? 'text-rose-600' : 'text-slate-900'}
        />
      </div>

      {next && (
        <a
          href={next.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl bg-rose-50 px-4 py-3 ring-1 ring-rose-100 transition hover:bg-rose-100"
        >
          <span className="text-lg">⏰</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-rose-700">가장 먼저 마감하는 공고 · {COMPANY_BY_ID[next.companyId].name}</p>
            <p className="truncate text-sm font-semibold text-slate-900">{next.title}</p>
          </div>
          <DdayBadge deadline={next.deadline} />
        </a>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {jobsState.loading ? <SkeletonCards count={4} /> : <JobTimeline result={jobsState.data} companyIds={scope} />}
        </div>
        {newsState.loading ? (
          <SkeletonCards count={4} className="space-y-3" />
        ) : (
          <NewsList result={newsState.data} companyIds={scope} limit={8} />
        )}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">⭐ My 픽 기업</h2>
          <Link to="/pick" className="text-sm text-slate-500 hover:text-slate-800">
            편집 ›
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {scope.map((id) => (
            <CompanyCard key={id} company={COMPANY_BY_ID[id]} jobs={allJobs.filter((j) => j.companyId === id)} />
          ))}
        </div>
      </section>
    </div>
  );
}
