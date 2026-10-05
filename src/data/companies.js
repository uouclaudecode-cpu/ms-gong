// 선택할 수 있는 공기업 목록.
// id는 URL(/company/:id)과 localStorage에 쓰이므로 한 번 정하면 바꾸지 않습니다.
// name은 잡알리오 기관명과 똑같아야 채용 공고가 연결됩니다.
// aliases는 뉴스·블로그에서 기업을 알아보는 다른 이름입니다(선택).
export const SECTORS = ['에너지', 'SOC·교통', '금융', '산업·무역', '보건·복지', '고용·노동'];

export const COMPANIES = [
  { id: 'kepco', name: '한국전력공사', short: '한전', sector: '에너지', hq: '전남 나주', emoji: '⚡' },
  { id: 'khnp', name: '한국수력원자력', short: '한수원', sector: '에너지', hq: '경북 경주', emoji: '⚛️' },
  { id: 'kogas', name: '한국가스공사', short: '가스공사', sector: '에너지', hq: '대구', emoji: '🔥' },
  { id: 'knoc', name: '한국석유공사', short: '석유공사', sector: '에너지', hq: '울산', emoji: '🛢️' },
  { id: 'ewp', name: '한국동서발전', short: '동서발전', sector: '에너지', hq: '울산', emoji: '🏭' },
  { id: 'iiac', name: '인천국제공항공사', short: '인국공', sector: 'SOC·교통', hq: '인천', emoji: '✈️', aliases: ['인천공항공사'] },
  { id: 'kac', name: '한국공항공사', short: '공항공사', sector: 'SOC·교통', hq: '서울 강서', emoji: '🛫' },
  { id: 'korail', name: '한국철도공사', short: '코레일', sector: 'SOC·교통', hq: '대전', emoji: '🚄' },
  { id: 'ex', name: '한국도로공사', short: '도로공사', sector: 'SOC·교통', hq: '경북 김천', emoji: '🛣️' },
  { id: 'lh', name: '한국토지주택공사', short: 'LH', sector: 'SOC·교통', hq: '경남 진주', emoji: '🏘️' },
  { id: 'kwater', name: '한국수자원공사', short: '수자원공사', sector: 'SOC·교통', hq: '대전', emoji: '💧' },

  // 금융 공기업·공공기관
  { id: 'kdb', name: '한국산업은행', short: '산업은행', sector: '금융', hq: '서울 여의도', emoji: '🏛️', aliases: ['KDB산업은행'] },
  { id: 'ibk', name: '중소기업은행', short: '기업은행', sector: '금융', hq: '서울 중구', emoji: '🏦', aliases: ['IBK기업은행'] },
  { id: 'koreaexim', name: '한국수출입은행', short: '수출입은행', sector: '금융', hq: '서울 여의도', emoji: '🚢' },
  { id: 'kodit', name: '신용보증기금', short: '신보', sector: '금융', hq: '대구', emoji: '🛡️' },
  { id: 'kibo', name: '기술보증기금', short: '기보', sector: '금융', hq: '부산', emoji: '🔬' },
  { id: 'kdic', name: '예금보험공사', short: '예보', sector: '금융', hq: '서울 중구', emoji: '💰' },
  { id: 'hf', name: '한국주택금융공사', short: '주금공', sector: '금융', hq: '부산', emoji: '🏠' },
  { id: 'hug', name: '주택도시보증공사', short: 'HUG', sector: '금융', hq: '부산', emoji: '🔑' },
  { id: 'ksd', name: '한국예탁결제원', short: '예탁원', sector: '금융', hq: '부산', emoji: '📈' },
  { id: 'kamco', name: '한국자산관리공사', short: '캠코', sector: '금융', hq: '부산', emoji: '💼' },
  { id: 'kic', name: '한국투자공사', short: 'KIC', sector: '금융', hq: '서울 중구', emoji: '🌐' },
  { id: 'kinfa', name: '서민금융진흥원', short: '서금원', sector: '금융', hq: '서울 중구', emoji: '🤝' },
  { id: 'ksure', name: '한국무역보험공사', short: '무보', sector: '금융', hq: '서울 종로', emoji: '☂️' },

  // 산업·무역
  { id: 'kotra', name: '대한무역투자진흥공사', short: 'KOTRA', sector: '산업·무역', hq: '서울 서초', emoji: '🌏', aliases: ['코트라'] },
  { id: 'kosmes', name: '중소벤처기업진흥공단', short: '중진공', sector: '산업·무역', hq: '경남 진주', emoji: '🚀' },

  { id: 'nhis', name: '국민건강보험공단', short: '건보', sector: '보건·복지', hq: '강원 원주', emoji: '🏥' },
  { id: 'hira', name: '건강보험심사평가원', short: '심평원', sector: '보건·복지', hq: '강원 원주', emoji: '🩺' },
  { id: 'nps', name: '국민연금공단', short: '국민연금', sector: '보건·복지', hq: '전북 전주', emoji: '👵' },
  { id: 'comwel', name: '근로복지공단', short: '근복', sector: '고용·노동', hq: '울산', emoji: '🦺' },
  { id: 'hrdkorea', name: '한국산업인력공단', short: '산인공', sector: '고용·노동', hq: '울산', emoji: '📜' },
];

export const COMPANY_BY_ID = Object.fromEntries(COMPANIES.map((c) => [c.id, c]));
