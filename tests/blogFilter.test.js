// 블로그 합격 후기 거르기 규칙 (api/_lib/blogFilter.js)
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { filterBlogPosts, judgePost } from '../api/_lib/blogFilter.js';
import { COMPANY_BY_ID as C } from '../src/data/companies.js';

const ok = (id, tab, title, extra = {}) => assert.ok(judgePost(C[id], tab, { title, ...extra }), `통과해야 함: ${title}`);
const no = (id, tab, title, extra = {}) => assert.equal(judgePost(C[id], tab, { title, ...extra }), null, `걸러야 함: ${title}`);

describe('남겨야 하는 글', () => {
  test('개인 합격·필기·면접·자소서 후기', () => {
    ok('kepco', 'review', '2025 한국전력공사 송변전직군 최종합격후기');
    ok('kepco', 'written', '2026상반기 한국전력공사 필기후기');
    ok('kepco', 'written', '한전 NCS 필기시험 준비 기록');
    ok('nhis', 'interview', '국민건강보험공단 청년인턴 면접 후기');
    ok('lh', 'essay', '2025 상반기 LH 청년인턴 서류 합격 후기');
  });
  test('제목에 주제가 없어도 요약에 있고 제목이 취업 글이면 채움용으로', () => {
    const r = judgePost(C.kotra, 'written', { title: '코트라 공채 준비 일지', description: '1차 필기 경제논술 정리' });
    assert.deepEqual(r, { inTitle: false });
  });
});

describe('걸러야 하는 글', () => {
  test('기업명이 제목에 없음', () => no('kepco', 'review', '공기업 최종 합격 후기', { description: '한전 이야기' }));
  test('자회사·다른 기관', () => {
    no('kepco', 'review', '한국전력기술 면접 후기 기출 PT발표 한전기…');
    no('korail', 'interview', '2025년 코레일 유통 인턴 면접 후기');
  });
  test('학원·출판사·컨설팅 홍보', () => {
    no('kepco', 'written', '[서평] 한전 필기시험 한국전력공사 모의고사로 완벽 대비');
    no('kepco', 'review', '[알라딘서재] 한국전력공사 NCS 합격 후기');
    no('kepco', 'review', '한국전력공사 보훈전형 1달만에 합격시켜드렸습니다');
    no('nps', 'review', '국민연금공단 사무직(53번째 합격자) 최종 합격후기');
    no('korail', 'interview', '2026년 상반기 코레일 면접 그룹수업 안내');
    no('kepco', 'review', '한전 합격 후기', { blogger: '해커스잡' });
  });
  test('취업과 상관없는 글', () => {
    no('kepco', 'review', '이천시 한전서류대행 업체 후기');
    no('kosmes', 'review', '중진공 정책자금 합격후기 신청절차');
    no('lh', 'essay', 'LH 행복주택 당첨기 서류제출 대상자');
    no('kepco', 'review', '2026년 한국전력공사 연봉 및 성과급 후기');
  });
  test('채움용 글인데 제목이 다른 탭 주제', () => {
    no('kepco', 'written', '[25하] 한국전력공사 면접 준비', { description: '필기 합격 뒤 면접' });
  });
  test('채움용 글인데 제목에 취업 낱말이 없음', () => {
    no('nps', 'review', '부산 웨딩홀 비교, 국민연금 컨벤션홀', { description: '합격 축하' });
  });
});

describe('정렬·기간', () => {
  const now = Date.parse('2026-10-09');
  const raw = (title, postdate, link = title) => ({ title, description: '', link, bloggername: '', postdate });

  test('제목에 주제 있는 글 먼저, 그 안에서 최신순, 중복 링크 하나만', () => {
    const { items } = filterBlogPosts(C.kepco, 'review', [
      raw('한국전력공사 합격 후기 A', '20250101'),
      raw('한국전력공사 합격 후기 B', '20260501'),
      raw('한국전력공사 합격 후기 B', '20260501'), // 중복
      raw('한국전력공사 합격 후기 C', '20240301'),
      raw('한국전력공사 합격 후기 D', '20250601'),
      raw('한국전력공사 합격 후기 E', '20251101'),
    ], now);
    assert.deepEqual(items.map((p) => p.title.at(-1)), ['B', 'E', 'D', 'A', 'C']);
  });

  test('3년 넘은 글은 빼고, 3년 안 글이 5개 미만이면 5년까지', () => {
    const many = Array.from({ length: 5 }, (_, i) => raw(`한국전력공사 합격 후기 최근${i}`, '20260101', `r${i}`));
    const old = raw('한국전력공사 합격 후기 4년전', '20221001');
    assert.equal(filterBlogPosts(C.kepco, 'review', [...many, old], now).items.length, 5);
    assert.equal(filterBlogPosts(C.kepco, 'review', [many[0], old], now).items.length, 2);
    assert.equal(filterBlogPosts(C.kepco, 'review', [raw('한국전력공사 합격 후기 옛날', '20180101')], now).items.length, 0);
  });
});
