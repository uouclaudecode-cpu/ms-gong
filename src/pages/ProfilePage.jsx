// 내 프로필: 희망 직무·지역·학력·우대 조건. 고르는 즉시 이 브라우저에 저장되고, 홈의 '나에게 맞는 공고'에 쓰입니다.
import { Link } from 'react-router-dom';
import { usePicks } from '../context/PickContext.jsx';
import { useJobs } from '../hooks/useJobs.js';
import { getDday } from '../lib/dday.js';
import { EDUCATION, EMPTY_PROFILE, NCS_FIELDS, PREFS, REGIONS, fieldLabel, isGoodMatch, matchJob } from '../lib/profile.js';

function Section({ title, hint, children }) {
  return (
    <section className="card space-y-3 p-4">
      <div>
        <h2 className="font-bold">{title}</h2>
        {hint && <p className="muted mt-0.5 text-xs">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Chips({ options, selected, onToggle, label = (o) => o, counts }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const key = typeof o === 'string' ? o : o.key;
        const on = selected.includes(key);
        return (
          <button key={key} type="button" aria-pressed={on} onClick={() => onToggle(key)} className={`chip !py-1 text-xs ${on ? 'chip-brand' : ''}`}>
            {on ? '✓ ' : ''}
            {label(o)}
            {counts?.[key] ? <span className="ml-1 opacity-60">{counts[key]}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

const toggleIn = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function ProfilePage() {
  const { profile, setProfile, passesFilters } = usePicks();
  const jobs = useJobs();
  const open = (jobs.data?.items ?? []).filter((j) => getDday(j.deadline).tone !== 'closed');

  // 지금 진행 중 공고 수를 옆에 보여 줘서 고르기 쉽게
  const count = (key) => {
    const c = {};
    for (const j of open) for (const v of j[key] ?? []) c[v] = (c[v] ?? 0) + 1;
    return c;
  };
  const ncsCounts = count('ncs');
  const regionCounts = count('regions');
  const prefCounts = count('prefs');
  const matched = open.filter((j) => passesFilters(j) && isGoodMatch(matchJob(j, profile))).length;

  const update = (patch) => setProfile((p) => ({ ...p, ...patch }));
  // 공고가 많은 직무를 앞에
  const fields = [...NCS_FIELDS].sort((a, b) => (ncsCounts[b] ?? 0) - (ncsCounts[a] ?? 0));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">🎯 내 프로필</h1>
          <p className="muted mt-1 text-sm">고르는 대로 바로 저장돼요. 이 브라우저에만 저장되고 어디에도 보내지 않아요.</p>
        </div>
        <Link to="/#matched" className="btn-primary">
          맞는 공고 {jobs.loading ? '…' : `${matched}건`} 보기
        </Link>
      </div>

      <Section title="💼 희망 직무" hint="NCS 직무 분야예요. 여러 개 골라도 돼요. 숫자는 지금 진행 중인 공고 수예요.">
        <Chips
          options={fields}
          selected={profile.fields}
          counts={ncsCounts}
          label={fieldLabel}
          onToggle={(f) => update({ fields: toggleIn(profile.fields, f) })}
        />
      </Section>

      <Section title="📍 희망 근무 지역" hint="안 고르면 지역은 따지지 않아요.">
        <Chips options={REGIONS} selected={profile.regions} counts={regionCounts} onToggle={(r) => update({ regions: toggleIn(profile.regions, r) })} />
      </Section>

      <Section title="🎓 학력" hint="'학력무관' 공고는 항상 맞는 것으로 봐요. 고졸 채용처럼 학력이 정해진 공고만 비교해요.">
        <Chips
          options={EDUCATION}
          selected={profile.edu ? [profile.edu] : []}
          onToggle={(e) => update({ edu: profile.edu === e ? '' : e })}
        />
      </Section>

      <Section title="⭐ 해당하는 우대 조건" hint="공고의 우대 조건·지원 자격 글에서 찾아요. 정확한 가점은 꼭 원문 공고에서 확인하세요.">
        <Chips
          options={PREFS}
          selected={profile.prefs}
          counts={prefCounts}
          label={(p) => p.label}
          onToggle={(k) => update({ prefs: toggleIn(profile.prefs, k) })}
        />
        {profile.prefs.includes('local') && (
          <label className="flex flex-wrap items-center gap-2 text-sm">
            <span className="muted">지역인재 지역</span>
            <select value={profile.localRegion} onChange={(e) => update({ localRegion: e.target.value })} className="input !py-1.5">
              <option value="">상관없음</option>
              {REGIONS.filter((r) => r !== '해외').map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <span className="muted text-xs">고르면 그 지역에서 근무하는 지역인재 우대 공고만 맞는 것으로 봐요.</span>
          </label>
        )}
      </Section>

      <button type="button" onClick={() => setProfile(EMPTY_PROFILE)} className="muted text-sm hover:underline">
        프로필 모두 지우기
      </button>
    </div>
  );
}
