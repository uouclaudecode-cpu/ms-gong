// 네이버 블로그 합격 후기·공부법 글 목록 (키워드 탭 + 네이버 검색 API)
import { useState } from 'react';
import { fetchBlog } from '../data/api.js';
import { useAsync } from '../hooks/useAsync.js';
import { BLOG_KEYWORDS, naverBlogSearchUrl } from '../lib/links.js';
import DataStatus from './DataStatus.jsx';
import { SkeletonCards } from './Skeleton.jsx';

export default function BlogPosts({ company }) {
  const [kw, setKw] = useState(BLOG_KEYWORDS[0].key);
  const result = useAsync(() => fetchBlog(company.id, kw), [company.id, kw]);
  const keyword = BLOG_KEYWORDS.find((k) => k.key === kw);

  return (
    <section id="blog" className="scroll-mt-20 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-1.5 text-lg font-bold">
          <span className="rounded bg-[#03c75a] px-1 text-xs font-black leading-5 text-white">N</span>
          블로그 합격 후기·공부법
        </h2>
        <DataStatus result={result.data} source="네이버 블로그" />
      </div>

      <div role="tablist" className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
        {BLOG_KEYWORDS.map((k) => (
          <button
            key={k.key}
            type="button"
            role="tab"
            aria-selected={kw === k.key}
            onClick={() => setKw(k.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              kw === k.key ? 'bg-[#03c75a] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-400'
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      {result.loading ? (
        <SkeletonCards count={4} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {(result.data?.items ?? []).map((p) => (
            <li key={p.url + p.title}>
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="flex h-full flex-col gap-1.5 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-emerald-300"
              >
                <p className="line-clamp-2 font-semibold leading-snug text-slate-900">{p.title}</p>
                <p className="line-clamp-2 text-sm text-slate-500">{p.description}</p>
                <p className="mt-auto pt-1 text-xs text-slate-400">
                  {p.blogger} · {p.postedAt}
                </p>
              </a>
            </li>
          ))}
          {result.data?.items?.length === 0 && (
            <li className="col-span-full rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
              관련 글을 찾지 못했어요.
            </li>
          )}
        </ul>
      )}

      <a
        href={naverBlogSearchUrl(company.name, keyword.query)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
      >
        네이버에서 &lsquo;{company.name} {keyword.query}&rsquo; 더 보기 ↗
      </a>
    </section>
  );
}
