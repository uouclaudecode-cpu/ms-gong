// 선택할 수 있는 공기업 목록.
// id는 URL(/company/:id)과 localStorage에 쓰이므로 한 번 정하면 바꾸지 않습니다.
export const SECTORS = ['에너지', 'SOC·교통', '보건·복지', '금융·자산', '고용·노동'];

export const COMPANIES = [
  { id: 'kepco', name: '한국전력공사', short: '한전', sector: '에너지', hq: '전남 나주', emoji: '⚡' },
  { id: 'khnp', name: '한국수력원자력', short: '한수원', sector: '에너지', hq: '경북 경주', emoji: '⚛️' },
  { id: 'kogas', name: '한국가스공사', short: '가스공사', sector: '에너지', hq: '대구', emoji: '🔥' },
  { id: 'knoc', name: '한국석유공사', short: '석유공사', sector: '에너지', hq: '울산', emoji: '🛢️' },
  { id: 'ewp', name: '한국동서발전', short: '동서발전', sector: '에너지', hq: '울산', emoji: '🏭' },
  { id: 'iiac', name: '인천국제공항공사', short: '인국공', sector: 'SOC·교통', hq: '인천', emoji: '✈️' },
  { id: 'kac', name: '한국공항공사', short: '공항공사', sector: 'SOC·교통', hq: '서울 강서', emoji: '🛫' },
  { id: 'korail', name: '한국철도공사', short: '코레일', sector: 'SOC·교통', hq: '대전', emoji: '🚄' },
  { id: 'ex', name: '한국도로공사', short: '도로공사', sector: 'SOC·교통', hq: '경북 김천', emoji: '🛣️' },
  { id: 'lh', name: '한국토지주택공사', short: 'LH', sector: 'SOC·교통', hq: '경남 진주', emoji: '🏘️' },
  { id: 'kwater', name: '한국수자원공사', short: '수자원공사', sector: 'SOC·교통', hq: '대전', emoji: '💧' },
  { id: 'nhis', name: '국민건강보험공단', short: '건보', sector: '보건·복지', hq: '강원 원주', emoji: '🏥' },
  { id: 'hira', name: '건강보험심사평가원', short: '심평원', sector: '보건·복지', hq: '강원 원주', emoji: '🩺' },
  { id: 'nps', name: '국민연금공단', short: '국민연금', sector: '보건·복지', hq: '전북 전주', emoji: '👵' },
  { id: 'kamco', name: '한국자산관리공사', short: '캠코', sector: '금융·자산', hq: '부산', emoji: '🏦' },
  { id: 'comwel', name: '근로복지공단', short: '근복', sector: '고용·노동', hq: '울산', emoji: '🦺' },
  { id: 'hrdkorea', name: '한국산업인력공단', short: '산인공', sector: '고용·노동', hq: '울산', emoji: '📜' },
];

export const COMPANY_BY_ID = Object.fromEntries(COMPANIES.map((c) => [c.id, c]));
