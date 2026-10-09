// 우리 목록(companies.js) 밖의 공공기관. 잡알리오 기관 코드로 id를 만듭니다: 'x-C0008'
// 서버와 화면이 같이 씁니다.

const PREFIX = 'x-';

/** 'x-C0008' → 'C0008' (형식이 아니면 null) */
export function parseDynamicId(id) {
  const m = /^x-([A-Z]\d{3,5})$/.exec(String(id ?? ''));
  return m ? m[1] : null;
}

export const dynamicId = (code) => `${PREFIX}${code}`;
export const isDynamicId = (id) => parseDynamicId(id) !== null;

/** 잡알리오 기관명 정리: '한국수력원자력(주)' → '한국수력원자력' */
export const cleanInstName = (name = '') => name.replace(/\(주\)|㈜|주식회사/g, '').trim();

/** 목록 밖 기관의 기업 정보 모양 (companies.js 항목과 같은 필드) */
export function dynamicCompany(code, name) {
  const clean = cleanInstName(name);
  return {
    id: dynamicId(code),
    code,
    name: clean,
    short: clean.length > 8 ? `${clean.slice(0, 7)}…` : clean,
    sector: '기타 공공기관',
    hq: '',
    emoji: '🏢',
    dynamic: true,
  };
}
