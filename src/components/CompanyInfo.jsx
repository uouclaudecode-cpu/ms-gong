// 기업 정보 카드: 신입 초임·평균보수·직원 수·기관 유형·주무부처 (ALIO 공시, 사이트에 들어 있는 파일)
import { fetchCompanyInfo } from '../data/api.js';
import { useAsync } from '../hooks/useAsync.js';

// ALIO 값은 천원 단위: 48864 → '4,886만 원'
const manwon = (v) => (v == null ? null : `${Math.round(v / 10).toLocaleString('ko-KR')}만 원`);
const people = (v) => (v == null ? null : `${Math.round(v).toLocaleString('ko-KR')}명`);

function Delta({ now, prev }) {
  if (now == null || prev == null || prev === 0) return null;
  const pct = ((now - prev) / prev) * 100;
  if (Math.abs(pct) < 0.5) return <span className="muted text-[11px]">작년과 비슷</span>;
  return (
    <span className={`text-[11px] font-semibold ${pct > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
      {pct > 0 ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}% (작년 대비)
    </span>
  );
}

function Tile({ label, value, children }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
      <p className="muted text-xs font-medium">{label}</p>
      <p className="mt-1 text-lg font-black tabular-nums tracking-tight">{value ?? '–'}</p>
      {children}
    </div>
  );
}

export default function CompanyInfo({ company }) {
  const result = useAsync(fetchCompanyInfo, []);
  const info = company.code ? result.data?.items?.[company.code] : null;

  if (result.loading) return null;
  if (!info) {
    return (
      <section className="card p-4">
        <h2 className="section-title">🏢 기관 정보</h2>
        <p className="muted mt-2 text-sm">이 기관은 ALIO 경영정보 공시 자료를 찾지 못했어요.</p>
      </section>
    );
  }

  const [year] = result.data.years;
  return (
    <section className="card space-y-3 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="section-title">🏢 기관 정보</h2>
        <p className="muted text-xs">
          {info.type} · {info.ministry}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Tile label="💰 신입 초임" value={manwon(info.starting?.[0])}>
          <Delta now={info.starting?.[0]} prev={info.starting?.[1]} />
        </Tile>
        <Tile label="📊 직원 평균보수 (정규직)" value={manwon(info.avgPay?.[0])}>
          <Delta now={info.avgPay?.[0]} prev={info.avgPay?.[1]} />
        </Tile>
        <Tile label="👥 정규직 직원 수" value={people(info.staff?.[0])}>
          <Delta now={info.staff?.[0]} prev={info.staff?.[1]} />
        </Tile>
      </div>
      <p className="text-[11px] text-slate-400">
        출처:{' '}
        <a href="https://www.alio.go.kr" target="_blank" rel="noreferrer" className="underline">
          ALIO 공공기관 경영정보 공개시스템
        </a>{' '}
        {year}년 공시 · 올해 값은 예산 기준일 수 있어요 · 자료 갱신 {result.data.updatedAt}
      </p>
    </section>
  );
}
