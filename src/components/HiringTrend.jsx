// 채용 트렌드: 최근 3년 연도별 공고 수 + 달별로 정규직·인턴 공고가 뜬 횟수 (잡알리오, 마감 공고 포함)
import { useState } from 'react';
import { fetchTrend } from '../data/api.js';
import { useAsync } from '../hooks/useAsync.js';
import { jobLink } from '../lib/links.js';
import { SkeletonCards } from './Skeleton.jsx';

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

/** 달별 막대 (한 가지 색, 많이 뜨는 달만 진하게). 마우스를 올리거나 누르면 숫자가 보입니다 */
function MonthBars({ counts }) {
  const [hover, setHover] = useState(null);
  const max = Math.max(...counts, 1);
  const top = [...counts].map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).slice(0, 2).filter(([v]) => v > 0).map(([, i]) => i);

  return (
    <figure className="space-y-2">
      <div className="relative">
        <div className="flex h-36 items-end gap-[2px]" role="img" aria-label="달별 정규직·인턴 공고 수 막대그래프">
          {counts.map((v, i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => setHover(i)}
              aria-label={`${MONTHS[i]} ${v}건`}
              className="group flex h-full flex-1 items-end"
            >
              <span
                className={`w-full rounded-t transition-colors ${
                  top.includes(i) ? 'bg-brand-500 dark:bg-brand-400' : 'bg-brand-200 dark:bg-brand-800'
                } ${hover === i ? 'opacity-80' : ''}`}
                style={{ height: `${Math.max((v / max) * 100, v ? 3 : 1)}%` }}
              />
            </button>
          ))}
        </div>
        {hover !== null && (
          <div
            className="pointer-events-none absolute -top-2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white shadow dark:bg-white dark:text-slate-900"
            style={{ left: `${((hover + 0.5) / 12) * 100}%` }}
          >
            {MONTHS[hover]} · {counts[hover]}건
          </div>
        )}
      </div>
      <div className="muted flex gap-[2px] text-center text-[10px] tabular-nums">
        {MONTHS.map((m, i) => (
          <span key={m} className={`flex-1 ${top.includes(i) ? 'font-bold text-brand-600 dark:text-brand-300' : ''}`}>
            {i + 1}
          </span>
        ))}
      </div>
      {/* 화면 낭독기용 표 */}
      <table className="sr-only">
        <caption>달별 정규직·인턴 공고 수</caption>
        <tbody>
          {counts.map((v, i) => (
            <tr key={i}>
              <th>{MONTHS[i]}</th>
              <td>{v}건</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export default function HiringTrend({ company }) {
  const result = useAsync(() => fetchTrend(company.id), [company.id]);
  const t = result.data;

  if (result.loading) {
    return (
      <section className="space-y-3">
        <h2 className="section-title">📊 채용 트렌드</h2>
        <SkeletonCards count={1} className="grid" />
        <p className="muted text-xs">지난 3년 공고를 모으는 중이에요. 처음엔 조금 걸려요.</p>
      </section>
    );
  }
  if (!t?.live || !t.available) {
    return (
      <section className="card p-4">
        <h2 className="section-title">📊 채용 트렌드</h2>
        <p className="muted mt-2 text-sm">
          {t?.reason === 'no_key'
            ? '잡알리오 키를 연결하면 지난 3년 채용 흐름을 보여 드려요.'
            : t?.live
              ? '이 기관은 잡알리오 기관 코드를 몰라서 지난 공고를 모으지 못했어요.'
              : '지금은 채용 기록을 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.'}
        </p>
      </section>
    );
  }

  const mainTotal = t.mainByMonth.reduce((a, b) => a + b, 0);
  const topMonths = t.mainByMonth
    .map((v, i) => [v, i])
    .sort((a, b) => b[0] - a[0])
    .slice(0, 2)
    .filter(([v]) => v > 0)
    .map(([, i]) => MONTHS[i]);

  return (
    <section className="space-y-3">
      <h2 className="section-title">📊 채용 트렌드</h2>
      <div className="card space-y-4 p-4">
        <div className="grid grid-cols-4 gap-2">
          {t.byYear.map((y) => {
            // 다 못 센 경우: 센 범위 이전 해는 '–', 걸친 해는 '216+'
            const fromYear = t.partial ? Number(t.coveredFrom?.slice(0, 4)) : 0;
            const label = y.year < fromYear ? '–' : y.year === fromYear ? `${y.count}+` : y.count;
            return (
              <div key={y.year} className="rounded-xl bg-slate-50 p-2.5 text-center dark:bg-slate-800/60">
                <p className="muted text-xs font-medium">{y.year}년</p>
                <p className="text-lg font-black tabular-nums">{label}</p>
              </div>
            );
          })}
        </div>
        <p className="muted text-xs">
          연도별 잡알리오 공고 수 (모든 고용형태)
          {t.partial && ` · 공고가 많아 ${t.coveredFrom} 이후 1,500건만 셌어요`}
        </p>

        <div>
          <p className="mb-3 text-sm">
            {mainTotal > 0 ? (
              <>
                정규직·인턴 공고는 보통 <b className="text-brand-600 dark:text-brand-300">{topMonths.join('·')}</b>에 많이 떴어요.
              </>
            ) : (
              '최근 3년간 정규직·인턴 공고가 없었어요.'
            )}
          </p>
          {mainTotal > 0 && <MonthBars counts={t.mainByMonth} />}
        </div>

        {t.latest.length > 0 && (
          <div className="space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
            <p className="muted text-xs font-semibold">최근 정규직·인턴 공고</p>
            <ul className="space-y-1">
              {t.latest.map((j) => (
                <li key={j.id} className="flex items-baseline gap-2 text-sm">
                  <span className="muted shrink-0 text-xs tabular-nums">{j.startsAt?.slice(0, 7)}</span>
                  <a href={jobLink(j)} target="_blank" rel="noreferrer" className="truncate hover:underline">
                    {j.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
