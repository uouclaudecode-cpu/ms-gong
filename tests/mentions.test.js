// 뉴스·블로그에서 '이 기업 이야기인지' 판별하는 규칙 (api/_lib/util.js mentions)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mentions } from '../api/_lib/util.js';
import { COMPANY_BY_ID as C } from '../src/data/companies.js';

const cases = [
  // [기업 id, 글, 이 기업 이야기인가]
  ['kepco', '한국전력공사 신입 채용', true],
  ['kepco', '한전, 전기요금 인상 검토', true],
  ['kepco', '[한전] 하반기 공채', true],
  ['kepco', '한전 기출 문제 풀이', true],
  ['kepco', '한전KPS와 한전이 협약', true], // 자회사와 본사가 같이 나오면 본사 이야기
  ['kepco', '한전KPS, 발전설비 정비 수주', false],
  ['kepco', '한전KDN 채용 공고', false],
  ['kepco', '한국전력기술 면접 후기', false],
  ['korail', '코레일, 추석 승차권 예매', true],
  ['korail', '코레일유통 편의점 입점', false],
  ['korail', '코레일 유통 인턴 면접', false], // 띄어 써도 자회사
  ['kac', '한국공항공사 김포공항', true],
  ['kac', '공항공사 노조 파업', true],
  ['kac', '인천국제공항공사 여객 증가', false], // 다른 기관 이름의 일부
  ['kdic', '예보, 부실 저축은행 정리', true],
  ['kdic', '주말 일기예보 비 소식', false],
  ['kic', 'KIC 해외투자 수익률', true],
  ['kic', 'KICT 건설기술연구원', false],
  ['ibk', 'IBK기업은행 채용', true],
  ['kdb', 'KDB산업은행 하반기', true],
];

for (const [id, text, want] of cases) {
  test(`${id}: "${text}" → ${want ? '맞음' : '아님'}`, () => {
    assert.equal(mentions(C[id], text), want);
  });
}
