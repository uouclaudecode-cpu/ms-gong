// 기업 상세: 기관 정보 + 공고 + 뉴스 + 채용 트렌드 + 네이버 블로그 후기
import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import BlogPosts from '../components/BlogPosts.jsx';
import CompanyInfo from '../components/CompanyInfo.jsx';
import HiringTrend from '../components/HiringTrend.jsx';
import JobTimeline from '../components/JobTimeline.jsx';
import NewsList from '../components/NewsList.jsx';
import { SkeletonCards } from '../components/Skeleton.jsx';
import { usePicks } from '../context/PickContext.jsx';
import { fetchNews } from '../data/api.js';
import { getCompany } from '../data/registry.js';
import { useAsync } from '../hooks/useAsync.js';
import { useJobs } from '../hooks/useJobs.js';
import { naverNewsSearchUrl } from '../lib/links.js';
import NotFoundPage from './NotFoundPage.jsx';
import { Safe } from '../components/ErrorBoundary.jsx';

export default function CompanyPage() {
  const { id } = useParams();
  const { hash } = useLocation();
  const company = getCompany(id);
  const { isPicked, toggle } = usePicks();
  const jobs = useJobs();
  const news = useAsync(() => fetchNews([id]), [id]);

  // 카드의 '블로그 후기 보기'로 들어오면 #blog 위치로.
  // 위쪽 공고·뉴스가 불러와지며 높이가 바뀌므로 로딩이 끝난 뒤에 스크롤합니다.
  const ready = !jobs.loading && !news.loading;
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [id, hash]);
  useEffect(() => {
    if (hash && ready) document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
  }, [id, hash, ready]);

  if (!company) return <NotFoundPage />;
  const picked = isPicked(company.id);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link to="/" className="muted text-sm hover:text-slate-800 dark:hover:text-white">
          ← 홈
        </Link>
        <header className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-4xl dark:bg-slate-800">
            {company.emoji}
          </span>
          <div className="flex-1">
            <h1 className="text-2xl font-black tracking-tight">{company.name}</h1>
            <p className="muted text-sm">{company.hq ? `${company.sector} · 본사 ${company.hq}` : company.sector}</p>
          </div>
          <div className="flex gap-2">
            <a href={naverNewsSearchUrl(company.name)} target="_blank" rel="noreferrer" className="btn-ghost">
              뉴스 검색 ↗
            </a>
            <button
              type="button"
              onClick={() => toggle(company.id)}
              className={picked ? 'btn bg-pick-500/15 text-pick-500 ring-1 ring-pick-500/40' : 'btn-primary'}
            >
              {picked ? '✓ PICK 됨' : '+ My 픽에 추가'}
            </button>
          </div>
        </header>
        <Safe name="기관 정보">
          <CompanyInfo company={company} />
        </Safe>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <Safe name="채용 공고">
            {jobs.loading ? <SkeletonCards count={2} /> : <JobTimeline result={jobs.data} companyIds={[id]} showCompany={false} />}
          </Safe>
        </div>
        <div className="min-w-0">
          <Safe name="뉴스">
            {news.loading ? <SkeletonCards count={3} className="space-y-3" /> : <NewsList result={news.data} companyIds={[id]} />}
          </Safe>
        </div>
      </div>

      <Safe name="채용 트렌드">
        <HiringTrend company={company} />
      </Safe>

      <Safe name="블로그 후기">
        <BlogPosts company={company} />
      </Safe>
    </div>
  );
}
