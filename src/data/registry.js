// 화면에서 기업 정보를 찾는 곳: 우리 목록(companies.js) + 잡알리오에서 알게 된 그 밖의 공공기관.
// 그 밖의 기관은 서버가 알려 준 이름을 이 브라우저에 저장해 두고, 다음 방문 때 바로 씁니다.
import { COMPANIES, COMPANY_BY_ID } from './companies.js';
import { dynamicCompany, parseDynamicId } from './institutions.js';

const KEY = 'ms-gong:institutions';
const others = new Map(); // id → { ...company, open }

try {
  for (const i of JSON.parse(localStorage.getItem(KEY) ?? '[]')) others.set(i.id, { ...dynamicCompany(i.code, i.name), open: i.open ?? 0 });
} catch {
  // 저장된 게 없거나 읽을 수 없으면 서버에서 다시 받습니다
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify([...others.values()].map(({ id, code, name, open }) => ({ id, code, name, open }))));
  } catch {
    // 저장 못 해도 이번 방문 동안은 메모리에 있습니다
  }
}

/** 서버에서 받은 기관 목록 [{ id, code, name, open? }]을 기억합니다. 새로 알게 된 게 있으면 true */
export function registerInstitutions(list = []) {
  let changed = false;
  for (const i of list) {
    if (COMPANY_BY_ID[i.id]) continue;
    const prev = others.get(i.id);
    const open = i.open ?? prev?.open ?? 0;
    if (!prev || prev.name !== i.name || prev.open !== open) {
      others.set(i.id, { ...dynamicCompany(i.code, i.name), open });
      changed = true;
    }
  }
  if (changed) persist();
  return changed;
}

/** id로 기업 정보. 모르는 기관이면 코드만으로 임시 이름을 만듭니다 */
export function getCompany(id) {
  if (COMPANY_BY_ID[id]) return COMPANY_BY_ID[id];
  if (others.has(id)) return others.get(id);
  const code = parseDynamicId(id);
  return code ? dynamicCompany(code, `공공기관(${code})`) : null;
}

export const isKnownCompanyId = (id) => Boolean(COMPANY_BY_ID[id] || parseDynamicId(id));

/** 우리 목록 밖의 기관들 (이름순) */
export function otherInstitutions() {
  return [...others.values()].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
}

export { COMPANIES };
