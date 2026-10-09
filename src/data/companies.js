// 선택할 수 있는 공기업 목록.
// id는 URL(/company/:id)과 localStorage에 쓰이므로 한 번 정하면 바꾸지 않습니다.
// name은 잡알리오 기관명과 똑같아야 채용 공고가 연결됩니다.
// code는 잡알리오 기관 코드(pblntInstCd): 채용 트렌드 조회에 씁니다. 모르면 비워 둡니다.
// aliases는 뉴스·블로그에서 기업을 알아보는 다른 이름입니다(선택).
// excludes는 기업명이 들어가지만 다른 회사인 이름(자회사 등)입니다(선택).
export const SECTORS = ['에너지', 'SOC·교통', '금융', '산업·무역', '보건·복지', '고용·노동'];

export const COMPANIES = [
  { id: 'kepco', code: 'C0247', name: '한국전력공사', short: '한전', sector: '에너지', hq: '전남 나주', emoji: '⚡', excludes: ['한전KPS', '한전KDN', '한전MCS', '한전원자력연료', '한전기술', '한국전력기술', '한전산업개발', '한전엠씨에스'] },
  { id: 'khnp', code: 'C0220', name: '한국수력원자력', short: '한수원', sector: '에너지', hq: '경북 경주', emoji: '⚛️', aliases: ['한국수력원자력(주)'] },
  { id: 'kogas', code: 'C0147', name: '한국가스공사', short: '가스공사', sector: '에너지', hq: '대구', emoji: '🔥' },
  { id: 'knoc', code: 'C0214', name: '한국석유공사', short: '석유공사', sector: '에너지', hq: '울산', emoji: '🛢️' },
  { id: 'ewp', name: '한국동서발전', short: '동서발전', sector: '에너지', hq: '울산', emoji: '🏭' },
  { id: 'iiac', code: 'C0105', name: '인천국제공항공사', short: '인국공', sector: 'SOC·교통', hq: '인천', emoji: '✈️', aliases: ['인천공항공사'] },
  { id: 'kac', code: 'C0157', name: '한국공항공사', short: '공항공사', sector: 'SOC·교통', hq: '서울 강서', emoji: '🛫' },
  { id: 'korail', code: 'C0268', name: '한국철도공사', short: '코레일', sector: 'SOC·교통', hq: '대전', emoji: '🚄', excludes: ['코레일유통', '코레일관광개발', '코레일네트웍스', '코레일테크', '코레일로지스', '코레일관광'] },
  { id: 'ex', code: 'C0183', name: '한국도로공사', short: '도로공사', sector: 'SOC·교통', hq: '경북 김천', emoji: '🛣️' },
  { id: 'lh', code: 'C0396', name: '한국토지주택공사', short: 'LH', sector: 'SOC·교통', hq: '경남 진주', emoji: '🏘️' },
  { id: 'kwater', code: 'C0221', name: '한국수자원공사', short: '수자원공사', sector: 'SOC·교통', hq: '대전', emoji: '💧' },

  // 금융 공기업·공공기관
  { id: 'kdb', code: 'C0210', name: '한국산업은행', short: '산업은행', sector: '금융', hq: '서울 여의도', emoji: '🏛️', aliases: ['KDB산업은행'] },
  { id: 'ibk', code: 'C0127', name: '중소기업은행', short: '기업은행', sector: '금융', hq: '서울 중구', emoji: '🏦', aliases: ['IBK기업은행'] },
  { id: 'koreaexim', code: 'C0223', name: '한국수출입은행', short: '수출입은행', sector: '금융', hq: '서울 여의도', emoji: '🚢' },
  { id: 'kodit', code: 'C0091', name: '신용보증기금', short: '신보', sector: '금융', hq: '대구', emoji: '🛡️' },
  { id: 'kibo', code: 'C0038', name: '기술보증기금', short: '기보', sector: '금융', hq: '부산', emoji: '🔬' },
  { id: 'kdic', code: 'C0101', name: '예금보험공사', short: '예보', sector: '금융', hq: '서울 중구', emoji: '💰' },
  { id: 'hf', code: 'C0258', name: '한국주택금융공사', short: '주금공', sector: '금융', hq: '부산', emoji: '🏠' },
  { id: 'hug', code: 'C0061', name: '주택도시보증공사', short: 'HUG', sector: '금융', hq: '부산', emoji: '🔑' },
  { id: 'ksd', name: '한국예탁결제원', short: '예탁원', sector: '금융', hq: '부산', emoji: '📈' },
  { id: 'kamco', code: 'C0240', name: '한국자산관리공사', short: '캠코', sector: '금융', hq: '부산', emoji: '💼' },
  { id: 'kic', code: 'C0284', name: '한국투자공사', short: 'KIC', sector: '금융', hq: '서울 중구', emoji: '🌐' },
  { id: 'kinfa', code: 'C1046', name: '서민금융진흥원', short: '서금원', sector: '금융', hq: '서울 중구', emoji: '🤝' },
  { id: 'ksure', code: 'C0222', name: '한국무역보험공사', short: '무보', sector: '금융', hq: '서울 종로', emoji: '☂️' },

  // 산업·무역
  { id: 'kotra', code: 'C0054', name: '대한무역투자진흥공사', short: 'KOTRA', sector: '산업·무역', hq: '서울 서초', emoji: '🌏', aliases: ['코트라'] },
  { id: 'kosmes', code: 'C0130', name: '중소벤처기업진흥공단', short: '중진공', sector: '산업·무역', hq: '경남 진주', emoji: '🚀' },

  { id: 'nhis', code: 'C0026', name: '국민건강보험공단', short: '건보', sector: '보건·복지', hq: '강원 원주', emoji: '🏥' },
  { id: 'hira', code: 'C0006', name: '건강보험심사평가원', short: '심평원', sector: '보건·복지', hq: '강원 원주', emoji: '🩺' },
  { id: 'nps', code: 'C0028', name: '국민연금공단', short: '국민연금', sector: '보건·복지', hq: '전북 전주', emoji: '👵' },
  { id: 'comwel', code: 'C0035', name: '근로복지공단', short: '근복', sector: '고용·노동', hq: '울산', emoji: '🦺' },
  { id: 'hrdkorea', code: 'C0211', name: '한국산업인력공단', short: '산인공', sector: '고용·노동', hq: '울산', emoji: '📜' },
];

export const COMPANY_BY_ID = Object.fromEntries(COMPANIES.map((c) => [c.id, c]));
