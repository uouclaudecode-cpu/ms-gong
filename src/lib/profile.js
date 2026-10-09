// 내 프로필과 '나에게 맞는 공고' 판단.
// 프로필: { fields: NCS 분야[], regions: 지역[], edu: 학력, prefs: 우대 조건 키[], localRegion: 지역인재 지역 }
// 공고(api/_lib/builders.js): { ncs[], regions[], edu[], replacement, prefs[] }

// NCS 직무 대분류 (잡알리오 표기 그대로: 점으로 구분)
export const NCS_FIELDS = [
  '경영.회계.사무', '정보통신', '전기.전자', '기계', '건설', '환경.에너지.안전', '연구', '사업관리',
  '금융.보험', '보건.의료', '사회복지.종교', '교육.자연.사회과학', '법률.경찰.소방.교도.국방', '문화.예술.디자인.방송',
  '운전.운송', '영업판매', '화학.바이오', '재료', '농림어업', '식품가공', '경비.청소', '이용.숙박.여행.오락.스포츠',
  '음식서비스', '섬유.의복', '인쇄.목재.가구.공예',
];
export const fieldLabel = (f) => f.replaceAll('.', '·');

// 잡알리오 근무 지역 표기 (전남·광주는 하나로 묶여 있음)
export const REGIONS = [
  '서울', '경기', '인천', '강원', '대전', '세종', '충북', '충남', '부산', '울산', '대구', '경북', '경남',
  '전남광주', '전북', '제주', '해외',
];

// 학력: 잡알리오 조건과 같은 이름
export const EDUCATION = ['고졸', '대졸(2~3년)', '대졸(4년)', '석사', '박사'];

// 우대 조건 (키는 api/_lib/builders.js의 PREF_RULES와 같음)
export const PREFS = [
  { key: 'local', label: '지역인재' },
  { key: 'veteran', label: '보훈(취업지원대상자)' },
  { key: 'disabled', label: '장애인' },
  { key: 'lowincome', label: '저소득층' },
  { key: 'defector', label: '북한이탈주민' },
  { key: 'multicultural', label: '다문화' },
  { key: 'selfreliant', label: '자립준비청년' },
  { key: 'history', label: '한국사 자격' },
];
export const PREF_LABEL = Object.fromEntries(PREFS.map((p) => [p.key, p.label]));

export const EMPTY_PROFILE = { fields: [], regions: [], edu: '', prefs: [], localRegion: '' };

/** 프로필에 고른 게 하나라도 있는지 */
export const hasProfile = (p) => Boolean(p && (p.fields?.length || p.regions?.length || p.edu || p.prefs?.length));

/**
 * 공고가 나와 얼마나 맞는지.
 * reasons: 맞는 이유(✓), blockers: 지원이 어렵거나 원하지 않는 이유(✗), score: 높을수록 잘 맞음
 * 공고에 정보가 없으면(빈 목록) 맞다/아니다를 판단하지 않습니다.
 */
export function matchJob(job, profile) {
  const reasons = [];
  const blockers = [];
  let score = 0;
  if (!hasProfile(profile)) return { score, reasons, blockers };

  if (profile.fields?.length && job.ncs?.length) {
    const hit = job.ncs.filter((f) => profile.fields.includes(f));
    if (hit.length) {
      score += 3;
      reasons.push(`${fieldLabel(hit[0])} 직무`);
    } else blockers.push('다른 직무');
  }

  if (profile.regions?.length && job.regions?.length) {
    const hit = job.regions.filter((r) => profile.regions.includes(r));
    if (hit.length) {
      score += 2;
      reasons.push(`${hit[0]} 근무`);
    } else blockers.push('다른 지역');
  }

  // 학력: '학력무관'이거나 내 학력이 조건에 들어 있으면 OK. 고졸 채용 등은 정확히 그 학력만 받는 경우가 많아 그대로 비교
  if (profile.edu && job.edu?.length && !job.edu.includes('학력무관')) {
    if (job.edu.includes(profile.edu)) {
      score += 1;
      reasons.push(`${profile.edu} 대상`);
    } else blockers.push(`학력 조건(${job.edu.join('·')})`);
  }

  for (const key of profile.prefs ?? []) {
    if (!job.prefs?.includes(key)) continue;
    // 지역인재는 내 지역인재 지역이 근무지와 같을 때 더 확실합니다
    if (key === 'local' && profile.localRegion && job.regions?.length && !job.regions.includes(profile.localRegion)) continue;
    score += 2;
    reasons.push(`${PREF_LABEL[key]} 우대`);
  }

  return { score, reasons, blockers };
}

/** '나에게 맞는 공고' 기준: 막히는 이유 없이 직무·지역·우대 중 하나 이상 맞음 */
export const isGoodMatch = (m) => m.blockers.length === 0 && m.score >= 2;
