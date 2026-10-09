// 홈. My 픽이 비어 있으면 온보딩(기업 고르기)부터 보여 줍니다.
// 공유 링크(/?picks=kepco,iiac)로 들어오면 그 목록을 적용할지 물어봅니다.
import { Link, useSearchParams } from 'react-router-dom';
import CompanyCard from '../components/CompanyCard.jsx';
import CompanyPicker from '../components/CompanyPicker.jsx';
import DdayBadge from '../components/DdayBadge.jsx';
import InstallApp from '../components/InstallApp.jsx';
import JobTimeline from '../components/JobTimeline.jsx';
import Logo from '../components/Logo.jsx';
import NewsList from '../components/NewsList.jsx';
import PickFilterBar from '../components/PickFilterBar.jsx';
import { SkeletonCards } from '../components/Skeleton.jsx';
import { usePicks } from '../context/PickContext.jsx';
import { fetchJobs, fetchNews } from '../data/api.js';
import { COMPANY_BY_ID } from '../data/companies.js';
import { useAsync } from '../hooks/useAsync.js';
import { byDeadline, formatKoreanDate, getDday, todayKST } from '../lib/dday.js';
import { jobLink } from '../lib/links.js';

function SharedPicksBanner({ ids, onApply, onDismiss }) {
  return (
    <div className="card flex flex-col gap-3 p-4 ring-2 ring-brand-300 sm:flex-row sm:items-center dark:ring-brand-700">
      <div className="flex-1">
        <p className="text-sm font-bold">🔗 친구가 공유한 My 픽이에요</p>
        <p className="muted mt-0.5 text-sm">{ids.map((id) => COMPANY_BY_ID[id].short).join(' · ')}</p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onDismiss} className="btn-ghost">
          괜찮아요
        </button>
        <button type="button" onClick={onApply} className="btn-primary">
          내 픽으로 담기
        </button>
      </div>
    </div>
  );
}

function Onboarding() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 px-6 py-10 text-white sm:px-10 sm:py-12">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-pick-400/20 blur-3xl" aria-hidden />
        <p className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
          <span className="text-pick-400">✓</span> My Selection PICK
        </p>
        <h1 className="relative mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          내가 고른 공기업만,
          <br />
          딱 필요한 것만.
        </h1>
        <p className="relative mt-3 max-w-md text-sm text-brand-100 sm:text-base">
          관심 공기업을 PICK 하면 채용 공고 D-Day, 최신 뉴스, 합격 후기를 한곳에 모아 드려요.
        </p>
        <ul className="relative mt-6 grid grid-cols-2 gap-2 text-xs font-semibold sm:flex sm:flex-wrap">
          {['📅 채용 공고 D-Day', '📰 기업별 뉴스', '📝 블로그 합격 후기', '⭐ 공고 찜·캘린더'].map((t) => (
            <li key={t} className="rounded-xl bg-white/15 px-3 py-2 backdrop-blur">
              {t}
            </li>
          ))}
        </ul>
      </section>
      <div>
        <h2 className="section-title mb-1">관심 있는 공기업을 PICK 하세요</h2>
        <p className="muted mb-4 text-sm">여러 곳을 골라도 돼요. 고른 기업은 이 브라우저에 저장돼요.</p>
        <CompanyPicker />
      </div>
    </div>
  );
}

function Stat({ label, value, tone = '', sub }) {
  return (
    <div className="card p-3 sm:p-4">
      <p className="muted text-xs font-medium">{label}</p>
      <p className={`mt-1 text-2xl font-black tabular-nums tracking-tight ${tone}`}>{value}</p>
      {sub && <p className="mt-0.5 truncate text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}

export default function HomePage() {
  const { picks, setPicks, hireTypes, saved } = usePicks();
  const [params, setParams] = useSearchParams();
  const jobsState = useAsync(fetchJobs, []);
  const newsState = useAsync(() => (picks.length ? fetchNews(picks) : Promise.resolve(null)), [picks.join(',')]);

  const shared = (params.get('picks') ?? '').split(',').filter((id) => COMPANY_BY_ID[id]);
  const dropShared = () => {
    params.delete('picks');
    setParams(params, { replace: true });
  };
  const banner = shared.length > 0 && (
    <SharedPicksBanner
      ids={shared}
      onDismiss={dropShared}
      onApply={() => {
        setPicks((prev) => [...new Set([...prev, ...shared])]);
        dropShared();
      }}
    />
  );

  if (picks.length === 0) {
    return (
      <div className="space-y-6">
        {banner}
        <Onboarding />
        <InstallApp />
      </div>
    );
  }

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
  const savedOpen = saved.filter((j) => getDday(j.deadline).tone !== 'closed');

  return (
    <div className="space-y-6">
      {banner}

      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="muted text-sm font-medium">{formatKoreanDate(todayKST())}</p>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">오늘의 PICK 브리핑</h1>
        </div>
        <div className="hidden sm:block">
          <Logo />
        </div>
      </div>

      <PickFilterBar picks={picks} active={active} onChange={setActive} />

      <div className="grid grid-cols-3 gap-3">
        <Stat
          label="진행 중 공고"
          value={jobsState.loading ? '–' : openJobs.length}
          tone="text-brand-600 dark:text-brand-300"
          sub={hireTypes.join('·') || '고용형태 미선택'}
        />
        <Stat
          label="7일 내 마감"
          value={jobsState.loading ? '–' : urgent.length}
          tone={urgent.length ? 'text-rose-600 dark:text-rose-400' : ''}
        />
        <Link to="/saved" className="contents">
          <Stat label="⭐ 찜한 공고" value={savedOpen.length} sub="찜 목록 보기 ›" />
        </Link>
      </div>

      {next && (
        <a
          href={jobLink(next)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-2xl bg-rose-50 px-4 py-3 ring-1 ring-rose-100 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:ring-rose-500/20 dark:hover:bg-rose-500/15"
        >
          <span className="text-xl">⏰</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
              가장 먼저 마감 · {COMPANY_BY_ID[next.companyId].name}
            </p>
            <p className="truncate text-sm font-bold">{next.title}</p>
          </div>
          <DdayBadge deadline={next.deadline} />
        </a>
      )}

      <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
        <div className="min-w-0 lg:col-span-2">
          {jobsState.loading ? <SkeletonCards count={4} /> : <JobTimeline result={jobsState.data} companyIds={scope} />}
        </div>
        <div className="min-w-0">
          {newsState.loading ? (
            <SkeletonCards count={4} className="space-y-3" />
          ) : (
            <NewsList result={newsState.data} companyIds={scope} limit={6} />
          )}
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">✅ My 픽 기업</h2>
          <Link to="/pick" className="muted text-sm hover:text-slate-800 dark:hover:text-white">
            편집 ›
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {scope.map((id) => (
            <CompanyCard key={id} company={COMPANY_BY_ID[id]} jobs={allJobs.filter((j) => j.companyId === id)} />
          ))}
        </div>
      </section>

      <InstallApp />
    </div>
  );
}
