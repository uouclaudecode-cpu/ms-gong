// 기업 상세: 공고 + 뉴스 + 네이버 블로그 후기
import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import BlogPosts from '../components/BlogPosts.jsx';
import JobTimeline from '../components/JobTimeline.jsx';
import NewsList from '../components/NewsList.jsx';
import { SkeletonCards } from '../components/Skeleton.jsx';
import { usePicks } from '../context/PickContext.jsx';
import { fetchJobs, fetchNews } from '../data/api.js';
import { COMPANY_BY_ID } from '../data/companies.js';
import { useAsync } from '../hooks/useAsync.js';
import { naverNewsSearchUrl } from '../lib/links.js';
import NotFoundPage from './NotFoundPage.jsx';

export default function CompanyPage() {
  const { id } = useParams();
  const { hash } = useLocation();
  const company = COMPANY_BY_ID[id];
  const { isPicked, toggle } = usePicks();
  const jobs = useAsync(fetchJobs, []);
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
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← 대시보드
        </Link>
        <header className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-4xl">
            {company.emoji}
          </span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="text-sm text-slate-500">
              {company.sector} · 본사 {company.hq}
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={naverNewsSearchUrl(company.name)}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              뉴스 검색 ↗
            </a>
            <button
              type="button"
              onClick={() => toggle(company.id)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                picked ? 'bg-amber-100 text-amber-800' : 'bg-brand-500 text-white hover:bg-brand-600'
              }`}
            >
              {picked ? '★ My 픽' : '☆ My 픽에 추가'}
            </button>
          </div>
        </header>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {jobs.loading ? <SkeletonCards count={2} /> : <JobTimeline result={jobs.data} companyIds={[id]} showCompany={false} />}
        </div>
        {news.loading ? <SkeletonCards count={3} className="space-y-3" /> : <NewsList result={news.data} companyIds={[id]} />}
      </div>

      <BlogPosts company={company} />
    </div>
  );
}
